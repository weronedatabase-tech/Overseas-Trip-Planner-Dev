const fs = require('fs');
let code = fs.readFileSync('./backend/Code.js', 'utf8');

const target = `  const pNric = String(p.nric).trim().toUpperCase();
  if (existingNrics.has(pNric)) continue;
  existingNrics.add(pNric);`;

const rep = `  const pNric = String(p.nric).trim().toUpperCase();
  if (existingNrics.has(pNric)) {
    return { status: 'error', message: \`NRIC \${pNric} already exists. If you have already registered, login to make changes.\` };
  }
  existingNrics.add(pNric);`;

code = code.replace(target, rep);
fs.writeFileSync('./backend/Code.js', code);
console.log("Updated backend submit");
