const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

code = code.replace(/function generateGroupCardHtml\(item\) \{[\s\S]*?return `/,
`function generateGroupCardHtml(item) {
    const dynColor = getProjectColor(item.group);
    const dName = item.displayName || item.name;
    const roleColor = item.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (item.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
    const roleShort = item.role.substring(0,3).toUpperCase();
    return \``);

code = code.replace(/<div class="dnd-group-draggable(.*?)data-nric="\$\{item\.nric\}">/g, 
`<div class="dnd-group-draggable$1data-nric="\${item.nric}" onclick="openGroupAssignSheet('\${item.nric}')">`);

code = code.replace(/<div class="main-name-pill font-extrabold text-\[10px\] md:text-\[11px\] px-1\.5 py-1 rounded shadow-sm border w-full flex items-start justify-between gap-1 border-gray-300 dark:border-gray-600">/g, 
`<div class="main-name-pill font-extrabold text-[10px] md:text-[11px] px-1.5 py-1 rounded shadow-sm border \${dynColor} w-full flex items-start justify-between gap-1">`);

code = code.replace(/function generateBusCardHtml\(item\) \{[\s\S]*?return `/,
`function generateBusCardHtml(item) {
    const dynColor = getProjectColor(item.group);
    const dName = item.displayName || item.name;
    const roleColor = item.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (item.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
    const roleShort = item.role.substring(0,3).toUpperCase();
    return \``);

code = code.replace(/<div class="dnd-bus-draggable(.*?)data-nric="\$\{item\.nric\}">/g, 
`<div class="dnd-bus-draggable$1data-nric="\${item.nric}" onclick="openBusAssignSheet('\${item.nric}')">`);

fs.writeFileSync('frontend/js/logistics.js', code);
