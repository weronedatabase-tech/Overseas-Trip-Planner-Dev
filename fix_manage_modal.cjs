const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

// Change the Add button to Manage button in html injection
code = code.replace(/<button onclick="addGroupList\(\)" class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-\[9px\] font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary transition focus:outline-none"><i class="fa-solid fa-plus mr-1"><\/i>Add<\/button>/,
`<button onclick="openManageGroupsSheet()" class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-[9px] font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary transition focus:outline-none"><i class="fa-solid fa-cog mr-1"></i>Manage</button>`);

code = code.replace(/<button onclick="addBusList\(\)" class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-\[9px\] font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary transition focus:outline-none"><i class="fa-solid fa-plus mr-1"><\/i>Add<\/button>/,
`<button onclick="openManageBusesSheet()" class="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm text-[9px] font-bold text-gray-600 dark:text-gray-300 hover:text-primary hover:border-primary transition focus:outline-none"><i class="fa-solid fa-cog mr-1"></i>Manage</button>`);

const manageFuncs = `
function openManageGroupsSheet() {
    activeAssignNric = null; // No assignment
    activeAssignType = 'group';
    document.getElementById('sheetTitle').innerHTML = \`Manage <span class="text-primary">Groups</span>\`;
    const searchInput = document.getElementById('sheetSearchInput');
    if(searchInput) searchInput.value = '';
    renderGroupBusOptions();
    document.getElementById('selectionBottomSheet').classList.remove('hidden-force');
}

function openManageBusesSheet() {
    activeAssignNric = null; // No assignment
    activeAssignType = 'bus';
    document.getElementById('sheetTitle').innerHTML = \`Manage <span class="text-primary">Buses</span>\`;
    const searchInput = document.getElementById('sheetSearchInput');
    if(searchInput) searchInput.value = '';
    renderGroupBusOptions();
    document.getElementById('selectionBottomSheet').classList.remove('hidden-force');
}
`;

code = code.replace(/function addGroupList\(\) \{[\s\S]*?function removeBusList\(bName\) \{[\s\S]*?\}\n/g, manageFuncs);

fs.writeFileSync('frontend/js/logistics.js', code);
