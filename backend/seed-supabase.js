const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { getSupabase } = require('./config/supabase');

const initialProblems = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    difficulty: 'Easy',
    topic: 'Arrays',
    input_format: 'First line contains space-separated integers `nums`.\nSecond line contains integer `target`.',
    output_format: 'Print the two indices separated by a space.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9',
    examples: [
      { input: '2 7 11 15\n9', output: '0 1', explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.' }
    ],
    starter_code: [
      {
        language: 'javascript',
        code: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length >= 2) {
  const nums = input[0].split(' ').map(Number);
  const target = Number(input[1]);
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      console.log(\`\${map.get(complement)} \${i}\`);
      break;
    }
    map.set(nums[i], i);
  }
}`
      },
      {
        language: 'python',
        code: `import sys
lines = sys.stdin.read().splitlines()
if len(lines) >= 2:
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            break
        seen[num] = i`
      }
    ],
    hints: ['Use a hash map to look up the complement in O(1) time.'],
    company_tags: ['Google', 'Amazon', 'Meta'],
    points: 10,
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1', isSample: true },
      { input: '3 2 4\n6', expectedOutput: '1 2', isSample: true },
      { input: '3 3\n6', expectedOutput: '0 1', isSample: false }
    ]
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if brackets are closed in the correct order.',
    difficulty: 'Easy',
    topic: 'Stack',
    input_format: 'A single string `s`.',
    output_format: 'Print `true` if valid, otherwise `false`.',
    constraints: '1 <= s.length <= 10^4',
    examples: [
      { input: '()[]{}', output: 'true', explanation: 'All brackets match.' }
    ],
    starter_code: [
      {
        language: 'javascript',
        code: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();
const stack = [];
const map = { ')': '(', '}': '{', ']': '[' };
let valid = true;
for (const char of s) {
  if (['(', '{', '['].includes(char)) {
    stack.push(char);
  } else if (map[char]) {
    if (stack.pop() !== map[char]) {
      valid = false;
      break;
    }
  }
}
if (stack.length !== 0) valid = false;
console.log(valid ? 'true' : 'false');`
      }
    ],
    hints: ['Push opening brackets onto a stack. When a closing bracket arrives, pop and verify.'],
    company_tags: ['Microsoft', 'Amazon', 'Apple'],
    points: 10,
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isSample: true },
      { input: '(]', expectedOutput: 'false', isSample: true },
      { input: '{[]}', expectedOutput: 'true', isSample: false }
    ]
  },
  {
    title: 'Maximum Subarray',
    description: 'Given an integer array `nums`, find the contiguous subarray with the largest sum, and return its sum (Kadane\'s Algorithm).',
    difficulty: 'Medium',
    topic: 'Arrays',
    input_format: 'Space-separated integers `nums`.',
    output_format: 'Print the maximum subarray sum.',
    constraints: '1 <= nums.length <= 10^5',
    examples: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
    ],
    starter_code: [
      {
        language: 'python',
        code: `import sys
nums = list(map(int, sys.stdin.read().split()))
max_so_far = nums[0]
curr_max = nums[0]
for num in nums[1:]:
    curr_max = max(num, curr_max + num)
    max_so_far = max(max_so_far, curr_max)
print(max_so_far)`
      }
    ],
    hints: ['Keep track of the running current maximum sum and reset if it falls below 0.'],
    company_tags: ['Amazon', 'Google'],
    points: 20,
    testCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', isSample: true },
      { input: '1', expectedOutput: '1', isSample: true },
      { input: '5 4 -1 7 8', expectedOutput: '23', isSample: false }
    ]
  }
];

const initialQuizzes = [
  {
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
        explanation: 'Inorder traversal (Left, Root, Right) of a BST produces elements in strictly ascending order.'
      },
      {
        id: 'q3',
        question: 'Which data structure is primarily used in Breadth-First Search (BFS)?',
        options: ['Stack', 'Queue', 'Priority Queue', 'Trie'],
        correctAnswer: 1,
        explanation: 'BFS explores neighbor vertices level-by-level using a FIFO Queue.'
      }
    ]
  }
];

async function seed() {
  console.log('🌱 Starting Supabase Seeder...');
  try {
    const supabase = getSupabase();

    // 1. Seed Problems
    for (const prob of initialProblems) {
      const { testCases, ...problemFields } = prob;

      const { data: existing } = await supabase
        .from('problems')
        .select('id')
        .eq('title', problemFields.title)
        .maybeSingle();

      let problemId = existing ? existing.id : null;

      if (!existing) {
        const { data: created, error } = await supabase
          .from('problems')
          .insert(problemFields)
          .select()
          .single();

        if (error) {
          console.error(`❌ Failed to insert problem ${problemFields.title}:`, error.message);
          continue;
        }
        problemId = created.id;
        console.log(`✅ Seeded problem: ${problemFields.title}`);
      } else {
        console.log(`ℹ️ Problem "${problemFields.title}" already exists.`);
      }

      // Seed Test Cases
      if (problemId && testCases && testCases.length > 0) {
        for (const tc of testCases) {
          await supabase.from('test_cases').insert({
            problem_id: problemId,
            input: tc.input,
            expected_output: tc.expectedOutput,
            is_sample: tc.isSample
          });
        }
      }
    }

    // 2. Seed Quizzes
    for (const quiz of initialQuizzes) {
      const { data: existing } = await supabase
        .from('quizzes')
        .select('id')
        .eq('title', quiz.title)
        .maybeSingle();

      if (!existing) {
        await supabase.from('quizzes').insert(quiz);
        console.log(`✅ Seeded quiz: ${quiz.title}`);
      }
    }

    console.log('🎉 Supabase Seeding Completed Successfully!');
  } catch (err) {
    console.error('❌ Seeding Error:', err.message);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
