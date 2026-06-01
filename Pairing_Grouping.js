let pairingSyncTimeout = null;
let altSwapMode = false;
let currentPairingSourceRole = 'TRAINEE';
let pendingPairingsMap = new Map();
let isPairingSyncing = false;
let pairingPollInterval = null;

// ==========================================
// ROBUST DRAG & DROP ENGINE (Mouse + Touch)
// ==========================================
if (!window.dndInitialized) {
window.dndInitialized = true;

let dndState = {
    isDragging: false,
    el: null,
    clone: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    nameNode: null,
    rect: null
};

// --- TOUCH EVENTS (MOBILE) ---
document.addEventListener('touchstart', (e) => {
    if(e.touches.length > 1) return;
    startDrag(e, e.touches[0].clientX, e.touches[0].clientY, true);
}, {passive: false});

document.addEventListener('touchmove', (e) => {
    moveDrag(e, e.touches[0].clientX, e.touches[0].clientY, true);
}, {passive: false});

document.addEventListener('touchend', (e) => {
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0];
    endDrag(e, touch.clientX, touch.clientY);
});

document.addEventListener('touchcancel', (e) => {
    const touch = e.changedTouches ? e.changedTouches[0] : e.touches[0];
    endDrag(e, touch.clientX, touch.clientY);
});

// --- MOUSE EVENTS (DESKTOP) ---
document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return; 
    startDrag(e, e.clientX, e.clientY, false);
});

document.addEventListener('mousemove', (e) => {
    moveDrag(e, e.clientX, e.clientY, false);
});

document.addEventListener('mouseup', (e) => {
    endDrag(e, e.clientX, e.clientY);
});

// --- CORE LOGIC ---
function startDrag(e, clientX, clientY, isTouch) {
    // Prevent interfering with buttons or scrollbars
    if(e.target.closest('.remove-x') || e.target.closest('button')) return;
    
    const pairingContainer = document.getElementById('log-pairings');
    if(!pairingContainer || pairingContainer.classList.contains('hidden-force')) return;

    let draggable = e.target.closest('.dnd-draggable');
    if(!draggable) return;

    dndState.el = draggable;
    dndState.nameNode = dndState.el.querySelector('.main-name-pill') || dndState.el;
    dndState.rect = dndState.nameNode.getBoundingClientRect();
    
    dndState.startX = clientX;
    dndState.startY = clientY;
    dndState.offsetX = clientX - dndState.rect.left;
    dndState.offsetY = clientY - dndState.rect.top;
    dndState.isDragging = false;
}

function moveDrag(e, clientX, clientY, isTouch) {
    if (!dndState.el) return;

    const deltaX = Math.abs(clientX - dndState.startX);
    const deltaY = Math.abs(clientY - dndState.startY);

    // If user hasn't triggered drag, check direction of movement
    if (!dndState.isDragging) {
        if (deltaX > 8 && deltaX > deltaY) {
            // Horizontal swipe detected - activate drag immediately
            dndState.isDragging = true;
            
            if(isTouch && navigator.vibrate) navigator.vibrate(20);
            
            dndState.el.classList.add('locked-for-drag');
            
            // Generate visually identical clone
            dndState.clone = dndState.nameNode.cloneNode(true);
            dndState.clone.classList.add('dragging-clone');
            dndState.clone.style.width = dndState.rect.width + 'px';
            dndState.clone.style.height = dndState.rect.height + 'px';
            
            document.body.appendChild(dndState.clone);
        } else if (deltaY > 8) {
            // Vertical swipe detected - cancel drag to allow native scrolling
            dndState.el = null;
            return;
        }
    }

    if (dndState.isDragging && dndState.clone) {
        if(e.cancelable) e.preventDefault(); // Stop native scrolling while dragging horizontally
        
        updateClonePosition(clientX, clientY);
        
        // Highlight valid drop zones
        const elAtPoint = document.elementFromPoint(clientX, clientY);
        const activeDz = elAtPoint ? elAtPoint.closest('.dnd-dropzone') : null;

        document.querySelectorAll('.dnd-dropzone').forEach(dz => {
            if (dz === activeDz && dz.dataset.role !== dndState.el.dataset.role) {
                dz.classList.add('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary');
            } else {
                dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary');
            }
        });
    }
}

