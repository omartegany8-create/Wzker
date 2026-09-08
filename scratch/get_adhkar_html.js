const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
const p1 = s.indexOf('<!-- 1. ADHKAR PAGE -->');
const p2 = s.indexOf('<!-- 2.', p1);
console.log('--- FOUND SECTION ---');
console.log(s.substring(p1, p2));
