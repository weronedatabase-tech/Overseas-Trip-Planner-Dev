const fs = require('fs');
let code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

const newCode = `
let pendingGroupUpdates = new Map();
let pendingBusUpdates = new Map();
let isGroupSyncing = false;
let isBusSyncing = false;
let activeGroupsList = ["1", "2", "3", "4", "5", "6", "7"];
let activeBusesList = ["1", "2", "3", "4", "5"];

function renderGroups() {
    if(!globalLogistics || !document.getElementById('groupListContainer')) return;
    const query = document.getElementById('groupSearchInput') ? document.getElementById('groupSearchInput').value.toLowerCase().trim() : '';
    
    let unassigned = [];
    let groupMap = {};
    activeGroupsList.forEach(g => groupMap[g] = []);

    globalLogistics.participants.forEach(p => {
        let pGroup = String(p.group || "").trim();
        if (pGroup && !activeGroupsList.includes(pGroup)) {
            activeGroupsList.push(pGroup);
            groupMap[pGroup] = [];
        }
        
        let match = false;
        if (query) {
            const dName = (p.displayName || p.name).toLowerCase();
            match = dName.includes(query) || p.nric.toLowerCase().includes(query) || pGroup.toLowerCase().includes(query);
        } else {
            match = true;
        }
        
        if (!match) return;

        if (pGroup) {
            groupMap[pGroup].push(p);
        } else {
            unassigned.push(p);
        }
    });

    document.getElementById('groupUnassignedCount').innerText = unassigned.length;
    let unHtml = '';
    unassigned.forEach(item => {
        unHtml += generateGroupCardHtml(item);
    });
    document.getElementById('groupUnassignedPool').innerHTML = unHtml || '<p class="text-[10px] text-gray-500 font-bold p-2 text-center mt-2">All assigned / No matches.</p>';

    let grpHtml = '';
    activeGroupsList.forEach(gName => {
        let occHtml = '';
        groupMap[gName].forEach(item => {
            occHtml += generateGroupCardHtml(item);
        });

        grpHtml += \`
        <div class="dnd-group-dropzone bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm transition-colors" data-group="\${gName}">
            <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-1.5 mb-1.5">
                <span class="font-black text-[11px] md:text-sm text-gray-900 dark:text-white leading-tight">Group \${gName}</span>
                <span class="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded shadow-inner">\${groupMap[gName].length} Pax</span>
            </div>
            <div class="flex flex-col gap-1 min-h-[40px] relative pointer-events-auto z-10 w-full rounded border border-transparent transition-all">
                \${occHtml || '<span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 m-1 pointer-events-none text-center py-2 w-full">Drop here...</span>'}
            </div>
        </div>
        \`;
    });
    document.getElementById('groupListContainer').innerHTML = grpHtml;
}

function generateGroupCardHtml(item) {
    const dName = item.displayName || item.name;
    const roleColor = item.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (item.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
    const roleShort = item.role.substring(0,3).toUpperCase();
    return \`
    <div class="dnd-group-draggable bg-white dark:bg-gray-800 p-1 md:p-1.5 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition select-none flex flex-col gap-1" data-nric="\${item.nric}">
        <div class="main-name-pill font-extrabold text-[10px] md:text-[11px] px-1.5 py-1 rounded shadow-sm border w-full flex items-start justify-between gap-1 border-gray-300 dark:border-gray-600">
            <span class="break-words whitespace-normal text-left flex-1">\${dName}</span>
        </div>
        <span class="text-[7px] md:text-[8px] font-black \${roleColor} bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded uppercase border border-gray-100 dark:border-gray-600 shrink-0 self-start w-max">\${roleShort}</span>
    </div>
    \`;
}

function renderBuses() {
    if(!globalLogistics || !document.getElementById('busListContainer')) return;
    const query = document.getElementById('busSearchInput') ? document.getElementById('busSearchInput').value.toLowerCase().trim() : '';
    
    let unassigned = [];
    let busMap = {};
    activeBusesList.forEach(b => busMap[b] = []);

    globalLogistics.participants.forEach(p => {
        let pBus = String(p.bus || "").trim();
        if (pBus && !activeBusesList.includes(pBus)) {
            activeBusesList.push(pBus);
            busMap[pBus] = [];
        }
        
        let match = false;
        if (query) {
            const dName = (p.displayName || p.name).toLowerCase();
            match = dName.includes(query) || p.nric.toLowerCase().includes(query) || pBus.toLowerCase().includes(query);
        } else {
            match = true;
        }
        
        if (!match) return;

        if (pBus) {
            busMap[pBus].push(p);
        } else {
            unassigned.push(p);
        }
    });

    document.getElementById('busUnassignedCount').innerText = unassigned.length;
    let unHtml = '';
    unassigned.forEach(item => {
        unHtml += generateBusCardHtml(item);
    });
    document.getElementById('busUnassignedPool').innerHTML = unHtml || '<p class="text-[10px] text-gray-500 font-bold p-2 text-center mt-2">All assigned / No matches.</p>';

    let busHtml = '';
    activeBusesList.forEach(bName => {
        let occHtml = '';
        busMap[bName].forEach(item => {
            occHtml += generateBusCardHtml(item);
        });

        busHtml += \`
        <div class="dnd-bus-dropzone bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-sm transition-colors" data-bus="\${bName}">
            <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-1.5 mb-1.5">
                <span class="font-black text-[11px] md:text-sm text-gray-900 dark:text-white leading-tight">Bus \${bName}</span>
                <span class="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded shadow-inner">\${busMap[bName].length} Pax</span>
            </div>
            <div class="flex flex-col gap-1 min-h-[40px] relative pointer-events-auto z-10 w-full rounded border border-transparent transition-all">
                \${occHtml || '<span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 m-1 pointer-events-none text-center py-2 w-full">Drop here...</span>'}
            </div>
        </div>
        \`;
    });
    document.getElementById('busListContainer').innerHTML = busHtml;
}

function generateBusCardHtml(item) {
    const dynColor = getProjectColor(item.group);
    const dName = item.displayName || item.name;
    const roleColor = item.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (item.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
    const roleShort = item.role.substring(0,3).toUpperCase();
    return \`
    <div class="dnd-bus-draggable bg-white dark:bg-gray-800 p-1 md:p-1.5 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary transition select-none flex flex-col gap-1" data-nric="\${item.nric}">
        <div class="main-name-pill font-extrabold text-[10px] md:text-[11px] px-1.5 py-1 rounded shadow-sm border \${dynColor} w-full flex items-start justify-between gap-1">
            <span class="break-words whitespace-normal text-left flex-1">\${dName}</span>
        </div>
        <span class="text-[7px] md:text-[8px] font-black \${roleColor} bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded uppercase border border-gray-100 dark:border-gray-600 shrink-0 self-start w-max">\${roleShort}</span>
    </div>
    \`;
}

function handleGroupDrop(nric, groupName) {
    const p = globalLogistics.participants.find(x => x.nric === nric);
    if (!p) return;
    p.group = groupName;
    pendingGroupUpdates.set(nric, { nric: nric, value: groupName });

    // Handle pairing logic (auto group paired vols / caregivers)
    let connected = getConnectedParticipants(nric);
    connected.forEach(cNric => {
        let cp = globalLogistics.participants.find(x => x.nric === cNric);
        if (cp && cp.group !== groupName) {
            cp.group = groupName;
            pendingGroupUpdates.set(cNric, { nric: cNric, value: groupName });
        }
    });

    renderGroups();
    triggerGroupSync();
}

function handleBusDrop(nric, busName) {
    const p = globalLogistics.participants.find(x => x.nric === nric);
    if (!p) return;
    p.bus = busName;
    pendingBusUpdates.set(nric, { nric: nric, value: busName });

    // Handle pairing logic (auto bus paired vols / caregivers)
    let connected = getConnectedParticipants(nric);
    connected.forEach(cNric => {
        let cp = globalLogistics.participants.find(x => x.nric === cNric);
        if (cp && cp.bus !== busName) {
            cp.bus = busName;
            pendingBusUpdates.set(cNric, { nric: cNric, value: busName });
        }
    });

    renderBuses();
    triggerBusSync();
}

function getConnectedParticipants(startNric) {
    const connected = new Set([startNric]);
    const queue = [startNric];
    const activePairings = (globalLogistics.pairings || []).filter(p => (!p.status || p.status === 'ACTIVE'));

    while(queue.length > 0) {
        const current = queue.shift();
        const p = globalLogistics.participants.find(x => x.nric === current);
        if (!p) continue;

        // Auto link related trainees/caregivers
        if (p.role === 'CAREGIVER' && p.relatedTrainee) {
            const rel = globalLogistics.participants.find(x => x.role === 'TRAINEE' && x.name === p.relatedTrainee);
            if (rel && !connected.has(rel.nric)) {
                connected.add(rel.nric);
                queue.push(rel.nric);
            }
        }
        if (p.role === 'TRAINEE') {
            globalLogistics.participants.forEach(x => {
                if (x.role === 'CAREGIVER' && x.relatedTrainee === p.name) {
                    if (!connected.has(x.nric)) {
                        connected.add(x.nric);
                        queue.push(x.nric);
                    }
                }
            });
        }

        // Auto link pairings
        activePairings.forEach(pair => {
            if (pair.traineeNric === current && !connected.has(pair.volNric)) {
                connected.add(pair.volNric);
                queue.push(pair.volNric);
            }
            if (pair.volNric === current && !connected.has(pair.traineeNric)) {
                connected.add(pair.traineeNric);
                queue.push(pair.traineeNric);
            }
        });
    }
    return Array.from(connected);
}

function autoGroup() {
    let unassigned = globalLogistics.participants.filter(p => !p.group);
    if (unassigned.length === 0) return;
    
    // Basic greedy grouping for demonstration
    let groupIdx = 0;
    unassigned.forEach(p => {
        if (!p.group) {
            let connected = getConnectedParticipants(p.nric);
            let targetGroup = activeGroupsList[groupIdx % activeGroupsList.length];
            connected.forEach(cNric => {
                let cp = globalLogistics.participants.find(x => x.nric === cNric);
                if (cp && !cp.group) {
                    cp.group = targetGroup;
                    pendingGroupUpdates.set(cNric, { nric: cNric, value: targetGroup });
                }
            });
            groupIdx++;
        }
    });
    renderGroups();
    triggerGroupSync();
}

function autoBus() {
    let unassigned = globalLogistics.participants.filter(p => !p.bus);
    if (unassigned.length === 0) return;
    
    // Auto bus assigns by groups first, then connected
    let busIdx = 0;
    unassigned.forEach(p => {
        if (!p.bus) {
            let connected = getConnectedParticipants(p.nric);
            // Additionally pull in people from the same group
            if (p.group) {
                globalLogistics.participants.forEach(x => {
                    if (x.group === p.group && !connected.includes(x.nric)) {
                        connected.push(x.nric);
                    }
                });
            }
            let targetBus = activeBusesList[busIdx % activeBusesList.length];
            connected.forEach(cNric => {
                let cp = globalLogistics.participants.find(x => x.nric === cNric);
                if (cp && !cp.bus) {
                    cp.bus = targetBus;
                    pendingBusUpdates.set(cNric, { nric: cNric, value: targetBus });
                }
            });
            busIdx++;
        }
    });
    renderBuses();
    triggerBusSync();
}

function resetGroupAssignments() {
    if (!confirm("Clear all group assignments?")) return;
    globalLogistics.participants.forEach(p => {
        if (p.group) {
            p.group = "";
            pendingGroupUpdates.set(p.nric, { nric: p.nric, value: "" });
        }
    });
    renderGroups();
    triggerGroupSync();
}

function resetBusAssignments() {
    if (!confirm("Clear all bus assignments?")) return;
    globalLogistics.participants.forEach(p => {
        if (p.bus) {
            p.bus = "";
            pendingBusUpdates.set(p.nric, { nric: p.nric, value: "" });
        }
    });
    renderBuses();
    triggerBusSync();
}

async function manualSyncGroups() {
    if (pendingGroupUpdates.size > 0) await executeGroupSync();
}
async function manualSyncBuses() {
    if (pendingBusUpdates.size > 0) await executeBusSync();
}

let groupSyncTimeout = null;
function triggerGroupSync() {
    if (groupSyncTimeout) clearTimeout(groupSyncTimeout);
    groupSyncTimeout = setTimeout(executeGroupSync, 800);
}

let busSyncTimeout = null;
function triggerBusSync() {
    if (busSyncTimeout) clearTimeout(busSyncTimeout);
    busSyncTimeout = setTimeout(executeBusSync, 800);
}

async function executeGroupSync() {
    if (isGroupSyncing || pendingGroupUpdates.size === 0) return;
    isGroupSyncing = true;
    const batch = Array.from(pendingGroupUpdates.values());
    pendingGroupUpdates.clear();
    try {
        await apiCall('syncAssignments', { updates: batch, column: 'group' });
    } finally {
        isGroupSyncing = false;
        if (pendingGroupUpdates.size > 0) triggerGroupSync();
    }
}

async function executeBusSync() {
    if (isBusSyncing || pendingBusUpdates.size === 0) return;
    isBusSyncing = true;
    const batch = Array.from(pendingBusUpdates.values());
    pendingBusUpdates.clear();
    try {
        await apiCall('syncAssignments', { updates: batch, column: 'bus' });
    } finally {
        isBusSyncing = false;
        if (pendingBusUpdates.size > 0) triggerBusSync();
    }
}
`;

