const fs = require('fs');

let code = fs.readFileSync('backend/Code.js', 'utf8');

code = code.replace(/function syncMinutes\(updates, takenBy\) \{\nconst ss = getDatabase\(\);\nlet sheet = ss.getSheetByName\("Minutes"\);/,
`function syncMinutes(updates, takenBy) {
const ss = getDatabase();
let sheet = ss.getSheetByName("Minutes");
if (!sheet) {
  sheet = ss.insertSheet("Minutes");
  sheet.appendRow(["Note ID", "Date", "Content", "Assigned To", "Timestamp", "Updated By", "Is Deleted"]);
}`);

fs.writeFileSync('backend/Code.js', code);
console.log("Fixed syncMinutes in Code.js");
