const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

const validatePairingBlock = `
function handleDndDrop(sourceNric, sourceRole, targetNric) {
let volNric = sourceRole === 'VOLUNTEER' ? sourceNric : targetNric;
let traineeNric = sourceRole === 'TRAINEE' ? sourceNric : targetNric;

// Group Constraint Check
let vPerson = globalLogistics.participants.find(p => p.nric === volNric);
let tPerson = globalLogistics.participants.find(p => p.nric === traineeNric);
if (vPerson && tPerson && vPerson.group && tPerson.group && vPerson.group !== tPerson.group) {
    showToast("Cannot pair: Trainee and Volunteer must be in the same group, or one must be unassigned.", true);
    return;
}
`;

code = code.replace(/function handleDndDrop\(sourceNric, sourceRole, targetNric\) \{\nlet volNric = sourceRole === 'VOLUNTEER' \? sourceNric : targetNric;\nlet traineeNric = sourceRole === 'TRAINEE' \? sourceNric : targetNric;/g, validatePairingBlock);


const validateConfirmPairingBlock = `
function confirmPairing(targetNric) {
if(!currentPairingTarget) return; 

const traineeNric = currentPairingSourceRole === 'TRAINEE' ? currentPairingTarget : targetNric;
const volNric = currentPairingSourceRole === 'TRAINEE' ? targetNric : currentPairingTarget;

// Group Constraint Check
let vPerson = globalLogistics.participants.find(p => p.nric === volNric);
let tPerson = globalLogistics.participants.find(p => p.nric === traineeNric);
if (vPerson && tPerson && vPerson.group && tPerson.group && vPerson.group !== tPerson.group) {
    showToast("Cannot pair: Trainee and Volunteer must be in the same group, or one must be unassigned.", true);
    closeSelectionSheet();
    return;
}

closeSelectionSheet();
`;

code = code.replace(/function confirmPairing\(targetNric\) \{([\s\S]*?)closeSelectionSheet\(\);([\s\S]*?)const traineeNric/g, validateConfirmPairingBlock + "\nconst traineeNric");
fs.writeFileSync('frontend/js/logistics.js', code);
