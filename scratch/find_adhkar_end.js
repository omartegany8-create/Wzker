const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
const p1 = s.indexOf('<!-- 1. ADHKAR PAGE');
const pEnd = s.indexOf('<!-- 2.', p1);
console.log('p1:', p1, 'pEnd:', pEnd);
console.log(s.substring(p1, p1 + 300));
console.log('--- END OF ADHKAR ---');
console.log(s.substring(pEnd - 400, pEnd));
