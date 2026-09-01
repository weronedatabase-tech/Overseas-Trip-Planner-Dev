/* OVERSEAS TRIP APP BACKEND - Code.gs (MPA Architecture with Atomic Write-Through Caching) */

// ==========================================
// SYSTEM & CRON SETUP 
// ==========================================
function setupProject() {
const props = PropertiesService.getScriptProperties();
if(!props.getProperty('PASS_GENERAL')) props.setProperty('PASS_GENERAL', 'P@ssw0rd');
if(!props.getProperty('PASS_ADMIN')) props.setProperty('PASS_ADMIN', 'P@ssw0rd');
if(!props.getProperty('REGISTRATION_OPEN')) props.setProperty('REGISTRATION_OPEN', 'false');
if(!props.getProperty('ALLOW_EDITS')) props.setProperty('ALLOW_EDITS', 'false');

DriveApp.getRootFolder(); // Triggers Drive permissions
try {
DocumentApp.create('Auth Setup').setTrashed(true);
SpreadsheetApp.create('Auth Setup').setTrashed(true);
SlidesApp.create('Auth Setup').setTrashed(true);
} catch(e) {}
setupCron();
console.log(`Safe setup complete for ${ENV} environment.`);
}

function factoryResetSettings() {
const props = PropertiesService.getScriptProperties();
['COMMITTEE_LIST', 'PROJECT_GROUPS', 'PROJECT_COLORS', 'ATTENDANCE_JUNCTURES', 'SORTING_RULES', 'APP_GRANTED_ACCESS'].forEach(k => props.deleteProperty(k));
console.log("Settings wiped.");
}

function setupCron() {
ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
ScriptApp.newTrigger('precomputeAppCache').timeBased().everyMinutes(15).create();
precomputeAppCache();
}

function precomputeAppCache() {
try { fetchLogistics(true); } catch(e){}
try { fetchAdminRoster(true); } catch(e){}
try { fetchFinance(true); } catch(e){}
try { fetchReceipts(true); } catch(e){}
try { fetchMinutes(true); } catch(e){}
try { fetchPairingsOnly(true); } catch(e){}
try { fetchRoomsOnly(true); } catch(e){}
try {
const juncList = PropertiesService.getScriptProperties().getProperty('ATTENDANCE_JUNCTURES');
if(juncList) JSON.parse(juncList).forEach(j => fetchAttendanceData(j, true));
} catch(e){}
}

// ==========================================
// CACHING & DATABASE HELPERS
// ==========================================
function getDbId() {
return PropertiesService.getScriptProperties().getProperty('DB_SHEET_ID') || Fallback_Sheet_ID;
}

function getDatabase() {
const dbId = getDbId();
if (!dbId) throw new Error("No active trip database found. Admin must Open Registration first.");
return SpreadsheetApp.openById(dbId);
}

function getCacheKey(type) {
return type + "_v2_" + getDbId();
}

function putLargeCache(cacheKey, jsonStr) {
const cache = CacheService.getScriptCache();
try {
if (jsonStr.length < 90000) {
cache.put(cacheKey, jsonStr, 21600); // 6 hours
} else {
const chunks = [];
let i = 0;
while (i < jsonStr.length) {
  chunks.push(jsonStr.substring(i, i + 90000));
  i += 90000;
}
cache.put(cacheKey + "_count", chunks.length.toString(), 21600);
const dict = {};
for (let j = 0; j < chunks.length; j++) dict[cacheKey + "_" + j] = chunks[j];
cache.putAll(dict, 21600);
}
} catch(e) { console.error("Cache Put Error:", e); }
}


