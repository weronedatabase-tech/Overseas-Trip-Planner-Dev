const fs = require('fs');

let content = fs.readFileSync('frontend/js/main.js', 'utf8');

// The corrupted block starts at `try {\n        let m = null;\n    let familyHtml = '';`
// We need to replace from `try {` down to `let familyHtml = '';`

let replacement = `  try {
    let m = null;
    let familyArr = [];
    if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) {
        m = adminRosterData.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    } else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        m = loadedFamily.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    }
    
    if (!m) {
        const res = await apiCall('getProfile', { nric: nric });
        if(res.status === 'error') throw new Error(res.message);
        if(res.family) {
            m = res.family.find(f => f.nric.toUpperCase() === nric.toUpperCase());
            if (m) {
                familyArr = res.family.filter(f => f.nric !== m.nric);
            }
        }
    }
    
    if(!m) throw new Error("Participant not found");

    if (m && familyArr.length === 0) {
        let tName = null;
        if (m.role === 'TRAINEE') tName = m.shortName || m.fullName || m.name;
        else if (m.role === 'CAREGIVER') tName = m.caregiverFor || m.relatedTrainee;
        
        if (tName) {
            let tNameL = (tName || '').toLowerCase();
            let sourceArr = [];
            if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) sourceArr = adminRosterData;
            else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) sourceArr = loadedFamily;
            
            familyArr = sourceArr.filter(f => {
                if (f.nric === m.nric) return false;
                let fName = (f.shortName || f.fullName || f.name || '').toLowerCase();
                if (f.role === 'TRAINEE' && fName === tNameL) return true;
                if (f.role === 'CAREGIVER' && (f.caregiverFor || f.relatedTrainee || '').toLowerCase() === tNameL) return true;
                return false;
            });
        }
    }

    let groupOpts = \`<option value="">Select...</option>\`;
    if(appSettings.projectGroups) {
       appSettings.projectGroups.forEach(g => { groupOpts += \`<option value="\${g}" \${m.group === g ? 'selected' : ''}>\${g}</option>\`; });
     }
    if(m.group && (!appSettings.projectGroups || !appSettings.projectGroups.includes(m.group))) {
       groupOpts += \`<option value="\${m.group}" selected>\${m.group} (Archived)</option>\`;
     }
    const dynColor = getProjectColor(m.group);

    let familyHtml = '';`;

content = content.replace(/try\s*\{\s*let m = null;\s*let familyHtml = '';/, replacement);

fs.writeFileSync('frontend/js/main.js', content, 'utf8');
