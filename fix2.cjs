const fs = require('fs');

let content = fs.readFileSync('frontend/js/main.js', 'utf8');

// I will replace the entire try block part:
const oldBlock = `    let m = null;
    if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) {
        m = adminRosterData.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    } else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        m = loadedFamily.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    }
    
    if (!m) {
        const res = await apiCall('getProfile', { nric: nric });
        if(res.status === 'error') throw new Error(res.message);
        m = res.family.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    }`;

// Actually, wait, let me use regex to replace everything from "let m = null;" down to "if(!m) throw new Error"
let newBlock = `    let m = null;
    let familyArr = [];
    if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) {
        m = adminRosterData.find(f => f.nric.toUpperCase() === nric.toUpperCase());
        if (m) {
            let tName = null;
            if (m.role === 'TRAINEE') tName = m.shortName || m.fullName || m.name;
            else if (m.role === 'CAREGIVER') tName = m.caregiverFor || m.relatedTrainee;
            
            if (tName) {
                let tNameL = (tName || '').toLowerCase();
                familyArr = adminRosterData.filter(f => {
                    if (f.nric === m.nric) return false;
                    let fName = (f.shortName || f.fullName || f.name || '').toLowerCase();
                    if (f.role === 'TRAINEE' && fName === tNameL) return true;
                    if (f.role === 'CAREGIVER' && (f.caregiverFor || f.relatedTrainee || '').toLowerCase() === tNameL) return true;
                    return false;
                });
            }
        }
    } else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        m = loadedFamily.find(f => f.nric.toUpperCase() === nric.toUpperCase());
        if (m) {
            familyArr = loadedFamily.filter(f => f.nric !== m.nric);
        }
    }
    
    if (!m) {
        const res = await apiCall('getProfile', { nric: nric });
        if(res.status === 'error') throw new Error(res.message);
        m = res.family.find(f => f.nric.toUpperCase() === nric.toUpperCase());
        if (m) {
            familyArr = res.family.filter(f => f.nric !== m.nric);
        }
    }
    if(!m) throw new Error("Participant not found");`;

content = content.replace(/let m = null;[\s\S]*?if\(!m\) throw new Error\("Participant not found"\);/, newBlock);

// Remove the injected familyArr declaration I just added
content = content.replace(/    let familyArr = \[\];\n    if \(typeof adminRosterData[\s\S]*?    \} else \{\n[\s\S]*?    \}\n/, '');

fs.writeFileSync('frontend/js/main.js', content, 'utf8');
