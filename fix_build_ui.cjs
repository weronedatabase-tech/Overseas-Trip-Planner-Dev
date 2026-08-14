const fs = require('fs');

let js = fs.readFileSync('frontend/js/diet.js', 'utf8');
js = js.replace(/function buildMedicalUI\(\)/, 'function buildDietUI()');
fs.writeFileSync('frontend/js/diet.js', js);

js = fs.readFileSync('frontend/js/other.js', 'utf8');
js = js.replace(/function buildMedicalUI\(\)/, 'function buildOtherUI()');
fs.writeFileSync('frontend/js/other.js', js);

console.log("Fixed build UI functions");
