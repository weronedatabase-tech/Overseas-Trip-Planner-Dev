const fs = require('fs');
let code = fs.readFileSync('frontend/js/minutes.js', 'utf8');
code = code.replace(/text-gray-400 hover:text-red-500 bg-white/g, 'text-red-500 hover:text-red-600 bg-white');
fs.writeFileSync('frontend/js/minutes.js', code);
