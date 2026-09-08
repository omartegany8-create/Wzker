const fs = require('fs');
const s = fs.readFileSync('index.html', 'utf8');
const headEnd = s.indexOf('</head>');
console.log(s.substring(headEnd - 1000, headEnd));
