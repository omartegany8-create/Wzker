const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/rn0x_adhkar.json', 'utf8'));
data[0].array.forEach((item, idx) => {
  console.log('[' + (idx+1) + '] audio: ' + item.audio + ' count: ' + item.count);
  console.log('    text: ' + item.text.replace(/\n/g, ' ').substring(0, 80) + '...');
});
