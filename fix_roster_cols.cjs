const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

// 1. Update rosterCols definition to hide role and group, and update localStorage init if possible.
// Wait, actually I can just change the default rosterCols and let them be visible or not, but it's better to force them out or hidden.
code = code.replace(/\{ id: 'role', label: 'Role', width: 90, visible: true \},/g, "{ id: 'role', label: 'Role', width: 90, visible: false },");
code = code.replace(/\{ id: 'group', label: 'Project', width: 100, visible: true \},/g, "{ id: 'group', label: 'Project', width: 100, visible: false },");

// Also clear localStorage for rosterCols so it takes the new default? No, the user might have saved it.
// Let's add a migration for the user's localStorage:
const migrationCode = `
// Force hide role and group in existing localStorage rosterCols if they are still visible
const savedCols = JSON.parse(localStorage.getItem('rosterCols'));
if (savedCols) {
    let changed = false;
    savedCols.forEach(c => {
        if ((c.id === 'role' || c.id === 'group') && c.visible) {
            c.visible = false;
            changed = true;
        }
    });
    if (changed) {
        localStorage.setItem('rosterCols', JSON.stringify(savedCols));
        rosterCols = savedCols;
    }
}
`;
code = code.replace(/let traineeShortNames = \{\};/, migrationCode + "\nlet traineeShortNames = {};");

// 2. Default view of the roster should be the special sort.
// rosterSortRules = JSON.parse(localStorage.getItem('rosterSortRules')) || [{ col: 'fullName', asc: true }];
code = code.replace(/rosterSortRules = JSON\.parse\(localStorage\.getItem\('rosterSortRules'\)\) \|\| \[\{ col: 'fullName', asc: true \}\];/,
"rosterSortRules = JSON.parse(localStorage.getItem('rosterSortRules')) || [{ col: 'specialSort', asc: true }];");

// 3. Freeze name column
// th: <th class="p-3 relative bg-gray-100 dark:bg-gray-800 roster-col-fullName align-top"
code = code.replace(/<th class="p-3 relative bg-gray-100 dark:bg-gray-800 roster-col-fullName align-top"/,
'<th class="p-3 relative bg-gray-100 dark:bg-gray-800 roster-col-fullName align-top sticky left-0 z-20 border-r border-gray-200 dark:border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"');

// td: <td class="p-3 align-top roster-col-fullName"
code = code.replace(/<td class="p-3 align-top roster-col-fullName"/g,
'<td class="p-3 align-top roster-col-fullName sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50"');
// Wait, the `tr` has `hover:bg-gray-50`, so the `td` needs to inherit it or use `group-hover`.
// I will change the `tr` to have `group`:
code = code.replace(/<tr class="hover:bg-gray-50 dark:hover:bg-gray-800\/50 transition cursor-pointer"/g,
'<tr class="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"');

// 4. Merge role and project into name column
// Replace the td contents for fullName
const oldTd = `<td class="p-3 align-top roster-col-fullName sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50" style="width: 200px; min-width: 200px; max-width: 200px;">
           <div class="\${nameClass} text-xs md:text-sm leading-tight whitespace-normal break-words">\${fullNameUpper}</div>
           <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium whitespace-normal break-words">\${shortNameUpper}</div>
           \${famTag}
       </td>`;
       
const newTd = `<td class="p-3 align-top roster-col-fullName sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50" style="width: 250px; min-width: 250px; max-width: 250px;">
           <div class="\${nameClass} text-xs md:text-sm leading-tight whitespace-normal break-words">\${fullNameUpper}</div>
           <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium whitespace-normal break-words">\${shortNameUpper}</div>
           <div class="flex items-center gap-1 mt-1 flex-wrap">
               <span class="text-[9px] font-black \${roleColor} bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wider">\${roleStr}</span>
               <span class="px-1.5 py-0.5 rounded border shadow-sm text-[9px] font-bold \${getProjectColor(p.group)} whitespace-normal break-words inline-block">\${(p.group || 'None').toUpperCase()}</span>
           </div>
           \${famTag}
       </td>`;

code = code.replace(/<td class="p-3 align-top roster-col-fullName[^>]*>[\s\S]*?<\/td>/, newTd);
code = code.replace(/<th class="([^"]*roster-col-fullName[^"]*)" style="width: 200px; min-width: 200px; max-width: 200px;"/, 
'<th class="$1" style="width: 250px; min-width: 250px; max-width: 250px;"');

fs.writeFileSync('frontend/js/participants.js', code);
