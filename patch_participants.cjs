const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

// Replace 250px default width for fullName with a calculation or CSS min/max
code = code.replace(/style="width: 250px; min-width: 250px; max-width: 250px;"/g, 
    'style="width: min(250px, 33vw); min-width: min(250px, 33vw); max-width: 33vw;"');

code = code.replace(/const colDef = colId === 'fullName' \? \{width: 250\} : rosterCols.find\(c => c.id === colId\);/g,
    'const colDef = colId === \'fullName\' ? {width: Math.min(250, window.innerWidth / 3)} : rosterCols.find(c => c.id === colId);');

fs.writeFileSync('frontend/js/participants.js', code);
console.log("Patched participants.js");
