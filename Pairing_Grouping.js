let pairingSyncTimeout = null;
let altSwapMode = false;

// Global DND State Management
if (!window.dndInitialized) {
    window.dndInitialized = true;
    let touchEl = null;
    let dndClone = null;
    let isDragging = false;
    let touchOffsetX = 0;
    let touchOffsetY = 0;
    let longPressTimer = null;

    // Mobile Touch DND listeners
    document.addEventListener('touchstart', function(e) {
        if(e.target.closest('.remove-x') || e.target.closest('button')) return;
        const target = e.target.closest('.dnd-draggable');
        if (target && !document.getElementById('log-pairings-alt').classList.contains('hidden-force')) {
            touchEl = target; 
            touchEl.setAttribute('draggable', 'false');
            longPressTimer = setTimeout(() => {
                isDragging = true;
                touchEl.classList.add('locked-for-drag');
                if(navigator.vibrate) navigator.vibrate(50);
                
                const rect = touchEl.getBoundingClientRect();
                touchOffsetX = e.touches[0].clientX - rect.left;
                touchOffsetY = e.touches[0].clientY - rect.top;
                
                dndClone = touchEl.cloneNode(true);
                dndClone.querySelectorAll('.remove-x').forEach(x => x.remove());
                dndClone.classList.add('dragging-clone');
                dndClone.classList.remove('locked-for-drag');
                dndClone.style.width = rect.width + 'px';
                document.body.appendChild(dndClone);
                
                moveDndClone(e.touches[0].clientX, e.touches[0].clientY);
            }, 150); // 150ms allows easy dragging without waiting long
        }
    }, {passive: false});

    document.addEventListener('touchmove', function(e) {
        if (isDragging && dndClone) {
            e.preventDefault(); // Stop mobile scroll while dragging
            moveDndClone(e.touches[0].clientX, e.touches[0].clientY);
            
            document.querySelectorAll('.dnd-dropzone').forEach(dz => {
                const r = dz.getBoundingClientRect();
                if(e.touches[0].clientX >= r.left && e.touches[0].clientX <= r.right && e.touches[0].clientY >= r.top && e.touches[0].clientY <= r.bottom) {
                    dz.classList.add('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
                } else {
                    dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
                }
            });
        } else {
            clearTimeout(longPressTimer);
            if(touchEl) touchEl.classList.remove('locked-for-drag');
        }
    }, {passive: false});

    function cleanupDrag(e) {
        clearTimeout(longPressTimer);
        if(touchEl) {
            touchEl.classList.remove('locked-for-drag');
            touchEl.setAttribute('draggable', 'true');
        }
        if (isDragging && dndClone) {
            let clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
            let clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
            
            dndClone.remove(); dndClone = null;
            
            let dropZone = null;
            document.querySelectorAll('.dnd-dropzone').forEach(dz => {
                dz.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
                const r = dz.getBoundingClientRect();
                if(clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
                    dropZone = dz;
                }
            });
            
            if (dropZone && touchEl) {
                handleDndDrop(touchEl.dataset.nric, dropZone.dataset.nric);
            }
        }
        touchEl = null; isDragging = false;
    }

    document.addEventListener('touchend', cleanupDrag);
    document.addEventListener('touchcancel', cleanupDrag);

    function moveDndClone(x, y) {
        if(dndClone) {
            dndClone.style.left = (x - touchOffsetX) + 'px';
            dndClone.style.top = (y - touchOffsetY) + 'px';
        }
    }

    // HTML5 Mouse DND implementations for desktop
    window.dndDragStart = function(e, sourceNric) {
      e.dataTransfer.setData('text/plain', sourceNric);
      e.dataTransfer.effectAllowed = 'copy';
    };
    window.dndDragOver = function(e) {
      e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
    };
    window.dndDragEnter = function(e) {
      e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
    };
    window.dndDragLeave = function(e) {
      e.currentTarget.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
    };
    window.dndDrop = function(e, targetNric) {
      e.preventDefault();
      e.currentTarget.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
      const sourceNric = e.dataTransfer.getData('text/plain');
      if(sourceNric) handleDndDrop(sourceNric, targetNric);
    };
}

function handleDndDrop(sourceNric, targetNric) {
    let volNric = altSwapMode ? targetNric : sourceNric;
    let traineeNric = altSwapMode ? sourceNric : targetNric;
    
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
       <p class="text-[10px] text-gray-500 dark:text-gray-400 mb-2 px-1 shrink-0">Drag from left pool and drop onto right targets.</p>
       
       <!-- STRICT Side-by-Side Flex Container (Equal Widths) -->
       <div class="flex flex-row gap-2 flex-1 min-h-0 w-full overflow-hidden">
         <!-- Source Pool (Left Side: 50% width) -->
         <div class="w-1/2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden shrink-0">
           <h4 id="dnd-source-title" class="font-bold text-[10px] md:text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-2 shrink-0 truncate uppercase tracking-wide">Volunteers</h4>
           <div id="dnd-source-pool" class="space-y-1.5 flex-grow overflow-y-auto pr-1 custom-scrollbar"></div>
         </div>
         <!-- Target Zones (Right Side: 50% width) -->
         <div class="w-1/2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden shrink-0">
           <h4 id="dnd-target-title" class="font-bold text-[10px] md:text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-2 shrink-0 truncate uppercase tracking-wide">Trainees</h4>
           <div id="dnd-target-list" class="space-y-2 flex-grow overflow-y-auto pr-1 custom-scrollbar pb-6"></div>
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
 try { const res = await callBackend('fetchLogistics'); globalLogistics = res; renderPairings(); } catch(e) { showToast("Failed to load logistics.", true); } 
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

// Clean isolated pill generator with red X positioned nicely on the corner
function generatePillHtml(targetName, targetColorClass, traineeNric, volNric) {
    return `<div class="relative inline-block m-1.5 align-top">
        <div class="${targetColorClass} text-[10px] md:text-xs px-1.5 py-1 md:px-2 md:py-1.5 rounded border border-gray-300 dark:border-gray-600 font-bold shadow-sm flex items-center justify-center truncate max-w-[85px] sm:max-w-[120px]">
            ${targetName}
        </div>
        <div class="remove-x" onclick="unpairTrainee('${traineeNric}', '${volNric}')">×</div>
    </div>`;
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
   const famBadge = isFam ? `<span class="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ml-1 border border-purple-200 dark:border-purple-800 align-middle inline-block">Fam</span>` : '';
   const dynColor = getProjectColor(t.group);

   let tagsHtml = '';
   tPairings.forEach(pair => {
       const vol = vols.find(v => v.nric === pair.volNric);
       const vDynColor = vol ? getProjectColor(vol.group) : '';
       tagsHtml += generatePillHtml(vol ? vol.name : 'Unknown', vDynColor, t.nric, pair.volNric);
   });

   const cardHtml = `<div class="bg-white dark:bg-gray-800 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-2 transition">
         <div class="flex justify-between items-start mb-1"><div class="flex items-center"><span class="font-bold text-xs md:text-sm px-2 py-0.5 rounded border ${dynColor}">${t.name}</span>${famBadge}</div><button onclick="openPairingSheet('${t.nric}')" class="text-[10px] md:text-xs bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold px-2 py-1 rounded-md border border-blue-200 dark:border-gray-600 hover:bg-blue-100 transition whitespace-nowrap focus:outline-none">+ Vol</button></div>
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
  
  const sourceArr = altSwapMode ? trainees : vols;
  const targetArr = altSwapMode ? vols : trainees;
  
  document.getElementById('dnd-source-title').innerText = altSwapMode ? "Trainees" : "Volunteers";
  document.getElementById('dnd-target-title').innerText = altSwapMode ? "Volunteers" : "Trainees";

  // Render Source Pool
  let sourceHtml = '';
  sourceArr.forEach(s => {
    const sDynColor = getProjectColor(s.group);
    const sFam = familyCounts[s.poc] > 1 ? `<span class="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[8px] uppercase font-bold px-1 rounded border border-purple-200 dark:border-purple-800 ml-1 shrink-0">Fam</span>` : '';
    
    const myPairings = altSwapMode ? pairings.filter(p => p.traineeNric === s.nric) : pairings.filter(p => p.volNric === s.nric);
    let pairedPills = '';
    myPairings.forEach(pair => {
        const pairedPerson = (altSwapMode) ? vols.find(v => v.nric === pair.volNric) : trainees.find(t => t.nric === pair.traineeNric);
        if(pairedPerson) {
            const pColor = getProjectColor(pairedPerson.group);
            pairedPills += generatePillHtml(pairedPerson.name, pColor, pair.traineeNric, pair.volNric);
        }
    });

    sourceHtml += `
      <div class="dnd-draggable bg-white dark:bg-gray-800 p-2 md:p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary dark:hover:border-primary transition select-none flex flex-col gap-1" data-nric="${s.nric}" draggable="true" ondragstart="dndDragStart(event, '${s.nric}')">
        <div class="flex items-center w-full pointer-events-none truncate text-ellipsis">
            <span class="font-bold text-[10px] md:text-xs px-1.5 py-0.5 rounded border ${sDynColor} truncate w-full tracking-tight">${s.name} ${s.role === 'TRAINEE' ? sFam : ''}</span>
        </div>
        <div class="flex flex-wrap pointer-events-auto">
            ${pairedPills}
        </div>
      </div>
    `;
  });
  document.getElementById('dnd-source-pool').innerHTML = sourceHtml || '<p class="text-[10px] text-gray-400">No items available.</p>';

  // Render Target Drop Zones
  let targetHtml = '';
  targetArr.forEach(t => {
    const tDynColor = getProjectColor(t.group);
    const tFam = familyCounts[t.poc] > 1 ? `<span class="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[8px] uppercase font-bold px-1 rounded border border-purple-200 dark:border-purple-800 ml-1 shrink-0">Fam</span>` : '';
    
    const myPairings = (!altSwapMode) ? pairings.filter(p => p.traineeNric === t.nric) : pairings.filter(p => p.volNric === t.nric);
    
    let pairedPills = '';
    myPairings.forEach(pair => {
       const pairedPerson = (!altSwapMode) ? vols.find(v => v.nric === pair.volNric) : trainees.find(tr => tr.nric === pair.traineeNric);
       if(pairedPerson) {
           const pColor = getProjectColor(pairedPerson.group);
           pairedPills += generatePillHtml(pairedPerson.name, pColor, pair.traineeNric, pair.volNric);
       }
    });

    targetHtml += `
      <div class="dnd-dropzone bg-white dark:bg-gray-800 p-2 md:p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all duration-200 relative min-h-[60px] flex flex-col" data-nric="${t.nric}" ondragover="dndDragOver(event)" ondragenter="dndDragEnter(event)" ondragleave="dndDragLeave(event)" ondrop="dndDrop(event, '${t.nric}')">
        <div class="flex items-center mb-1 pointer-events-none shrink-0 truncate text-ellipsis">
            <span class="font-bold text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded border border-solid ${tDynColor} truncate w-full tracking-tight">${t.name} ${t.role === 'TRAINEE' ? tFam : ''}</span>
        </div>
        <div class="flex flex-wrap flex-grow items-start content-start pointer-events-auto">
          ${pairedPills || '<span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 pointer-events-none mt-1 ml-1">Drop here</span>'}
        </div>
      </div>
    `;
  });
  document.getElementById('dnd-target-list').innerHTML = targetHtml || '<p class="text-[10px] text-gray-400">No targets available.</p>';
}

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
 const familyCounts = {}; globalLogistics.participants.forEach(p => { familyCounts[p.poc] = (familyCounts[p.poc] || 0) + 1; });

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
