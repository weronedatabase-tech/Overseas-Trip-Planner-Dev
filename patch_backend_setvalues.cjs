const fs = require('fs');
let code = fs.readFileSync('backend/Code.js', 'utf8');

// I will just change the loop in syncAssignments
const regex = /updates\.forEach\(u => \{[\s\S]*?\}\);/m;

const replacement = `updates.forEach(u => {
  if (existingMap[u.nric] !== undefined) {
    const rowIndex = existingMap[u.nric];
    if (data[rowIndex][colIndex] !== u.value) {
        data[rowIndex][colIndex] = u.value || '';
        dataChanged = true;
    }
  }
});

if (dataChanged) {
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
}`;

code = code.replace(/updates\.forEach\(u => \{[\s\S]*?\}\);\s*if \(dataChanged\) \{\s*SpreadsheetApp\.flush\(\);/m, replacement + '\\n  SpreadsheetApp.flush();');

fs.writeFileSync('backend/Code.js', code);
