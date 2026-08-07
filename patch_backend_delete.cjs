const fs = require('fs');
let code = fs.readFileSync('backend/Code.js', 'utf8');

const delFunc = `
function deleteParticipant(nric) {
  const ss = getDatabase();
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const mainSheet = ss.getSheetByName("Raw Data");
    let delSheet = ss.getSheetByName("Deleted Participants");
    if (!delSheet) {
      delSheet = ss.insertSheet("Deleted Participants");
      const headers = mainSheet.getRange(1, 1, 1, mainSheet.getMaxColumns()).getValues();
      delSheet.appendRow(headers[0]);
      delSheet.getRange(1, 1, 1, delSheet.getMaxColumns()).setFontWeight("bold");
    }

    const data = mainSheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][11]).trim().toUpperCase() === String(nric || '').trim().toUpperCase()) {
        rowIndex = i + 1; // +1 for 1-based index
        break;
      }
    }

    if (rowIndex === -1) {
      return { status: 'error', message: 'Participant not found.' };
    }

    const rowData = mainSheet.getRange(rowIndex, 1, 1, mainSheet.getMaxColumns()).getValues();
    delSheet.appendRow(rowData[0]);
    mainSheet.deleteRow(rowIndex);
    
    // Clear caches
    CacheService.getScriptCache().remove(getCacheKey('ROSTER'));
    CacheService.getScriptCache().remove(getCacheKey('LOGISTICS'));
    precomputeAppCache();

    return { status: 'success' };
  } catch (e) {
    return { status: 'error', message: e.message };
  } finally {
    lock.releaseLock();
  }
}
`;

code = code.replace(/case 'updateProfile': result = updateProfile\(data\.member, data\.isAdmin\); break;/g, "case 'updateProfile': result = updateProfile(data.member, data.isAdmin); break;\ncase 'deleteParticipant': result = deleteParticipant(data.nric); break;");

if (!code.includes("function deleteParticipant(")) {
    code += delFunc;
}

fs.writeFileSync('backend/Code.js', code);
