let pairingSyncTimeout = null;
let altSwapMode = false;

// ==========================================
// ROBUST DRAG & DROP ENGINE (Mouse + Touch)
// ==========================================
if (!window.dndInitialized) {
    window.dndInitialized = true;

    let dndState = {
        timer: null,
        isDragging: false,
        el: null,
        clone: null,
        startX: 0,
        startY: 0
    };

    // --- TOUCH EVENTS (MOBILE) ---
    document.addEventListener('touchstart', (e) => {
        if(e.touches.length > 1) return;
        startDrag(e, e.touches[0].clientX, e.touches[0].clientY, true);
    }, {passive: false});

    document.addEventListener('touchmove', (e) => {
        if (dndState.isDragging) {
            e.preventDefault(); 
            moveDrag(e, e.touches[0].clientX, e.touches[0].clientY);
        } else if (dndState.timer) {
            clearTimeout(dndState.timer);
            dndState.timer = null;
            dndState.el = null;
        }
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
        if (dndState.isDragging) {
            e.preventDefault();
            moveDrag(e, e.clientX, e.clientY);
        }
    });

    document.addEventListener('mouseup', (e) => {
        endDrag(e, e.clientX, e.clientY);
    });

    // --- CORE LOGIC ---
    function startDrag(e, clientX, clientY, isTouch) {
        if(e.target.closest('.remove-x') || e.target.closest('button')) return;
        
        const altContainer = document.getElementById('log-pairings-alt');
        if(!altContainer || altContainer.classList.contains('hidden-force')) return;

        let draggable = e.target.closest('.dnd-draggable');
        if(!draggable) return;

        dndState.el = draggable;
        
        // Pick up ONLY the visual name pill, not the whole dropzone box
        const nameNode = dndState.el.querySelector('.main-name-pill') || dndState.el;
        const rect = nameNode.getBoundingClientRect();
        
        dndState.startX = clientX - rect.left;
        dndState.startY = clientY - rect.top;

        const delay = isTouch ? 200 : 0;

        dndState.timer = setTimeout(() => {
            dndState.isDragging = true;
            if(isTouch && navigator.vibrate) navigator.vibrate(50);
            
            dndState.el.classList.add('locked-for-drag');
            
            dndState.clone = nameNode.cloneNode(true);
            dndState.clone.classList.add('dragging-clone');
            dndState.clone.style.width = rect.width + 'px';
            dndState.clone.style.margin = '0px';
            dndState.clone.style.pointerEvents = 'none'; // Critical for elementFromPoint
            dndState.clone.style.zIndex = '9999';
            
            document.body.appendChild(dndState.clone);
            updateClonePosition(clientX, clientY, rect.width, rect.height);
        }, delay);
    }

    function moveDrag(e, clientX, clientY) {
        if (!dndState.isDragging || !dndState.clone) return;
        
        const w = parseFloat(dndState.clone.style.width);
        const h = dndState.clone.offsetHeight || 30;
        updateClonePosition(clientX, clientY, w, h);
        
        // Find valid dropzone under finger using elementFromPoint
        const elAtPoint = document.elementFromPoint(clientX, clientY);
        const activeDz = elAtPoint ? elAtPoint.closest('.dnd-dropzone') : null;

        document.querySelectorAll('.dnd-dropzone').forEach(dz => {
            if (dz === activeDz && dz.dataset.role !== dndState.el.dataset.role) {
                dz.classList.add('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
            } else {
                dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
            }
        });
    }

    function endDrag(e, clientX, clientY) {
        if(dndState.timer) {
            clearTimeout(dndState.timer);
            dndState.timer = null;
        }

        if(dndState.el) dndState.el.classList.remove('locked-for-drag');
        
        if (dndState.isDragging && dndState.clone) {
            dndState.clone.remove(); 
            dndState.clone = null; 
            dndState.isDragging = false;
            
            document.querySelectorAll('.dnd-dropzone').forEach(dz => dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary'));

            // Find where we dropped
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
    }

    function updateClonePosition(x, y, w, h) {
        if(dndState.clone) {
            dndState.clone.style.left = (x - (w / 2)) + 'px';
            dndState.clone.style.top = (y - (h / 2)) + 'px';
        }
    }
}

function handleDndDrop(sourceNric, sourceRole, targetNric) {
    let volNric = sourceRole === 'VOLUNTEER' ? sourceNric : targetNric;
    let traineeNric = sourceRole === 'TRAINEE' ? sourceNric : targetNric;
    
    if(!globalLogistics.pairings.some(p => p.traineeNric === traineeNric && p.volNric === volNric)) {
        globalLogistics.pairings.push({ traineeNric: traineeNric, volNric: volNric });
        renderPairings(); 
        triggerPairingSync();
    } else {
        showToast("Already paired!", true);
    }
}

function buildLogisticsUI() {
 document.getElementById('tab-logistics').innerHTML = `
   <div class="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide pb-1 shrink-0">
     <button onclick="switchLogisticsSubTab('pairings')" id="subTab-pairings" class="px-3 py-1 font-semibold border-b-2 border-primary text-primary whitespace-nowrap text-sm mb-[-5px] transition focus:outline-none">1. Pairings</button>
     <button onclick="switchLogisticsSubTab('pairings-alt')" id="subTab-pairings-alt" class="px-3 py-1 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap text-sm mb-[-5px] transition focus:outline-none">1. Pairings (Alt)</button>
     <button onclick="switchLogisticsSubTab('rooms')" id="subTab-rooms" class="px-3 py-1 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap text-sm mb-[-5px] transition focus:outline-none">2. Rooms</button>
     <button onclick="switchLogisticsSubTab('groups')" id="subTab-groups" class="px-3 py-1 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap text-sm mb-[-5px] transition focus:outline-none">3. Groups</button>
     <button onclick="switchLogisticsSubTab('buses')" id="subTab-buses" class="px-3 py-1 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap text-sm mb-[-5px] transition focus:outline-none">4. Buses</button>
   </div>
   
   <!-- Standard Pairing UI -->
   <div id="log-pairings" class="flex-1 flex flex-col min-h-0 mt-2 overflow-y-auto pb-10">
     <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
       <div class="flex justify-between items-center mb-2">
         <h3 class="text-base font-bold text-gray-900 dark:text-white">Trainee - Vol Pairings</h3>
         <button onclick="manualSyncPairings(this)" class="btn-sync-pairings text-xs px-2 py-1 rounded font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none">
           <span class="btn-text">Saved</span><div class="btn-spinner ml-1 !w-3 !h-3 hidden-force"></div>
         </button>
       </div>
       <p class="text-[11px] text-gray-500 dark:text-gray-400 mb-3">Tap "+ Add Vol" to assign multiple volunteers per trainee.</p>
       <div class="space-y-2"><h4 class="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-1 text-sm">Unassigned (<span id="unpairedCount">0</span>)</h4><div id="unpairedTraineesList" class="space-y-2"></div></div>
       <div class="space-y-2 mt-4"><h4 class="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-1 text-sm">Paired (<span id="pairedCount">0</span>)</h4><div id="pairedTraineesList" class="space-y-2"></div></div>
     </div>
   </div>

   <!-- Alternative Drag & Drop Pairing UI -->
   <div id="log-pairings-alt" class="hidden-force flex-1 flex flex-col min-h-0 mt-2">
     <div class="bg-white dark:bg-gray-800 p-2 md:p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col flex-1 min-h-0">
       <div class="flex justify-between items-center mb-2 px-1 shrink-0">
         <div class="flex items-center gap-2">
             <h3 class="text-sm md:text-base font-bold text-gray-900 dark:text-white">Drag & Drop Pairings</h3>
             <button onclick="toggleAltSwap()" class="bg-gray-100 dark:bg-gray-700 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition focus:outline-none border border-gray-200 dark:border-gray-600" title="Swap Columns">
                <svg class="w-3.5 h-3.5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
             </button>
         </div>
         <button onclick="manualSyncPairings(this)" class="btn-sync-pairings text-xs px-2 py-1 rounded font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none">
           <span class="btn-text">Saved</span><div class="btn-spinner ml-1 !w-3 !h-3 hidden-force"></div>
         </button>
       </div>
       <p class="text-[10px] text-gray-500 dark:text-gray-400 mb-2 px-1 shrink-0">Drag between columns to pair. Tap 'X' to unpair.</p>
       
       <div class="flex flex-row gap-2 flex-1 min-h-0 w-full overflow-hidden">
         <!-- Source Pool (Left Side: 50%) -->
         <div id="dnd-source-col" class="w-1/2 rounded-xl border flex flex-col h-full overflow-hidden shrink-0 transition-colors">
           <h4 id="dnd-source-title" class="font-extrabold text-[12px] md:text-sm py-1.5 shrink-0 text-center uppercase tracking-widest shadow-sm rounded-t-md border-b-2"></h4>
           <div id="dnd-source-pool" class="space-y-1.5 flex-grow overflow-y-auto p-1.5 custom-scrollbar bg-opacity-50 pb-6"></div>
         </div>
         <!-- Target Zones (Right Side: 50%) -->
         <div id="dnd-target-col" class="w-1/2 rounded-xl border flex flex-col h-full overflow-hidden shrink-0 transition-colors">
           <h4 id="dnd-target-title" class="font-extrabold text-[12px] md:text-sm py-1.5 shrink-0 text-center uppercase tracking-widest shadow-sm rounded-t-md border-b-2"></h4>
           <div id="dnd-target-list" class="space-y-2 flex-grow overflow-y-auto p-1.5 custom-scrollbar pb-6 bg-opacity-50"></div>
         </div>
       </div>
     </div>
   </div>

   <div id="log-rooms" class="hidden-force flex-1 mt-2"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Room builder in development...</p></div></div>
   <div id="log-groups" class="hidden-force flex-1 mt-2"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Group builder in development...</p></div></div>
   <div id="log-buses" class="hidden-force flex-1 mt-2"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Bus Allocation in development...</p></div></div>
 `;
}

function switchLogisticsSubTab(tabId) {['pairings', 'pairings-alt', 'rooms', 'groups', 'buses'].forEach(id => { 
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
 try { 
     const res = await callBackend('fetchLogistics'); 
     globalLogistics = res; 
     if (typeof applyGlobalSorting === "function") {
         globalLogistics.participants = applyGlobalSorting(globalLogistics.participants);
     }
     renderPairings(); 
 } catch(e) { showToast("Failed to load logistics.", true); } 
}

function setSyncButtonState(state) {
  const btns = document.querySelectorAll('.btn-sync-pairings');
  if(btns.length === 0) return;
  btns.forEach(btn => {
    const textSpan = btn.querySelector('.btn-text'); const spinner = btn.querySelector('.btn-spinner');
    btn.className = "btn-sync-pairings text-xs px-2 md:px-3 py-1 md:py-1.5 rounded font-bold transition flex items-center justify-center border shadow-sm focus:outline-none"; 
    spinner.className = "btn-spinner ml-1 !w-3 !h-3 hidden-force"; 
    if(state === 'saving') { btn.classList.add('bg-yellow-50', 'text-yellow-700', 'border-yellow-200', 'dark:bg-yellow-900/30', 'dark:text-yellow-300', 'dark:border-yellow-800'); textSpan.textContent = "Saving..."; spinner.classList.remove('hidden-force'); spinner.classList.add('spinner-yellow'); btn.disabled = true; } 
    else if (state === 'saved') { btn.classList.add('bg-green-50', 'text-green-700', 'border-green-200', 'dark:bg-green-900/30', 'dark:text-green-300', 'dark:border-green-800'); textSpan.textContent = "Saved"; btn.disabled = false; } 
    else if (state === 'error') { btn.classList.add('bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/30', 'dark:text-red-300', 'dark:border-red-800'); textSpan.textContent = "Save Failed"; btn.disabled = false; }
  });
}

function triggerPairingSync() {
  setSyncButtonState('saving');
  if (pairingSyncTimeout) clearTimeout(pairingSyncTimeout);
  pairingSyncTimeout = setTimeout(async () => {
    try { await callBackend('syncAllPairings', { pairings: globalLogistics.pairings }); setSyncButtonState('saved'); } 
    catch(e) { showToast("Failed to sync", true); setSyncButtonState('error'); }
  }, 800); 
}

function toggleAltSwap() { altSwapMode = !altSwapMode; renderPairingsAlt(); }

// Generates the smaller, distinct paired pill inside the cards
function generatePillHtml(targetName, targetColorClass, traineeNric, volNric) {
    return `<div class="relative inline-block m-1 align-top pointer-events-auto">
        <!-- Added right padding to avoid red 'x' overlap -->
        <div class="${targetColorClass} text-[9px] md:text-[10px] pl-1.5 pr-3 py-0.5 rounded border border-gray-300 dark:border-gray-600 font-semibold shadow-sm flex items-center justify-center truncate max-w-[85px] sm:max-w-[120px] opacity-85">
            ${targetName}
        </div>
        <div class="remove-x" onclick="unpairTrainee('${traineeNric}', '${volNric}')">×</div>
    </div>`;
}

// Generates the main large cards for both columns
function generateCardHtml(item, familyCounts, pairings, vols, trainees) {
    const dynColor = getProjectColor(item.group);
    const isFam = familyCounts[item.poc] > 1;
    const famBadge = isFam && item.role === 'TRAINEE' ? `<span class="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 rounded ml-2 shrink-0 shadow-sm border border-purple-200 dark:border-purple-700 pointer-events-none">Fam</span>` : '';
    
    const myPairings = item.role === 'TRAINEE' ? pairings.filter(p => p.traineeNric === item.nric) : pairings.filter(p => p.volNric === item.nric);
    
    let pairedPills = '';
    myPairings.forEach(pair => {
        const pairedPerson = item.role === 'TRAINEE' ? vols.find(v => v.nric === pair.volNric) : trainees.find(t => t.nric === pair.traineeNric);
        if(pairedPerson) {
            const pColor = getProjectColor(pairedPerson.group);
            pairedPills += generatePillHtml(pairedPerson.name, pColor, pair.traineeNric, pair.volNric);
        }
    });

    return `
      <div class="dnd-draggable dnd-dropzone bg-white dark:bg-gray-800 p-2 md:p-3 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary dark:hover:border-primary transition select-none flex flex-col min-h-[75px] gap-1.5" data-nric="${item.nric}" data-role="${item.role}">
        <!-- Main Name Pill: Larger, bolder -->
        <div class="main-name-pill flex items-center w-full pointer-events-none shrink-0 bg-white dark:bg-gray-800 rounded z-10">
            <span class="font-extrabold text-[13px] md:text-sm px-2.5 py-1 rounded border shadow-sm ${dynColor} truncate max-w-full tracking-tight inline-flex items-center">${item.name} ${famBadge}</span>
        </div>
        <!-- Paired Pills Zone -->
        <div class="flex flex-wrap flex-grow items-start content-start pointer-events-auto bg-gray-50/50 dark:bg-gray-900/50 p-1 rounded min-h-[32px] border border-dashed border-gray-200 dark:border-gray-700">
            ${pairedPills || '<span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1 ml-1 pointer-events-none">Drop pair here</span>'}
        </div>
      </div>
    `;
}

function renderPairings() {
 if(!globalLogistics || !document.getElementById('unpairedCount')) return;
 const trainees = globalLogistics.participants.filter(p => p.role === 'TRAINEE');
 const vols = globalLogistics.participants.filter(p => p.role === 'VOLUNTEER');
 const pairings = globalLogistics.pairings ||[];
 const familyCounts = {}; globalLogistics.participants.forEach(p => { familyCounts[p.poc] = (familyCounts[p.poc] || 0) + 1; });

 let unpairedHtml = ''; let pairedHtml = ''; let uCount = 0; let pCount = 0;

 trainees.forEach(t => {
   const tPairings = pairings.filter(p => p.traineeNric === t.nric);
   const isFam = familyCounts[t.poc] > 1;
   const famBadge = isFam ? `<span class="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[8px] uppercase font-bold tracking-wider px-1 py-0.5 rounded ml-1 shrink-0 shadow-sm border border-purple-200 dark:border-purple-700 pointer-events-none">Fam</span>` : '';
   const dynColor = getProjectColor(t.group);

   let tagsHtml = '';
   tPairings.forEach(pair => {
       const vol = vols.find(v => v.nric === pair.volNric);
       const vDynColor = vol ? getProjectColor(vol.group) : '';
       tagsHtml += generatePillHtml(vol ? vol.name : 'Unknown', vDynColor, t.nric, pair.volNric);
   });

   const cardHtml = `<div class="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-2 transition">
         <div class="flex justify-between items-start mb-1"><div class="flex items-center"><span class="font-extrabold text-sm md:text-base px-2 py-0.5 rounded border shadow-sm ${dynColor}">${t.name}</span>${famBadge}</div><button onclick="openPairingSheet('${t.nric}')" class="text-[10px] md:text-xs bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold px-2 py-1 rounded-md border border-blue-200 dark:border-gray-600 hover:bg-blue-100 transition whitespace-nowrap focus:outline-none">+ Vol</button></div>
         <div class="flex flex-wrap min-h-[28px] items-center pt-1">${tagsHtml || '<span class="text-[10px] md:text-xs font-medium text-gray-400">Unassigned</span>'}</div></div>`;

   if(tPairings.length > 0) { pCount++; pairedHtml += cardHtml; } else { uCount++; unpairedHtml += cardHtml; }
 });

 document.getElementById('unpairedCount').textContent = uCount; document.getElementById('pairedCount').textContent = pCount;
 document.getElementById('unpairedTraineesList').innerHTML = unpairedHtml || '<p class="text-xs text-gray-400">All trainees paired!</p>';
 document.getElementById('pairedTraineesList').innerHTML = pairedHtml || '<p class="text-xs text-gray-400">No pairings yet.</p>';
 
 renderPairingsAlt();
}

function renderPairingsAlt() {
  if(!globalLogistics || !document.getElementById('dnd-source-pool')) return;
  const trainees = globalLogistics.participants.filter(p => p.role === 'TRAINEE');
  const vols = globalLogistics.participants.filter(p => p.role === 'VOLUNTEER');
  const pairings = globalLogistics.pairings ||[];
  const familyCounts = {}; globalLogistics.participants.forEach(p => { familyCounts[p.poc] = (familyCounts[p.poc] || 0) + 1; });
  
  const isSourceVol = !altSwapMode;
  const sourceArr = isSourceVol ? vols : trainees;
  const targetArr = isSourceVol ? trainees : vols;
  
  // Apply centralized, distinctly colored headers and column backgrounds
  const volColClass = "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800";
  const traineeColClass = "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800";
  const sourceColClass = isSourceVol ? volColClass : traineeColClass;
  const targetColClass = isSourceVol ? traineeColClass : volColClass;
  
  const volTitleClass = "bg-green-600 dark:bg-green-700 text-white border-green-700 dark:border-green-900";
  const traineeTitleClass = "bg-blue-600 dark:bg-blue-700 text-white border-blue-700 dark:border-blue-900";

  const sourceCol = document.getElementById('dnd-source-col');
  const targetCol = document.getElementById('dnd-target-col');
  sourceCol.className = `w-1/2 rounded-xl border flex flex-col h-full overflow-hidden shrink-0 transition-colors ${sourceColClass}`;
  targetCol.className = `w-1/2 rounded-xl border flex flex-col h-full overflow-hidden shrink-0 transition-colors ${targetColClass}`;

  const sourceTitle = document.getElementById('dnd-source-title');
  const targetTitle = document.getElementById('dnd-target-title');
  sourceTitle.innerText = isSourceVol ? "Volunteers" : "Trainees";
  targetTitle.innerText = isSourceVol ? "Trainees" : "Volunteers";
  sourceTitle.className = `font-extrabold text-[12px] md:text-sm py-1.5 shrink-0 text-center uppercase tracking-widest shadow-sm rounded-t-md border-b-2 ${isSourceVol ? volTitleClass : traineeTitleClass}`;
  targetTitle.className = `font-extrabold text-[12px] md:text-sm py-1.5 shrink-0 text-center uppercase tracking-widest shadow-sm rounded-t-md border-b-2 ${!isSourceVol ? volTitleClass : traineeTitleClass}`;

  let sourceHtml = '';
  sourceArr.forEach(item => { sourceHtml += generateCardHtml(item, familyCounts, pairings, vols, trainees); });
  document.getElementById('dnd-source-pool').innerHTML = sourceHtml || '<p class="text-[10px] text-gray-500 font-bold p-2 text-center mt-4">No items.</p>';

  let targetHtml = '';
  targetArr.forEach(item => { targetHtml += generateCardHtml(item, familyCounts, pairings, vols, trainees); });
  document.getElementById('dnd-target-list').innerHTML = targetHtml || '<p class="text-[10px] text-gray-500 font-bold p-2 text-center mt-4">No targets.</p>';
}

// === ORIGINAL BOTTOM SHEET UI LOGIC ===
function openPairingSheet(traineeNric) {
 currentPairingTarget = traineeNric; 
 const targetTrainee = globalLogistics.participants.find(p => p.nric === traineeNric);
 let titleHtml = "Select Volunteer";
 if (targetTrainee) {
   const dynColor = getProjectColor(targetTrainee.group);
   titleHtml = `Pair Volunteer with <span class="ml-1.5 font-bold text-sm px-2 py-0.5 rounded border ${dynColor}">${targetTrainee.name}</span>`;
 }
 document.getElementById('sheetTitle').innerHTML = titleHtml;
 document.getElementById('selectionBottomSheet').classList.remove('hidden-force');
 
 const vols = globalLogistics.participants.filter(p => p.role === 'VOLUNTEER'); const pairings = globalLogistics.pairings ||[]; let html = '';

 vols.forEach(v => {
   const volPairs = pairings.filter(p => p.volNric === v.nric);
   if(volPairs.some(p => p.traineeNric === traineeNric)) return; 
   const vDynColor = getProjectColor(v.group);
   html += `<div onclick="confirmPairing('${v.nric}')" class="flex flex-col bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition mb-2">
       <div class="flex justify-between items-center w-full"><span class="font-bold text-sm px-2 py-0.5 rounded border ${vDynColor}">${v.name}</span><span class="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-1.5 py-0.5 rounded">Volunteer</span></div>
     </div>`;
 });
 document.getElementById('sheetListContainer').innerHTML = html || '<p class="text-sm font-medium text-gray-400 p-2">No available volunteers.</p>';
}

function confirmPairing(volNric) {
 if(!currentPairingTarget) return; closeSelectionSheet(); 
 globalLogistics.pairings.push({ traineeNric: currentPairingTarget, volNric: volNric }); renderPairings(); triggerPairingSync();
}

function unpairTrainee(traineeNric, volNric) {
 globalLogistics.pairings = globalLogistics.pairings.filter(p => !(p.traineeNric === traineeNric && p.volNric === volNric)); renderPairings(); triggerPairingSync();
}

async function manualSyncPairings(btn) {
  setSyncButtonState('saving');
  try { await callBackend('syncAllPairings', { pairings: globalLogistics.pairings }); setSyncButtonState('saved'); showToast("Manual save complete!"); } 
  catch(e) { showToast("Save failed.", true); setSyncButtonState('error'); } 
}

function closeSelectionSheet() { document.getElementById('selectionBottomSheet').classList.add('hidden-force'); }