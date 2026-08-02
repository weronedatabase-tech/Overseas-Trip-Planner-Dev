let medicalRosterData = [];
let medicalSearchQuery = '';

let medSortRules = JSON.parse(localStorage.getItem('medSortRules')) || [{ col: 'fullName', asc: true }];
let medCols = JSON.parse(localStorage.getItem('medCols')) || [
{ id: 'diet', label: 'Dietary Restrictions', width: 220, visible: true },
{ id: 'otherPoints', label: 'Medical / Other Notes', width: 260, visible: true },
{ id: 'emergencyName', label: 'Emergency Contact', width: 180, visible: true }
];

let traineeShortNames = {};

function buildMedicalUI() {
document.getElementById('tab-medical').innerHTML = `
<div class="flex flex-col h-full w-full relative bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
    <div class="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center gap-2 shrink-0">
        <h3 class="font-black text-gray-900 dark:text-white text-base md:text-lg flex items-center gap-2">
            <svg class="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zM12 9v6m-3-3h6" /></svg>
            Medication & Dietary Requirements
        </h3>
        <button onclick="loadMedicalData()" class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none shadow-sm" title="Refresh">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
        </button>
    </div>
    
    <div class="p-3 bg-gray-50 dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shrink-0 flex items-center gap-2">
        <div class="relative w-full flex-1">
            <input type="text" id="medicalSearch" oninput="handleMedicalSearch()" placeholder="Search by name, diet, or medical notes..." class="w-full p-2 pl-9 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition">
            <svg class="w-4 h-4 absolute left-3 top-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <button onclick="clearSearch('medicalSearch', 'handleMedicalSearch')" class="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
        </div>
    </div>
    
    <div class="flex-1 overflow-auto custom-scrollbar relative" id="medicalTableContainer">
        <table class="table-fixed-layout text-left border-collapse border-b border-gray-200 dark:border-gray-800">
            <thead id="medicalTableHead" class="sticky top-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-[10px] uppercase font-black tracking-wider z-10 shadow-sm border-b border-gray-200 dark:border-gray-700">
            </thead>
            <tbody id="medicalTableBody" class="text-sm divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
            </tbody>
        </table>
        
        <div id="medicalLoading" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex flex-col justify-center items-center z-20">
            <div class="loader !w-8 !h-8 border-primary mb-2"></div>
            <span class="text-primary dark:text-blue-400 font-bold text-[10px] tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">Loading Data...</span>
        </div>
    </div>
</div>
`;
loadMedicalData();
}

async function loadMedicalData() {
const loader = document.getElementById('medicalLoading');
if(loader) loader.classList.remove('hidden-force');

try {
    const res = await apiCall('fetchAdminRoster');
    medicalRosterData = res.roster || [];

    traineeShortNames = {};
    medicalRosterData.forEach(p => {
        if(p.role === 'TRAINEE' && p.fullName) {
            traineeShortNames[String(p.fullName || '').trim().toUpperCase()] = String(p.shortName || p.fullName || '').trim().toUpperCase();
        }
    });

    renderMedicalTable();
} catch(e) {
    showToast("Failed to load medical data.", true);
} finally {
    if(loader) loader.classList.add('hidden-force');
}
}

function handleMedicalSearch() {
medicalSearchQuery = document.getElementById('medicalSearch').value.toLowerCase().trim();
renderMedicalTable();
}

let mResizingCol = null;
let mStartX = 0;
let mStartWidth = 0;

function initMedResize(e, colId) {
e.stopPropagation();
mResizingCol = colId;
mStartX = e.clientX;
const colDef = colId === 'fullName' ? {width: 250} : medCols.find(c => c.id === colId);
mStartWidth = colDef.width || 150;
document.addEventListener('mousemove', onMedMouseMove);
document.addEventListener('mouseup', onMedMouseUp);
}

