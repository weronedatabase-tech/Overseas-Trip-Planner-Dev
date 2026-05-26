// ==========================================
// OVERSEAS TRIP APP BACKEND - Code.gs
// ==========================================

const APP_ENV = 'DEV';
const DRIVE_FOLDERS = {
PROD: '1ROD8FT46w5vpbZdWBGxTL59hSOKHIKH-',
DEV: '162ZkzByQajQ-EE8OAoV76-VG5VXBX2BO'
};

// SAFE SETUP: Triggers authorization without wiping data.
function setupProject() {
const props = PropertiesService.getScriptProperties();
if(!props.getProperty('PASS_GENERAL')) props.setProperty('PASS_GENERAL', 'P@ssw0rd');
if(!props.getProperty('PASS_ADMIN')) props.setProperty('PASS_ADMIN', 'P@ssw0rd');
if(!props.getProperty('REGISTRATION_OPEN')) props.setProperty('REGISTRATION_OPEN', 'false');
if(!props.getProperty('ALLOW_EDITS')) props.setProperty('ALLOW_EDITS', 'false');

DriveApp.getRootFolder(); // Triggers the Drive permission prompt
console.log(`Safe setup complete for ${APP_ENV} environment.`);
}

// DANGER: Wipes all UI Settings (Run only if you want a fresh start)
function factoryResetSettings() {
const props = PropertiesService.getScriptProperties();
props.deleteProperty('COMMITTEE_LIST');
props.deleteProperty('PROJECT_GROUPS');
props.deleteProperty('PROJECT_COLORS');
props.deleteProperty('ATTENDANCE_JUNCTURES');
props.deleteProperty('SORTING_RULES');
props.deleteProperty('APP_GRANTED_ACCESS');
console.log("Settings wiped.");
}

function getDatabase() {
const dbId = PropertiesService.getScriptProperties().getProperty('DB_SHEET_ID');
if (!dbId) throw new Error("No active trip database found. The Admin must Open Registration first.");
return SpreadsheetApp.openById(dbId);
}

function setupSheets(ss) {
const requiredSheets =["Raw Data", "Finance", "Rooms", "Buses", "Groups", "Pairings", "Attendance", "Minutes"];
requiredSheets.forEach(name => {
  if (!ss.getSheetByName(name)) {
    let sheet = ss.insertSheet(name);
    if (name === "Raw Data") {
      sheet.appendRow(["Timestamp", "Email address", "Trainee / Volunteer / Caregiver", "Full Name (As stated in your Passport)", "Related Trainee's Name", "Relationship with Trainee", "Which project do you belong to?", "Gender", "Contact Number", "Home Address", "Nationality", "FULL NRIC / FIN", "Passport No.", "Passport Expiry Date", "Date of Birth", "Any dietary restrictions?", "Emergency Contact Name", "Emergency Contact Number", "Relationship with Emergency Contact", "Any sleeping arrangement request?", "Other Points to Note", "Family POC NRIC"]);
      sheet.setFrozenRows(1);
    } else if (name === "Finance") {
      sheet.appendRow(["Currency Setup", "SGD to MYR Rate:", '=GOOGLEFINANCE("CURRENCY:SGDMYR")']);
      sheet.appendRow(["Timestamp", "NRIC", "Name", "Total Amount (SGD)", "PayNow Serial", "Payment Status", "CSV Match Date"]);
      sheet.setFrozenRows(2);
    } else if (name === "Attendance") {
      sheet.appendRow(["Timestamp", "Event/Juncture", "Group/Bus", "Participant Name", "NRIC", "Status (Present/Absent)", "Taken By"]);
      sheet.setFrozenRows(1);
    } else if (name === "Pairings") {
      sheet.appendRow(["Trainee NRIC", "Volunteer NRIC"]);
      sheet.setFrozenRows(1);
    } else if (name === "Minutes") {
      sheet.appendRow(["Timestamp", "Meeting Date", "Salient Points", "Follow-up Actions", "Recorded By"]);
      sheet.setFrozenRows(1);
    }
  }
});
const defaultSheet = ss.getSheetByName("Sheet1");
if (defaultSheet && ss.getSheets().length > 1) ss.deleteSheet(defaultSheet);
}

