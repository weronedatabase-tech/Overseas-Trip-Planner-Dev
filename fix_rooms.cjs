const fs = require('fs');

let code = fs.readFileSync('backend/Code.js', 'utf8');

code = code.replace(/function syncRoomUpdates\(updates, takenBy\) \{\nconst ss = getDatabase\(\);\nlet sheet = ss.getSheetByName\("Rooms"\);/,
`function syncRoomUpdates(updates, takenBy) {
const ss = getDatabase();
let sheet = ss.getSheetByName("Rooms");
if (!sheet) {
  sheet = ss.insertSheet("Rooms");
  sheet.appendRow(["Room ID", "Name", "Occupants NRICs (Comma separated)", "Timestamp", "Updated By"]);
}`);

fs.writeFileSync('backend/Code.js', code);
console.log("Fixed syncRoomUpdates in Code.js");
