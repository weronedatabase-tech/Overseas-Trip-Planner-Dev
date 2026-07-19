let adminRosterData = [];
let rosterSearchQuery = '';

let rosterSortRules = JSON.parse(localStorage.getItem('rosterSortRules')) || [{ col: 'fullName', asc: true }];

let rosterCols = JSON.parse(localStorage.getItem('rosterCols')) || [
{ id: 'role', label: 'Role', width: 90, visible: true },
{ id: 'group', label: 'Project', width: 100, visible: true },
{ id: 'room', label: 'Room', width: 120, visible: true },
{ id: 'pairings', label: 'Pairing(s)', width: 150, visible: true },
{ id: 'gender', label: 'Gender', width: 80, visible: true },
{ id: 'nationality', label: 'Nationality', width: 110, visible: true },
{ id: 'nric', label: 'NRIC', width: 100, visible: true },
{ id: 'passportNo', label: 'Passport No', width: 110, visible: true },
{ id: 'passportExpiry', label: 'Expiry', width: 100, visible: true },
{ id: 'dob', label: 'DOB', width: 100, visible: true },
{ id: 'contact', label: 'Contact', width: 100, visible: true },
{ id: 'address', label: 'Address', width: 220, visible: true },
{ id: 'emergencyName', label: 'Emerg. Name', width: 140, visible: true },
{ id: 'emergencyContact', label: 'Emerg. Contact', width: 120, visible: true },
{ id: 'diet', label: 'Dietary', width: 180, visible: true },
{ id: 'otherPoints', label: 'Med/Other Notes', width: 220, visible: true }
];

let traineeShortNames = {};

function buildParticipantsUI() {
document.getElementById('tab-participants').innerHTML = `
<div class="flex flex-col h-full w-full relative bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
    <div class="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center gap-2 shrink-0">
        <h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg">Participant Roster</h3>
        <div class="flex items-center gap-2">
            <button onclick="window.location.href='medical.html'" class="bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-red-100 transition shadow-sm focus:outline-none shrink-0 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM12 9v6m-3-3h6" /></svg>
                Medical & Diet
            </button>
            <button onclick="loadParticipantsData()" class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none shadow-sm" title="Refresh Roster">
                <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </button>
        </div>
    </div>
    
    <div class="p-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shrink-0 flex items-center gap-2">
        <div class="relative w-full flex-1">
            <input type="text" id="rosterSearch" oninput="handleRosterSearch()" placeholder="Fuzzy search across all fields..." class="w-full p-2 pl-9 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition">
            <svg class="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <button onclick="clearSearch('rosterSearch', 'handleRosterSearch')" class="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
        <div class="relative">
            <button onclick="toggleSortSelector()" class="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition focus:outline-none flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg> Sort
            </button>
            <div id="sortSelector" class="hidden-force absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-40 p-3">
               <h4 class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider mb-2 border-b border-gray-100 dark:border-gray-700 pb-1">Advanced Sort</h4>
               <div id="sortRulesContainer" class="space-y-2 mb-3"></div>
               <button onclick="addSortRule()" class="w-full text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-700 rounded py-1 mb-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">+ Add Level</button>
               <button onclick="applySortRules(); toggleSortSelector();" class="w-full bg-primary text-white text-xs font-bold py-2 rounded-lg shadow-sm hover:bg-blue-600 transition">Apply Sort</button>
            </div>
        </div>
        <div class="relative">
            <button onclick="toggleColumnSelector()" class="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition focus:outline-none flex items-center gap-1">
                Columns <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div id="columnSelector" class="hidden-force absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-30 p-2 flex flex-col gap-1 max-h-96 overflow-y-auto custom-scrollbar">
               ${rosterCols.map(c => `
                 <label class="flex items-center gap-2 p-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition">
                   <input type="checkbox" value="${c.id}" ${c.visible ? 'checked' : ''} onchange="toggleRosterColumn('${c.id}', this.checked)" class="w-4 h-4 text-primary rounded border-gray-300">
                   <span class="text-xs font-bold text-gray-700 dark:text-gray-200">${c.label}</span>
                 </label>
               `).join('')}
            </div>
        </div>
    </div>
    
    <div class="flex-1 overflow-auto custom-scrollbar relative" id="rosterTableContainer">
        <table class="table-fixed-layout text-left border-collapse border-b border-gray-200 dark:border-gray-800">
            <thead id="rosterTableHead" class="sticky top-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] uppercase font-black tracking-wider z-20 shadow-sm border-b border-gray-200 dark:border-gray-700">
            </thead>
            <tbody id="rosterTableBody" class="text-sm divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            </tbody>
        </table>
        
        <div id="rosterLoading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col justify-center items-center z-30">
            <div class="loader !w-8 !h-8 border-primary mb-2"></div>
            <span class="text-primary dark:text-blue-400 font-bold text-[10px] tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">Fetching Directory...</span>
        </div>
    </div>
</div>
`;

document.addEventListener('click', (e) => {
    const colSel = document.getElementById('columnSelector');
    if(colSel && !colSel.classList.contains('hidden-force') && !e.target.closest('#columnSelector') && !e.target.closest('button[onclick="toggleColumnSelector()"]')) {
        colSel.classList.add('hidden-force');
    }
    const sortSel = document.getElementById('sortSelector');
    if(sortSel && !sortSel.classList.contains('hidden-force') && !e.target.closest('#sortSelector') && !e.target.closest('button[onclick="toggleSortSelector()"]')) {
        sortSel.classList.add('hidden-force');
    }
});

renderSortRulesUI();
loadParticipantsData();
}

