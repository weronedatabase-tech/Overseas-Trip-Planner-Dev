const fs = require('fs');
let codeReg = fs.readFileSync('frontend/js/registration.js', 'utf8');

codeReg = codeReg.replace(
    /function validateCgPopupTrainee\(\) \{[\s\S]*?\}, 250\);\s*\}/,
    `function validateCgPopupTrainee() {
setTimeout(() => {
   const input = document.getElementById('cgPopupTraineeName');
   if(input && document.activeElement === input) return;
   const modal = document.getElementById('caregiverPopupModal');
   if(modal && modal.classList.contains('hidden-force')) return;
   const dd = document.getElementById('cgPopupTraineeDropdown');
   if(dd) dd.classList.add('hidden-force');
   if(input && input.value.trim() !== '') {
       const names = input.value.split(',').map(x => x.trim()).filter(x => x !== '');
       let allValid = true;
       names.forEach(val => {
           if (!isValidTraineeName(val)) allValid = false;
       });
       if (!allValid) {
           alert("Pls add/register all Trainees first before adding yourself as the Caregiver. You can add the Trainee as Person 1, and add yourself as Person 2.");
           const validNames = names.filter(n => isValidTraineeName(n));
           input.value = validNames.join(', ') + (validNames.length > 0 ? ', ' : '');
           input.dataset.manual = 'false';
       } else {
           if (!input.value.trim().endsWith(',')) {
               input.value = names.join(', ');
           }
       }
   }
}, 250);
}`
);
fs.writeFileSync('frontend/js/registration.js', codeReg);
