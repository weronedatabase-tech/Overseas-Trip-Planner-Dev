const fs = require('fs');

let expiredJs = fs.readFileSync('frontend/js/expired.js', 'utf8');

expiredJs = expiredJs.replace(/localStorage\.getItem\('medicalSortRules_v2'\)/g, "localStorage.getItem('expiredSortRules')");
expiredJs = expiredJs.replace(/localStorage\.setItem\('medicalSortRules_v2'/g, "localStorage.setItem('expiredSortRules'");

expiredJs = expiredJs.replace(/localStorage\.getItem\('medicalCols_v2'\)/g, "localStorage.getItem('expiredCols')");
expiredJs = expiredJs.replace(/localStorage\.setItem\('medicalCols_v2'/g, "localStorage.setItem('expiredCols'");

const newCols = `let medCols = JSON.parse(localStorage.getItem('expiredCols')) || [
{ id: 'passportNo', label: 'Passport No.', width: 150, visible: true },
{ id: 'passportExpiry', label: 'Expiry Date', width: 150, visible: true },
{ id: 'nationality', label: 'Nationality', width: 120, visible: true }
];`;
expiredJs = expiredJs.replace(/let medCols =[\s\S]*?\];/, newCols);

// Filter adminRosterData for expired passports
// In roster, minExpiry is 6 months after tripEndDate
const expiredFilter = `
let tripEnd = appSettings.tripEndDate ? new Date(appSettings.tripEndDate) : null;
let minExpiry = null;
if (tripEnd && !isNaN(tripEnd.getTime())) {
   minExpiry = new Date(tripEnd);
   minExpiry.setMonth(minExpiry.getMonth() + 6);
}

let data = adminRosterData.filter(p => {
    if (!p.passportExpiry) return true; // Show those with missing expiry
    const expD = new Date(p.passportExpiry);
    if (isNaN(expD.getTime())) return true;
    if (minExpiry && expD < minExpiry) return true;
    return false;
});
`;
expiredJs = expiredJs.replace(/let data = adminRosterData\.filter[\s\S]*?\);/, expiredFilter);

// Change title inside UI
expiredJs = expiredJs.replace(/<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Medical Requirements<\/h3>/, 
'<h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Action Required: Passport/Visa</h3>');

fs.writeFileSync('frontend/js/expired.js', expiredJs);
