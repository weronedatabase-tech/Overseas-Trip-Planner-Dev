const fs = require('fs');
let code = fs.readFileSync('./frontend/js/registration.js', 'utf8');

const target = `warnEl.innerHTML = \`\${res.conflictType} already exists. If you have already registered, <a href="index.html" class="underline text-blue-600 hover:text-blue-800">login here</a> (NRIC and Password) to make changes.\`;`;
const rep = `warnEl.innerHTML = \`\${res.conflictType} already exists. If you have already registered before, <a href="index.html" class="underline text-blue-600 hover:text-blue-800">login here</a> to make the necessary changes. Login format: NRIC/FIN + Year of Birth (e.g. S1234567A1989).\`;`;

if (code.includes(target)) {
    code = code.replace(target, rep);
    fs.writeFileSync('./frontend/js/registration.js', code);
    console.log("Updated checkDuplicateField with format");
} else {
    console.log("Not found");
}
