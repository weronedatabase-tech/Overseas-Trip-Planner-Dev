const fs = require('fs');
let codeProfile = fs.readFileSync('frontend/js/profile.js', 'utf8');

codeProfile = codeProfile.replace(
    /<select id="edRole_\$\{i\}" class="w-full/g,
    `<select id="edRole_\${i}" onchange="document.getElementById('edRelated_\${i}').closest('.relative').className = this.value === 'CAREGIVER' ? 'block relative' : 'hidden-force relative'; document.getElementById('edRelation_\${i}').parentElement.className = this.value === 'CAREGIVER' ? 'block' : 'hidden-force'; document.getElementById('edMedical_\${i}').parentElement.className = this.value === 'TRAINEE' ? 'md:col-span-2' : 'hidden-force';" class="w-full`
);

fs.writeFileSync('frontend/js/profile.js', codeProfile);

let codeMain = fs.readFileSync('frontend/js/main.js', 'utf8');
codeMain = codeMain.replace(
    /<select id="gpmRole" class="w-full/g,
    `<select id="gpmRole" onchange="document.getElementById('gpmRelated').closest('.relative').className = this.value === 'CAREGIVER' ? 'block relative' : 'hidden-force relative'; document.getElementById('gpmRelation').parentElement.className = this.value === 'CAREGIVER' ? 'block' : 'hidden-force'; document.getElementById('gpmMedical').parentElement.className = this.value === 'TRAINEE' ? 'md:col-span-2' : 'hidden-force';" class="w-full`
);
fs.writeFileSync('frontend/js/main.js', codeMain);
