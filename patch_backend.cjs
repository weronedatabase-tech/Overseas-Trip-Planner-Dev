const fs = require('fs');
let path = './backend/Code.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/pocNric: String\(data\[i\]\[21\]\|\|''\)\.trim\(\)\.toUpperCase\(\)/g, "pocNric: String(data[i][21]||data[i][11]||'').trim().toUpperCase()");
content = content.replace(/pocNric: String\(pData\[i\]\[21\]\)\.trim\(\)\.toUpperCase\(\)/g, "pocNric: String(pData[i][21]||pData[i][11]||'').trim().toUpperCase()");

fs.writeFileSync(path, content);
