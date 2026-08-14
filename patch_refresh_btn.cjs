const fs = require('fs');

let js = fs.readFileSync('frontend/js/diet.js', 'utf8');
js = js.replace(/loadMedicalData\(\)/, 'loadDietData()');
fs.writeFileSync('frontend/js/diet.js', js);

js = fs.readFileSync('frontend/js/expired.js', 'utf8');
js = js.replace(/loadMedicalData\(\)/, 'loadExpiredData()');
fs.writeFileSync('frontend/js/expired.js', js);

js = fs.readFileSync('frontend/js/other.js', 'utf8');
js = js.replace(/loadMedicalData\(\)/, 'loadOtherData()');
fs.writeFileSync('frontend/js/other.js', js);

console.log("Patched refresh buttons");
