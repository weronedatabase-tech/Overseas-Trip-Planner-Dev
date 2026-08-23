const fs = require('fs');
let code = fs.readFileSync('./frontend/js/registration.js', 'utf8');

code = code.replace(
    /async function submitRegistration\(btn\) \{/,
    `async function submitRegistration(btn) {
    if (document.querySelector('[data-invalid="true"]')) {
        showToast("Please resolve all errors before submitting.", true);
        return;
    }`
);

fs.writeFileSync('./frontend/js/registration.js', code);
console.log("Updated submitRegistration via regex");
