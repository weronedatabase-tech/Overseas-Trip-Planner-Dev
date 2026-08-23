const fs = require('fs');
let content = fs.readFileSync('frontend/js/main.js', 'utf8');

let newLogic = `
    let m = null;
    let familyArr = [];
    if (typeof adminRosterData !== 'undefined' && adminRosterData.length > 0) {
        m = adminRosterData.find(f => f.nric.toUpperCase() === nric.toUpperCase());
        if (m) {
            let tName = null;
            if (m.role === 'TRAINEE') tName = m.shortName || m.fullName || m.name;
            else if (m.role === 'CAREGIVER') tName = m.caregiverFor;
            if (tName) {
                familyArr = adminRosterData.filter(f => {
                    if (f.nric === m.nric) return false;
                    if (f.role === 'TRAINEE' && (f.shortName || f.fullName || f.name) === tName) return true;
                    if (f.role === 'CAREGIVER' && f.caregiverFor === tName) return true;
                    return false;
                });
            }
        }
    } else if (typeof loadedFamily !== 'undefined' && loadedFamily.length > 0) {
        m = loadedFamily.find(f => f.nric.toUpperCase() === nric.toUpperCase());
        if (m) {
            familyArr = loadedFamily.filter(f => f.nric !== m.nric);
        }
    }
    
    if (!m) {
        const res = await apiCall('getProfile', { nric: nric });
        if(res.status === 'error') throw new Error(res.message);
        m = res.family.find(f => f.nric.toUpperCase() === nric.toUpperCase());
        if (m) {
            familyArr = res.family.filter(f => f.nric !== m.nric);
        }
    }`;

content = content.replace(/let m = null;.*?if \(\!m\) throw new Error\("Participant not found"\);/s, newLogic + '\n    if (!m) throw new Error("Participant not found");');

let familyHtmlLogic = `
    let familyHtml = '';
    if (familyArr.length > 0) {
        familyHtml = \`
        <div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-3 mt-1">
            <p class="font-bold text-gray-500 dark:text-gray-400 text-[9px] uppercase tracking-wider mb-2">Family Members</p>
            <div class="flex flex-col gap-2">
                \${familyArr.map(f => {
                     const fRoleColor = f.role === 'TRAINEE' ? 'text-green-600 dark:text-green-400' : (f.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400');
                     return \\\`<div class="flex flex-col md:flex-row md:items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                         <div class="flex items-center gap-2 mb-1 md:mb-0">
                            <span class="text-[8px] font-black \\\${fRoleColor} bg-white dark:bg-gray-900 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wider shrink-0">\\\${f.role.substring(0,3)}</span>
                            <span class="font-bold text-xs text-gray-800 dark:text-gray-200">\\\${f.fullName}</span>
                         </div>
                         <div class="text-[11px] font-mono text-gray-600 dark:text-gray-400 font-semibold bg-white dark:bg-gray-900 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
                            \\\${f.contact || 'No Contact'}
                         </div>
                     </div>\\\`;
                }).join('')}
            </div>
        </div>\`;
    }
`;

content = content.replace(/const dynColor = getProjectColor\(m\.group\);/, "const dynColor = getProjectColor(m.group);\n" + familyHtmlLogic);

content = content.replace(/\$\{m\.role === 'CAREGIVER' \? \`.*?` : ''\}/, `$& \n          \${familyHtml}`);

fs.writeFileSync('frontend/js/main.js', content, 'utf8');
