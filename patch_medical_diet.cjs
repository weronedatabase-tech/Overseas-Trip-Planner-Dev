const fs = require('fs');

// 1. Remove Other Notes from Medical
let medCode = fs.readFileSync('frontend/js/medical.js', 'utf8');
medCode = medCode.replace(/const hasNotes = p\.otherPoints[\s\S]*?<\/span><\/div>\`;\s*\}/, '');
fs.writeFileSync('frontend/js/medical.js', medCode);

// 2. Fix Diet filter and remove Other Notes
let dietCode = fs.readFileSync('frontend/js/diet.js', 'utf8');
const newDietFilter = `let data = medicalRosterData.filter(p => {
    if (!p.diet) return false;
    const diet = p.diet.trim().toLowerCase();
    if (diet === '' || diet === '-' || diet === 'nil' || diet === 'na' || diet === 'n/a' || diet === 'none' || diet === 'no' || diet === 'normal') return false;
    return true;
});`;
dietCode = dietCode.replace(/let data = medicalRosterData\.filter\(p => p\.diet \|\| p\.otherPoints\);/, newDietFilter);
dietCode = dietCode.replace(/const hasNotes = p\.otherPoints[\s\S]*?<\/span><\/div>\`;\s*\}/, '');
fs.writeFileSync('frontend/js/diet.js', dietCode);

console.log("Patched medical and diet notes rendering and filters");
