const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
const p = s.lastIndexOf('<script');
console.log(s.substring(p - 500));