function doPost(e) {
try {
  const data = JSON.parse(e.postData.contents);
  let result = {};
  switch(data.action) {
    case 'getSettings': result = getAppConfig(); break;
    case 'login': result = handleLogin(data.nric, data.password); break;
    case 'getProfile': result = getProfile(data.nric); break;
    case 'updateProfile': result = updateProfile(data.member); break;
    case 'submitRegistration': result = submitRegistration(data.payload); break;
    case 'toggleRegistration': result = toggleRegistration(data.status, data.tripTitle, data.tripYear); break;
    case 'toggleEdits': result = toggleEdits(data.status); break;
    case 'getCommittee': result = getCommitteeList(); break;
    case 'addCommittee': result = modifyCommitteeList(data.nric, true, data.name, data.phone); break;
    case 'removeCommittee': result = modifyCommitteeList(data.nric, false); break;
    case 'addProjectGroup': result = modifyProjectGroups(data.groupName, true, data.callerNric, data.colorClass); break;
    case 'removeProjectGroup': result = modifyProjectGroups(data.groupName, false, data.callerNric); break;
    case 'modifyJunctures': result = modifyJunctures(data.actionType, data.oldName, data.newName); break;
    case 'saveSortingRules': result = saveSortingRules(data.rules, data.callerNric); break;
    case 'addDriveAccess': result = addDriveAccess(data.email, data.role); break;
    case 'removeDriveAccess': result = removeDriveAccess(data.email); break;
    case 'fetchLogistics': result = fetchLogistics(); break;
    case 'syncAllPairings': result = syncAllPairings(data.pairings); break;
    case 'syncAttendance': result = syncAttendance(data.records); break;
    case 'archiveAndReset': result = archiveAndReset(); break;
    default: throw new Error("Unknown action.");
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
} catch (error) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
}
}

function getAppConfig() {
const props = PropertiesService.getScriptProperties();
const commList = props.getProperty('COMMITTEE_LIST') ? JSON.parse(props.getProperty('COMMITTEE_LIST')) :[];
const groupList = props.getProperty('PROJECT_GROUPS') ? JSON.parse(props.getProperty('PROJECT_GROUPS')) :[];
const juncList = props.getProperty('ATTENDANCE_JUNCTURES') ? JSON.parse(props.getProperty('ATTENDANCE_JUNCTURES')) : ['Morning Assembly'];
const projColors = props.getProperty('PROJECT_COLORS') ? JSON.parse(props.getProperty('PROJECT_COLORS')) : {};
const sortingRules = props.getProperty('SORTING_RULES') ? JSON.parse(props.getProperty('SORTING_RULES')) :['project', 'family', 'role', 'name'];
const rawAccess = props.getProperty('APP_GRANTED_ACCESS');
const driveAccessList = rawAccess ? JSON.parse(rawAccess) : {};

let activeProjects =[];
try {
  const dbId = props.getProperty('DB_SHEET_ID');
  if (dbId) {
    const data = SpreadsheetApp.openById(dbId).getSheetByName("Raw Data").getDataRange().getValues();
    const projSet = new Set();
    for (let i = 1; i < data.length; i++) {
      let pName = String(data[i][6]).trim();
      if (pName) projSet.add(pName);
    }
    activeProjects = Array.from(projSet);
  }
} catch(e) {}

return {
  status: 'success', registrationOpen: props.getProperty('REGISTRATION_OPEN') === 'true', allowEdits: props.getProperty('ALLOW_EDITS') === 'true',
  committee: commList, projectGroups: groupList, projectColors: projColors, activeProjects: activeProjects, junctures: juncList,
  sortingRules: sortingRules, driveAccessList: driveAccessList, tripTitle: props.getProperty('TRIP_TITLE') || '', tripYear: props.getProperty('TRIP_YEAR') || ''
};
}

function handleLogin(nric, password) {
const props = PropertiesService.getScriptProperties();
const genPass = props.getProperty('PASS_GENERAL'); const adminPassPrefix = props.getProperty('PASS_ADMIN');
nric = nric.trim().toUpperCase();

if (nric === 'ADMIN' && password === adminPassPrefix) return { status: 'success', role: 'admin', name: 'Main Admin' };

const committeeList = props.getProperty('COMMITTEE_LIST') ? JSON.parse(props.getProperty('COMMITTEE_LIST')) :[];
const commMember = committeeList.find(c => c.nric === nric);
if (commMember) {
  if (password === (adminPassPrefix + nric)) return { status: 'success', role: 'admin', name: commMember.name };
  else return { status: 'error', message: 'Incorrect committee password.' };
}

const ss = getDatabase();
const data = ss.getSheetByName("Raw Data").getDataRange().getValues();
for (let i = 1; i < data.length; i++) {
  if (String(data[i][11]).trim().toUpperCase() === nric) {
    if (password === genPass) return { status: 'success', role: 'user', name: data[i][3] };
    else return { status: 'error', message: 'Incorrect password.' };
  }
}
return { status: 'error', message: 'NRIC not found. Please register first.' };
}

