const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../node_modules/@reef-chain/ui-kit/src/ui-kit/assets/avatars');
const destDir = path.resolve(__dirname, '../public/images/avatars');

if (!fs.existsSync(srcDir)) {
  console.error(`Source directory not found: ${srcDir}`);
  process.exit(0);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.readdirSync(srcDir).forEach(file => {
  const srcFile = path.join(srcDir, file);
  const destFile = path.join(destDir, file);
  fs.copyFileSync(srcFile, destFile);
});

console.log(`Avatars copied to ${destDir}`);

