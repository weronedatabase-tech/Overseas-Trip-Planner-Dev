const fs = require('fs');

let js = fs.readFileSync('frontend/js/expired.js', 'utf8');

const newFilter = `let tripEnd = appSettings.tripEndDate ? new Date(appSettings.tripEndDate) : null;
let minExpiry = null;
if (tripEnd && !isNaN(tripEnd.getTime())) {
   minExpiry = new Date(tripEnd);
   minExpiry.setMonth(minExpiry.getMonth() + 6);
}

let data = medicalRosterData.filter(p => {
    if (!p.passportExpiry) return false; // If they don't have an expiry date, exclude them from expired
    const expD = new Date(p.passportExpiry);
    // Include if valid date AND expires before minExpiry (6 months after trip)
    if (!isNaN(expD.getTime()) && minExpiry && expD < minExpiry) {
        return true;
    }
    // If no trip date is set, just show everything with an expiry for now, or fallback to current date + 6m
    if (!minExpiry) {
        const fallback = new Date();
        fallback.setMonth(fallback.getMonth() + 6);
        if (!isNaN(expD.getTime()) && expD < fallback) return true;
    }
    return false;
});`;

js = js.replace(/let data = medicalRosterData\.filter\(p => p\.passportNo \|\| p\.passportExpiry \|\| p\.nationality\);/, newFilter);

fs.writeFileSync('frontend/js/expired.js', js);
console.log("Patched expired.js logic");
