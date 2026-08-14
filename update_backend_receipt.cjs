const fs = require('fs');
let code = fs.readFileSync('backend/Code.js', 'utf8');

// Update fetchReceipts
code = code.replace(
  /isReimbursed: String\(data\[i\]\[12\]\)\.toUpperCase\(\) === 'TRUE'\s*\}\);/,
  "isReimbursed: String(data[i][12]).toUpperCase() === 'TRUE',\n  uploaderName: String(data[i][13] || '')\n});"
);

// Update uploadReceipt
code = code.replace(
  /sheet\.appendRow\(\[newId, new Date\(\), payload\.uploaderNric, payload\.currency, payload\.amount, payload\.rate, payload\.sgdAmount, payload\.categoryId, fileUrl, payload\.remarks, false, payload\.paidByNric \|\| payload\.uploaderNric, false\]\);/,
  "sheet.appendRow([newId, new Date(), payload.uploaderNric, payload.currency, payload.amount, payload.rate, payload.sgdAmount, payload.categoryId, fileUrl, payload.remarks, false, payload.paidByNric || payload.uploaderNric, false, payload.uploaderName || '']);"
);

// Update syncReceipts
code = code.replace(
  /data\[rowIndex\]\[12\] = isReim;/,
  "data[rowIndex][12] = isReim;\n    data[rowIndex][13] = u.uploaderName || '';"
);

fs.writeFileSync('backend/Code.js', code);
console.log("Updated backend/Code.js");
