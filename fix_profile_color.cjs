const fs = require('fs');
let content = fs.readFileSync('frontend/js/profile.js', 'utf8');

// Inject the definition right above `profilesHtml += `
if (!content.includes('const mRoleColor =')) {
    content = content.replace(
        /profilesHtml \+= `/g,
        "const mRoleColor = m.role === 'TRAINEE' ? 'text-green-600 dark:text-green-400' : (m.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400');\n profilesHtml += `"
    );
    fs.writeFileSync('frontend/js/profile.js', content, 'utf8');
}
