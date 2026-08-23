const fs = require('fs');
let codeReg = fs.readFileSync('frontend/js/registration.js', 'utf8');
let codeMain = fs.readFileSync('frontend/js/main.js', 'utf8');

codeReg = codeReg.replace(
    /function selectCgPopupTrainee\(name\) \{[\s\S]*?if\(dd\) dd\.classList\.add\('hidden-force'\);\s*\}/,
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
   setTimeout(() => input.focus(), 10);
}`
);

codeReg = codeReg.replace(
    /function validateCgPopupTrainee\(\) \{[\s\S]*?\}, 250\);\s*\}/,
    `function validateCgPopupTrainee() {
setTimeout(() => {
   const input = document.getElementById('cgPopupTraineeName');
   if(input && document.activeElement === input) return;
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

codeReg = codeReg.replace(
    /if \(!isValidTraineeName\(nameVal\)\) \{[\s\S]*?return;\s*\}/,
    `let allValid = true;
const names = nameVal.split(',').map(x => x.trim()).filter(x => x !== '');
if (names.length === 0) allValid = false;
names.forEach(val => {
   if (!isValidTraineeName(val)) allValid = false;
});
if (!allValid) {
   alert("Pls add/register all Trainees first before adding yourself as the Caregiver. You can add the Trainee as Person 1, and add yourself as Person 2.");
   return;
}`
);

codeReg = codeReg.replace(
    /function selectTraineeDropdown\(idx, name\) \{[\s\S]*?if\(dd\) dd\.classList\.add\('hidden-force'\);\s*\}/,
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
  setTimeout(() => input.focus(), 10);
}`
);

codeReg = codeReg.replace(
    /function hideTraineeDropdown\(idx\) \{[\s\S]*?\}, 250\);\s*\}/,
    `function hideTraineeDropdown(idx) {
setTimeout(() => {
  const input = document.getElementById(\`reg-f-related-\${idx}\`);
  if(input && document.activeElement === input) return;
  const dd = document.getElementById(\`trainee-dropdown-\${idx}\`);
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

codeMain = codeMain.replace(
    /window\.selectGpmRelatedTrainee = function\(name\) \{[\s\S]*?if\(dd\) dd\.classList\.add\('hidden-force'\);\s*\};/,
    `window.selectGpmRelatedTrainee = function(name) {
    const inp = document.getElementById('gpmRelated');
    if(inp) {
        let parts = inp.value.split(',');
        parts.pop();
        parts.push(name);
        inp.value = parts.join(', ') + ', ';
    }
    const dd = document.getElementById('gpmRelatedDropdown');
    if(dd) dd.classList.add('hidden-force');
    setTimeout(() => { if(inp) inp.focus(); }, 10);
};`
);

fs.writeFileSync('frontend/js/registration.js', codeReg);
fs.writeFileSync('frontend/js/main.js', codeMain);
