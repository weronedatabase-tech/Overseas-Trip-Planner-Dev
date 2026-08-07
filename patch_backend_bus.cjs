const fs = require('fs');
let code = fs.readFileSync('backend/Code.js', 'utf8');

// 1. Add 'bus' to fetchAdminRoster
code = code.replace(/medical: String\(data\[i\]\[23\]\|\|''\)\.trim\(\)/g, "medical: String(data[i][23]||'').trim(),\n  bus: String(data[i][24]||'').trim()");

// 2. Add 'bus' to fetchLogistics
code = code.replace(/pocNric: String\(pData\[i\]\[21\]\)\.trim\(\)\.toUpperCase\(\),/g, "pocNric: String(pData[i][21]).trim().toUpperCase(),\n  bus: String(pData[i][24]||'').trim(),");

// 3. Add generic syncAssignments function
const syncAssignmentsFunc = `
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
  // Ensure the sheet has enough columns
  if (sheet.getMaxColumns() <= colIndex) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), colIndex - sheet.getMaxColumns() + 1);
  }
  sheet.getRange(1, 1, data.length, Math.max(data[0].length, colIndex + 1)).setValues(data);
  SpreadsheetApp.flush();
  CacheService.getScriptCache().remove(getCacheKey('ROSTER'));
  CacheService.getScriptCache().remove(getCacheKey('LOGISTICS'));
  precomputeAppCache();
}
return { status: 'success' };
} catch(e) { return { status: 'error', message: e.message }; }
finally { lock.releaseLock(); }
}
`;

// Add to switch
code = code.replace(/case 'syncRoomUpdates': result = syncRoomUpdates\(data\.updates, data\.takenBy \|\| 'Admin'\); break;/g, "case 'syncRoomUpdates': result = syncRoomUpdates(data.updates, data.takenBy || 'Admin'); break;\ncase 'syncAssignments': result = syncAssignments(data.updates, data.column); break;");

if (!code.includes("function syncAssignments(")) {
    code += syncAssignmentsFunc;
}

fs.writeFileSync('backend/Code.js', code);
