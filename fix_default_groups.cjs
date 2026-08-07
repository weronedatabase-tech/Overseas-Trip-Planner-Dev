const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/let activeGroupsList = JSON\.parse\(localStorage\.getItem\('activeGroupsList'\)\) \|\| \["1", "2", "3", "4", "5", "6", "7"\];/,
`let activeGroupsList = JSON.parse(localStorage.getItem('activeGroupsList')) || [];`);

code = code.replace(/let activeBusesList = JSON\.parse\(localStorage\.getItem\('activeBusesList'\)\) \|\| \["1", "2", "3", "4", "5"\];/,
`let activeBusesList = JSON.parse(localStorage.getItem('activeBusesList')) || [];`);

fs.writeFileSync('frontend/js/logistics.js', code);
