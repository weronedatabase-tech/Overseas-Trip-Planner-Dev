const fs = require('fs');

// Medical
let medJs = fs.readFileSync('frontend/js/medical.js', 'utf8');
medJs = medJs.replace(/let data = \[\.\.\.medicalRosterData\];/, 'let data = medicalRosterData.filter(p => p.medical || p.otherPoints || p.emergencyName || p.emergencyContact);');
fs.writeFileSync('frontend/js/medical.js', medJs);

// Diet
let dietJs = fs.readFileSync('frontend/js/diet.js', 'utf8');
dietJs = dietJs.replace(/let data = \[\.\.\.medicalRosterData\];/, 'let data = medicalRosterData.filter(p => p.diet || p.otherPoints);');
fs.writeFileSync('frontend/js/diet.js', dietJs);

// Expired
let expiredJs = fs.readFileSync('frontend/js/expired.js', 'utf8');
const expiredFilter = `
let tripEnd = (window.appSettings && window.appSettings.tripEndDate) ? new Date(window.appSettings.tripEndDate) : null;
let minExpiry = null;
if (tripEnd && !isNaN(tripEnd.getTime())) {
   minExpiry = new Date(tripEnd);
   minExpiry.setMonth(minExpiry.getMonth() + 6);
}

let data = medicalRosterData.filter(p => {
    if (!p.passportExpiry) return true; // Show missing expiry
    const expD = new Date(p.passportExpiry);
    if (isNaN(expD.getTime())) return true;
    if (minExpiry && expD < minExpiry) return true;
    return false;
});
`;
expiredJs = expiredJs.replace(/let data = \[\.\.\.medicalRosterData\];/, expiredFilter);
fs.writeFileSync('frontend/js/expired.js', expiredJs);
