const fs = require('fs');
const path = './frontend/js/registration.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/split\(\',\',/g, "split('|')");
content = content.replace(/split\(\',\'\)/g, "split('|')");
content = content.replace(/join\(\', \'\) \+ \', \'/g, "join(' | ') + ' | '");
content = content.replace(/join\(\',\'\)/g, "join('|')");

fs.writeFileSync(path, content);
