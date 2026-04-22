let pairingSyncTimeout = null;

function buildLogisticsUI() {
 document.getElementById('tab-logistics').innerHTML = `
   <div class="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide pb-2">
     <button onclick="switchLogisticsSubTab('pairings')" id="subTab-pairings" class="px-4 py-2 font-semibold border-b-2 border-primary text-primary whitespace-nowrap mb-[-9px] transition">1. Pairings</button>
     <button onclick="switchLogisticsSubTab('pairings-alt')" id="subTab-pairings-alt" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-9px] transition">1. Pairings (Alt)</button>
     <button onclick="switchLogisticsSubTab('rooms')" id="subTab-rooms" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-9px] transition">2. Rooms</button>
     <button onclick="switchLogisticsSubTab('groups')" id="subTab-groups" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-9px] transition">3. Groups</button>
     <button onclick="switchLogisticsSubTab('buses')" id="subTab-buses" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-9px] transition">4. Buses</button>
   </div>
   
   <!-- Standard Pairing UI -->
   <div id="log-pairings" class="space-y-4 pt-2">
     <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
       <div class="flex justify-between items-center mb-2">
         <h3 class="text-lg font-bold text-gray-900 dark:text-white">Trainee - Vol Pairings</h3>
         <button onclick="manualSyncPairings(this)" class="btn-sync-pairings text-xs px-3 py-1.5 rounded font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none">
           <span class="btn-text">Saved</span><div class="btn-spinner ml-2 !w-3 !h-3 hidden-force"></div>
         </button>
       </div>
       <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Tap "+ Add Vol" to assign multiple volunteers per trainee.</p>
       <div class="space-y-3"><h4 class="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-1 text-sm">Unassigned (<span id="unpairedCount">0</span>)</h4><div id="unpairedTraineesList" class="space-y-2"></div></div>
       <div class="space-y-3 mt-6"><h4 class="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-1 text-sm">Paired (<span id="pairedCount">0</span>)</h4><div id="pairedTraineesList" class="space-y-2"></div></div>
     </div>
   </div>

   <!-- Alternative Drag & Drop Pairing UI -->
   <div id="log-pairings-alt" class="hidden-force space-y-4 pt-2">
     <div class="bg-white dark:bg-gray-800 p-3 md:p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
       <div class="flex justify-between items-center mb-2">
         <h3 class="text-base md:text-lg font-bold text-gray-900 dark:text-white">Drag & Drop Pairings</h3>
         <button onclick="manualSyncPairings(this)" class="btn-sync-pairings text-xs px-3 py-1.5 rounded font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none">
           <span class="btn-text">Saved</span><div class="btn-spinner ml-2 !w-3 !h-3 hidden-force"></div>
         </button>
       </div>
       <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Drag available volunteers from the left and drop them onto a trainee's card on the right.</p>
       
       <!-- Side-by-Side Flex Container -->
       <div class="flex flex-row gap-2 md:gap-4 h-[65vh]">
         
         <!-- Volunteer Pool (Left Side: 1/3 width) -->
         <div class="w-1/3 lg:w-1/4 bg-gray-50 dark:bg-gray-900 p-2 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full min-w-0">
           <h4 class="font-bold text-[11px] md:text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2 shrink-0 truncate">Volunteers</h4>
           <div id="dnd-volunteer-pool" class="space-y-2 flex-grow overflow-y-auto pr-1 custom-scrollbar"></div>
         </div>
         
         <!-- Trainee Drop Zones (Right Side: 2/3 width) -->
         <div class="w-2/3 lg:w-3/4 bg-gray-50 dark:bg-gray-900 p-2 md:p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-full min-w-0">
           <h4 class="font-bold text-[11px] md:text-sm text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2 shrink-0 truncate">Trainees</h4>
           <div id="dnd-trainee-list" class="space-y-2 md:space-y-3 flex-grow overflow-y-auto pr-1 custom-scrollbar"></div>
         </div>
         
       </div>
     </div>
   </div>

   <div id="log-rooms" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Room builder in development...</p></div></div>
   <div id="log-groups" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Group builder in development...</p></div></div>
   <div id="log-buses" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Bus Allocation in development...</p></div></div>
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
    btn.className = "btn-sync-pairings text-xs px-3 py-1.5 rounded font-bold transition flex items-center justify-center border shadow-sm focus:outline-none"; 
    spinner.className = "btn-spinner ml-2 !w-3 !h-3 hidden-force"; 
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
   const famBadge = isFam ? `<span class="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ml-1 border border-purple-200 dark:border-purple-800 align-middle inline-block">Fam</span>` : '';
   const dynColor = getProjectColor(t.group);

   let tagsHtml = '';
   tPairings.forEach(pair => {
       const vol = vols.find(v => v.nric === pair.volNric);
       const vDynColor = vol ? getProjectColor(vol.group) : '';
       tagsHtml += `<span class="bg-gray-50 dark:bg-gray-800 text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded-md font-medium flex items-center mb-1 mr-1 shadow-sm text-gray-800 dark:text-gray-200">
           <span class="${vDynColor} px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">${vol ? vol.name : 'Unknown'}</span>
           <button onclick="unpairTrainee('${t.nric}', '${pair.volNric}')" class="ml-1.5 text-gray-400 hover:text-red-500 font-bold focus:outline-none text-base leading-none">&times;</button>
       </span>`;
   });

   const cardHtml = `<div class="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-2 transition">
         <div class="flex justify-between items-start mb-2"><div class="flex items-center"><span class="font-bold text-sm px-2 py-0.5 rounded border ${dynColor}">${t.name}</span>${famBadge}</div><button onclick="openPairingSheet('${t.nric}')" class="text-xs bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold px-2 py-1 rounded-md border border-blue-200 dark:border-gray-600 hover:bg-blue-100 transition whitespace-nowrap focus:outline-none">+ Vol</button></div>
         <div class="flex flex-wrap mt-2 min-h-[26px]">${tagsHtml || '<span class="text-xs font-medium text-gray-400">Unassigned</span>'}</div></div>`;

   if(tPairings.length > 0) { pCount++; pairedHtml += cardHtml; } else { uCount++; unpairedHtml += cardHtml; }
 });

 document.getElementById('unpairedCount').textContent = uCount; document.getElementById('pairedCount').textContent = pCount;
 document.getElementById('unpairedTraineesList').innerHTML = unpairedHtml || '<p class="text-xs text-gray-400">All trainees paired!</p>';
 document.getElementById('pairedTraineesList').innerHTML = pairedHtml || '<p class="text-xs text-gray-400">No pairings yet.</p>';
 
 // Simultaneously update the Alt UI
 renderPairingsAlt();
}

// === DRAG AND DROP (ALT) UI LOGIC ===

function renderPairingsAlt() {
  if(!globalLogistics || !document.getElementById('dnd-volunteer-pool')) return;
  const trainees = globalLogistics.participants.filter(p => p.role === 'TRAINEE');
  const vols = globalLogistics.participants.filter(p => p.role === 'VOLUNTEER');
  const pairings = globalLogistics.pairings ||[];
  
  // Render Volunteer Pool
  let volHtml = '';
  vols.forEach(v => {
    const vDynColor = getProjectColor(v.group);
    const assignmentCount = pairings.filter(p => p.volNric === v.nric).length;
    const badgeHtml = assignmentCount > 0 ? `<span class="text-[9px] md:text-[10px] font-bold text-white bg-green-500 px-1.5 py-0.5 rounded-full ml-1 md:ml-2">${assignmentCount}</span>` : '';
    
    volHtml += `
      <div draggable="true" ondragstart="dndDragStart(event, '${v.nric}')" class="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-gray-800 p-2 md:p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-primary dark:hover:border-primary transition select-none overflow-hidden gap-1">
        <span class="font-bold text-[10px] md:text-sm px-1.5 md:px-2 py-0.5 rounded border ${vDynColor} pointer-events-none truncate max-w-full">${v.name}</span>
        <div class="pointer-events-none flex items-center shrink-0">
          ${badgeHtml}
          <span class="text-gray-300 dark:text-gray-600 ml-1 hidden sm:inline-block">⋮⋮</span>
        </div>
      </div>
    `;
  });
  document.getElementById('dnd-volunteer-pool').innerHTML = volHtml || '<p class="text-xs text-gray-400">No volunteers available.</p>';

  // Render Trainee Drop Zones
  let traineeHtml = '';
  trainees.forEach(t => {
    const tDynColor = getProjectColor(t.group);
    const tPairings = pairings.filter(p => p.traineeNric === t.nric);
    
    let pairedVolsHtml = '';
    tPairings.forEach(pair => {
       const vol = vols.find(v => v.nric === pair.volNric);
       const vDynColor = vol ? getProjectColor(vol.group) : '';
       pairedVolsHtml += `<span class="bg-gray-100 dark:bg-gray-900 text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 border border-gray-200 dark:border-gray-600 rounded font-medium flex items-center shadow-sm text-gray-800 dark:text-gray-200 z-10 relative">
           <span class="${vDynColor} px-1 md:px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600 truncate max-w-[80px] sm:max-w-[120px]">${vol ? vol.name : 'Unknown'}</span>
           <button onclick="unpairTrainee('${t.nric}', '${pair.volNric}')" class="ml-1 text-gray-400 hover:text-red-500 font-bold focus:outline-none text-sm md:text-base leading-none">&times;</button>
       </span>`;
    });

    traineeHtml += `
      <div ondragover="dndDragOver(event)" ondragenter="dndDragEnter(event)" ondragleave="dndDragLeave(event)" ondrop="dndDrop(event, '${t.nric}')" class="bg-white dark:bg-gray-800 p-2 md:p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 transition-all duration-200 relative min-h-[70px] flex flex-col">
        <div class="flex items-center mb-1.5 pointer-events-none shrink-0"><span class="font-bold text-[11px] md:text-sm px-1.5 md:px-2 py-0.5 rounded border border-solid ${tDynColor} truncate max-w-full">${t.name}</span></div>
        <div class="flex flex-wrap gap-1.5 flex-grow items-start content-start">
          ${pairedVolsHtml || '<span class="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500 pointer-events-none mt-1">Drop vol here</span>'}
        </div>
      </div>
    `;
  });
  document.getElementById('dnd-trainee-list').innerHTML = traineeHtml || '<p class="text-xs text-gray-400">No trainees available.</p>';
}

function dndDragStart(e, volNric) {
  e.dataTransfer.setData('text/plain', volNric);
  e.dataTransfer.effectAllowed = 'copy';
}

function dndDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

function dndDragEnter(e) {
  e.preventDefault();
  e.currentTarget.classList.add('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
}

function dndDragLeave(e) {
  e.currentTarget.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
}

function dndDrop(e, traineeNric) {
  e.preventDefault();
  e.currentTarget.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-gray-700', 'dark:border-primary');
  
  const volNric = e.dataTransfer.getData('text/plain');
  if(volNric) {
      if(!globalLogistics.pairings.some(p => p.traineeNric === traineeNric && p.volNric === volNric)) {
          globalLogistics.pairings.push({ traineeNric: traineeNric, volNric: volNric });
          renderPairings(); 
          triggerPairingSync();
      } else {
          showToast("Volunteer is already paired with this Trainee!", true);
      }
  }
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
 const familyCounts = {}; globalLogistics.participants.forEach(p => { familyCounts[p.poc] = (familyCounts[p.poc] || 0) + 1; });

 vols.forEach(v => {
   const volPairs = pairings.filter(p => p.volNric === v.nric);
   if(volPairs.some(p => p.traineeNric === traineeNric)) return; 
   
   let pairedTraineesHtml = '';
   if(volPairs.length > 0) {
       let tNames = volPairs.map(vp => {
           const t = globalLogistics.participants.find(p => p.nric === vp.traineeNric);
           if(t) {
               const isFam = familyCounts[t.poc] > 1; const famBadge = isFam ? `<span class="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-[9px] uppercase font-bold tracking-wider px-1 py-0 rounded border border-purple-200 dark:border-purple-800 ml-1 inline-block align-middle">Fam</span>` : '';
               const dynColor = getProjectColor(t.group); return `<span class="inline-block px-1.5 py-0.5 border border-gray-200 dark:border-gray-600 rounded text-xs font-medium mr-1 mb-1 ${dynColor}">${t.name}${famBadge}</span>`;
           } return '';
       }).join('');
       pairedTraineesHtml = `<div class="mt-1 text-[11px] text-gray-500 dark:text-gray-400 font-medium border-t border-gray-100 dark:border-gray-700 pt-1 w-full">Paired with: <br>${tNames}</div>`;
   }
   const vDynColor = getProjectColor(v.group);
   html += `<div onclick="confirmPairing('${v.nric}')" class="flex flex-col bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition mb-2">
       <div class="flex justify-between items-center w-full"><span class="font-bold text-sm px-2 py-0.5 rounded border ${vDynColor}">${v.name}</span><span class="text-[10px] font-semibold text-green-600 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-1.5 py-0.5 rounded">Volunteer</span></div>
       ${pairedTraineesHtml}
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