function toggleColumnSelector() { document.getElementById('columnSelector').classList.toggle('hidden-force'); }
function toggleSortSelector() { document.getElementById('sortSelector').classList.toggle('hidden-force'); }

function toggleRosterColumn(colId, isVisible) {
const c = rosterCols.find(x => x.id === colId);
if(c) c.visible = isVisible;
localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
renderRosterTable();
}

async function loadParticipantsData() {
const loader = document.getElementById('rosterLoading');
if(loader) loader.classList.remove('hidden-force');

try {
    const [rostRes, logRes] = await Promise.all([
        apiCall('fetchAdminRoster'),
        apiCall('fetchLogistics')
    ]);
    
    adminRosterData = rostRes.roster || [];
    const logisticsData = logRes || { rooms: [], pairings: [] };
    
    traineeShortNames = {};
    adminRosterData.forEach(p => {
        if(p.role === 'TRAINEE') {
            traineeShortNames[p.fullName.toLowerCase()] = (p.shortName || p.fullName).toUpperCase();
        }
    });

    const roomsMap = {};
    if (logisticsData.rooms) {
        logisticsData.rooms.filter(r => !r.isDeleted).forEach(r => {
            r.occupants.forEach(n => roomsMap[n] = r.name.toUpperCase());
        });
    }
    
    const pairingsMap = {};
    if (logisticsData.pairings) {
        logisticsData.pairings.filter(p => p.status === 'ACTIVE').forEach(pair => {
            if(!pairingsMap[pair.traineeNric]) pairingsMap[pair.traineeNric] = [];
            if(!pairingsMap[pair.volNric]) pairingsMap[pair.volNric] = [];
            
            const v = adminRosterData.find(x => x.nric === pair.volNric);
            const t = adminRosterData.find(x => x.nric === pair.traineeNric);
            
            if(v) pairingsMap[pair.traineeNric].push((v.shortName || v.fullName).toUpperCase());
            if(t) pairingsMap[pair.volNric].push((t.shortName || t.fullName).toUpperCase());
        });
    }

    adminRosterData.forEach(p => {
        p.room = roomsMap[p.nric] || 'UNASSIGNED';
        p.pairings = pairingsMap[p.nric] ? pairingsMap[p.nric].join(', ') : 'NONE';
    });

    renderRosterTable();
} catch(e) {
    showToast("Failed to load roster.", true);
} finally {
    if(loader) loader.classList.add('hidden-force');
}
}

function handleRosterSearch() {
rosterSearchQuery = document.getElementById('rosterSearch').value.toLowerCase().trim();
renderRosterTable();
}

// ==========================================
// ADVANCED SORTING
// ==========================================
const sortableFields = [
{ id: 'fullName', label: 'Full Name' },
{ id: 'role', label: 'Role' },
{ id: 'group', label: 'Project' },
{ id: 'room', label: 'Room' },
{ id: 'gender', label: 'Gender' },
{ id: 'nationality', label: 'Nationality' }
];