function getProfile(nric) {
const ss = getDatabase(); const data = ss.getSheetByName("Raw Data").getDataRange().getValues();
let pocNric = null;
for (let i = 1; i < data.length; i++) { if (String(data[i][11]).trim().toUpperCase() === nric) { pocNric = data[i][21] || nric; break; } }
if (!pocNric) return {status: 'error', message: 'Profile not found.'};

let family =[];
for (let i = 1; i < data.length; i++) {
  if (String(data[i][21]).trim().toUpperCase() === pocNric || String(data[i][11]).trim().toUpperCase() === pocNric) {
    let expRaw = data[i][13]; if (expRaw instanceof Date) expRaw = Utilities.formatDate(expRaw, Session.getScriptTimeZone(), "dd MMM yyyy");
    let dobRaw = data[i][14]; if (dobRaw instanceof Date) dobRaw = Utilities.formatDate(dobRaw, Session.getScriptTimeZone(), "dd MMM yyyy");
    family.push({
      email: data[i][1], role: data[i][2], fullName: data[i][3], relatedTrainee: data[i][4], relationship: data[i][5],
      group: data[i][6], gender: data[i][7], contact: data[i][8], address: data[i][9], nationality: data[i][10],
      nric: data[i][11], passportNo: data[i][12], passportExpiry: expRaw, dob: dobRaw, diet: data[i][15],
      emergencyName: data[i][16], emergencyContact: data[i][17], emergencyRelation: data[i][18], sleeping: data[i][19], otherPoints: data[i][20]
    });
  }
}
return { status: 'success', family: family };
}

function updateProfile(member) {
const props = PropertiesService.getScriptProperties();
if (props.getProperty('ALLOW_EDITS') !== 'true') return { status: 'error', message: 'Editing is locked by the committee.' };
const sheet = getDatabase().getSheetByName("Raw Data"); const data = sheet.getDataRange().getValues();
for (let i = 1; i < data.length; i++) {
  if (String(data[i][11]).trim().toUpperCase() === member.nric.trim().toUpperCase()) {
    sheet.getRange(i+1, 2).setValue(member.email); sheet.getRange(i+1, 3).setValue(member.role); sheet.getRange(i+1, 4).setValue(member.fullName);
    sheet.getRange(i+1, 5).setValue(member.relatedTrainee || ''); sheet.getRange(i+1, 6).setValue(member.relationship || '');
    sheet.getRange(i+1, 7).setValue(member.group || ''); sheet.getRange(i+1, 8).setValue(member.gender);
    sheet.getRange(i+1, 9).setValue(member.contact); sheet.getRange(i+1, 10).setValue(member.address || '');
    sheet.getRange(i+1, 11).setValue(member.nationality); sheet.getRange(i+1, 13).setValue(member.passportNo);
    sheet.getRange(i+1, 14).setValue(member.passportExpiry ? "'" + member.passportExpiry : '');
    sheet.getRange(i+1, 15).setValue(member.dob ? "'" + member.dob : '');                      
    sheet.getRange(i+1, 16).setValue(member.diet || ''); sheet.getRange(i+1, 17).setValue(member.emergencyName || '');
    sheet.getRange(i+1, 18).setValue(member.emergencyContact || ''); sheet.getRange(i+1, 19).setValue(member.emergencyRelation || '');
    sheet.getRange(i+1, 20).setValue(member.sleeping || ''); sheet.getRange(i+1, 21).setValue(member.otherPoints || '');
    return { status: 'success' };
  }
}
return { status: 'error', message: 'Record not found.' };
}

function submitRegistration(payloadArray) {
if (PropertiesService.getScriptProperties().getProperty('REGISTRATION_OPEN') !== 'true') return { status: 'error', message: 'Registration is closed.' };
const sheet = getDatabase().getSheetByName("Raw Data"); const pocNric = payloadArray[0].nric.toUpperCase();
payloadArray.forEach(p => {
  sheet.appendRow([
    new Date(), p.email||'', p.role||'', p.fullName||'', p.relatedTrainee||'', p.relationship||'', p.group||'', p.gender||'', p.contact||'', p.address||'', p.nationality||'',
    p.nric.toUpperCase(), p.passportNo||'', p.passportExpiry ? "'" + p.passportExpiry : '', p.dob ? "'" + p.dob : '', p.diet||'',
    p.emergencyName||'', p.emergencyContact||'', p.emergencyRelation||'', p.sleeping||'', p.otherPoints||'', pocNric
  ]);
});
return { status: 'success' };
}

