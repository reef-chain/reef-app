const fs = require('fs');
const path = require('path');

const srcDir = path.resolve(__dirname, '../node_modules/@reef-chain/ui-kit/src/ui-kit/assets/avatars');
const destDir = path.resolve(__dirname, '../public/images/avatars');

if (!fs.existsSync(srcDir)) {
  console.error('Avatar source directory not found:', srcDir);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
for (const file of fs.readdirSync(srcDir)) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  fs.copyFileSync(src, dest);
}
