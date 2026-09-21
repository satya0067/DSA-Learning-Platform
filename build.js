const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting DSA Platform Build for Vercel...');

// 1. Build the code editor
console.log('📦 Installing dependencies and building Code Editor...');
execSync('npm --prefix "code editor" install --include=dev', { stdio: 'inherit' });
execSync('npm --prefix "code editor" run build', { stdio: 'inherit' });

// 2. Prepare the public directory
const publicDir = path.join(__dirname, 'public');
const frontendDir = path.join(__dirname, 'frontend');
const codeEditorDistDir = path.join(__dirname, 'code editor', 'dist');

if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });

// 3. Copy frontend contents into public/
console.log('📁 Copying frontend files to public/...');
fs.cpSync(frontendDir, publicDir, { recursive: true });

// 4. Copy code editor dist into public/code-editor/
const targetCodeEditorDir = path.join(publicDir, 'code-editor');
console.log('📁 Copying code-editor build to public/code-editor/...');
fs.cpSync(codeEditorDistDir, targetCodeEditorDir, { recursive: true });

console.log('✅ Build completed successfully! Public directory ready for Vercel.');
