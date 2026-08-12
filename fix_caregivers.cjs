const fs = require('fs');

const helper = `
window.applyCaregiverLabels = function(participants) {
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
                const suffix = \` [\${tName}]\`;
                if (p.name && !p.name.endsWith(suffix)) p.name += suffix;
                if (p.shortName && !p.shortName.endsWith(suffix)) p.shortName += suffix;
                if (p.fullName && !p.fullName.endsWith(suffix)) p.fullName += suffix;
                if (p.displayName && !p.displayName.endsWith(suffix)) p.displayName += suffix;
            }
        }
    });
};
`;

let uiJs = fs.readFileSync('frontend/js/ui.js', 'utf8');
uiJs += "\n" + helper;
fs.writeFileSync('frontend/js/ui.js', uiJs);

// Now apply it in all fetch places

// logistics.js
let logJs = fs.readFileSync('frontend/js/logistics.js', 'utf8');
logJs = logJs.replace(/globalLogistics = logRes;/, "globalLogistics = logRes; if(globalLogistics.participants) applyCaregiverLabels(globalLogistics.participants);");
fs.writeFileSync('frontend/js/logistics.js', logJs);

// attendance.js
let attJs = fs.readFileSync('frontend/js/attendance.js', 'utf8');
attJs = attJs.replace(/attendanceData = attRes\.data \|\| \{\};/g, "attendanceData = attRes.data || {}; if(globalLogistics && globalLogistics.participants) applyCaregiverLabels(globalLogistics.participants);");
fs.writeFileSync('frontend/js/attendance.js', attJs);

// finance.js
let finJs = fs.readFileSync('frontend/js/finance.js', 'utf8');
finJs = finJs.replace(/globalLogistics = logRes;/, "globalLogistics = logRes; if(globalLogistics.participants) applyCaregiverLabels(globalLogistics.participants);");
fs.writeFileSync('frontend/js/finance.js', finJs);

// participants.js - wait, adminRosterData
let partJs = fs.readFileSync('frontend/js/participants.js', 'utf8');
partJs = partJs.replace(/adminRosterData = rostRes\.roster \|\| \[\];/, "adminRosterData = rostRes.roster || []; applyCaregiverLabels(adminRosterData);");
// In participants.js, I manually added famTag. But now the name will already have [Trainee] appended to it!
// So I should remove famTag from participants.js, medical.js, diet.js so it's not duplicated.
partJs = partJs.replace(/let famTag = '';[\s\S]*?\${famTag}/g, "");
fs.writeFileSync('frontend/js/participants.js', partJs);

// medical.js
let medJs = fs.readFileSync('frontend/js/medical.js', 'utf8');
medJs = medJs.replace(/adminRosterData = rostRes\.roster \|\| \[\];/, "adminRosterData = rostRes.roster || []; applyCaregiverLabels(adminRosterData);");
medJs = medJs.replace(/let famTag = '';[\s\S]*?\${famTag}/g, "");
fs.writeFileSync('frontend/js/medical.js', medJs);

// diet.js
let dietJs = fs.readFileSync('frontend/js/diet.js', 'utf8');
dietJs = dietJs.replace(/adminRosterData = rostRes\.roster \|\| \[\];/, "adminRosterData = rostRes.roster || []; applyCaregiverLabels(adminRosterData);");
dietJs = dietJs.replace(/let famTag = '';[\s\S]*?\${famTag}/g, "");
fs.writeFileSync('frontend/js/diet.js', dietJs);

// expired.js
let expiredJs = fs.readFileSync('frontend/js/expired.js', 'utf8');
expiredJs = expiredJs.replace(/adminRosterData = rostRes\.roster \|\| \[\];/, "adminRosterData = rostRes.roster || []; applyCaregiverLabels(adminRosterData);");
expiredJs = expiredJs.replace(/let famTag = '';[\s\S]*?\${famTag}/g, "");
fs.writeFileSync('frontend/js/expired.js', expiredJs);

