const fs = require('fs');

let js = fs.readFileSync('frontend/js/participants.js', 'utf8');

// The incorrect countEl update inside toggleRosterColumn:
js = js.replace(/const countEl = document\.getElementById\('rosterTotalCount'\);\s*if\(countEl\) countEl\.innerText = `\(\$\{adminRosterData\.length\}\)`;/, '');

// Add it to renderRosterTable
const injectPoint = "function renderRosterTable() {\nlet data = [...adminRosterData];";
const injectCode = `function renderRosterTable() {
let data = [...adminRosterData];
`;
js = js.replace(injectPoint, injectCode);

// Actually, wait, let's inject it after data is filtered!
const injectAfterFilter = "data.sort((a, b) => {";
const countUpdateCode = `
    const countEl = document.getElementById('rosterTotalCount');
    if (countEl) countEl.innerText = \`(\${data.length})\`;
data.sort((a, b) => {`;
js = js.replace(injectAfterFilter, countUpdateCode);

fs.writeFileSync('frontend/js/participants.js', js);
console.log("Fixed roster count");
