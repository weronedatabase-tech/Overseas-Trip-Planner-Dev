const fs = require('fs');
let code = fs.readFileSync('frontend/js/registration.js', 'utf8');

code = code.replace(
    /function hideTraineeDropdown\(idx\) \{[\s\S]*?\}, 250\);\s*\}/,
    `function hideTraineeDropdown(idx) {
setTimeout(() => {
  const dd = document.getElementById(\`trainee-dropdown-\${idx}\`);
  if(dd) dd.classList.add('hidden-force');

  const input = document.getElementById(\`reg-f-related-\${idx}\`);
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
fs.writeFileSync('frontend/js/registration.js', code);