function fetchLogistics() {
const ss = getDatabase(); const pData = ss.getSheetByName("Raw Data").getDataRange().getValues(); const participants =[];
for(let i=1; i<pData.length; i++) {
  if(pData[i][11]) {
    participants.push({ role: String(pData[i][2]).trim().toUpperCase(), name: pData[i][3], group: String(pData[i][6]).trim(), nric: String(pData[i][11]).trim().toUpperCase(), poc: String(pData[i][21]).trim().toUpperCase() || String(pData[i][11]).trim().toUpperCase() });
  }
}
const pairSheet = ss.getSheetByName("Pairings"); let pairings =[];
if(pairSheet) {
  const pairData = pairSheet.getDataRange().getValues();
  for(let i=1; i<pairData.length; i++) {
    if(pairData[i][0]) pairings.push({ traineeNric: String(pairData[i][0]).trim().toUpperCase(), volNric: String(pairData[i][1]).trim().toUpperCase() });
  }
}
return { status: 'success', participants, pairings, roomConfigs:[], rooms: [], groups: [], buses:[] };
}

function syncAllPairings(pairings) {
const sheet = getDatabase().getSheetByName("Pairings"); const lastRow = sheet.getLastRow();
if(lastRow > 1) sheet.getRange(2, 1, lastRow - 1, 2).clearContent();
if(pairings && pairings.length > 0) {
  const rows = pairings.map(p =>[p.traineeNric, p.volNric]);
  sheet.getRange(2, 1, rows.length, 2).setValues(rows);
}
return fetchLogistics();
}

function toggleRegistration(status, tripTitle, tripYear) {
const props = PropertiesService.getScriptProperties();
if (status) {
  tripTitle = tripTitle || 'Overseas Trip'; tripYear = tripYear || new Date().getFullYear().toString();
  const mainFolder = DriveApp.getFolderById(DRIVE_FOLDERS[APP_ENV]);
  let subFolders = mainFolder.getFoldersByName(tripYear);
  let yearFolder = subFolders.hasNext() ? subFolders.next() : mainFolder.createFolder(tripYear);
  let files = yearFolder.getFilesByName("Active Database"); let dbId;
  if (files.hasNext()) { dbId = files.next().getId(); }
  else { let ss = SpreadsheetApp.create("Active Database"); dbId = ss.getId(); DriveApp.getFileById(dbId).moveTo(yearFolder); setupSheets(ss); }
  props.setProperty('TRIP_TITLE', tripTitle); props.setProperty('TRIP_YEAR', tripYear); props.setProperty('DB_SHEET_ID', dbId);
}
props.setProperty('REGISTRATION_OPEN', status ? 'true' : 'false');
return { status: 'success', tripTitle, tripYear };
}

function toggleEdits(status) { PropertiesService.getScriptProperties().setProperty('ALLOW_EDITS', status ? 'true' : 'false'); return { status: 'success' }; }

function getCommitteeList() {
const rawComm = PropertiesService.getScriptProperties().getProperty('COMMITTEE_LIST'); let list = rawComm ? JSON.parse(rawComm) :[]; return { status: 'success', list: list };
}

function modifyCommitteeList(nric, isAdding, name = "", phone = "") {
const props = PropertiesService.getScriptProperties(); nric = nric.trim().toUpperCase();
const rawComm = props.getProperty('COMMITTEE_LIST'); let list = rawComm ? JSON.parse(rawComm) :[];
if (isAdding) { if (!list.find(c => c.nric === nric)) list.push({ nric, name: name.trim(), phone: phone.trim() }); }
else { list = list.filter(c => c.nric !== nric); }
props.setProperty('COMMITTEE_LIST', JSON.stringify(list)); return getCommitteeList();
}

function modifyProjectGroups(groupName, isAdding, callerNric, colorClass) {
if (callerNric !== 'ADMIN') return { status: 'error', message: 'Only Main Admin can modify Projects.' };
const props = PropertiesService.getScriptProperties(); groupName = groupName.trim();
const rawGroups = props.getProperty('PROJECT_GROUPS'); let list = rawGroups ? JSON.parse(rawGroups) :[];
const rawColors = props.getProperty('PROJECT_COLORS'); let colors = rawColors ? JSON.parse(rawColors) : {};

if (isAdding) {
  if (groupName && !list.includes(groupName)) list.push(groupName);
  if (colorClass) colors[groupName] = colorClass;
} else {
  list = list.filter(g => g !== groupName);
  delete colors[groupName];
}
props.setProperty('PROJECT_GROUPS', JSON.stringify(list));
props.setProperty('PROJECT_COLORS', JSON.stringify(colors));
return { status: 'success', groups: list, projectColors: colors };
}

