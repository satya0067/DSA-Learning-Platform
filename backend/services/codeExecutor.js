const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function spawnWithTimeout(command, args, options, stdin, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';
    let timedOut = false;

    const child = spawn(command, args, options);

    const timeout = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    if (child.stdin) {
      child.stdin.on('error', (err) => {
        console.error('stdin stream error:', err.message);
      });
      if (stdin) {
        child.stdin.write(stdin);
      }
      child.stdin.end();
    }

    if (child.stdout) {
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
    }

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (timedOut) {
        resolve({ output: `Execution timed out after ${timeoutMs / 1000} seconds.`, status: 'Timeout' });
      } else if (code === 0) {
        resolve({ output, status: 'Success' });
      } else {
        resolve({ output: errorOutput || output || `Process exited with code ${code}`, status: 'Error' });
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

const execute = async (language, code, stdin = '') => {
  try {
    if (typeof language !== 'string' || !language.trim()) {
      throw new Error('Language is required');
    }
    if (typeof code !== 'string' || !code.trim()) {
      throw new Error('Code is required');
    }

    const supportedLanguages = ['python', 'java', 'c', 'cpp', 'javascript'];
    const lowerLang = language.toLowerCase();
    if (!supportedLanguages.includes(lowerLang)) {
      throw new Error('Unsupported language');
    }

    let result;
    switch (lowerLang) {
      case 'python':
        result = await executePython(code, stdin);
        break;
      case 'java':
        result = await executeJava(code, stdin);
        break;
      case 'c':
        result = await executeC(code, stdin);
        break;
      case 'cpp':
        result = await executeCpp(code, stdin);
        break;
      case 'javascript':
        result = await executeJavaScript(code, stdin);
        break;
      default:
        throw new Error('Unsupported language');
    }

    return {
      output: result.output || 'No output returned.',
      status: result.status,
    };
  } catch (error) {
    return {
      output: 'Code execution failed: ' + error.message,
      status: 'Error',
    };
  }
};

async function executePython(code, stdin) {
  const tempDir = createTempDir();
  const filePath = path.join(tempDir, 'main.py');
  fs.writeFileSync(filePath, code);

  try {
    const result = await spawnWithTimeout('python', ['main.py'], { cwd: tempDir }, stdin);
    return result;
  } catch (err) {
    return { output: `Failed to run Python: ${err.message}`, status: 'Error' };
  } finally {
    cleanupTempDir(tempDir);
  }
}

async function executeJava(code, stdin) {
  const tempDir = createTempDir();

  // Strip comments to locate the class name cleanly
  const cleanCode = code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '');

  const classMatch = cleanCode.match(/(?:public\s+)?class\s+([a-zA-Z0-9_$]+)/);
  const className = classMatch ? classMatch[1] : 'Main';

  const filePath = path.join(tempDir, `${className}.java`);
  fs.writeFileSync(filePath, code);

  try {
    // Compile (timeout of 8 seconds for compile)
    const compileResult = await spawnWithTimeout('javac', [`${className}.java`], { cwd: tempDir });
    if (compileResult.status !== 'Success') {
      return {
        output: compileResult.output || 'Compilation failed',
        status: 'Compilation Error',
      };
    }

    // Execute
    const runResult = await spawnWithTimeout('java', ['-cp', '.', className], { cwd: tempDir }, stdin);
    return runResult;
  } catch (err) {
    return { output: `Failed to execute Java: ${err.message}`, status: 'Error' };
  } finally {
    cleanupTempDir(tempDir);
  }
}

async function executeC(code, stdin) {
  const tempDir = createTempDir();
  const filePath = path.join(tempDir, 'main.c');
  const exePath = path.join(tempDir, 'main.exe');
  fs.writeFileSync(filePath, code);

  try {
    // Compile
    const compileResult = await spawnWithTimeout('gcc', ['main.c', '-o', 'main.exe'], { cwd: tempDir });
    if (compileResult.status !== 'Success') {
      return {
        output: compileResult.output || 'Compilation failed',
        status: 'Compilation Error',
      };
    }

    // Execute
    const runResult = await spawnWithTimeout(exePath, [], { cwd: tempDir }, stdin);
    return runResult;
  } catch (err) {
    return { output: `Failed to execute C program: ${err.message}`, status: 'Error' };
  } finally {
    cleanupTempDir(tempDir);
  }
}

async function executeCpp(code, stdin) {
  const tempDir = createTempDir();
  const filePath = path.join(tempDir, 'main.cpp');
  const exePath = path.join(tempDir, 'main.exe');
  fs.writeFileSync(filePath, code);

  try {
    // Compile
    const compileResult = await spawnWithTimeout('g++', ['main.cpp', '-o', 'main.exe'], { cwd: tempDir });
    if (compileResult.status !== 'Success') {
      return {
        output: compileResult.output || 'Compilation failed',
        status: 'Compilation Error',
      };
    }

    // Execute
    const runResult = await spawnWithTimeout(exePath, [], { cwd: tempDir }, stdin);
    return runResult;
  } catch (err) {
    return { output: `Failed to execute C++ program: ${err.message}`, status: 'Error' };
  } finally {
    cleanupTempDir(tempDir);
  }
}

async function executeJavaScript(code, stdin) {
  const tempDir = createTempDir();
  const filePath = path.join(tempDir, 'main.js');
  fs.writeFileSync(filePath, code);

  try {
    const result = await spawnWithTimeout('node', ['main.js'], { cwd: tempDir }, stdin);
    return result;
  } catch (err) {
    return { output: `Failed to execute JavaScript: ${err.message}`, status: 'Error' };
  } finally {
    cleanupTempDir(tempDir);
  }
}

function createTempDir() {
  const baseDir = path.join(__dirname, 'temp');
  fs.mkdirSync(baseDir, { recursive: true });
  return fs.mkdtempSync(path.join(baseDir, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-`));
}

function cleanupTempDir(tempDir) {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch (err) {
    console.error('Failed to cleanup temp directory:', err.message);
  }
}

module.exports = { execute };
