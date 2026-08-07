const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/closeSelectionSheet\(\);\nconst traineeNric = currentPairingSourceRole === 'TRAINEE' \? currentPairingTarget : targetNric;\nconst volNric = currentPairingSourceRole === 'TRAINEE' \? targetNric : currentPairingTarget;/g, "closeSelectionSheet();");

// Alternative regex if spacing is different:
const start = code.indexOf('function confirmPairing(targetNric) {');
const end = code.indexOf('function confirmRoomAdd(nric) {');
if (start !== -1 && end !== -1) {
    let block = code.substring(start, end);
    block = block.replace(/closeSelectionSheet\(\);\s*const traineeNric = currentPairingSourceRole === 'TRAINEE' \? currentPairingTarget : targetNric;\s*const volNric = currentPairingSourceRole === 'TRAINEE' \? targetNric : currentPairingTarget;/g, "closeSelectionSheet();");
    code = code.substring(0, start) + block + code.substring(end);
}

fs.writeFileSync('frontend/js/logistics.js', code);