function endDrag(e, clientX, clientY) {
    if(dndState.el) dndState.el.classList.remove('locked-for-drag');
    
    if (dndState.isDragging && dndState.clone) {
        // Remove clone before finding the drop element underneath!
        dndState.clone.remove(); 
        dndState.clone = null; 
        dndState.isDragging = false;
        
        document.querySelectorAll('.dnd-dropzone').forEach(dz => dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-800', 'dark:border-primary', 'ring-1', 'ring-primary'));

        // Robust element targeting regardless of DOM layout bounds
        const elAtPoint = document.elementFromPoint(clientX, clientY);
        const dropZone = elAtPoint ? elAtPoint.closest('.dnd-dropzone') : null;
        
        if(dropZone && dndState.el && dropZone.dataset.role !== dndState.el.dataset.role) {
            const sourceNric = dndState.el.dataset.nric;
            const sourceRole = dndState.el.dataset.role;
            const targetNric = dropZone.dataset.nric;
            if(sourceNric && targetNric) handleDndDrop(sourceNric, sourceRole, targetNric);
        }
    }
    dndState.el = null;
    dndState.nameNode = null;
}

function updateClonePosition(x, y) {
    if(dndState.clone) {
        dndState.clone.style.left = (x - dndState.offsetX) + 'px';
        dndState.clone.style.top = (y - dndState.offsetY) + 'px';
    }
}
}

function handleDndDrop(sourceNric, sourceRole, targetNric) {
let volNric = sourceRole === 'VOLUNTEER' ? sourceNric : targetNric;
let traineeNric = sourceRole === 'TRAINEE' ? sourceNric : targetNric;

if(!globalLogistics.pairings.some(p => p.traineeNric === traineeNric && p.volNric === volNric)) {
    const key = traineeNric + '_' + volNric;
    pendingPairingsMap.set(key, { action: 'ADD', traineeNric, volNric });
    globalLogistics.pairings.push({ traineeNric: traineeNric, volNric: volNric });
    renderPairings(); 
    triggerPairingSync();
} else {
    showToast("Already paired!", true);
}
}

function unpairTrainee(traineeNric, volNric) {
const key = traineeNric + '_' + volNric;
pendingPairingsMap.set(key, { action: 'REMOVE', traineeNric, volNric });
globalLogistics.pairings = globalLogistics.pairings.filter(p => !(p.traineeNric === traineeNric && p.volNric === volNric)); 
renderPairings(); 
triggerPairingSync();
}

// ==========================================
// DATA SYNC & POLLING LOGIC
// ==========================================
function setSyncButtonState(state) {
const btns = document.querySelectorAll('.btn-sync-pairings');
if(btns.length === 0) return;
btns.forEach(btn => {
const textSpan = btn.querySelector('.btn-text'); const spinner = btn.querySelector('.btn-spinner');
btn.className = "btn-sync-pairings text-[10px] md:text-xs px-2 py-1 rounded-md font-bold transition flex items-center justify-center border shadow-sm focus:outline-none shrink-0"; 
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
});
}

function triggerPairingSync() {
setSyncButtonState('saving');
if (pairingSyncTimeout) clearTimeout(pairingSyncTimeout);
pairingSyncTimeout = setTimeout(() => {
   executePairingSync();
}, 800); 
}

async function executePairingSync() {
if (pendingPairingsMap.size === 0) return;

isPairingSyncing = true;
setSyncButtonState('saving');

const updates = Array.from(pendingPairingsMap.values());
const batch = new Map(pendingPairingsMap);
pendingPairingsMap.clear();

try {
   const res = await callBackend('syncPairingUpdates', { updates });
   if(res.pairings) {
       globalLogistics.pairings = res.pairings;
   }
   setSyncButtonState('saved');
} catch(e) {
   showToast("Sync failed. Retrying...", true);
   setSyncButtonState('error');
   batch.forEach((val, key) => pendingPairingsMap.set(key, val));
} finally {
   isPairingSyncing = false;
}
}

function startPairingPolling() {
if (pairingPollInterval) clearInterval(pairingPollInterval);

pairingPollInterval = setInterval(async () => {
   const logTab = document.getElementById('tab-logistics');
   if(!logTab || logTab.classList.contains('hidden-force')) return;
   
   // Do not poll if pending edits or actively syncing
   if(pendingPairingsMap.size > 0 || isPairingSyncing) return;
   
   try {
       const res = await callBackend('fetchPairingsOnly');
       if(res.pairings) {
           const server = res.pairings;
           const local = globalLogistics.pairings || [];
           
           const serverHash = server.map(p => p.traineeNric+'_'+p.volNric).sort().join('|');
           const localHash = local.map(p => p.traineeNric+'_'+p.volNric).sort().join('|');
           
           if (serverHash !== localHash) {
               globalLogistics.pairings = server;
               renderPairings();
           }
       }
   } catch(e) {
       // Silent fail on polling
   }
}, 8000);
}

