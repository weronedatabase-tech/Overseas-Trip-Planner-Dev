const fs = require('fs');
let code = fs.readFileSync('./frontend/js/registration.js', 'utf8');

const target = `async function submitRegistration(btn) {
let finalData = [];
let blocks = document.getElementsByClassName('member-block');
if (blocks.length === 0) { showToast("Please add at least one person.", true); return;}`;

const rep = `async function submitRegistration(btn) {
if (document.querySelector('[data-invalid="true"]')) {
    showToast("Please resolve all errors before submitting.", true);
    return;
}
let finalData = [];
let blocks = document.getElementsByClassName('member-block');
if (blocks.length === 0) { showToast("Please add at least one person.", true); return;}`;

code = code.replace(target, rep);
fs.writeFileSync('./frontend/js/registration.js', code);
console.log("Updated submitRegistration");
