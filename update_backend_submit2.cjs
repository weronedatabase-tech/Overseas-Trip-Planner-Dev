const fs = require('fs');
let code = fs.readFileSync('./backend/Code.js', 'utf8');

const target = `const existingNrics = new Set();
for (let i = 1; i < data.length; i++) {
  if (data[i][11]) existingNrics.add(String(data[i][11]).trim().toUpperCase());
}`;

const rep = `const existingNrics = new Set();
const existingPassports = new Set();
for (let i = 1; i < data.length; i++) {
  if (data[i][11]) existingNrics.add(String(data[i][11]).trim().toUpperCase());
  if (data[i][12]) existingPassports.add(String(data[i][12]).trim().toUpperCase());
}`;

const target2 = `  const pNric = String(p.nric).trim().toUpperCase();
  if (existingNrics.has(pNric)) {
    return { status: 'error', message: \`NRIC \${pNric} already exists. If you have already registered, login to make changes.\` };
  }`;

const rep2 = `  const pNric = String(p.nric).trim().toUpperCase();
  const pPassport = String(p.passportNo || '').trim().toUpperCase();
  if (existingNrics.has(pNric)) {
    return { status: 'error', message: \`NRIC/FIN \${pNric} already exists. If you have already registered, login to make changes.\` };
  }
  if (pPassport && existingPassports.has(pPassport)) {
    return { status: 'error', message: \`Passport \${pPassport} already exists. If you have already registered, login to make changes.\` };
  }`;

code = code.replace(target, rep);
code = code.replace(target2, rep2);
fs.writeFileSync('./backend/Code.js', code);
console.log("Updated backend submit 2");
