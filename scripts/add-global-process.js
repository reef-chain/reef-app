const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../node_modules/@reef-chain/ui-kit/dist/index.es.js');

const contentToAdd = `
globalThis.process = {};
globalThis.process.env = {
  'POLKADOTJS_DISABLE_ESM_CJS_WARNING':'1'
};
`;

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  const updatedContent = contentToAdd + data;

  fs.writeFile(filePath, updatedContent, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to file:', err);
    } else {
      console.log('File successfully updated.');
    }
  });
});
