const fs = require('fs');
let codeProfile = fs.readFileSync('frontend/js/profile.js', 'utf8');

codeProfile = codeProfile.replace(
    /const updated = \{/g,
    `const roleVal = document.getElementById(\`edRole_\${i}\`).value;
const relatedVal = document.getElementById(\`edRelated_\${i}\`) ? document.getElementById(\`edRelated_\${i}\`).value.trim() : loadedFamily[i].relatedTrainee;

if (roleVal === 'CAREGIVER' && relatedVal) {
  const names = relatedVal.split(',').map(x => x.trim()).filter(x => x !== '');
  let allValid = true;
  names.forEach(n => {
      const match = loadedFamily.find(x => x.role === 'TRAINEE' && (x.fullName || '').toLowerCase() === n.toLowerCase());
      if (!match) allValid = false;
  });
  if (!allValid) {
      showToast("Caregiver For field must match exactly with existing Trainees' Full Names in your family.", true);
      setBtnLoading(btn, false);
      return;
  }
}

const updated = {`
);

fs.writeFileSync('frontend/js/profile.js', codeProfile);
