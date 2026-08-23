const fs = require('fs');

let content = fs.readFileSync('frontend/js/main.js', 'utf8');

// Ensure the edit mode input values are formatted as DD MMM YYYY
content = content.replace(
    /value="\$\{m\.dob\}" readonly onclick="openDatePicker\('gpmDob', 'dob'\)"/g,
    'value="${formatDDMmmYYYY(m.dob)}" readonly onclick="openDatePicker(\'gpmDob\', \'dob\')"'
);

content = content.replace(
    /value="\$\{m\.passportExpiry\}" readonly onclick="openDatePicker\('gpmExp', 'exp'\)"/g,
    'value="${m.passportExpiry ? formatDDMmmYYYY(m.passportExpiry) : \'\'}" readonly onclick="openDatePicker(\'gpmExp\', \'exp\')"'
);

// We should also replace in profile.js just to be safe
let profileContent = fs.readFileSync('frontend/js/profile.js', 'utf8');
profileContent = profileContent.replace(
    /value="\$\{m\.dob\}" readonly onclick="openDatePicker\('edDob_/g,
    'value="${formatDDMmmYYYY(m.dob)}" readonly onclick="openDatePicker(\'edDob_'
);
profileContent = profileContent.replace(
    /value="\$\{m\.passportExpiry\}" readonly onclick="openDatePicker\('edExp_/g,
    'value="${m.passportExpiry ? formatDDMmmYYYY(m.passportExpiry) : \'\'}" readonly onclick="openDatePicker(\'edExp_'
);

fs.writeFileSync('frontend/js/main.js', content, 'utf8');
fs.writeFileSync('frontend/js/profile.js', profileContent, 'utf8');

