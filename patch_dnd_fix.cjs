const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

code = code.replace(/e\.dataTransfer\.effectAllowed = "move";/g, "e.dataTransfer.effectAllowed = 'move';\ne.dataTransfer.setData('text/plain', colId);");
fs.writeFileSync('frontend/js/participants.js', code);