function onMedMouseMove(e) {
if (!mResizingCol) return;
const diff = e.clientX - mStartX;
let newWidth = Math.max(50, mStartWidth + diff);

if (mResizingCol === 'fullName') {
    const cells = document.querySelectorAll(`.med-col-fullName`);
    cells.forEach(c => { c.style.width = newWidth + 'px'; c.style.minWidth = newWidth + 'px'; c.style.maxWidth = newWidth + 'px'; });
} else {
    const cDef = medCols.find(c => c.id === mResizingCol);
    if (cDef) {
        cDef.width = newWidth;
        const cells = document.querySelectorAll(`.med-col-${mResizingCol}`);
        cells.forEach(c => { c.style.width = newWidth + 'px'; c.style.minWidth = newWidth + 'px'; c.style.maxWidth = newWidth + 'px'; });
    }
}
}

function onMedMouseUp() {
if (mResizingCol && mResizingCol !== 'fullName') {
    localStorage.setItem('medCols', JSON.stringify(medCols));
}
mResizingCol = null;
document.removeEventListener('mousemove', onMedMouseMove);
document.removeEventListener('mouseup', onMedMouseUp);
}

let medDraggedColId = null;
window.onMedColDragStart = function(e, colId) {
medDraggedColId = colId;
e.dataTransfer.effectAllowed = "move";
e.target.classList.add('opacity-50');
}
window.onMedColDragEnd = function(e) {
e.target.classList.remove('opacity-50');
document.querySelectorAll('th').forEach(th => th.classList.remove('bg-gray-200', 'dark:bg-gray-700'));
}
window.onMedColDragOver = function(e) {
e.preventDefault();
e.dataTransfer.dropEffect = "move";
const th = e.target.closest('th');
if(th && th.dataset.colId !== medDraggedColId && th.dataset.colId !== 'fullName') {
    th.classList.add('bg-gray-200', 'dark:bg-gray-700');
}
}
window.onMedColDragLeave = function(e) {
const th = e.target.closest('th');
if(th) th.classList.remove('bg-gray-200', 'dark:bg-gray-700');
}
window.onMedColDrop = function(e, targetColId) {
e.preventDefault();
const th = e.target.closest('th');
if(th) th.classList.remove('bg-gray-200', 'dark:bg-gray-700');

if (!medDraggedColId || medDraggedColId === targetColId || targetColId === 'fullName' || medDraggedColId === 'fullName') return;

const fromIdx = medCols.findIndex(c => c.id === medDraggedColId);
const toIdx = medCols.findIndex(c => c.id === targetColId);
if(fromIdx > -1 && toIdx > -1) {
    const [moved] = medCols.splice(fromIdx, 1);
    medCols.splice(toIdx, 0, moved);
    localStorage.setItem('medCols', JSON.stringify(medCols));
    renderMedicalTable();
}
}