// ==========================================
// UI RENDERERS
// ==========================================
function buildLogisticsUI() {
document.getElementById('tab-logistics').innerHTML = `
<div class="flex overflow-x-auto bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 scrollbar-hide shrink-0 rounded-t-xl md:rounded-none px-2 pt-1 z-10">
 <button onclick="switchLogisticsSubTab('pairings')" id="subTab-pairings" class="px-3 py-2 font-semibold border-b-2 border-primary text-primary whitespace-nowrap text-xs md:text-sm transition focus:outline-none">1. Pairings</button>
 <button onclick="switchLogisticsSubTab('rooms')" id="subTab-rooms" class="px-3 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs md:text-sm transition focus:outline-none">2. Rooms</button>
 <button onclick="switchLogisticsSubTab('groups')" id="subTab-groups" class="px-3 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs md:text-sm transition focus:outline-none">3. Groups</button>
 <button onclick="switchLogisticsSubTab('buses')" id="subTab-buses" class="px-3 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs md:text-sm transition focus:outline-none">4. Buses</button>
</div>

<!-- Drag & Drop Pairing UI -->
<div id="log-pairings" class="flex-1 flex flex-col min-h-0 w-full relative">
 <div id="logLoadingOverlay" class="absolute inset-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-20 hidden-force flex flex-col justify-center items-center">
     <div class="loader !w-8 !h-8 border-primary mb-2"></div>
     <span class="text-primary dark:text-blue-400 font-bold text-[10px] tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">Loading...</span>
 </div>
 
 <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 md:p-3 shrink-0 z-10 flex flex-col gap-1 shadow-sm">
   <div class="flex justify-between items-center px-1">
     <div class="flex items-center gap-2">
         <h3 class="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight">Pairings</h3>
         <button onclick="toggleAltSwap()" class="bg-gray-100 dark:bg-gray-800 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition focus:outline-none border border-gray-200 dark:border-gray-700 shadow-sm" title="Swap Columns">
            <svg class="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
         </button>
     </div>
     <button onclick="manualSyncPairings(this)" class="btn-sync-pairings text-[10px] md:text-xs px-2 py-1 rounded-md font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none shrink-0">
       <span class="btn-text">Saved</span><div class="btn-spinner ml-1 !w-3 !h-3 hidden-force"></div>
     </button>
   </div>
   <p class="text-[9px] md:text-[10px] text-gray-500 dark:text-gray-400 px-1 leading-tight">Slide between columns to pair. Tap 'X' to unpair.</p>
 </div>
 
 <div class="flex flex-row flex-1 min-h-0 w-full overflow-hidden relative bg-gray-50 dark:bg-gray-950 border-x border-b border-gray-200 dark:border-gray-800 rounded-b-xl md:rounded-none">
   <!-- Source Pool (Left Side: 50%) -->
   <div id="dnd-source-col" class="flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-colors border-r border-gray-200 dark:border-gray-800">
     <h4 id="dnd-source-title" class="font-black text-[10px] py-1.5 shrink-0 text-center uppercase tracking-widest shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b"></h4>
     <div id="dnd-source-pool" class="space-y-1.5 flex-grow overflow-y-auto p-1.5 custom-scrollbar bg-opacity-50 pb-6"></div>
   </div>
   <!-- Target Zones (Right Side: 50%) -->
   <div id="dnd-target-col" class="flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-colors">
     <h4 id="dnd-target-title" class="font-black text-[10px] py-1.5 shrink-0 text-center uppercase tracking-widest shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b"></h4>
     <div id="dnd-target-list" class="space-y-1.5 flex-grow overflow-y-auto p-1.5 custom-scrollbar pb-6 bg-opacity-50"></div>
   </div>
 </div>
</div>

<div id="log-rooms" class="hidden-force flex-1 mt-2 w-full"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Room builder in development...</p></div></div>
<div id="log-groups" class="hidden-force flex-1 mt-2 w-full"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Group builder in development...</p></div></div>
<div id="log-buses" class="hidden-force flex-1 mt-2 w-full"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Bus Allocation in development...</p></div></div>
`;
}

