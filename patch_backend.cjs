const fs = require('fs');
let code = fs.readFileSync('backend/Code.js', 'utf8');

// update getParticipantSummary case
code = code.replace(
    "case 'getParticipantSummary': result = getParticipantSummary(data.nric); break;",
    "case 'adminUpdateParticipant': result = updateProfile(data.member, true); break;\ncase 'deleteParticipant': result = deleteParticipant(data.nric); break;"
);

// update updateProfile
code = code.replace(
    "function updateProfile(member) {",
    "function updateProfile(member, isAdmin = false) {"
);
code = code.replace(
    "if (props.getProperty('ALLOW_EDITS') !== 'true') return { status: 'error', message: 'Editing locked.' };",
    "if (!isAdmin && props.getProperty('ALLOW_EDITS') !== 'true') return { status: 'error', message: 'Editing locked.' };"
);

const deleteFunc = `
function deleteParticipant(nric) {
  const ss = getDatabase();
  const sheet = ss.getSheetByName("Raw Data");
  let archiveSheet = ss.getSheetByName("Archived Participants");
  
  if (!archiveSheet) {
    archiveSheet = ss.insertSheet("Archived Participants");
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    archiveSheet.appendRow(headers);
  }
  
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const data = sheet.getDataRange().getValues();
    
    let rowIndex = -1;
    let rowData = null;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][11]).trim().toUpperCase() === String(nric || '').trim().toUpperCase()) {
        rowIndex = i + 1;
        rowData = data[i];
        break;
      }
    }
    
    if (rowIndex === -1) return { status: 'error', message: 'Participant not found.' };
    
    archiveSheet.appendRow(rowData);
    sheet.deleteRow(rowIndex);
    
    CacheService.getScriptCache().remove(getCacheKey('ROSTER'));
    return { status: 'success' };
  } catch(e) {
    return { status: 'error', message: e.message };
  } finally {
    lock.releaseLock();
  }
}
`;

code += deleteFunc;

fs.writeFileSync('backend/Code.js', code);
