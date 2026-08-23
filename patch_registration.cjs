const fs = require('fs');
let code = fs.readFileSync('frontend/js/registration.js', 'utf8');

code = code.replace(
    /function validateCgPopupTrainee\(\) \{[\s\S]*?\}, 250\);\s*\}/,
    `function validateCgPopupTrainee() {
setTimeout(() => {
   const dd = document.getElementById('cgPopupTraineeDropdown');
   if(dd) dd.classList.add('hidden-force');
   const input = document.getElementById('cgPopupTraineeName');
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
           input.value = names.join(', ');
       }
   }
}, 250);
}`
);

// update selectCgPopupTrainee
code = code.replace(
    /function selectCgPopupTrainee\(name\) \{[\s\S]*?if\(dd\) dd\.classList\.add\('hidden-force'\);\s*\}\s*\}/,
    `function selectCgPopupTrainee(name) {
const input = document.getElementById('cgPopupTraineeName');
if(input) {
   let parts = input.value.split(',');
   parts.pop();
   parts.push(name);
   input.value = parts.join(', ') + ', ';
   input.dataset.manual = 'true';
   const dd = document.getElementById('cgPopupTraineeDropdown');
   if(dd) dd.classList.add('hidden-force');
}
}`
);

// update filterCgPopupDropdown query
code = code.replace(
    /const query = input\.value\.toLowerCase\(\)\.trim\(\);/,
    `const parts = input.value.split(',');\nconst query = parts[parts.length - 1].toLowerCase().trim();`
);

// Update inline filterTraineeDropdown
code = code.replace(
    /function filterTraineeDropdown\(idx\) \{[\s\S]*?const query = input\.value\.toLowerCase\(\)\.trim\(\);/,
    `function filterTraineeDropdown(idx) {
const input = document.getElementById(\`reg-f-related-\${idx}\`);
const dd = document.getElementById(\`trainee-dropdown-\${idx}\`);
if(!input || !dd) return;
const parts = input.value.split(',');
const query = parts[parts.length - 1].toLowerCase().trim();`
);

// Update inline selectTraineeDropdown
code = code.replace(
    /function selectTraineeDropdown\(idx, name\) \{[\s\S]*?if\(dd\) dd\.classList\.add\('hidden-force'\);\s*\}\s*\}/,
    `function selectTraineeDropdown(idx, name) {
const input = document.getElementById(\`reg-f-related-\${idx}\`);
if(input) {
  let parts = input.value.split(',');
  parts.pop();
  parts.push(name);
  input.value = parts.join(', ') + ', ';
  input.dataset.manual = 'true';
  const dd = document.getElementById(\`trainee-dropdown-\${idx}\`);
  if(dd) dd.classList.add('hidden-force');
}
}`
);

// We need to also patch inline hideTraineeDropdown similarly if we have one. Let's look for hideTraineeDropdown.
fs.writeFileSync('frontend/js/registration.js', code);
