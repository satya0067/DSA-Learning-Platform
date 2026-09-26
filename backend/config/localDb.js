const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class LocalQueryBuilder {
  constructor(tableName, db) {
    this.tableName = tableName;
    this.db = db;
    this._type = 'select';
    this._columns = '*';
    this._countOption = null;
    this._head = false;
    this._filters = [];
    this._order = null;
    this._limit = null;
    this._insertData = null;
    this._updateData = null;
  }

  select(columns = '*', options = {}) {
    this._columns = columns;
    if (options.count) this._countOption = options.count;
    if (options.head) this._head = Boolean(options.head);
    return this;
  }

  insert(data) {
    this._type = 'insert';
    this._insertData = Array.isArray(data) ? [...data] : [{ ...data }];
    return this;
  }

  update(data) {
    this._type = 'update';
    this._updateData = { ...data };
    return this;
  }

  delete() {
    this._type = 'delete';
    return this;
  }

  eq(column, value) {
    this._filters.push(row => {
      const v = row[column];
      return String(v !== undefined && v !== null ? v : '') === String(value !== undefined && value !== null ? value : '');
    });
    return this;
  }

  neq(column, value) {
    this._filters.push(row => {
      const v = row[column];
      return String(v !== undefined && v !== null ? v : '') !== String(value !== undefined && value !== null ? value : '');
    });
    return this;
  }

  in(column, values) {
    const list = Array.isArray(values) ? values.map(v => String(v)) : [String(values)];
    this._filters.push(row => list.includes(String(row[column])));
    return this;
  }

  ilike(column, pattern) {
    const term = String(pattern).replace(/%/g, '').toLowerCase();
    this._filters.push(row => {
      const v = String(row[column] || '').toLowerCase();
      return v.includes(term);
    });
    return this;
  }

  or(clause) {
    if (!clause) return this;
    const parts = clause.split(',');
    this._filters.push(row => {
      for (const cond of parts) {
        if (cond.includes('.eq.')) {
          const idx = cond.indexOf('.eq.');
          const col = cond.slice(0, idx).trim();
          const val = cond.slice(idx + 4).trim();
          const cell = String(row[col] !== undefined && row[col] !== null ? row[col] : '').toLowerCase();
          if (cell === val.toLowerCase()) return true;
        } else if (cond.includes('.ilike.')) {
          const idx = cond.indexOf('.ilike.');
          const col = cond.slice(0, idx).trim();
          const val = cond.slice(idx + 7).replace(/%/g, '').trim().toLowerCase();
          const cell = String(row[col] || '').toLowerCase();
          if (cell.includes(val)) return true;
        } else if (cond.includes('.neq.')) {
          const idx = cond.indexOf('.neq.');
          const col = cond.slice(0, idx).trim();
          const val = cond.slice(idx + 5).trim();
          const cell = String(row[col] !== undefined && row[col] !== null ? row[col] : '').toLowerCase();
          if (cell !== val.toLowerCase()) return true;
        }
      }
      return false;
    });
    return this;
  }

  order(column, { ascending = true } = {}) {
    this._order = { column, ascending };
    return this;
  }

  limit(count) {
    this._limit = Number(count);
    return this;
  }

  _project(row) {
    if (!row) return null;
    if (this._columns === '*' || !this._columns) {
      return { ...row };
    }
    const cols = this._columns.split(',').map(c => c.trim()).filter(Boolean);
    const out = {};
    for (const c of cols) {
      out[c] = row[c];
    }
    return out;
  }

  async execute() {
    try {
      const table = this.db.getTable(this.tableName);

      if (this._type === 'insert') {
        const rowsToInsert = this._insertData.map(item => ({
          id: item.id || crypto.randomUUID(),
          created_at: item.created_at || new Date().toISOString(),
          ...item
        }));

        // Unique constraint check for users table
        if (this.tableName === 'users') {
          for (const item of rowsToInsert) {
            const dup = table.find(u => 
              (u.email && item.email && u.email.toLowerCase() === item.email.toLowerCase()) ||
              (u.username && item.username && u.username.toLowerCase() === item.username.toLowerCase())
            );
            if (dup) {
              return {
                data: null,
                error: {
                  code: '23505',
                  message: 'duplicate key value violates unique constraint "users_email_key"'
                }
              };
            }
          }
        }

        const newTable = [...table, ...rowsToInsert];
        this.db.setTable(this.tableName, newTable);
        const projected = rowsToInsert.map(r => this._project(r));
        return { data: projected, count: projected.length, error: null };
      }

      if (this._type === 'update') {
        let updatedCount = 0;
        const updatedRows = [];
        const newTable = table.map(row => {
          const match = this._filters.every(f => f(row));
          if (match) {
            updatedCount++;
            const updated = { ...row, ...this._updateData, updated_at: new Date().toISOString() };
            updatedRows.push(updated);
            return updated;
          }
          return row;
        });

        this.db.setTable(this.tableName, newTable);
        const projected = updatedRows.map(r => this._project(r));
        return { data: projected, count: updatedCount, error: null };
      }

      if (this._type === 'delete') {
        const deletedRows = [];
        const newTable = table.filter(row => {
          const match = this._filters.every(f => f(row));
          if (match) {
            deletedRows.push(row);
            return false;
          }
          return true;
        });

        this.db.setTable(this.tableName, newTable);
        const projected = deletedRows.map(r => this._project(r));
        return { data: projected, count: deletedRows.length, error: null };
      }

      // Default: select
      let matching = table.filter(row => this._filters.every(f => f(row)));
      const count = matching.length;

      if (this._head) {
        return { data: null, count, error: null };
      }

      if (this._order) {
        const { column, ascending } = this._order;
        matching.sort((a, b) => {
          const valA = a[column];
          const valB = b[column];
          if (valA === valB) return 0;
          if (valA === undefined || valA === null) return ascending ? -1 : 1;
          if (valB === undefined || valB === null) return ascending ? 1 : -1;
          if (typeof valA === 'number' && typeof valB === 'number') {
            return ascending ? valA - valB : valB - valA;
          }
          const strA = String(valA);
          const strB = String(valB);
          return ascending ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
      }

      if (this._limit !== null && this._limit >= 0) {
        matching = matching.slice(0, this._limit);
      }

      const projected = matching.map(r => this._project(r));
      return { data: projected, count, error: null };
    } catch (err) {
      return { data: null, count: 0, error: { message: err.message } };
    }
  }

  async single() {
    const res = await this.execute();
    if (res.error) return { data: null, error: res.error };
    const rows = res.data || [];
    if (rows.length === 0) {
      return {
        data: null,
        error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' }
      };
    }
    return { data: rows[0], error: null };
  }

  async maybeSingle() {
    const res = await this.execute();
    if (res.error) return { data: null, error: res.error };
    const rows = res.data || [];
    return { data: rows.length > 0 ? rows[0] : null, error: null };
  }

  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this.execute().catch(onRejected);
  }
}

class LocalDb {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.filePath = path.join(this.dataDir, 'local_db.json');
    this.data = {};
    this.init();
  }

  init() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.warn('⚠️ Could not parse local_db.json, reinitializing...');
        this.data = {};
      }
    }

    const defaultTables = [
      'users', 'problems', 'test_cases', 'submissions',
      'quizzes', 'progress', 'bookmarks', 'notes',
      'discussions', 'comments', 'contests', 'challenges', 'notifications'
    ];

    for (const t of defaultTables) {
      if (!Array.isArray(this.data[t])) {
        this.data[t] = [];
      }
    }

    // Auto-seed default problems & quizzes if empty
    this._autoSeed();
    this.save();
  }

  _autoSeed() {
    try {
      const seedFile = path.join(__dirname, '..', 'seed-supabase.js');
      if (fs.existsSync(seedFile) && this.data.problems.length === 0) {
        // Let's populate default problems and quizzes
        const seedModule = require(seedFile);
        // The file defines initialProblems and initialQuizzes internally,
        // we can seed standard DSA problems directly:
        this._seedDefaults();
      }
    } catch (e) {
      // Fallback defaults
      this._seedDefaults();
    }
  }

  _seedDefaults() {
    if (this.data.problems.length === 0) {
      const twoSumId = crypto.randomUUID();
      const validParenId = crypto.randomUUID();
      const maxSubId = crypto.randomUUID();

      this.data.problems.push(
        {
          id: twoSumId,
          title: 'Two Sum',
          description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
          difficulty: 'Easy',
          topic: 'Arrays',
          input_format: 'First line contains space-separated integers `nums`.\nSecond line contains integer `target`.',
          output_format: 'Print the two indices separated by a space.',
          constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
          examples: [{ input: '2 7 11 15\n9', output: '0 1', explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.' }],
          starter_code: [
            {
              language: 'javascript',
              code: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length >= 2) {\n  const nums = input[0].split(' ').map(Number);\n  const target = Number(input[1]);\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      console.log(\`\${map.get(complement)} \${i}\`);\n      break;\n    }\n    map.set(nums[i], i);\n  }\n}`
            },
            {
              language: 'python',
              code: `import sys\nlines = sys.stdin.read().splitlines()\nif len(lines) >= 2:\n    nums = list(map(int, lines[0].split()))\n    target = int(lines[1])\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            print(f"{seen[diff]} {i}")\n            break\n        seen[num] = i`
            }
          ],
          hints: ['Use a hash map to look up the complement in O(1) time.'],
          company_tags: ['Google', 'Amazon', 'Meta'],
          acceptance_rate: 85,
          points: 10,
          created_at: new Date().toISOString()
        },
        {
          id: validParenId,
          title: 'Valid Parentheses',
          description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if brackets are closed in the correct order.',
          difficulty: 'Easy',
          topic: 'Stack',
          input_format: 'A single string `s`.',
          output_format: 'Print `true` if valid, otherwise `false`.',
          constraints: '1 <= s.length <= 10^4',
          examples: [{ input: '()[]{}', output: 'true', explanation: 'All brackets match.' }],
          starter_code: [
            {
              language: 'javascript',
              code: `const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\nconst stack = [];\nconst map = { ')': '(', '}': '{', ']': '[' };\nlet valid = true;\nfor (const char of s) {\n  if (['(', '{', '['].includes(char)) {\n    stack.push(char);\n  } else if (map[char]) {\n    if (stack.pop() !== map[char]) {\n      valid = false;\n      break;\n    }\n  }\n}\nif (stack.length !== 0) valid = false;\nconsole.log(valid ? 'true' : 'false');`
            }
          ],
          hints: ['Push opening brackets onto a stack. When a closing bracket arrives, pop and verify.'],
          company_tags: ['Microsoft', 'Amazon', 'Apple'],
          acceptance_rate: 78,
          points: 10,
          created_at: new Date().toISOString()
        },
        {
          id: maxSubId,
          title: 'Maximum Subarray',
          description: 'Given an integer array `nums`, find the contiguous subarray with the largest sum, and return its sum (Kadane\'s Algorithm).',
          difficulty: 'Medium',
          topic: 'Arrays',
          input_format: 'Space-separated integers `nums`.',
          output_format: 'Print the maximum subarray sum.',
          constraints: '1 <= nums.length <= 10^5',
          examples: [{ input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }],
          starter_code: [
            {
              language: 'python',
              code: `import sys\nnums = list(map(int, sys.stdin.read().split()))\nmax_so_far = nums[0]\ncurr_max = nums[0]\nfor num in nums[1:]:\n    curr_max = max(num, curr_max + num)\n    max_so_far = max(max_so_far, curr_max)\nprint(max_so_far)`
            }
          ],
          hints: ['Keep track of running sum and reset if it drops below zero.'],
          company_tags: ['Amazon', 'Google'],
          acceptance_rate: 62,
          points: 20,
          created_at: new Date().toISOString()
        }
      );

      // Add test cases
      this.data.test_cases.push(
        { id: crypto.randomUUID(), problem_id: twoSumId, input: '2 7 11 15\n9', expected_output: '0 1', is_sample: true },
        { id: crypto.randomUUID(), problem_id: twoSumId, input: '3 2 4\n6', expected_output: '1 2', is_sample: true },
        { id: crypto.randomUUID(), problem_id: twoSumId, input: '3 3\n6', expected_output: '0 1', is_sample: false },
        { id: crypto.randomUUID(), problem_id: validParenId, input: '()[]{}', expected_output: 'true', is_sample: true },
        { id: crypto.randomUUID(), problem_id: validParenId, input: '(]', expected_output: 'false', is_sample: true },
        { id: crypto.randomUUID(), problem_id: validParenId, input: '{[]}', expected_output: 'true', is_sample: false },
        { id: crypto.randomUUID(), problem_id: maxSubId, input: '-2 1 -3 4 -1 2 1 -5 4', expected_output: '6', is_sample: true },
        { id: crypto.randomUUID(), problem_id: maxSubId, input: '1', expected_output: '1', is_sample: true },
        { id: crypto.randomUUID(), problem_id: maxSubId, input: '5 4 -1 7 8', expected_output: '23', is_sample: false }
      );
    }

    if (this.data.quizzes.length === 0) {
      this.data.quizzes.push({
        id: crypto.randomUUID(),
        title: 'DSA Fundamentals Quiz',
        topic: 'general',
        difficulty: 'easy',
        questions: [
          {
            id: 'q1',
            question: 'What is the average time complexity of searching in a Hash Table?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
            correctAnswer: 0,
            explanation: 'Hash table average case lookup is O(1).'
          },
          {
            id: 'q2',
            question: 'Which traversal of a Binary Search Tree (BST) visits nodes in ascending sorted order?',
            options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
            correctAnswer: 1,
            explanation: 'Inorder traversal of a BST visits keys in strictly increasing order.'
          },
          {
            id: 'q3',
            question: 'Which data structure is primarily used in Breadth-First Search (BFS)?',
            options: ['Stack', 'Queue', 'Priority Queue', 'Trie'],
            correctAnswer: 1,
            explanation: 'BFS explores vertices level-by-level using a FIFO Queue.'
          }
        ],
        created_at: new Date().toISOString()
      });
    }
  }

  getTable(name) {
    return this.data[name] || [];
  }

  setTable(name, rows) {
    this.data[name] = rows;
    this.save();
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('❌ Failed to save local_db.json:', e);
    }
  }

  from(tableName) {
    return new LocalQueryBuilder(tableName, this);
  }
}

let localDbInstance = null;

function getLocalDb() {
  if (!localDbInstance) {
    localDbInstance = new LocalDb();
    console.log('⚡ Using Local Database Fallback (persisted in backend/data/local_db.json)');
  }
  return localDbInstance;
}

module.exports = {
  LocalDb,
  getLocalDb
};
