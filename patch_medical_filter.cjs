const fs = require('fs');
let code = fs.readFileSync('frontend/js/medical.js', 'utf8');

// The logic to filter data in medical.js currently:
// let data = medicalRosterData.filter(p => p.medical || p.otherPoints || p.emergencyName || p.emergencyContact);
// We want to change this to strictly filter on `medical` field and exclude blank/nil/na/- 

const newFilter = `let data = medicalRosterData.filter(p => {
    if (!p.medical) return false;
    const med = p.medical.trim().toLowerCase();
    if (med === '' || med === '-' || med === 'nil' || med === 'na' || med === 'n/a' || med === 'none' || med === 'no') return false;
    return true;
});`;

code = code.replace(/let data = medicalRosterData\.filter\(p => p\.medical \|\| p\.otherPoints \|\| p\.emergencyName \|\| p\.emergencyContact\);/, newFilter);

// For dietary we'll do the same.

// We also need to remove "Other Notes" and maybe "Emergency Contact" from the medical table. Wait, the prompt says:
// "Do not show other notes". Does it mean don't show the column, or just don't use it in the filter?
// I'll remove the Other Notes column from the Medical UI.
fs.writeFileSync('frontend/js/medical.js', code);
console.log("Updated medical filter");
