let attendanceState = {}; // { nric: boolean }
let pendingAttendanceUpdates = new Set();
let attSyncTimeout = null;
let isAttendanceSyncing = false;
let attendancePollInterval = null;

function buildAttendanceUI() {
document.getElementById('tab-attendance').innerHTML = `
 <div class="bg-white dark:bg-gray-800 p-2 md:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 admin-only flex flex-col h-full min-h-0">
   
   <div class="flex justify-between items-center mb-3 shrink-0 px-1">
      <div class="flex items-center gap-2">
         <h3 class="text-sm md:text-base font-bold text-gray-900 dark:text-white">Live Attendance</h3>
      </div>
      <button id="btn-sync-attendance" class="text-xs px-2 py-1 rounded font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none">
         <span class="btn-text">Saved</span><div class="btn-spinner ml-1 !w-3 !h-3 hidden-force"></div>
      </button>
   </div>
   
   <div class="grid grid-cols-2 gap-2 mb-3 shrink-0 px-1">
      <div>
         <label class="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Juncture</label>
         <select id="attJunctureSelect" onchange="changeAttendanceContext()" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg font-bold text-xs md:text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"></select>
      </div>
      <div>
         <label class="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">My Assignment</label>
         <select id="attAssignmentSelect" onchange="renderAttendanceLists()" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg font-bold text-xs md:text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="ALL">All Participants</option>
         </select>
      </div>
   </div>
   
   <div class="relative mb-3 shrink-0 px-1">
      <input type="text" id="attSearchInput" oninput="handleAttendanceSearch()" placeholder="Search name to mark present..." class="w-full p-2.5 pl-9 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 font-bold text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 dark:text-white shadow-sm transition">
      <svg class="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      <ul id="attSearchResults" class="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl mt-1 max-h-56 overflow-y-auto hidden-force custom-scrollbar"></ul>
   </div>
   
   <div class="flex flex-row gap-2 flex-1 min-h-0 w-full overflow-hidden mt-1 px-1 relative">
       <!-- Loading Overlay -->
       <div id="attLoadingOverlay" class="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-10 hidden-force flex flex-col justify-center items-center rounded-xl">
           <div class="loader !w-10 !h-10 border-primary mb-3"></div>
           <span class="text-primary dark:text-blue-400 font-bold text-xs tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full">Loading...</span>
       </div>
       
       <!-- NOT Checked (Red) -->
       <div class="flex-1 min-w-0 flex flex-col rounded-xl border border-red-300 dark:border-red-800 bg-red-50/60 dark:bg-red-900/20 h-full overflow-hidden transition-colors">
          <h4 class="font-extrabold text-[11px] md:text-sm py-2 shrink-0 text-center uppercase tracking-widest bg-red-600 dark:bg-red-700 text-white shadow-sm rounded-t-md border-b-2 border-red-700 dark:border-red-900">NOT Checked (<span id="attNotCheckedCount">0</span>)</h4>
          <div id="attNotCheckedList" class="flex-grow overflow-y-auto p-1.5 custom-scrollbar pb-6 space-y-1.5"></div>
       </div>
       
       <!-- Checked (Green) -->
       <div class="flex-1 min-w-0 flex flex-col rounded-xl border border-green-300 dark:border-green-800 bg-green-50/60 dark:bg-green-900/20 h-full overflow-hidden transition-colors">
          <h4 class="font-extrabold text-[11px] md:text-sm py-2 shrink-0 text-center uppercase tracking-widest bg-green-600 dark:bg-green-700 text-white shadow-sm rounded-t-md border-b-2 border-green-700 dark:border-green-900">Checked (<span id="attCheckedCount">0</span>)</h4>
          <div id="attCheckedList" class="flex-grow overflow-y-auto p-1.5 custom-scrollbar pb-6 space-y-1.5"></div>
       </div>
   </div>
   
 </div>`;

 // Close search results if clicked outside
 document.addEventListener('click', (e) => {
    const results = document.getElementById('attSearchResults');
    const input = document.getElementById('attSearchInput');
    if(results && !results.classList.contains('hidden-force') && e.target !== input && !results.contains(e.target)) {
        results.classList.add('hidden-force');
    }
 });
}

async function renderAttendanceChecklist() {
if(!globalLogistics || !document.getElementById('attJunctureSelect')) return;

const juncSel = document.getElementById('attJunctureSelect');
juncSel.innerHTML = '';
if(appSettings.junctures && appSettings.junctures.length > 0) {
    appSettings.junctures.forEach(j => juncSel.innerHTML += `<option value="${j}">${j}</option>`);
} else {
    juncSel.innerHTML = `<option value="">No Junctures Defined</option>`;
}

const asgnSel = document.getElementById('attAssignmentSelect');
asgnSel.innerHTML = `<option value="ALL">All Participants</option>`;
if(appSettings.activeProjects && appSettings.activeProjects.length > 0) {
    appSettings.activeProjects.forEach(g => asgnSel.innerHTML += `<option value="${g}">${g}</option>`);
}

await changeAttendanceContext();
}

