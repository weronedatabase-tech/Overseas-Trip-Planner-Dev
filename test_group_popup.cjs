const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

const popupFuncs = `
let activeAssignNric = null;
let activeAssignType = null; // 'group' or 'bus'

function openGroupAssignSheet(nric) {
    activeAssignNric = nric;
    activeAssignType = 'group';
    const p = globalLogistics.participants.find(x => x.nric === nric);
    if (!p) return;
    
    document.getElementById('sheetTitle').innerHTML = \`Assign <span class="text-primary">\${p.displayName || p.name}</span>\`;
    const searchInput = document.getElementById('sheetSearchInput');
    if(searchInput) searchInput.value = '';
    
    renderGroupBusOptions();
    
    document.getElementById('selectionBottomSheet').classList.remove('hidden-force');
}

function openBusAssignSheet(nric) {
    activeAssignNric = nric;
    activeAssignType = 'bus';
    const p = globalLogistics.participants.find(x => x.nric === nric);
    if (!p) return;
    
    document.getElementById('sheetTitle').innerHTML = \`Assign <span class="text-primary">\${p.displayName || p.name}</span>\`;
    const searchInput = document.getElementById('sheetSearchInput');
    if(searchInput) searchInput.value = '';
    
    renderGroupBusOptions();
    
    document.getElementById('selectionBottomSheet').classList.remove('hidden-force');
}

function renderGroupBusOptions() {
    const query = document.getElementById('sheetSearchInput').value.toLowerCase().trim();
    const list = activeAssignType === 'group' ? activeGroupsList : activeBusesList;
    
    let html = \`<div class="flex flex-col gap-2">\`;
    
    // Unassign option
    if (!query || "unassign".includes(query)) {
        html += \`
        <div onclick="selectGroupBusOption('')" class="sheet-list-item cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition" data-name="unassign">
            <span class="font-bold text-gray-700 dark:text-gray-200 text-sm">Unassigned</span>
        </div>\`;
    }
    
    list.forEach(item => {
        if (query && !item.toLowerCase().includes(query)) return;
        html += \`
        <div class="sheet-list-item p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between transition hover:bg-gray-50 dark:hover:bg-gray-750" data-name="\${item.toLowerCase()}">
            <div class="cursor-pointer flex-1 font-bold text-gray-900 dark:text-white text-sm" onclick="selectGroupBusOption('\${item}')">\${activeAssignType === 'group' ? 'Group ' : 'Bus '}\${item}</div>
            <button onclick="removeGroupBusFromPopup('\${item}')" class="text-gray-400 hover:text-red-500 p-2 -mr-2"><i class="fa-solid fa-trash text-xs"></i></button>
        </div>\`;
    });
    
    // Add new
    html += \`
    <div onclick="addGroupBusFromPopup()" class="cursor-pointer p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition">
        <span class="font-bold text-primary text-sm flex items-center gap-2"><i class="fa-solid fa-plus"></i> Add New \${activeAssignType === 'group' ? 'Group' : 'Bus'}</span>
    </div>\`;
    
    html += \`</div>\`;
    
    document.getElementById('sheetListContainer').innerHTML = html;
}

function selectGroupBusOption(value) {
    if (!activeAssignNric) return;
    if (activeAssignType === 'group') {
        handleGroupDrop(activeAssignNric, value);
    } else {
        handleBusDrop(activeAssignNric, value);
    }
    closeSelectionSheet();
}

function addGroupBusFromPopup() {
    const typeName = activeAssignType === 'group' ? 'Group' : 'Bus';
    const name = prompt(\`Enter new \${typeName} name:\`);
    if (!name || !name.trim()) return;
    const val = name.trim();
    
    if (activeAssignType === 'group') {
        if (!activeGroupsList.includes(val)) {
            activeGroupsList.push(val);
            localStorage.setItem('activeGroupsList', JSON.stringify(activeGroupsList));
        }
    } else {
        if (!activeBusesList.includes(val)) {
            activeBusesList.push(val);
            localStorage.setItem('activeBusesList', JSON.stringify(activeBusesList));
        }
    }
    renderGroupBusOptions();
    if (activeAssignType === 'group') renderGroups();
    else renderBuses();
}

function removeGroupBusFromPopup(val) {
    const typeName = activeAssignType === 'group' ? 'Group' : 'Bus';
    if (!confirm(\`Are you sure you want to remove \${typeName} \${val}?\`)) return;
    
    if (activeAssignType === 'group') {
        globalLogistics.participants.forEach(p => {
            if (p.logisticsGroup === val) {
                p.logisticsGroup = "";
                pendingGroupUpdates.set(p.nric, { nric: p.nric, value: "" });
            }
        });
        activeGroupsList = activeGroupsList.filter(x => x !== val);
        localStorage.setItem('activeGroupsList', JSON.stringify(activeGroupsList));
        renderGroups();
        if (pendingGroupUpdates.size > 0) triggerGroupSync();
    } else {
        globalLogistics.participants.forEach(p => {
            if (p.bus === val) {
                p.bus = "";
                pendingBusUpdates.set(p.nric, { nric: p.nric, value: "" });
            }
        });
        activeBusesList = activeBusesList.filter(x => x !== val);
        localStorage.setItem('activeBusesList', JSON.stringify(activeBusesList));
        renderBuses();
        if (pendingBusUpdates.size > 0) triggerBusSync();
    }
    renderGroupBusOptions();
}

function addGroupList() {
    addGroupBusFromPopup(); // Reuses logic but need to set type if called directly
}

function removeGroupList(gName) {
    activeAssignType = 'group';
    removeGroupBusFromPopup(gName);
}

function addBusList() {
    activeAssignType = 'bus';
    addGroupBusFromPopup();
}

function removeBusList(bName) {
    activeAssignType = 'bus';
    removeGroupBusFromPopup(bName);
}
`;

code += `\n${popupFuncs}\n`;

fs.writeFileSync('frontend/js/logistics.js', code);
