const fs = require('fs');
let code = fs.readFileSync('backend/Code.js', 'utf8');

const newSync = `
function syncAssignments(updates, column) {
const ss = getDatabase();
const sheet = ss.getSheetByName("Raw Data");
const lock = LockService.getScriptLock();
try {
lock.waitLock(15000);
const data = sheet.getDataRange().getValues();
const existingMap = {};
for (let i = 1; i < data.length; i++) {
  const nric = String(data[i][11]).trim().toUpperCase();
  if (nric) existingMap[nric] = i;
}
let colIndex = column === 'group' ? 6 : 24;
let dataChanged = false;

// Ensure all rows are at least colIndex + 1 in length
const targetLength = Math.max(data[0].length, colIndex + 1);
for (let i = 0; i < data.length; i++) {
    while (data[i].length < targetLength) {
        data[i].push("");
    }
}

updates.forEach(u => {
  if (existingMap[u.nric] !== undefined) {
    const rowIndex = existingMap[u.nric];
    if (data[rowIndex][colIndex] !== u.value) {
        data[rowIndex][colIndex] = u.value || '';
        dataChanged = true;
    }
  }
});

if (dataChanged) {
  if (sheet.getMaxColumns() < targetLength) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), targetLength - sheet.getMaxColumns());
  }
  sheet.getRange(1, 1, data.length, targetLength).setValues(data);
  SpreadsheetApp.flush();
  CacheService.getScriptCache().remove(getCacheKey('ROSTER'));
  CacheService.getScriptCache().remove(getCacheKey('LOGISTICS'));
  precomputeAppCache();
}
return { status: 'success' };
`;

const oldStart = code.indexOf('function syncAssignments(updates, column) {');
const oldEnd = code.indexOf('return { status: \'success\' };', oldStart) + "return { status: 'success' };\n} catch(e) {".length - "\n} catch(e) {".length;

if (oldStart !== -1) {
    code = code.substring(0, oldStart) + newSync + code.substring(oldEnd);
    fs.writeFileSync('backend/Code.js', code);
    console.log("Patched syncAssignments");
} else {
    console.log("Could not find syncAssignments");
}

