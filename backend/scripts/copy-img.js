const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'img');
const dest = path.join(__dirname, '..', 'dist', 'img');

if (!fs.existsSync(src)) {
  process.exit(0);
}

function copyRecursive(srcPath, destPath) {
  fs.mkdirSync(destPath, { recursive: true });
  for (const name of fs.readdirSync(srcPath)) {
    const srcFile = path.join(srcPath, name);
    const destFile = path.join(destPath, name);
    if (fs.statSync(srcFile).isDirectory()) {
      copyRecursive(srcFile, destFile);
    } else {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}

copyRecursive(src, dest);
