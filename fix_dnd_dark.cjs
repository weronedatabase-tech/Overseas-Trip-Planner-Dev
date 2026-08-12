const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/bg-blue-50', 'dark:bg-gray-800/g, "bg-blue-50', 'dark:bg-blue-900/30");

fs.writeFileSync('frontend/js/logistics.js', code);