function modifyJunctures(actionType, oldName, newName) {
const props = PropertiesService.getScriptProperties(); const rawJunc = props.getProperty('ATTENDANCE_JUNCTURES');
let list = rawJunc ? JSON.parse(rawJunc) :['Morning Assembly'];
if (actionType === 'add' && newName && !list.includes(newName)) list.push(newName);
else if (actionType === 'remove' && oldName) list = list.filter(j => j !== oldName);
else if (actionType === 'edit' && oldName && newName) { const idx = list.indexOf(oldName); if (idx > -1) list[idx] = newName; }
props.setProperty('ATTENDANCE_JUNCTURES', JSON.stringify(list)); return { status: 'success', junctures: list };
}

function saveSortingRules(rules, callerNric) {
 if (callerNric !== 'ADMIN' && !JSON.parse(PropertiesService.getScriptProperties().getProperty('COMMITTEE_LIST') || '[]').some(c => c.nric === callerNric)) {
     return { status: 'error', message: 'Unauthorized' };
 }
 PropertiesService.getScriptProperties().setProperty('SORTING_RULES', JSON.stringify(rules));
 return { status: 'success', sortingRules: rules };
}

function getTripFolder() {
  const dbId = PropertiesService.getScriptProperties().getProperty('DB_SHEET_ID');
  if (!dbId) throw new Error("No active trip folder found. Ensure registration has been opened.");
  const file = DriveApp.getFileById(dbId);
  const parents = file.getParents();
  if (parents.hasNext()) return parents.next();
  throw new Error("Trip parent folder not found.");
}

function addDriveAccess(email, role) {
  if (!email) return { status: 'error', message: 'Email is required.' };
  email = email.trim().toLowerCase();
  try {
    const folder = getTripFolder();
    if (role === 'editor') {
      folder.addEditor(email);
    } else {
      folder.addViewer(email);
    }
    const props = PropertiesService.getScriptProperties();
    const rawAccess = props.getProperty('APP_GRANTED_ACCESS');
    const access = rawAccess ? JSON.parse(rawAccess) : {};
    access[email] = role;
    props.setProperty('APP_GRANTED_ACCESS', JSON.stringify(access));
    return { status: 'success', driveAccessList: access };
  } catch (error) {
    return { status: 'error', message: "Failed to grant access. Make sure the email is a valid Google Account. (" + error.message + ")" };
  }
}

function removeDriveAccess(email) {
  if (!email) return { status: 'error', message: 'Email is required.' };
  email = email.trim().toLowerCase();
  const props = PropertiesService.getScriptProperties();
  const rawAccess = props.getProperty('APP_GRANTED_ACCESS');
  const access = rawAccess ? JSON.parse(rawAccess) : {};
  
  if (!access[email]) {
    return { status: 'error', message: 'You can only remove access for users who were added via this app interface.' };
  }

  try {
    const folder = getTripFolder();
    if (access[email] === 'editor') {
      folder.removeEditor(email);
    } else {
      folder.removeViewer(email);
    }
    delete access[email];
    props.setProperty('APP_GRANTED_ACCESS', JSON.stringify(access));
    return { status: 'success', driveAccessList: access };
  } catch (error) {
    return { status: 'error', message: "Failed to remove access. (" + error.message + ")" };
  }
}

function syncAttendance(records) {
const sheet = getDatabase().getSheetByName("Attendance");
records.forEach(r => { sheet.appendRow([new Date(), r.juncture, r.group, r.name, r.nric, r.status, r.takenBy]); });
return { status: 'success' };
}

function archiveAndReset() {
const props = PropertiesService.getScriptProperties(); const dbId = props.getProperty('DB_SHEET_ID');
if (dbId) {
  const t = props.getProperty('TRIP_TITLE') || 'Archived Trip'; const y = props.getProperty('TRIP_YEAR') || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy");
  const d = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  try { DriveApp.getFileById(dbId).setName(`${t} ${y} (Archived ${d})`); } catch(e){}
}
props.deleteProperty('DB_SHEET_ID'); props.setProperty('REGISTRATION_OPEN', 'false'); props.setProperty('ALLOW_EDITS', 'false');
props.deleteProperty('TRIP_TITLE'); props.deleteProperty('TRIP_YEAR');
props.deleteProperty('COMMITTEE_LIST'); props.deleteProperty('ATTENDANCE_JUNCTURES');
props.deleteProperty('APP_GRANTED_ACCESS'); // Reset app-managed drive access tracker
return { status: 'success' };
}