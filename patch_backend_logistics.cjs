const fs = require('fs');
let code = fs.readFileSync('backend/Code.js', 'utf8');

// 1. In getParticipants / getLogistics, add logisticsGroup
code = code.replace(/bus: String\(data\[i\]\[24\]\|\|''\)\.trim\(\)/, 
`bus: String(data[i][24]||'').trim(),
  logisticsGroup: String(data[i][25]||'').trim()`);

code = code.replace(/bus: String\(pData\[i\]\[24\]\|\|''\)\.trim\(\)/, 
`bus: String(pData[i][24]||'').trim(),
  logisticsGroup: String(pData[i][25]||'').trim()`);

// 2. In syncAssignments
code = code.replace(/let colIndex = column === 'group' \? 6 : 24;/, 
`let colIndex = 25;
if (column === 'group') colIndex = 6;
else if (column === 'bus') colIndex = 24;
else if (column === 'logisticsGroup') colIndex = 25;`);

fs.writeFileSync('backend/Code.js', code);
