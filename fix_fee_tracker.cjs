const fs = require('fs');
let code = fs.readFileSync('./frontend/js/finance.js', 'utf8');

const target = `globalLogistics.participants.forEach(p => {
    const targetPoc = p.pocNric || p.nric;
    if(!groups[targetPoc]) groups[targetPoc] = [];
    groups[targetPoc].push(p);
});`;

const replacement = `globalLogistics.participants.forEach(p => {
    let targetPoc = p.pocNric || p.nric;
    
    // Fallback: If Caregiver has relatedTrainee, group them with the FIRST trainee they are related to
    if (p.role === 'CAREGIVER' && p.relatedTrainee && (!p.pocNric || p.pocNric === p.nric)) {
        const rNames = p.relatedTrainee.split(',').map(n => n.trim().toLowerCase());
        const matchTrainee = globalLogistics.participants.find(x => x.role === 'TRAINEE' && rNames.includes((x.name || '').toLowerCase()));
        if (matchTrainee) {
            targetPoc = matchTrainee.pocNric || matchTrainee.nric;
        }
    }
    
    // Also fix Trainees who are related to a Caregiver but somehow have different pocNric
    if (p.role === 'TRAINEE' && (!p.pocNric || p.pocNric === p.nric)) {
        const matchCaregiver = globalLogistics.participants.find(x => x.role === 'CAREGIVER' && x.relatedTrainee && x.relatedTrainee.toLowerCase().includes((p.name || '').toLowerCase()));
        if (matchCaregiver) {
            targetPoc = matchCaregiver.pocNric || matchCaregiver.nric;
        }
    }

    if(!groups[targetPoc]) groups[targetPoc] = [];
    groups[targetPoc].push(p);
});`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('./frontend/js/finance.js', code);
    console.log("Fixed finance.js grouping");
} else {
    console.log("Could not find target block in finance.js");
}
