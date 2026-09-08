const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
const start = s.indexOf('id="adhkarPage"');
const next = s.indexOf('id="tasbeehPage"', start);
console.log('--- ADHKAR PAGE CURRENT HTML ---');
console.log(s.substring(start - 25, next !== -1 ? next - 10 : start + 1200));
