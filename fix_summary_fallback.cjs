const fs = require('fs');
let code = fs.readFileSync('./frontend/js/main.js', 'utf8');

const target = `    if (m && familyArr.length === 0) {
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

const replacement = `    if (m && familyArr.length === 0) {
        let sourceArr = [];
        if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) sourceArr = adminRosterData;
        else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) sourceArr = loadedFamily;
        
        let targetPoc = m.pocNric || m.nric;
        
        // Advanced fallback mapping
        if (m.role === 'CAREGIVER' && m.caregiverFor && (!m.pocNric || m.pocNric === m.nric)) {
            const rNames = m.caregiverFor.split(',').map(n => n.trim().toLowerCase());
            const matchTrainee = sourceArr.find(x => x.role === 'TRAINEE' && rNames.includes((x.fullName || '').toLowerCase()));
            if (matchTrainee) targetPoc = matchTrainee.pocNric || matchTrainee.nric;
        } else if (m.role === 'TRAINEE' && (!m.pocNric || m.pocNric === m.nric)) {
            const matchCaregiver = sourceArr.find(x => x.role === 'CAREGIVER' && x.caregiverFor && x.caregiverFor.toLowerCase().includes((m.fullName || '').toLowerCase()));
            if (matchCaregiver) targetPoc = matchCaregiver.pocNric || matchCaregiver.nric;
        }

        if (targetPoc) {
            familyArr = sourceArr.filter(f => {
                if (f.nric === m.nric) return false;
                
                let fPoc = f.pocNric || f.nric;
                if (f.role === 'CAREGIVER' && f.caregiverFor && (!f.pocNric || f.pocNric === f.nric)) {
                    const rNames = f.caregiverFor.split(',').map(n => n.trim().toLowerCase());
                    const matchT = sourceArr.find(x => x.role === 'TRAINEE' && rNames.includes((x.fullName || '').toLowerCase()));
                    if (matchT) fPoc = matchT.pocNric || matchT.nric;
                } else if (f.role === 'TRAINEE' && (!f.pocNric || f.pocNric === f.nric)) {
                    const matchC = sourceArr.find(x => x.role === 'CAREGIVER' && x.caregiverFor && x.caregiverFor.toLowerCase().includes((f.fullName || '').toLowerCase()));
                    if (matchC) fPoc = matchC.pocNric || matchC.nric;
                }
                
                if (fPoc === targetPoc) return true;
                return false;
            });
        }
    }`;

if (code.includes(target)) {
    code = code.replace(target, replacement);
    fs.writeFileSync('./frontend/js/main.js', code);
    console.log("Fixed main.js summary grouping");
} else {
    console.log("Could not find target block in main.js");
}
