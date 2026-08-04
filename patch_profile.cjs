const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

const regex = /<h3 class="text-sm font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">\s*<svg.+?<\/svg>\s*Upload Receipt\s*<\/h3>/s;
code = code.replace(regex, `<h3 class="text-sm font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Upload Fees Paid Confirmation Screenshot
        </h3>`);

const btnTextRegex = /<span class="btn-text">Upload Receipt<\/span>/g;
code = code.replace(btnTextRegex, '<span class="btn-text">Upload Confirmation</span>');

fs.writeFileSync('frontend/js/profile.js', code);