function removeLargeCache(cacheKey) {
  const cache = CacheService.getScriptCache();
  try {
    cache.remove(cacheKey);
    const countStr = cache.get(cacheKey + "_count");
    if (countStr) {
      const count = parseInt(countStr);
      const keys = [cacheKey + "_count"];
      for (let i = 0; i < count; i++) keys.push(cacheKey + "_" + i);
      cache.removeAll(keys);
    }
  } catch(e) {}
}
function getLargeCache(cacheKey) {
const cache = CacheService.getScriptCache();
try {
const single = cache.get(cacheKey);
if (single) return single;

const countStr = cache.get(cacheKey + "_count");
if (countStr) {
const count = parseInt(countStr);
const keys = [];
for (let i = 0; i < count; i++) keys.push(cacheKey + "_" + i);
const dict = cache.getAll(keys);
let fullStr = "";
for (let i = 0; i < count; i++) {
  if (!dict[keys[i]]) return null;
  fullStr += dict[keys[i]];
}
return fullStr;
}
} catch(e) { console.error("Cache Get Error:", e); }
return null;
}

// Atomic patch helper for Arrays
function patchCacheList(cacheKey, listKey, updates, matchFn) {
const str = getLargeCache(cacheKey);
if(!str) return false;
try {
const data = JSON.parse(str);
if(!data[listKey]) data[listKey] = [];
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
  sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  SpreadsheetApp.flush();
  removeLargeCache(getCacheKey('ROSTER'));
  removeLargeCache(getCacheKey('LOGISTICS'));
  // Removed precomputeAppCache() for faster async resolution
}
return { status: 'success' };

} catch(e) { return { status: 'error', message: e.message }; }
finally { lock.releaseLock(); }
}

function checkDuplicateParticipant(nric, passport) {
  const sheet = getDatabase().getSheetByName("Raw Data");
  const data = sheet.getDataRange().getValues();
  const existingNrics = new Set();
  const existingPassports = new Set();
  for (let i = 1; i < data.length; i++) {
    if (data[i][11]) existingNrics.add(String(data[i][11]).trim().toUpperCase());
    if (data[i][12]) existingPassports.add(String(data[i][12]).trim().toUpperCase());
  }
  
  let conflictType = null;
  if (nric && existingNrics.has(String(nric).trim().toUpperCase())) {
    conflictType = 'NRIC';
  } else if (passport && existingPassports.has(String(passport).trim().toUpperCase())) {
    conflictType = 'Passport';
  }
  
  if (conflictType) {
    return { status: 'error', conflictType: conflictType, message: `This ${conflictType} already exists.` };
  }
  return { status: 'success' };
}


function forceMigratePocNric() {
  const ss = getDatabase();
  const sheet = ss.getSheetByName("Raw Data");
  const data = sheet.getDataRange().getValues();
  
  // 1. Identify all caregivers and their related trainees
  let changes = 0;
  for (let i = 1; i < data.length; i++) {
      if (String(data[i][2]).trim().toUpperCase() === 'CAREGIVER') {
          const cgNric = String(data[i][11]).trim().toUpperCase();
          const relatedStr = String(data[i][4] || '').trim(); // column E has the names
          
          if (relatedStr) {
              const desiredNames = relatedStr.split(/[\|,]/).map(n => n.trim().toLowerCase()).filter(n => n);
              
              for (let j = 1; j < data.length; j++) {
                  if (String(data[j][2]).trim().toUpperCase() === 'TRAINEE') {
                      const jNric = String(data[j][11]).trim().toUpperCase();
                      const jPoc = String(data[j][21] || '').trim().toUpperCase(); // Column V
                      const jName = String(data[j][3] || '').replace(/\s+/g, '').toLowerCase();
                      const jShort = String(data[j][22] || '').replace(/\s+/g, '').toLowerCase();
                      
                      const isDesired = desiredNames.some(d => d.includes(jName) || jName.includes(d) || (jShort && d.includes(jShort)));
                      
                      if (isDesired && jPoc !== cgNric) {
                          sheet.getRange(j+1, 22).setValue(cgNric); // set Trainee's pocNric to Caregiver's NRIC
                          sheet.getRange(i+1, 22).setValue(cgNric); // set Caregiver's pocNric to Caregiver's NRIC
                          changes++;
                      }
                  }
              }
          }
      }
  }
  removeLargeCache(getCacheKey('ROSTER'));
  removeLargeCache(getCacheKey('LOGISTICS'));
  return changes;
}
