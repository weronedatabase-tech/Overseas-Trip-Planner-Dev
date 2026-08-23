const fs = require('fs');

function patchFile(file) {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // add mRoleColor definition right before window._currentModalParticipant = m; (for main.js) 
    // or right before cont.innerHTML = ... (for profile.js)
    if (!content.includes('const mRoleColor =')) {
        content = content.replace(
            /window\._currentModalParticipant = m;/,
            "const mRoleColor = m.role === 'TRAINEE' ? 'text-green-600 dark:text-green-400' : (m.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400');\n    window._currentModalParticipant = m;"
        );
        // For profile.js where it doesn't have window._currentModalParticipant
        content = content.replace(
            /profilesHtml \+= `\n\s*<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">/,
            "const mRoleColor = m.role === 'TRAINEE' ? 'text-green-600 dark:text-green-400' : (m.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400');\n  profilesHtml += `\n        <div class=\"bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6\">"
        );
    }

    // Now replace the span
    content = content.replace(
        /<span class="text-\[9px\] font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1\.5 py-0\.5 rounded uppercase tracking-wider">\$\{m\.role\}<\/span>/g,
        '<span class="text-[9px] font-black ${mRoleColor} bg-gray-50 dark:bg-gray-800 px-1 py-[1px] leading-tight rounded-sm border border-gray-200 dark:border-gray-700 uppercase tracking-wide">${m.role}</span>'
    );

    fs.writeFileSync(file, content, 'utf8');
}

patchFile('frontend/js/main.js');
patchFile('frontend/js/profile.js');

