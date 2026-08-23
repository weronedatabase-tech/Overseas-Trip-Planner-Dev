const fs = require('fs');
let code = fs.readFileSync('./frontend/js/main.js', 'utf8');

const target = `    if (m && familyArr.length === 0) {
        let tName = null;
        if (m.role === 'TRAINEE') tName = m.shortName || m.fullName || m.name;
        else if (m.role === 'CAREGIVER') tName = m.caregiverFor || m.relatedTrainee;
        
        if (tName) {
            let tNames = tName.split(',').map(n => n.trim().toLowerCase());
            let sourceArr = [];
            if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) sourceArr = adminRosterData;
            else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) sourceArr = loadedFamily;
            
            familyArr = sourceArr.filter(f => {
                if (f.nric === m.nric) return false;
                let fName = (f.shortName || f.fullName || f.name || '').toLowerCase();
                let fRelated = (f.caregiverFor || f.relatedTrainee || '').split(',').map(n => n.trim().toLowerCase());
                
                if (f.role === 'TRAINEE') {
                    if (m.role === 'CAREGIVER' && tNames.includes(fName)) return true;
                }
                if (f.role === 'CAREGIVER') {
                    if (m.role === 'TRAINEE' && fRelated.some(r => tNames.includes(r))) return true;
                    if (m.role === 'CAREGIVER' && fRelated.some(r => tNames.includes(r))) return true;
                }
                return false;
            });
        }
    }`;

const replacement = `    if (m && familyArr.length === 0) {
        let sourceArr = [];
        if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) sourceArr = adminRosterData;
        else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) sourceArr = loadedFamily;
        
        let targetPoc = m.pocNric || m.nric;
        if (targetPoc) {
            familyArr = sourceArr.filter(f => {
                if (f.nric === m.nric) return false;
                if ((f.pocNric || f.nric) === targetPoc) return true;
                return false;
            });
        }
    }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('./frontend/js/main.js', code);
    console.log("Fixed main.js familyArr");
} else {
    console.log("Could not find target block in main.js");
}
