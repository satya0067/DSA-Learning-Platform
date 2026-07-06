const codeExecutor = require('./codeExecutor');
const { performance } = require('perf_hooks');

/**
 * Normalizes string outputs to prevent whitespace, casing, or Windows/Linux newline differences
 */
const normalizeOutput = (str) => {
  if (!str) return '';
  return str.toString()
    .replace(/\r\n/g, '\n') // Normalize newlines
    .replace(/\r/g, '\n')
    .trim()
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .join('\n');
};

/**
 * Evaluates a code string against a list of test cases
 * @param {string} language - python, java, c, cpp, javascript
 * @param {string} code - User solution source code
 * @param {Array} testCases - Array of objects with { input, expectedOutput }
 * @returns {Promise<Object>} - Judging result
 */
const judge = async (language, code, testCases) => {
  if (!testCases || testCases.length === 0) {
    return { status: 'Accepted', runtime: 0, memory: 0 };
  }

  let totalRuntime = 0;
  let maxRuntime = 0;
  
  // Estimate baseline memory usage based on runtime language (in KB)
  const memoryBaselines = {
    c: 1200 + Math.floor(Math.random() * 800),         // ~1.2MB - 2.0MB
    cpp: 1500 + Math.floor(Math.random() * 1000),      // ~1.5MB - 2.5MB
    java: 28000 + Math.floor(Math.random() * 5000),    // ~28MB - 33MB
    python: 18000 + Math.floor(Math.random() * 4000),  // ~18MB - 22MB
    javascript: 25000 + Math.floor(Math.random() * 5000) // ~25MB - 30MB
  };
  const estimatedMemory = memoryBaselines[language.toLowerCase()] || 15000;

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const startTime = performance.now();

    const result = await codeExecutor.execute(language, code, testCase.input);
    
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    totalRuntime += duration;
    if (duration > maxRuntime) maxRuntime = duration;

    // Handle compilation errors (checked on first run)
    if (result.status === 'Compilation Error') {
      return {
        status: 'Compilation Error',
        errorOutput: result.output,
        failedTestCaseIndex: i
      };
    }

    // Handle process timeouts (TLE)
    if (result.status === 'Timeout') {
      return {
        status: 'Time Limit Exceeded',
        failedTestCaseIndex: i + 1,
        runtime: maxRuntime
      };
    }

    // Handle execution failures (RE)
    if (result.status === 'Error') {
      return {
        status: 'Runtime Error',
        errorOutput: result.output,
        failedTestCaseIndex: i + 1,
        runtime: maxRuntime
      };
    }

    // Check outputs
    const actual = normalizeOutput(result.output);
    const expected = normalizeOutput(testCase.expectedOutput);

    if (actual !== expected) {
      return {
        status: 'Wrong Answer',
        failedTestCaseIndex: i + 1,
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: result.output, // Show raw actual output
        runtime: maxRuntime
      };
    }
  }

  // All test cases passed!
  const avgRuntime = Math.round(totalRuntime / testCases.length);
  return {
    status: 'Accepted',
    runtime: avgRuntime,
    memory: estimatedMemory
  };
};

module.exports = { judge };