function renderSortRulesUI() {
const container = document.getElementById('sortRulesContainer');
if(!container) return;

let html = '';
rosterSortRules.forEach((rule, idx) => {
    let opts = sortableFields.map(f => `<option value="${f.id}" ${rule.col === f.id ? 'selected' : ''}>${f.label}</option>`).join('');
    html += `
    <div class="flex items-center gap-1">
        <select onchange="updateSortRule(${idx}, 'col', this.value)" class="flex-1 text-[10px] font-bold p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none">
            ${opts}
        </select>
        <select onchange="updateSortRule(${idx}, 'asc', this.value === 'true')" class="w-16 text-[10px] font-bold p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none">
            <option value="true" ${rule.asc ? 'selected' : ''}>ASC</option>
            <option value="false" ${!rule.asc ? 'selected' : ''}>DESC</option>
        </select>
        <button onclick="removeSortRule(${idx})" class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition"><svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
    </div>
    `;
});
container.innerHTML = html;
}

function updateSortRule(idx, field, val) {
if(rosterSortRules[idx]) rosterSortRules[idx][field] = val;
}

function addSortRule() {
rosterSortRules.push({ col: 'fullName', asc: true });
renderSortRulesUI();
}

function removeSortRule(idx) {
rosterSortRules.splice(idx, 1);
if(rosterSortRules.length === 0) rosterSortRules.push({ col: 'fullName', asc: true });
renderSortRulesUI();
}

function applySortRules() {
localStorage.setItem('rosterSortRules', JSON.stringify(rosterSortRules));
renderRosterTable();
}

function quickSort(colId) {
rosterSortRules = [{ col: colId, asc: true }];
localStorage.setItem('rosterSortRules', JSON.stringify(rosterSortRules));
renderSortRulesUI();
renderRosterTable();
}

// ==========================================
// RESIZING & REORDERING
// ==========================================
let resizingCol = null;
let startX = 0;
let startWidth = 0;

function initResize(e, colId) {
e.stopPropagation();
resizingCol = colId;
startX = e.clientX;
const colDef = colId === 'fullName' ? {width: 250} : rosterCols.find(c => c.id === colId);
startWidth = colDef.width || 150;
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e) {
if (!resizingCol) return;
const diff = e.clientX - startX;
let newWidth = Math.max(50, startWidth + diff);

if (resizingCol === 'fullName') {
    const cells = document.querySelectorAll(`.roster-col-fullName`);
    cells.forEach(c => { c.style.width = newWidth + 'px'; c.style.minWidth = newWidth + 'px'; c.style.maxWidth = newWidth + 'px'; });
} else {
    const cDef = rosterCols.find(c => c.id === resizingCol);
    if (cDef) {
        cDef.width = newWidth;
        const cells = document.querySelectorAll(`.roster-col-${resizingCol}`);
        cells.forEach(c => { c.style.width = newWidth + 'px'; c.style.minWidth = newWidth + 'px'; c.style.maxWidth = newWidth + 'px'; });
    }
}
}

function onMouseUp() {
if (resizingCol && resizingCol !== 'fullName') {
    localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
}
resizingCol = null;
document.removeEventListener('mousemove', onMouseMove);
document.removeEventListener('mouseup', onMouseUp);
}

let draggedColId = null;
window.onColDragStart = function(e, colId) {
draggedColId = colId;
e.dataTransfer.effectAllowed = "move";
e.target.classList.add('opacity-50');
}
window.onColDragEnd = function(e) {
e.target.classList.remove('opacity-50');
document.querySelectorAll('th').forEach(th => th.classList.remove('bg-gray-200', 'dark:bg-gray-700'));
}
window.onColDragOver = function(e) {
e.preventDefault();
e.dataTransfer.dropEffect = "move";
const th = e.target.closest('th');
if(th && th.dataset.colId !== draggedColId && th.dataset.colId !== 'fullName') {
    th.classList.add('bg-gray-200', 'dark:bg-gray-700');
}
}
window.onColDragLeave = function(e) {
const th = e.target.closest('th');
if(th) th.classList.remove('bg-gray-200', 'dark:bg-gray-700');
}
window.onColDrop = function(e, targetColId) {
e.preventDefault();
const th = e.target.closest('th');
if(th) th.classList.remove('bg-gray-200', 'dark:bg-gray-700');

if (!draggedColId || draggedColId === targetColId || targetColId === 'fullName' || draggedColId === 'fullName') return;

const fromIdx = rosterCols.findIndex(c => c.id === draggedColId);
const toIdx = rosterCols.findIndex(c => c.id === targetColId);
if(fromIdx > -1 && toIdx > -1) {
    const [moved] = rosterCols.splice(fromIdx, 1);
    rosterCols.splice(toIdx, 0, moved);
    localStorage.setItem('rosterCols', JSON.stringify(rosterCols));
    renderRosterTable();
}
}


