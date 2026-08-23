const fs = require('fs');
let code = fs.readFileSync('./backend/Code.js', 'utf8');

const target = "case 'getPublicTrainees': result = getPublicTrainees(); break;";
const replacement = "case 'getPublicTrainees': result = getPublicTrainees(); break;\ncase 'checkDuplicateParticipant': result = checkDuplicateParticipant(data.nric, data.passport); break;";

code = code.replace(target, replacement);
fs.writeFileSync('./backend/Code.js', code);
console.log("Updated switch");
