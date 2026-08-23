const fs = require('fs');

let content = fs.readFileSync('frontend/js/ui.js', 'utf8');

const oldLogic = `window.applyCaregiverLabels = function(participants) {
    if (!participants) return;
    const traineeMap = {};
    participants.forEach(p => {
        if (p.role === 'TRAINEE') {
            const searchKey = String(p.nric || '').toLowerCase();
            const searchKey2 = String(p.name || '').toLowerCase();
            const searchKey3 = String(p.shortName || '').toLowerCase();
            traineeMap[searchKey] = p.shortName || p.name;
            traineeMap[searchKey2] = p.shortName || p.name;
            traineeMap[searchKey3] = p.shortName || p.name;
        }
    });

    participants.forEach(p => {
        if (p.role === 'CAREGIVER') {
            let tName = p.relatedTrainee ? (traineeMap[String(p.relatedTrainee).toLowerCase()] || p.relatedTrainee) : '';
            if (tName) {
                p.caregiverFor = tName;
            }
        }
    });
};`;

const newLogic = `window.applyCaregiverLabels = function(participants) {
    if (!participants) return;
    const traineeMap = {};
    participants.forEach(p => {
        if (p.role === 'TRAINEE') {
            const nameToUse = p.shortName || p.fullName || p.name;
            const searchKey = String(p.nric || '').toLowerCase();
            const searchKey2 = String(p.fullName || p.name || '').toLowerCase();
            const searchKey3 = String(p.shortName || '').toLowerCase();
            traineeMap[searchKey] = nameToUse;
            traineeMap[searchKey2] = nameToUse;
            traineeMap[searchKey3] = nameToUse;
        }
    });

    participants.forEach(p => {
        if (p.role === 'CAREGIVER') {
            let tName = p.relatedTrainee ? (traineeMap[String(p.relatedTrainee).toLowerCase()] || p.relatedTrainee) : '';
            if (tName) {
                p.caregiverFor = tName;
            }
        }
    });
};`;

if (content.includes(oldLogic)) {
    content = content.replace(oldLogic, newLogic);
    fs.writeFileSync('frontend/js/ui.js', content, 'utf8');
    console.log("Patched applyCaregiverLabels");
} else {
    console.log("Could not find old logic in ui.js");
}
