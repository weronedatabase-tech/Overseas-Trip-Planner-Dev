const fs = require('fs');
let codeMain = fs.readFileSync('frontend/js/main.js', 'utf8');

codeMain = codeMain.replace(
    /if \(roleVal === 'CAREGIVER' && relatedVal\) \{[\s\S]*?const match = allP\.find\(x => x\.role === 'TRAINEE' && \(x\.fullName \|\| ''\)\.toLowerCase\(\) === relatedVal\.toLowerCase\(\)\);[\s\S]*?if \(!match\) \{[\s\S]*?showToast\("Caregiver For field must match exactly with an existing Trainees' Full Names\.", true\);[\s\S]*?setBtnLoading\(btn, false\);[\s\S]*?return;[\s\S]*?\}[\s\S]*?\}/g,
    `if (roleVal === 'CAREGIVER' && relatedVal) {
        let allP = [];
        if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) allP = adminRosterData;
        else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) allP = loadedFamily;
        
        const names = relatedVal.split(',').map(x => x.trim()).filter(x => x !== '');
        let allValid = true;
        names.forEach(n => {
            const match = allP.find(x => x.role === 'TRAINEE' && (x.fullName || '').toLowerCase() === n.toLowerCase());
            if (!match) allValid = false;
        });
        
        if (!allValid) {
            showToast("Caregiver For field must match exactly with existing Trainees' Full Names.", true);
            setBtnLoading(btn, false);
            return;
        }
    }`
);

fs.writeFileSync('frontend/js/main.js', codeMain);
