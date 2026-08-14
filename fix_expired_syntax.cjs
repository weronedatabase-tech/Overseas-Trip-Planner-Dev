const fs = require('fs');

let js = fs.readFileSync('frontend/js/expired.js', 'utf8');
const searchStr = `let tripEnd = appSettings.tripEndDate ? new Date(appSettings.tripEndDate) : null;
let minExpiry = null;
if (tripEnd && !isNaN(tripEnd.getTime())) {
   minExpiry = new Date(tripEnd);
   minExpiry.setMonth(minExpiry.getMonth() + 6);
}`;

// It appears twice, let's remove the first instance of it.
// Or we can just do string replace and it replaces the first occurrence!
js = js.replace(searchStr, '');
fs.writeFileSync('frontend/js/expired.js', js);
console.log("Fixed expired syntax");
