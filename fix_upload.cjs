const fs = require('fs');

let code = fs.readFileSync('backend/Code.js', 'utf8');

code = code.replace(/function uploadReceipt\(payload\) \{\nconst ss = getDatabase\(\);\nlet sheet = ss.getSheetByName\("Receipts"\);/,
`function uploadReceipt(payload) {
const ss = getDatabase();
let sheet = ss.getSheetByName("Receipts");
if (!sheet) {
  sheet = ss.insertSheet("Receipts");
  sheet.appendRow(["Receipt ID", "Timestamp", "Uploader NRIC", "Currency", "Amount", "Rate", "SGD Amount", "Category ID", "File URL", "Remarks", "Is Deleted", "Paid By", "Is Reimbursed"]);
}`);

code = code.replace(/function syncReceipts\(updates\) \{\nconst ss = getDatabase\(\);\nlet sheet = ss.getSheetByName\("Receipts"\);/,
`function syncReceipts(updates) {
const ss = getDatabase();
let sheet = ss.getSheetByName("Receipts");
if (!sheet) {
  sheet = ss.insertSheet("Receipts");
  sheet.appendRow(["Receipt ID", "Timestamp", "Uploader NRIC", "Currency", "Amount", "Rate", "SGD Amount", "Category ID", "File URL", "Remarks", "Is Deleted", "Paid By", "Is Reimbursed"]);
}`);

fs.writeFileSync('backend/Code.js', code);
console.log("Fixed uploadReceipt in Code.js");