function switchLogisticsSubTab(tabId) {['pairings', 'rooms', 'groups', 'buses'].forEach(id => { 
const el = document.getElementById(`log-${id}`);
if(el) el.classList.add('hidden-force'); 
const btn = document.getElementById(`subTab-${id}`); 
if(btn) { btn.classList.remove('border-primary', 'text-primary'); btn.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400'); } 
}); 
const targetEl = document.getElementById(`log-${tabId}`);
if(targetEl) targetEl.classList.remove('hidden-force'); 
const targetBtn = document.getElementById(`subTab-${tabId}`); 
if(targetBtn) { targetBtn.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400'); targetBtn.classList.add('border-primary', 'text-primary'); } 
}

async function loadLogisticsData() { 
const overlay = document.getElementById('logLoadingOverlay');
if (overlay) overlay.classList.remove('hidden-force');
setSyncButtonState('loading');

try { 
 const res = await callBackend('fetchLogistics'); 
 globalLogistics = res; 
 
 if (typeof processDisplayNames === "function") {
     processDisplayNames(globalLogistics.participants);
 }
 if (typeof applyGlobalSorting === "function") {
     globalLogistics.participants = applyGlobalSorting(globalLogistics.participants);
 }
 renderPairings(); 
 
 if (typeof renderAttendanceLists === "function" && document.getElementById('attAssignmentSelect')) {
     renderAttendanceLists();
 }

 setSyncButtonState('saved');
 startPairingPolling();
} catch(e) { 
 showToast("Failed to load logistics.", true); 
 setSyncButtonState('error');
} finally {
 if (overlay) overlay.classList.add('hidden-force');
}
}

function toggleAltSwap() { altSwapMode = !altSwapMode; renderPairings(); }

// Generates the visual paired pill. Uses smaller text, lower opacity.
function generatePillHtml(targetName, targetColorClass, traineeNric, volNric) {
return `<div class="relative inline-block m-1 align-top pointer-events-auto">
    <div class="${targetColorClass} text-[9px] md:text-[10px] pl-1.5 pr-2.5 py-0.5 rounded shadow-sm border border-gray-300 dark:border-gray-600 font-bold opacity-90 leading-tight break-words whitespace-normal text-center" style="overflow-wrap: anywhere;">
        ${targetName}
    </div>
    <div class="remove-x" onclick="unpairTrainee('${traineeNric}', '${volNric}')">×</div>
</div>`;
}

// Generates the main drag/drop cards. Emphasizes Main Name via text sizing and boldness.
function generateCardHtml(item, familyCounts, pairings, vols, trainees) {
const dynColor = getProjectColor(item.group);
const isFam = familyCounts[item.poc] > 1;
const famBadge = isFam && item.role === 'TRAINEE' ? `<span class="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[8px] uppercase font-black tracking-wider px-1 py-0.5 rounded shrink-0 shadow-sm border border-purple-200 dark:border-purple-700 pointer-events-none whitespace-nowrap">FAM</span>` : '';

const myPairings = item.role === 'TRAINEE' ? pairings.filter(p => p.traineeNric === item.nric) : pairings.filter(p => p.volNric === item.nric);

let pairedPills = '';
myPairings.forEach(pair => {
    const pairedPerson = item.role === 'TRAINEE' ? vols.find(v => v.nric === pair.volNric) : trainees.find(t => t.nric === pair.traineeNric);
    if(pairedPerson) {
        const pColor = getProjectColor(pairedPerson.group);
        pairedPills += generatePillHtml(pairedPerson.displayName || pairedPerson.name, pColor, pair.traineeNric, pair.volNric);
    }
});

const btnLabel = item.role === 'TRAINEE' ? '+ Vol' : '+ Trn';
const displayName = item.displayName || item.name;

return `
  <div class="dnd-draggable dnd-dropzone bg-white dark:bg-gray-800 p-1.5 md:p-2 rounded-md border border-gray-200 dark:border-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-grab active:cursor-grabbing hover:border-primary transition select-none flex flex-col min-h-[60px] gap-1" data-nric="${item.nric}" data-role="${item.role}">
    <!-- Unique Targetable class for cloning -->
    <div class="flex justify-between items-start w-full gap-1">
      <div class="main-name-pill font-extrabold text-[11px] md:text-[12px] px-1.5 py-0.5 rounded shadow-sm border ${dynColor} max-w-full inline-flex flex-wrap items-center gap-1 self-start min-w-0 leading-[1.1]">
        <span class="break-words whitespace-normal min-w-0 text-left" style="overflow-wrap: break-word;">${displayName}</span>
        ${famBadge}
      </div>
      <button onclick="openPairingSheet('${item.nric}', '${item.role}')" class="text-[9px] md:text-[10px] bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-1 rounded border border-blue-200 dark:border-gray-600 hover:bg-blue-100 transition whitespace-nowrap focus:outline-none shrink-0 pointer-events-auto shadow-sm">${btnLabel}</button>
    </div>
    <div class="flex flex-wrap flex-grow items-start content-start pointer-events-auto bg-gray-50/50 dark:bg-gray-900/50 p-1 rounded min-h-[28px] border border-dashed border-gray-200 dark:border-gray-700 mt-0.5">
        ${pairedPills || '<span class="text-[9px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 ml-0.5 pointer-events-none">Drop pair here</span>'}
    </div>
  </div>
`;
}

function renderPairings() {
if(!globalLogistics || !document.getElementById('dnd-source-pool')) return;
const trainees = globalLogistics.participants.filter(p => p.role === 'TRAINEE');
const vols = globalLogistics.participants.filter(p => p.role === 'VOLUNTEER');
const pairings = globalLogistics.pairings ||[];
const familyCounts = {}; globalLogistics.participants.forEach(p => { familyCounts[p.poc] = (familyCounts[p.poc] || 0) + 1; });

const isSourceVol = !altSwapMode;
const sourceArr = isSourceVol ? vols : trainees;
const targetArr = isSourceVol ? trainees : vols;

// Distinct visual themes for columns
const volColClass = "bg-green-50/30 dark:bg-green-900/10";
const traineeColClass = "bg-blue-50/30 dark:bg-blue-900/10";
const sourceColClass = isSourceVol ? volColClass : traineeColClass;
const targetColClass = isSourceVol ? traineeColClass : volColClass;

const volTitleClass = "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 border-b border-green-200 dark:border-green-800";
const traineeTitleClass = "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border-b border-blue-200 dark:border-blue-800";

const sourceCol = document.getElementById('dnd-source-col');
const targetCol = document.getElementById('dnd-target-col');
sourceCol.className = `flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-colors border-r border-gray-200 dark:border-gray-800 ${sourceColClass}`;
targetCol.className = `flex-1 min-w-0 flex flex-col h-full overflow-hidden transition-colors ${targetColClass}`;

const sourceTitle = document.getElementById('dnd-source-title');
const targetTitle = document.getElementById('dnd-target-title');
sourceTitle.innerText = isSourceVol ? "Volunteers" : "Trainees";
targetTitle.innerText = isSourceVol ? "Trainees" : "Volunteers";
sourceTitle.className = `font-black text-[10px] py-1.5 shrink-0 text-center uppercase tracking-widest shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b ${isSourceVol ? volTitleClass : traineeTitleClass}`;
targetTitle.className = `font-black text-[10px] py-1.5 shrink-0 text-center uppercase tracking-widest shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b ${!isSourceVol ? volTitleClass : traineeTitleClass}`;

let sourceHtml = '';
sourceArr.forEach(item => { sourceHtml += generateCardHtml(item, familyCounts, pairings, vols, trainees); });
document.getElementById('dnd-source-pool').innerHTML = sourceHtml || '<p class="text-[10px] text-gray-500 font-bold p-2 text-center mt-2">No items.</p>';

let targetHtml = '';
targetArr.forEach(item => { targetHtml += generateCardHtml(item, familyCounts, pairings, vols, trainees); });
document.getElementById('dnd-target-list').innerHTML = targetHtml || '<p class="text-[10px] text-gray-500 font-bold p-2 text-center mt-2">No items.</p>';
}

// === ORIGINAL BOTTOM SHEET UI LOGIC ===
function openPairingSheet(sourceNric, sourceRole = 'TRAINEE') {
currentPairingTarget = sourceNric; 
currentPairingSourceRole = sourceRole;

const sourcePerson = globalLogistics.participants.find(p => p.nric === sourceNric);
let titleHtml = sourceRole === 'TRAINEE' ? "Select Volunteer" : "Select Trainee";

if (sourcePerson) {
 const dynColor = getProjectColor(sourcePerson.group);
 const dName = sourcePerson.displayName || sourcePerson.name;
 titleHtml = `Pair with <span class="ml-1 font-bold text-[11px] md:text-xs px-1.5 py-0.5 rounded shadow-sm border ${dynColor}">${dName}</span>`;
}

document.getElementById('sheetTitle').innerHTML = titleHtml;

const searchInput = document.getElementById('pairingSearchInput');
if(searchInput) {
   searchInput.value = '';
}

document.getElementById('selectionBottomSheet').classList.remove('hidden-force');

const targetRole = sourceRole === 'TRAINEE' ? 'VOLUNTEER' : 'TRAINEE';
const targets = globalLogistics.participants.filter(p => p.role === targetRole);
const pairings = globalLogistics.pairings ||[];
let html = '';

targets.forEach(t => {
 // Check if already paired
 const isPaired = sourceRole === 'TRAINEE' 
   ? pairings.some(p => p.volNric === t.nric && p.traineeNric === sourceNric)
   : pairings.some(p => p.traineeNric === t.nric && p.volNric === sourceNric);
   
 if(isPaired) return; 

 const tDynColor = getProjectColor(t.group);
 const roleLabel = t.role === 'VOLUNTEER' ? 'Volunteer' : 'Trainee';
 const roleColor = t.role === 'VOLUNTEER' ? 'text-green-700 bg-green-100 dark:bg-green-900/50 border-green-200 dark:border-green-800' : 'text-blue-700 bg-blue-100 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800';
 const dName = t.displayName || t.name;
 
 html += `<div onclick="confirmPairing('${t.nric}')" class="pairing-list-item flex flex-col bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] cursor-pointer hover:border-primary dark:hover:border-primary transition mb-1.5" data-name="${dName.toLowerCase()}">
     <div class="flex justify-between items-start w-full gap-2">
       <span class="font-extrabold text-[11px] md:text-xs px-1.5 py-0.5 rounded shadow-sm border ${tDynColor} break-words whitespace-normal min-w-0 flex-1 text-left leading-[1.1]" style="overflow-wrap: break-word;">${dName}</span>
       <span class="text-[9px] font-black ${roleColor} border px-1.5 py-0.5 rounded shrink-0 whitespace-nowrap uppercase tracking-wider">${roleLabel}</span>
     </div>
   </div>`;
});

document.getElementById('sheetListContainer').innerHTML = html || `<p class="text-[10px] font-bold text-gray-400 p-2 text-center mt-2">No available ${targetRole.toLowerCase()}s.</p>`;
}

function filterPairingSheet() {
const query = document.getElementById('pairingSearchInput').value.toLowerCase();
const items = document.querySelectorAll('.pairing-list-item');
items.forEach(item => {
 if (item.dataset.name.includes(query)) {
   item.classList.remove('hidden-force');
 } else {
   item.classList.add('hidden-force');
 }
});
}

function confirmPairing(targetNric) {
if(!currentPairingTarget) return; 
closeSelectionSheet(); 

const traineeNric = currentPairingSourceRole === 'TRAINEE' ? currentPairingTarget : targetNric;
const volNric = currentPairingSourceRole === 'TRAINEE' ? targetNric : currentPairingTarget;

if(!globalLogistics.pairings.some(p => p.traineeNric === traineeNric && p.volNric === volNric)) {
   const key = traineeNric + '_' + volNric;
   pendingPairingsMap.set(key, { action: 'ADD', traineeNric, volNric });
   globalLogistics.pairings.push({ traineeNric, volNric }); 
   renderPairings(); 
   triggerPairingSync();
}
}

async function manualSyncPairings(btn) {
setSyncButtonState('loading');
try { 
   // Fallback: forcefully wipe and sync all from the local cache, in case delta drops.
   await callBackend('syncAllPairings', { pairings: globalLogistics.pairings }); 
   pendingPairingsMap.clear();
   setSyncButtonState('saved'); 
   showToast("Manual save complete!"); 
} 
catch(e) { 
   showToast("Save failed.", true); 
   setSyncButtonState('error'); 
} 
}

function closeSelectionSheet() { document.getElementById('selectionBottomSheet').classList.add('hidden-force'); }