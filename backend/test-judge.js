const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const Problem = require('./models/Problem');
const TestCase = require('./models/TestCase');
const HiddenTestCase = require('./models/HiddenTestCase');
const judgeService = require('./services/judgeService');

const runTest = async () => {
  try {
    await connectDB();
    console.log('📦 Connected to MongoDB for testing...');

    const problem = await Problem.findOne({ title: 'Two Sum' });
    if (!problem) {
      console.error('❌ Could not find Two Sum problem in database. Did you run the seeder?');
      process.exit(1);
    }

    console.log(`Found Problem: ${problem.title}`);

    // Gather test cases
    const sampleCases = await TestCase.find({ problemId: problem._id }).lean();
    const hiddenCases = await HiddenTestCase.find({ problemId: problem._id }).lean();
    const allCases = [...sampleCases, ...hiddenCases];

    console.log(`Gathered ${allCases.length} test cases (sample + hidden).`);

    // 1. Correct Python Code
    const correctPythonCode = `import sys
def solve():
    lines = sys.stdin.read().splitlines()
    if not lines: return
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i
solve()`;

    console.log('\n--- Test 1: Correct Python Code ---');
    const result1 = await judgeService.judge('python', correctPythonCode, allCases);
    console.log('Result:', result1);
    if (result1.status === 'Accepted') {
      console.log('✅ Test 1 Passed: Output matches perfectly!');
    } else {
      console.error('❌ Test 1 Failed: Expected Accepted but got', result1.status);
    }

    // 2. Wrong Python Code
    const wrongPythonCode = `print("0 0")`; // will always output wrong answer
    console.log('\n--- Test 2: Wrong Python Code ---');
    const result2 = await judgeService.judge('python', wrongPythonCode, allCases);
    console.log('Result:', result2);
    if (result2.status === 'Wrong Answer') {
      console.log('✅ Test 2 Passed: Wrong Answer detected successfully!');
    } else {
      console.error('❌ Test 2 Failed: Expected Wrong Answer but got', result2.status);
    }

    // 3. Compile/Syntax Error Python Code
    const syntaxErrorPythonCode = `def solve(: # syntax error`;
    console.log('\n--- Test 3: Syntax Error Python Code ---');
    const result3 = await judgeService.judge('python', syntaxErrorPythonCode, allCases);
    console.log('Result:', result3);
    if (result3.status === 'Runtime Error' || result3.status === 'Compilation Error' || result3.status === 'Error') {
      console.log('✅ Test 3 Passed: Python compilation/syntax error caught successfully!');
    } else {
      console.error('❌ Test 3 Failed: Expected compilation/runtime error but got', result3.status);
    }

    console.log('\nAll judge engine verification tests complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Judging test failed with error:', error.message);
    process.exit(1);
  }
};

runTest();