code = code.replace(/function switchLogisticsSubTab/g, newCode + "\nfunction switchLogisticsSubTab");

// Modify endDrag to handle group and bus
const dragEndBlock = `
    let roomDraggable = e.target.closest('.dnd-room-draggable');
    let groupDraggable = e.target.closest('.dnd-group-draggable');
    let busDraggable = e.target.closest('.dnd-bus-draggable');
    if(!draggable && !roomDraggable && !groupDraggable && !busDraggable) return;

    if (draggable) {
        const pairingContainer = document.getElementById('log-pairings');
        if(!pairingContainer || pairingContainer.classList.contains('hidden-force')) return;
        dndState.type = 'pairing';
        dndState.el = draggable;
    } else if (roomDraggable) {
        const roomsContainer = document.getElementById('log-rooms');
        if(!roomsContainer || roomsContainer.classList.contains('hidden-force')) return;
        dndState.type = 'rooming';
        dndState.el = roomDraggable;
    } else if (groupDraggable) {
        const groupsContainer = document.getElementById('log-groups');
        if(!groupsContainer || groupsContainer.classList.contains('hidden-force')) return;
        dndState.type = 'grouping';
        dndState.el = groupDraggable;
    } else if (busDraggable) {
        const busesContainer = document.getElementById('log-buses');
        if(!busesContainer || busesContainer.classList.contains('hidden-force')) return;
        dndState.type = 'busing';
        dndState.el = busDraggable;
    }`;

