const fs = require('fs');

function patchFile(file) {
    if(!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    content = content.replace(
        /<span class="text-\[9px\] font-black \$\{roleColor\} bg-gray-50 dark:bg-gray-800 px-1\.5 py-0\.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wider">\$\{roleStr\}<\/span>/g,
        '<span class="text-[9px] font-black ${roleColor} bg-gray-50 dark:bg-gray-800 px-1 py-[1px] leading-tight rounded-sm border border-gray-200 dark:border-gray-700 uppercase tracking-wide">${roleStr}</span>'
    );

    content = content.replace(
        /<span class="px-1\.5 py-0\.5 rounded border shadow-sm text-\[9px\] font-bold \$\{getProjectColor\(p\.group\)\} whitespace-normal break-words inline-block">\$\{\(p\.group \|\| 'None'\)\.toUpperCase\(\)\}<\/span>/g,
        '<span class="px-1 py-[1px] leading-tight rounded-sm border shadow-sm text-[9px] font-bold ${getProjectColor(p.group)} whitespace-normal break-words inline-block" title="${(p.group || \'None\').toUpperCase()}">${getProjectAbbreviation(p.group || \'None\')}</span>'
    );

    fs.writeFileSync(file, content, 'utf8');
}

patchFile('frontend/js/diet.js');
patchFile('frontend/js/expired.js');
patchFile('frontend/js/other.js');
patchFile('frontend/js/main.js');

