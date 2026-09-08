const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
const p1 = s.indexOf('id="adhkarPage"');
const p2 = s.indexOf('<!-- 2.', p1);
console.log('p1:', p1, 'p2:', p2);
console.log(s.substring(p1, p2));