function renderMedicalTable() {
let data = [...medicalRosterData];

if (medicalSearchQuery) {
    data = data.filter(p => {
        return (p.fullName && p.fullName.toLowerCase().includes(medicalSearchQuery)) ||
               (p.shortName && p.shortName.toLowerCase().includes(medicalSearchQuery)) ||
               (p.diet && p.diet.toLowerCase().includes(medicalSearchQuery)) ||
               (p.otherPoints && p.otherPoints.toLowerCase().includes(medicalSearchQuery));
    });
}

data.sort((a, b) => {
    let valA = (a.fullName || '').toString().toLowerCase();
    let valB = (b.fullName || '').toString().toLowerCase();
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
});

const thead = document.getElementById('medicalTableHead');
let headHtml = `<tr>
    <th class="p-3 relative bg-gray-100 dark:bg-gray-800 med-col-fullName align-top" style="width: 250px; min-width: 250px; max-width: 250px;" data-col-id="fullName">
        <div class="flex items-center gap-1 cursor-pointer">Participant</div>
        <div class="resize-handle" onmousedown="initMedResize(event, 'fullName')"></div>
    </th>`;
    
medCols.forEach(c => {
    if (c.visible) {
        headHtml += `
        <th class="p-3 relative bg-gray-100 dark:bg-gray-800 med-col-${c.id} align-top" 
            style="width: ${c.width}px; min-width: ${c.width}px; max-width: ${c.width}px;" 
            data-col-id="${c.id}" draggable="true" 
            ondragstart="onMedColDragStart(event, '${c.id}')" ondragend="onMedColDragEnd(event)"
            ondragover="onMedColDragOver(event)" ondragleave="onMedColDragLeave(event)" ondrop="onMedColDrop(event, '${c.id}')">
            <div class="flex items-center gap-1 cursor-pointer">${c.label}</div>
            <div class="resize-handle" onmousedown="initMedResize(event, '${c.id}')"></div>
        </th>`;
    }
});
headHtml += `</tr>`;
thead.innerHTML = headHtml;

const tbody = document.getElementById('medicalTableBody');
let html = '';

data.forEach(p => {
    const roleStr = p.role.substring(0, 3).toUpperCase();
    const roleColor = p.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (p.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
    
    let famTag = '';
    if (p.role === 'CAREGIVER' && p.relatedTrainee) {
        const tShort = (traineeShortNames[String(p.relatedTrainee || '').trim().toUpperCase()] || p.relatedTrainee);
        famTag = `<div class="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1 leading-tight whitespace-normal break-words">[${String(tShort || '').trim().toUpperCase()}]</div>`;
    }

    const fullNameUpper = (p.fullName || '').toUpperCase();
    const shortNameUpper = (p.shortName || '').toUpperCase();

    html += `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer" data-nric="${p.nric}">
        <td class="p-3 align-top med-col-fullName" style="width: 250px; min-width: 250px; max-width: 250px;">
            <div class="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight whitespace-normal break-words">${fullNameUpper}</div>
            <div class="flex items-center gap-1 mt-1 flex-wrap">
                <span class="text-[9px] font-black ${roleColor} bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700 uppercase tracking-wider">${roleStr}</span>
                <span class="px-1.5 py-0.5 rounded border shadow-sm text-[9px] font-bold ${getProjectColor(p.group)} whitespace-normal break-words inline-block">${(p.group || 'None').toUpperCase()}</span>
            </div>
            ${famTag}
        </td>`;
        
    medCols.forEach(c => {
        if (c.visible) {
            const styleStr = `style="width: ${c.width}px; min-width: ${c.width}px; max-width: ${c.width}px;"`;
            const baseClass = `p-3 align-top med-col-${c.id} text-xs leading-relaxed whitespace-normal break-words`;
            
            if (c.id === 'diet') {
                const hasDiet = p.diet && p.diet.trim() && p.diet.trim().toLowerCase() !== 'nil' && p.diet.trim().toLowerCase() !== 'none';
                const dietHtml = hasDiet ? `<span class="text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded inline-block whitespace-pre-wrap">${p.diet}</span>` : `<span class="text-gray-400 dark:text-gray-600 italic">NONE</span>`;
                html += `<td class="${baseClass} border-l border-gray-100 dark:border-gray-800/50" ${styleStr}>${dietHtml}</td>`;
            } else if (c.id === 'otherPoints') {
                const hasNotes = p.otherPoints && p.otherPoints.trim() && p.otherPoints.trim().toLowerCase() !== 'nil' && p.otherPoints.trim().toLowerCase() !== 'none';
                const notesHtml = hasNotes ? `<span class="text-orange-700 dark:text-orange-400 font-medium whitespace-pre-wrap">${p.otherPoints}</span>` : `<span class="text-gray-400 dark:text-gray-600 italic">NONE</span>`;
                html += `<td class="${baseClass} border-l border-gray-100 dark:border-gray-800/50" ${styleStr}>${notesHtml}</td>`;
            } else if (c.id === 'emergencyName') {
                html += `<td class="${baseClass} border-l border-gray-100 dark:border-gray-800/50" ${styleStr}>
                    <div class="font-bold text-gray-800 dark:text-gray-200">${(p.emergencyName || '-').toUpperCase()}</div>
                    <div class="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">${(p.emergencyRelation || '-').toUpperCase()}</div>
                    <div class="font-mono text-blue-600 dark:text-blue-400 font-bold">${p.emergencyContact || '-'}</div>
                </td>`;
            }
        }
    });

    html += `</tr>`;
});

const colCount = medCols.filter(c => c.visible).length + 1;
tbody.innerHTML = html || `<tr><td colspan="${colCount}" class="p-6 text-center text-[11px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold">No records found matching the criteria.</td></tr>`;
}