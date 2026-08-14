const fs = require('fs');

function fixHeader(file, title, iconHtml) {
    let code = fs.readFileSync(file, 'utf8');
    
    // The previous bad replacement caused:
    // <h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg flex items-center gap-2">
    //            ${iconHtml}
    //            ${title}
    //        </h3>
    
    code = code.replace(/\$\{iconHtml\}/g, iconHtml);
    code = code.replace(/\$\{title\}/g, title);
    
    fs.writeFileSync(file, code);
}

fixHeader('frontend/js/medical.js', 'Medical & Medications', '<svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM12 9v6m-3-3h6" /></svg>');
fixHeader('frontend/js/diet.js', 'Dietary Restrictions', '<svg class="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>');
fixHeader('frontend/js/expired.js', 'Expired Passports', '<svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-3.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm3-.75a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>');
fixHeader('frontend/js/other.js', 'Other Notes', '<svg class="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>');

console.log("Fixed headers!");