// ==========================================
// RENDER TABLE
// ==========================================
function renderRosterTable() {
let data = [...adminRosterData];

if (rosterSearchQuery) {
    data = data.filter(p => {
        return Object.values(p).some(val => 
            val && val.toString().toLowerCase().includes(rosterSearchQuery)
        );
    });
}

data.sort((a, b) => {
    for (let rule of rosterSortRules) {
        let valA = a[rule.col] || '';
        let valB = b[rule.col] || '';
        
        if (rule.col === 'passportExpiry' || rule.col === 'dob') {
            valA = new Date(valA).getTime() || 0;
            valB = new Date(valB).getTime() || 0;
        } else {
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
        }
        
        if (valA < valB) return rule.asc ? -1 : 1;
        if (valA > valB) return rule.asc ? 1 : -1;
    }
    return 0;
});

const thead = document.getElementById('rosterTableHead');
let headHtml = `<tr>
    <th class="p-3 relative bg-gray-100 dark:bg-gray-800 roster-col-fullName align-top" style="width: 200px; min-width: 200px; max-width: 200px;" data-col-id="fullName">
        <div class="flex items-center gap-1 cursor-pointer hover:text-primary transition" onclick="quickSort('fullName')">Full Name <span class="text-[8px]">↕</span></div>
        <div class="resize-handle" onmousedown="initResize(event, 'fullName')"></div>
    </th>`;

rosterCols.forEach(c => {
    if (c.visible) {
        headHtml += `
        <th class="p-3 relative bg-gray-100 dark:bg-gray-800 roster-col-${c.id} align-top" 
            style="width: ${c.width}px; min-width: ${c.width}px; max-width: ${c.width}px;" 
            data-col-id="${c.id}" draggable="true" 
            ondragstart="onColDragStart(event, '${c.id}')" ondragend="onColDragEnd(event)"
            ondragover="onColDragOver(event)" ondragleave="onColDragLeave(event)" ondrop="onColDrop(event, '${c.id}')">
            <div class="flex items-center gap-1 cursor-pointer hover:text-primary transition" onclick="quickSort('${c.id}')">${c.label} <span class="text-[8px]">↕</span></div>
            <div class="resize-handle" onmousedown="initResize(event, '${c.id}')"></div>
        </th>`;
    }
});
headHtml += `</tr>`;
thead.innerHTML = headHtml;

const tbody = document.getElementById('rosterTableBody');
let html = '';

let tripEnd = appSettings.tripEndDate ? new Date(appSettings.tripEndDate) : null;
let minExpiry = null;
if (tripEnd && !isNaN(tripEnd.getTime())) {
    minExpiry = new Date(tripEnd);
    minExpiry.setMonth(minExpiry.getMonth() + 6);
}

data.forEach(p => {
    let expiryHighlight = false;
    let formattedExpiry = p.passportExpiry;
    
    if (p.passportExpiry) {
        const expD = new Date(p.passportExpiry);
        if (!isNaN(expD.getTime())) {
            formattedExpiry = `${expD.getFullYear()}-${String(expD.getMonth()+1).padStart(2,'0')}-${String(expD.getDate()).padStart(2,'0')}`;
            if (minExpiry && expD < minExpiry) {
                expiryHighlight = true;
            }
        }
    }

    let formattedDob = p.dob;
    if (p.dob) {
        const dD = new Date(p.dob);
        if (!isNaN(dD.getTime())) {
            formattedDob = `${dD.getFullYear()}-${String(dD.getMonth()+1).padStart(2,'0')}-${String(dD.getDate()).padStart(2,'0')}`;
        }
    }

    const fullNameUpper = (p.fullName || '').toUpperCase();
    const shortNameUpper = (p.shortName || '').toUpperCase();

    const nameClass = expiryHighlight ? 'text-red-600 dark:text-red-400 font-extrabold' : 'font-bold text-gray-900 dark:text-gray-100';
    const expClass = expiryHighlight 
        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded font-black border border-red-200 dark:border-red-800 shadow-sm whitespace-nowrap text-[11px] uppercase tracking-wider inline-block' 
        : 'text-gray-800 dark:text-gray-200 whitespace-nowrap text-xs font-medium';
    
    const roleStr = p.role.substring(0, 3).toUpperCase();
    const roleColor = p.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (p.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
    
    let famTag = '';
    if (p.role === 'CAREGIVER' && p.relatedTrainee) {
        const tShort = (traineeShortNames[p.relatedTrainee.toLowerCase()] || p.relatedTrainee).toUpperCase();
        famTag = `<div class="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1 leading-tight whitespace-normal break-words">[${tShort}]</div>`;
    }

    html += `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer" data-nric="${p.nric}">
        <td class="p-3 align-top roster-col-fullName" style="width: 200px; min-width: 200px; max-width: 200px;">
            <div class="${nameClass} text-xs md:text-sm leading-tight whitespace-normal break-words">${fullNameUpper}</div>
            <div class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 font-medium whitespace-normal break-words">${shortNameUpper}</div>
            ${famTag}
        </td>`;
        
    rosterCols.forEach(c => {
        if (c.visible) {
            const styleStr = `style="width: ${c.width}px; min-width: ${c.width}px; max-width: ${c.width}px;"`;
            const baseClass = `p-3 align-top roster-col-${c.id} text-xs font-medium text-gray-800 dark:text-gray-200 whitespace-normal break-words`;
            
            if (c.id === 'role') {
                html += `<td class="${baseClass}" ${styleStr}><span class="text-[9px] font-black ${roleColor} bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wider">${roleStr}</span></td>`;
            } else if (c.id === 'group') {
                html += `<td class="${baseClass}" ${styleStr}><span class="px-2 py-0.5 rounded border shadow-sm text-[10px] font-bold ${getProjectColor(p.group)} whitespace-normal break-words inline-block">${(p.group || 'None').toUpperCase()}</span></td>`;
            } else if (c.id === 'nric') {
                html += `<td class="${baseClass} font-mono font-bold text-gray-700 dark:text-gray-300" ${styleStr}>${(p.nric||'').toUpperCase()}</td>`;
            } else if (c.id === 'passportNo') {
                html += `<td class="${baseClass} font-mono uppercase text-gray-700 dark:text-gray-300" ${styleStr}>${(p.passportNo || '-').toUpperCase()}</td>`;
            } else if (c.id === 'passportExpiry') {
                html += `<td class="${baseClass}" ${styleStr}><span class="${expClass}">${formattedExpiry || '-'}</span></td>`;
            } else if (c.id === 'dob') {
                html += `<td class="${baseClass}" ${styleStr}>${formattedDob || '-'}</td>`;
            } else if (c.id === 'diet') {
                const hasDiet = p.diet && p.diet.trim() && p.diet.trim().toLowerCase() !== 'nil' && p.diet.trim().toLowerCase() !== 'none';
                html += `<td class="${baseClass}" ${styleStr}>${hasDiet ? `<span class="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-block whitespace-pre-wrap leading-tight">${p.diet}</span>` : `<span class="text-gray-400 italic">NONE</span>`}</td>`;
            } else if (c.id === 'otherPoints') {
                const hasNotes = p.otherPoints && p.otherPoints.trim() && p.otherPoints.trim().toLowerCase() !== 'nil' && p.otherPoints.trim().toLowerCase() !== 'none';
                html += `<td class="${baseClass}" ${styleStr}>${hasNotes ? `<span class="text-orange-700 dark:text-orange-400 font-medium whitespace-pre-wrap leading-tight">${p.otherPoints}</span>` : `<span class="text-gray-400 italic">NONE</span>`}</td>`;
            } else if (c.id === 'room') {
                html += `<td class="${baseClass} font-bold" ${styleStr}>${(p.room || 'UNASSIGNED').toUpperCase()}</td>`;
            } else if (c.id === 'pairings') {
                html += `<td class="${baseClass}" ${styleStr}>${(p.pairings || 'NONE').toUpperCase()}</td>`;
            } else if (c.id === 'emergencyName') {
                html += `<td class="${baseClass}" ${styleStr}>${(p.emergencyName || '-').toUpperCase()}</td>`;
            } else {
                html += `<td class="${baseClass}" ${styleStr}>${(p[c.id] || '-').toString().toUpperCase()}</td>`;
            }
        }
    });
    
    html += `</tr>`;
});

const colCount = rosterCols.filter(c => c.visible).length + 1;
tbody.innerHTML = html || `<tr><td colspan="${colCount}" class="p-6 text-center text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">No participants found matching the criteria.</td></tr>`;
}