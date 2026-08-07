const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/if \(!query \|\| "unassign"\.includes\(query\)\) \{/, `if (activeAssignNric && (!query || "unassign".includes(query))) {`);

fs.writeFileSync('frontend/js/logistics.js', code);