code = code.replace(/let roomDraggable = e\.target\.closest\('\.dnd-room-draggable'\);([\s\S]*?)dndState\.nameNode = dndState\.el\.querySelector\('\.main-name-pill'\) \|\| dndState\.el;/g, dragEndBlock + "\n    dndState.nameNode = dndState.el.querySelector('.main-name-pill') || dndState.el;");

const moveDragBlock = `
        const activeDz = elAtPoint ? elAtPoint.closest('.dnd-dropzone, .dnd-room-dropzone, .dnd-group-dropzone, .dnd-bus-dropzone') : null;
`;
code = code.replace(/const activeDz = elAtPoint \? elAtPoint\.closest\('\.dnd-dropzone, \.dnd-room-dropzone'\) : null;/g, moveDragBlock);

const endDragBlock = `
        const dropZone = elAtPoint ? elAtPoint.closest('.dnd-dropzone, .dnd-room-dropzone, .dnd-group-dropzone, .dnd-bus-dropzone') : null;
        if (dropZone && dndState.el) {
            if (dndState.type === 'pairing' && dropZone.classList.contains('dnd-dropzone')) {
                if (dropZone.dataset.role !== undefined && dndState.el.dataset.role !== undefined && dropZone.dataset.role !== dndState.el.dataset.role) {
                    handleDndDrop(dndState.el.dataset.nric, dndState.el.dataset.role, dropZone.dataset.nric);
                }
            } else if (dndState.type === 'rooming' && dropZone.classList.contains('dnd-room-dropzone')) {
                handleRoomDrop(dndState.el.dataset.nric, dropZone.dataset.room);
            } else if (dndState.type === 'grouping' && dropZone.classList.contains('dnd-group-dropzone')) {
                handleGroupDrop(dndState.el.dataset.nric, dropZone.dataset.group);
            } else if (dndState.type === 'busing' && dropZone.classList.contains('dnd-bus-dropzone')) {
                handleBusDrop(dndState.el.dataset.nric, dropZone.dataset.bus);
            } else if (dropZone.id === 'roomUnassignedPool' && dndState.type === 'rooming') {
                handleRoomDrop(dndState.el.dataset.nric, null);
            } else if (dropZone.id === 'groupUnassignedPool' && dndState.type === 'grouping') {
                handleGroupDrop(dndState.el.dataset.nric, "");
            } else if (dropZone.id === 'busUnassignedPool' && dndState.type === 'busing') {
                handleBusDrop(dndState.el.dataset.nric, "");
            }
        }`;
        
code = code.replace(/const dropZone = elAtPoint \? elAtPoint\.closest\('\.dnd-dropzone, \.dnd-room-dropzone'\) : null;([\s\S]*?)dndState\.el = null;/g, endDragBlock + "\n        dndState.el = null;");

// Update render hooks in switch tab
code = code.replace(/if\(tabId === 'rooms'\) renderRooms\(\);/g, "if(tabId === 'rooms') renderRooms();\n    if(tabId === 'groups') renderGroups();\n    if(tabId === 'buses') renderBuses();");

// We should also add drop zone ids to UnassignedPool
code = code.replace(/<div id="groupUnassignedPool" class="space-y-1\.5/g, `<div id="groupUnassignedPool" class="dnd-group-dropzone space-y-1.5`);
code = code.replace(/<div id="busUnassignedPool" class="space-y-1\.5/g, `<div id="busUnassignedPool" class="dnd-bus-dropzone space-y-1.5`);

fs.writeFileSync('frontend/js/logistics.js', code);