async function changeAttendanceContext() {
const juncture = document.getElementById('attJunctureSelect').value;
if(!juncture) {
    attendanceState = {};
    renderAttendanceLists();
    return;
}

const overlay = document.getElementById('attLoadingOverlay');
if (overlay) overlay.classList.remove('hidden-force');
setAttSyncButtonState('loading');

try {
    const res = await callBackend('fetchAttendanceData', { juncture });
    attendanceState = res.data || {};
    renderAttendanceLists();
    setAttSyncButtonState('saved');
    startAttendancePolling();
} catch(e) {
    showToast("Failed to load attendance", true);
    setAttSyncButtonState('error');
} finally {
    if (overlay) overlay.classList.add('hidden-force');
}
}

function renderAttendanceLists() {
if(!globalLogistics) return;

const assignment = document.getElementById('attAssignmentSelect').value;
const notCheckedList = document.getElementById('attNotCheckedList');
const checkedList = document.getElementById('attCheckedList');

let notCheckedHtml = '';
let checkedHtml = '';
let notCheckedCount = 0;
let checkedCount = 0;

const participants = globalLogistics.participants.filter(p => assignment === 'ALL' || p.group === assignment);

participants.forEach(p => {
    const isChecked = attendanceState[p.nric] || false;
    const cardHtml = generateAttCard(p, isChecked);
    
    if(isChecked) {
        checkedHtml += cardHtml;
        checkedCount++;
    } else {
        notCheckedHtml += cardHtml;
        notCheckedCount++;
    }
});

notCheckedList.innerHTML = notCheckedHtml || '<p class="text-[10px] text-gray-500 font-bold p-2 text-center mt-4">Empty</p>';
checkedList.innerHTML = checkedHtml || '<p class="text-[10px] text-gray-500 font-bold p-2 text-center mt-4">Empty</p>';

document.getElementById('attNotCheckedCount').textContent = notCheckedCount;
document.getElementById('attCheckedCount').textContent = checkedCount;
}

function generateAttCard(p, isChecked) {
const dynColor = getProjectColor(p.group);
const roleColor = p.role === 'TRAINEE' ? 'text-blue-500 dark:text-blue-400' : (p.role === 'CAREGIVER' ? 'text-purple-500 dark:text-purple-400' : 'text-green-500 dark:text-green-400');
const roleShort = p.role.substring(0,3).toUpperCase();

return `
 <div class="bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm transition flex items-center justify-between gap-2 select-none hover:border-primary dark:hover:border-primary">
     <div class="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer" onclick="toggleAttendanceStatus('${p.nric}', ${!isChecked})">
         <span class="font-extrabold text-[12px] md:text-[13px] px-2 py-1 rounded-md border shadow-sm ${dynColor} max-w-full break-words whitespace-normal leading-tight text-left" style="overflow-wrap: anywhere;">${p.name}</span>
         <span class="text-[9px] font-black ${roleColor} shrink-0 bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded border border-gray-200 dark:border-gray-600">${roleShort}</span>
     </div>
     <div class="shrink-0 pl-1" onclick="toggleAttendanceStatus('${p.nric}', ${!isChecked})">
         <input type="checkbox" ${isChecked ? 'checked' : ''} class="w-5 h-5 text-primary rounded border border-gray-300 dark:border-gray-500 focus:ring-primary focus:ring-offset-0 dark:bg-gray-700 cursor-pointer pointer-events-none">
     </div>
 </div>`;
}

function handleAttendanceSearch() {
const query = document.getElementById('attSearchInput').value.toLowerCase().trim();
const resultsContainer = document.getElementById('attSearchResults');

if(!query) {
    resultsContainer.classList.add('hidden-force');
    return;
}

const assignment = document.getElementById('attAssignmentSelect').value;
const participants = globalLogistics.participants.filter(p => {
    if(assignment !== 'ALL' && p.group !== assignment) return false;
    return p.name.toLowerCase().includes(query);
});

let html = '';
participants.forEach(p => {
    const isChecked = attendanceState[p.nric] || false;
    const dynColor = getProjectColor(p.group);
    
    html += `
    <li class="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center border-b border-gray-100 dark:border-gray-700 last:border-0 transition" onclick="selectFromSearch('${p.nric}')">
        <span class="font-bold text-[12px] md:text-sm ${dynColor} px-2 py-1 rounded-md border shadow-sm leading-tight max-w-[70%] break-words whitespace-normal" style="overflow-wrap: anywhere;">${p.name}</span>
        ${isChecked ? '<span class="text-[10px] bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 px-1.5 py-0.5 rounded font-black uppercase">Checked</span>' : '<span class="text-[10px] bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 px-1.5 py-0.5 rounded font-black uppercase">NOT Checked</span>'}
    </li>`;
});

resultsContainer.innerHTML = html || '<li class="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 text-center">No matches found.</li>';
resultsContainer.classList.remove('hidden-force');
}

