const fs = require('fs');

let content = fs.readFileSync('frontend/js/main.js', 'utf8');

const injection = `
    let familyArr = [];
    if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) {
        if (m) {
            let tName = null;
            if (m.role === 'TRAINEE') tName = m.shortName || m.fullName || m.name;
            else if (m.role === 'CAREGIVER') tName = m.caregiverFor || m.relatedTrainee;
            
            if (tName) {
                familyArr = adminRosterData.filter(f => {
                    if (f.nric === m.nric) return false;
                    let fName = (f.shortName || f.fullName || f.name || '').toLowerCase();
                    let tNameL = (tName || '').toLowerCase();
                    if (f.role === 'TRAINEE' && fName === tNameL) return true;
                    if (f.role === 'CAREGIVER' && (f.caregiverFor || f.relatedTrainee || '').toLowerCase() === tNameL) return true;
                    if (f.role === 'CAREGIVER' && fName === tNameL) return true;
                    return false;
                });
            }
        }
    } else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        if (m) {
            familyArr = loadedFamily.filter(f => f.nric !== m.nric);
        }
    } else {
        // If loaded via apiCall, res.family should have the family
        // we can assume we'll just show the other people from the same API response if it was available.
        // Actually, we need to check if 'res' is available here, but res is local to the if block above.
        // So let's re-fetch or modify the if block if needed.
    }
`;

content = content.replace(/const dynColor = getProjectColor\(m\.group\);/, "const dynColor = getProjectColor(m.group);\n" + injection);
fs.writeFileSync('frontend/js/main.js', content, 'utf8');
