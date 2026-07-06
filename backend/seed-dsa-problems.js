const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Problem = require('./models/Problem');
const TestCase = require('./models/TestCase');
const HiddenTestCase = require('./models/HiddenTestCase');
const Editorial = require('./models/Editorial');
const Achievement = require('./models/Achievement');
const DailyChallenge = require('./models/DailyChallenge');
const WeeklyChallenge = require('./models/WeeklyChallenge');
const Contest = require('./models/Contest');

const problemsData = [
  {
    title: 'Two Sum',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
    difficulty: 'Easy',
    topic: 'Arrays',
    inputFormat: 'First line contains space-separated integers representing `nums`.\nSecond line contains a single integer representing `target`.',
    outputFormat: 'Print the two indices separated by a space.',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    examples: [
      {
        input: '2 7 11 15\n9',
        output: '0 1',
        explanation: 'Because nums[0] + nums[1] == 9, we return 0 1.'
      }
    ],
    hints: [
      'Try using a Hash Map to store elements and their indices as you traverse.',
      'For each number, check if (target - num) exists in the map.'
    ],
    companyTags: ['Google', 'Meta', 'Amazon', 'Apple'],
    points: 10,
    starterCode: [
      {
        language: 'python',
        code: `import sys

def solve():
    # Read all inputs from stdin
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    
    # Write your logic here
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    solve()`
      },
      {
        language: 'javascript',
        code: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (input.length < 2) return;
    const nums = input[0].split(' ').map(Number);
    const target = Number(input[1]);
    
    // Write your logic here
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (seen[diff] !== undefined) {
            console.log(seen[diff] + ' ' + i);
            return;
        }
        seen[nums[i]] = i;
    }
}

solve();`
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
#include <unordered_map>
#include <sstream>

using namespace std;

int main() {
    string line1;
    if (!getline(cin, line1)) return 0;
    
    vector<int> nums;
    stringstream ss(line1);
    int val;
    while (ss >> val) {
        nums.push_back(val);
    }
    
    int target;
    cin >> target;
    
    unordered_map<int, int> seen;
    for (int i = 0; i < nums.size(); ++i) {
        int diff = target - nums[i];
        if (seen.count(diff)) {
            cout << seen[diff] << " " << i << endl;
            return 0;
        }
        seen[nums[i]] = i;
    }
    return 0;
}`
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    int nums[10000];
    int count = 0;
    int val;
    
    // Read numbers until newline
    char ch;
    while (scanf("%d%c", &val, &ch) == 2) {
        nums[count++] = val;
        if (ch == '\\n') break;
    }
    
    int target;
    if (scanf("%d", &target) != 1) return 0;
    
    for (int i = 0; i < count; ++i) {
        for (int j = i + 1; j < count; ++j) {
            if (nums[i] + nums[j] == target) {
                printf("%d %d\\n", i, j);
                return 0;
            }
        }
    }
    return 0;
}`
      },
      {
        language: 'java',
        code: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line1 = br.readLine();
        if (line1 == null) return;
        
        String[] parts = line1.trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            nums[i] = Integer.parseInt(parts[i]);
        }
        
        String line2 = br.readLine();
        if (line2 == null) return;
        int target = Integer.parseInt(line2.trim());
        
        HashMap<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int diff = target - nums[i];
            if (seen.containsKey(diff)) {
                System.out.println(seen.get(diff) + " " + i);
                return;
            }
            seen.put(nums[i], i);
        }
    }
}`
      }
    ],
    testCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1', isSample: true },
      { input: '3 2 4\n6', expectedOutput: '1 2', isSample: true }
    ],
    hiddenTestCases: [
      { input: '3 3\n6', expectedOutput: '0 1' },
      { input: '10 20 30 40 50\n90', expectedOutput: '3 4' },
      { input: '-3 4 3 90\n0', expectedOutput: '0 2' }
    ],
    editorial: {
      approaches: [
        {
          title: 'One-pass Hash Map',
          description: 'While traversing and inserting elements into the hash map, we look back to check if current element\'s complement already exists.',
          code: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i`,
          language: 'python',
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(N)'
        }
      ],
      videoUrl: 'https://www.youtube.com/embed/KLlXCFG5Tk0',
      complexityAnalysis: 'Time Complexity is O(N) since we traverse the list containing N elements exactly once. Space Complexity is O(N) to store elements in the hash table.'
    }
  },
  {
    title: 'Reverse Linked List',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    difficulty: 'Easy',
    topic: 'Linked List',
    inputFormat: 'A single line containing space-separated integers representing the list values.',
    outputFormat: 'Print the reversed space-separated list values.',
    constraints: 'The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000',
    examples: [
      {
        input: '1 2 3 4 5',
        output: '5 4 3 2 1',
        explanation: 'Reversing the linked list [1,2,3,4,5] gives [5,4,3,2,1].'
      }
    ],
    hints: [
      'Can you reverse it iteratively by swapping pointers?',
      'Maintain a prev, curr, and next pointer during traversal.'
    ],
    companyTags: ['Apple', 'Microsoft', 'Adobe'],
    points: 10,
    starterCode: [
      {
        language: 'python',
        code: `import sys

def solve():
    input_str = sys.stdin.read().strip()
    if not input_str:
        print("")
        return
    values = input_str.split()
    values.reverse()
    print(" ".join(values))

if __name__ == '__main__':
    solve()`
      },
      {
        language: 'javascript',
        code: `const fs = require('fs');

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) {
        console.log('');
        return;
    }
    const values = input.split(/\\s+/);
    values.reverse();
    console.log(values.join(' '));
}

solve();`
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>

using namespace std;

int main() {
    string line;
    if (!getline(cin, line)) return 0;
    stringstream ss(line);
    string val;
    vector<string> vals;
    while (ss >> val) {
        vals.push_back(val);
    }
    reverse(vals.begin(), vals.end());
    for (int i = 0; i < vals.size(); ++i) {
        cout << vals[i] << (i == vals.size() - 1 ? "" : " ");
    }
    cout << endl;
    return 0;
}`
      },
      {
        language: 'c',
        code: `#include <stdio.h>

int main() {
    int arr[5000];
    int count = 0;
    int val;
    while (scanf("%d", &val) == 1) {
        arr[count++] = val;
    }
    for (int i = count - 1; i >= 0; --i) {
        printf("%d%s", arr[i], (i == 0 ? "" : " "));
    }
    printf("\\n");
    return 0;
}`
      },
      {
        language: 'java',
        code: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) {
            System.out.println("");
            return;
        }
        String[] parts = line.trim().split("\\\\s+");
        List<String> list = Arrays.asList(parts);
        Collections.reverse(list);
        System.out.println(String.join(" ", list));
    }
}`
      }
    ],
    testCases: [
      { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', isSample: true },
      { input: '1 2', expectedOutput: '2 1', isSample: true }
    ],
    hiddenTestCases: [
      { input: '42', expectedOutput: '42' },
      { input: '10 20 30 40 50 60 70 80 90', expectedOutput: '90 80 70 60 50 40 30 20 10' },
      { input: '', expectedOutput: '' }
    ],
    editorial: {
      approaches: [
        {
          title: 'Iterative Swapping',
          description: 'Store the next node, reverse the current node\'s pointer to point to previous, move previous to current, and current to next.',
          code: `def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
          language: 'python',
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(1)'
        }
      ],
      videoUrl: 'https://www.youtube.com/embed/G0_I-ZF0S38',
      complexityAnalysis: 'Time Complexity is O(N) where N is list length. Space Complexity is O(1) auxiliary space.'
    }
  },
  {
    title: 'Valid Parentheses',
    description: 'Given a string `s` containing just the characters `\'(\'`, `\')\'`, `\'{\'`, `\'}\'`, `\'[\'` and `\']\'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
    difficulty: 'Easy',
    topic: 'Stack',
    inputFormat: 'A single line containing the string `s`.',
    outputFormat: 'Print `true` if the string is valid, otherwise print `false`.',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
    examples: [
      {
        input: '()[]{}',
        output: 'true',
        explanation: 'All brackets are closed correctly in sequential order.'
      },
      {
        input: '(]',
        output: 'false',
        explanation: 'Open paren is closed by wrong bracket type.'
      }
    ],
    hints: [
      'Use a stack to keep track of open brackets.',
      'Push open brackets. When a closing bracket appears, pop the top and check if it matches.'
    ],
    companyTags: ['Google', 'Amazon', 'Facebook'],
    points: 10,
    starterCode: [
      {
        language: 'python',
        code: `import sys

def isValid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top_element = stack.pop() if stack else '#'
            if mapping[char] != top_element:
                return False
        else:
            stack.append(char)
    return not stack

def solve():
    input_str = sys.stdin.read().strip()
    print("true" if isValid(input_str) else "false")

if __name__ == '__main__':
    solve()`
      },
      {
        language: 'javascript',
        code: `const fs = require('fs');

function isValid(s) {
    const stack = [];
    const mapping = { ')': '(', '}': '{', ']': '[' };
    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        if (mapping[char] !== undefined) {
            const top = stack.length ? stack.pop() : '#';
            if (mapping[char] !== top) return false;
        } else {
            stack.push(char);
        }
    }
    return stack.length === 0;
}

function solve() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    console.log(isValid(input) ? 'true' : 'false');
}

solve();`
      },
      {
        language: 'cpp',
        code: `#include <iostream>
#include <stack>
#include <unordered_map>
#include <string>

using namespace std;

bool isValid(string s) {
    stack<char> st;
    unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};
    for (char c : s) {
        if (mapping.count(c)) {
            char top = st.empty() ? '#' : st.top();
            if (!st.empty()) st.pop();
            if (mapping[c] != top) return false;
        } else {
            st.push(c);
        }
    }
    return st.empty();
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << endl;
    } else {
        cout << "true" << endl; // Empty input is valid
    }
    return 0;
}`
      },
      {
        language: 'c',
        code: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isValid(char* s) {
    int len = strlen(s);
    char stack[10005];
    int top = -1;
    for (int i = 0; i < len; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            stack[++top] = c;
        } else {
            if (top == -1) return false;
            char t = stack[top--];
            if (c == ')' && t != '(') return false;
            if (c == ']' && t != '[') return false;
            if (c == '}' && t != '{') return false;
        }
    }
    return top == -1;
}

int main() {
    char s[10005];
    if (scanf("%s", s) == 1) {
        printf("%s\\n", isValid(s) ? "true" : "false");
    } else {
        printf("true\\n");
    }
    return 0;
}`
      },
      {
        language: 'java',
        code: `import java.util.*;
import java.io.*;

public class Main {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        HashMap<Character, Character> map = new HashMap<>();
        map.put(')', '(');
        map.put('}', '{');
        map.put(']', '[');
        
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (map.containsKey(c)) {
                char top = stack.isEmpty() ? '#' : stack.pop();
                if (map.get(c) != top) return false;
            } else {
                stack.push(c);
            }
        }
        return stack.isEmpty();
    }
    
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        String s = (line != null) ? line.trim() : "";
        System.out.println(isValid(s) ? "true" : "false");
    }
}`
      }
    ],
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isSample: true },
      { input: '(]', expectedOutput: 'false', isSample: true }
    ],
    hiddenTestCases: [
      { input: '((([])))', expectedOutput: 'true' },
      { input: '(', expectedOutput: 'false' },
      { input: '[(])', expectedOutput: 'false' },
      { input: '[[[]]]', expectedOutput: 'true' }
    ],
    editorial: {
      approaches: [
        {
          title: 'Stack-based Matching',
          description: 'Use a stack data structure to hold matching open brackets. When a close bracket is seen, verify if stack is non-empty and match corresponds.',
          code: `def isValid(s):\n    st = []\n    m = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in m:\n            if not st or st.pop() != m[c]: return False\n        else: st.append(c)\n    return not st`,
          language: 'python',
          timeComplexity: 'O(N)',
          spaceComplexity: 'O(N)'
        }
      ],
      videoUrl: 'https://www.youtube.com/embed/WTzjTcl9u9E',
      complexityAnalysis: 'Time Complexity is O(N) as we scan the string once. Space Complexity is O(N) for the bracket storage in the stack.'
    }
  }
];

const achievementsData = [
  { title: 'Corps Initiate', description: 'Solve your first practice problem successfully!', xpReward: 50, coinsReward: 10, badgeName: 'Corps Initiate 🥋', category: 'problems', requirementCount: 1 },
  { title: 'Arrays Hashira', description: 'Solve 2 problems under the Arrays topic.', xpReward: 100, coinsReward: 20, badgeName: 'Arrays Hashira 🌊', category: 'problems', requirementCount: 2 },
  { title: 'Streak Slayer', description: 'Build a consecutive coding streak of 3 days.', xpReward: 150, coinsReward: 30, badgeName: 'Streak Slayer 🔥', category: 'streaks', requirementCount: 3 }
];

const seed = async () => {
  try {
    await connectDB();

    console.log('🧹 Clearing practice models...');
    await Problem.deleteMany({});
    await TestCase.deleteMany({});
    await HiddenTestCase.deleteMany({});
    await Editorial.deleteMany({});
    await Achievement.deleteMany({});
    await DailyChallenge.deleteMany({});
    await WeeklyChallenge.deleteMany({});
    await Contest.deleteMany({});

    console.log('🌱 Seeding Problems, Test Cases, and Editorials...');
    for (const prob of problemsData) {
      const p = new Problem({
        title: prob.title,
        description: prob.description,
        difficulty: prob.difficulty,
        topic: prob.topic,
        inputFormat: prob.inputFormat,
        outputFormat: prob.outputFormat,
        constraints: prob.constraints,
        examples: prob.examples,
        starterCode: prob.starterCode,
        hints: prob.hints,
        companyTags: prob.companyTags,
        points: prob.points
      });
      await p.save();

      // Seed test cases
      for (const tc of prob.testCases) {
        const testCase = new TestCase({
          problemId: p._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample
        });
        await testCase.save();
      }

      // Seed hidden test cases
      for (const htc of prob.hiddenTestCases) {
        const hiddenCase = new HiddenTestCase({
          problemId: p._id,
          input: htc.input,
          expectedOutput: htc.expectedOutput
        });
        await hiddenCase.save();
      }

      // Seed editorial
      const edit = new Editorial({
        problemId: p._id,
        approaches: prob.editorial.approaches,
        videoUrl: prob.editorial.videoUrl,
        complexityAnalysis: prob.editorial.complexityAnalysis
      });
      await edit.save();
    }

    console.log('🌱 Seeding Achievements...');
    await Achievement.insertMany(achievementsData);

    console.log('🌱 Seeding Daily Challenges & Contests...');
    const solvedProb = await Problem.findOne({ title: 'Two Sum' });
    const listProb = await Problem.findOne({ title: 'Reverse Linked List' });
    const stackProb = await Problem.findOne({ title: 'Valid Parentheses' });

    if (solvedProb && listProb && stackProb) {
      // Seed a Contest
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const prevWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prevWeekEnd = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

      const contest1 = new Contest({
        title: 'Final Selection Tournament #1',
        description: 'Prove your breathing form mastery in the Final Selection. Standings will reward rating points!',
        problems: [solvedProb._id, listProb._id],
        startTime: nextWeek, // Upcoming
        endTime: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000)
      });
      await contest1.save();

      const contest2 = new Contest({
        title: 'Mugen Train Showdown',
        description: 'Compete in real time. Can you write perfect code under pressure?',
        problems: [solvedProb._id, stackProb._id],
        startTime: new Date(now.getTime() - 30 * 60 * 1000), // Live (started 30 min ago)
        endTime: new Date(now.getTime() + 90 * 60 * 1000)
      });
      await contest2.save();

      const contest3 = new Contest({
        title: 'Mount Natagumo Trial',
        description: 'This contest has concluded. View rankings and review editorial codes.',
        problems: [listProb._id, stackProb._id],
        startTime: prevWeek,
        endTime: prevWeekEnd
      });
      await contest3.save();
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
