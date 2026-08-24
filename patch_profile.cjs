const fs = require('fs');
const path = './frontend/js/profile.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/if \(!hasCaregiver\) targetNric = loadedFamily\[0\]\.nric;\n/g, "");
content = content.replace(/if \(!loadedFamily\.some\(m => m\.role === 'CAREGIVER'\)\) targetNric = loadedFamily\[0\]\.nric;\n/g, "");

fs.writeFileSync(path, content);