function selectFromSearch(nric) {
document.getElementById('attSearchInput').value = '';
document.getElementById('attSearchResults').classList.add('hidden-force');
toggleAttendanceStatus(nric, true);
}

function toggleAttendanceStatus(nric, forceState) {
attendanceState[nric] = forceState;
pendingAttendanceUpdates.add(nric);
renderAttendanceLists();

if (attSyncTimeout) clearTimeout(attSyncTimeout);
attSyncTimeout = setTimeout(() => {
    executeAttendanceSync();
}, 800);
}

async function executeAttendanceSync() {
if(pendingAttendanceUpdates.size === 0) return;

const juncture = document.getElementById('attJunctureSelect').value;
if(!juncture) return;

isAttendanceSyncing = true;
setAttSyncButtonState('saving');

const updates = Array.from(pendingAttendanceUpdates).map(nric => ({
    nric: nric,
    status: attendanceState[nric] || false
}));

// Capture the current batch and clear the pending set immediately to allow concurrent local edits
const batch = new Set(pendingAttendanceUpdates);
pendingAttendanceUpdates.clear();

try {
    await callBackend('syncAttendanceUpdate', { 
        juncture: juncture, 
        updates: updates, 
        takenBy: currentUser.name 
    });
    setAttSyncButtonState('saved');
} catch(e) {
    showToast("Sync failed. Retrying...", true);
    setAttSyncButtonState('error');
    // Re-add to pending if failed so it tries again on next interaction
    batch.forEach(nric => pendingAttendanceUpdates.add(nric));
} finally {
    isAttendanceSyncing = false;
}
}

function startAttendancePolling() {
if(attendancePollInterval) clearInterval(attendancePollInterval);

attendancePollInterval = setInterval(async () => {
    const attTab = document.getElementById('tab-attendance');
    if(!attTab || attTab.classList.contains('hidden-force')) return;
    
    // Do not poll if there are pending local changes or active network sync to avoid race condition visual glitches
    if(pendingAttendanceUpdates.size > 0 || isAttendanceSyncing) return;
    
    const juncture = document.getElementById('attJunctureSelect').value;
    if(!juncture) return;

    try {
        const res = await callBackend('fetchAttendanceData', { juncture });
        const remoteData = res.data || {};
        let hasChanges = false;
        
        globalLogistics.participants.forEach(p => {
            const rState = remoteData[p.nric] || false;
            const lState = attendanceState[p.nric] || false;
            if(rState !== lState) {
                attendanceState[p.nric] = rState;
                hasChanges = true;
            }
        });

        if(hasChanges) {
            renderAttendanceLists();
        }
    } catch(e) {
        // Silent fail on polling
    }
}, 8000);
}

function setAttSyncButtonState(state) {
const btn = document.getElementById('btn-sync-attendance');
if(!btn) return;

const textSpan = btn.querySelector('.btn-text'); 
const spinner = btn.querySelector('.btn-spinner');

btn.className = "text-xs px-2 md:px-3 py-1 md:py-1.5 rounded font-bold transition flex items-center justify-center border shadow-sm focus:outline-none"; 
spinner.className = "btn-spinner ml-1 !w-3 !h-3 hidden-force"; 

if (state === 'loading') { 
    btn.classList.add('bg-gray-100', 'text-gray-500', 'border-gray-200', 'dark:bg-gray-800', 'dark:text-gray-400', 'dark:border-gray-700'); 
    textSpan.textContent = "Loading..."; 
    spinner.classList.remove('hidden-force'); 
    spinner.classList.add('spinner-primary'); 
} else if(state === 'saving') { 
    btn.classList.add('bg-yellow-50', 'text-yellow-700', 'border-yellow-200', 'dark:bg-yellow-900/30', 'dark:text-yellow-300', 'dark:border-yellow-800'); 
    textSpan.textContent = "Saving..."; 
    spinner.classList.remove('hidden-force'); 
    spinner.classList.add('spinner-yellow'); 
} else if (state === 'saved') { 
    btn.classList.add('bg-green-50', 'text-green-700', 'border-green-200', 'dark:bg-green-900/30', 'dark:text-green-300', 'dark:border-green-800'); 
    textSpan.textContent = "Saved"; 
} else if (state === 'error') { 
    btn.classList.add('bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/30', 'dark:text-red-300', 'dark:border-red-800'); 
    textSpan.textContent = "Save Failed"; 
}
}