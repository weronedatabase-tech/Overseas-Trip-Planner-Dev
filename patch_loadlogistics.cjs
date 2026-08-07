const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/renderPairings\(\);\s*renderRooms\(\);/g, "renderPairings();\n    renderRooms();\n    renderGroups();\n    renderBuses();");

fs.writeFileSync('frontend/js/logistics.js', code);
