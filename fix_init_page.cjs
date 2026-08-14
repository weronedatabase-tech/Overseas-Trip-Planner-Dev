const fs = require('fs');

let html = fs.readFileSync('diet.html', 'utf8');
html = html.replace(/buildMedicalUI\(\)/g, 'buildDietUI()');
fs.writeFileSync('diet.html', html);

html = fs.readFileSync('expired.html', 'utf8');
html = html.replace(/buildMedicalUI\(\)/g, 'buildExpiredUI()');
fs.writeFileSync('expired.html', html);

html = fs.readFileSync('other.html', 'utf8');
html = html.replace(/buildMedicalUI\(\)/g, 'buildOtherUI()');
fs.writeFileSync('other.html', html);

console.log("Fixed init scripts");
