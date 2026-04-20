let pairingSyncTimeout = null;

function buildLogisticsUI() {
 document.getElementById('tab-logistics').innerHTML = `
   <div class="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 scrollbar-hide pb-2">
     <button onclick="switchLogisticsSubTab('pairings')" id="subTab-pairings" class="px-4 py-2 font-semibold border-b-2 border-primary text-primary whitespace-nowrap mb-[-9px] transition">1. Pairings</button>
     <button onclick="switchLogisticsSubTab('rooms')" id="subTab-rooms" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-9px] transition">2. Rooms</button>
     <button onclick="switchLogisticsSubTab('groups')" id="subTab-groups" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-9px] transition">3. Groups</button>
     <button onclick="switchLogisticsSubTab('buses')" id="subTab-buses" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-9px] transition">4. Buses</button>
   </div>
   
   <div id="log-pairings" class="space-y-4 pt-2">
     <div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
       <div class="flex justify-between items-center mb-2">
         <h3 class="text-lg font-bold text-gray-900 dark:text-white">Volunteer Pairings</h3>
         <button id="btnSyncPairings" onclick="manualSyncPairings(this)" class="text-xs px-3 py-1.5 rounded font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
           <span class="btn-text">Saved</span><div class="btn-spinner ml-2 !w-3 !h-3 hidden-force"></div>
         </button>
       </div>
       <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">Tap "+ Add Vol" to assign multiple volunteers per trainee.</p>
       <div class="space-y-3"><h4 class="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-1 text-sm">Unassigned (<span id="unpairedCount">0</span>)</h4><div id="unpairedTraineesList" class="space-y-2"></div></div>
       <div class="space-y-3 mt-6"><h4 class="font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 pb-1 text-sm">Paired (<span id="pairedCount">0</span>)</h4><div id="pairedTraineesList" class="space-y-2"></div></div>
     </div>
   </div>
   <div id="log-rooms" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Room builder in development...</p></div></div>
   <div id="log-groups" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Group builder in development...</p></div></div>
   <div id="log-buses" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"><p class="text-sm text-gray-500 dark:text-gray-400">Bus Allocation in development...</p></div></div>
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
 try { const res = await callBackend('fetchLogistics'); globalLogistics = res; renderPairings(); } catch(e) { showToast("Failed to load logistics.", true); } 
}

function setSyncButtonState(state) {
  const btn = document.getElementById('btnSyncPairings'); if(!btn) return;
  const textSpan = btn.querySelector('.btn-text'); const spinner = btn.querySelector('.btn-spinner');
  btn.className = "text-xs px-3 py-1.5 rounded font-bold transition flex items-center justify-center border shadow-sm"; 
  spinner.className = "btn-spinner ml-2 !w-3 !h-3 hidden-force"; 
  if(state === 'saving') { btn.classList.add('bg-yellow-50', 'text-yellow-700', 'border-yellow-200', 'dark:bg-yellow-900/30', 'dark:text-yellow-300', 'dark:border-yellow-800'); textSpan.textContent = "Saving..."; spinner.classList.remove('hidden-force'); spinner.classList.add('spinner-yellow'); btn.disabled = true; } 
  else if (state === 'saved') { btn.classList.add('bg-green-50', 'text-green-700', 'border-green-200', 'dark:bg-green-900/30', 'dark:text-green-300', 'dark:border-green-800'); textSpan.textContent = "Saved"; btn.disabled = false; } 
  else if (state === 'error') { btn.classList.add('bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/30', 'dark:text-red-300', 'dark:border-red-800'); textSpan.textContent = "Save Failed"; btn.disabled = false; }
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
         <div class="flex justify-between items-start mb-2"><div class="flex items-center"><span class="font-bold text-sm px-2 py-0.5 rounded border ${dynColor}">${t.name}</span>${famBadge}</div><button onclick="openPairingSheet('${t.nric}')" class="text-xs bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold px-2 py-1 rounded-md border border-blue-200 dark:border-gray-600 hover:bg-blue-100 transition whitespace-nowrap">+ Vol</button></div>
         <div class="flex flex-wrap mt-2 min-h-[26px]">${tagsHtml || '<span class="text-xs font-medium text-gray-400">Unassigned</span>'}</div></div>`;

   if(tPairings.length > 0) { pCount++; pairedHtml += cardHtml; } else { uCount++; unpairedHtml += cardHtml; }
 });

 document.getElementById('unpairedCount').textContent = uCount; document.getElementById('pairedCount').textContent = pCount;
 document.getElementById('unpairedTraineesList').innerHTML = unpairedHtml || '<p class="text-xs text-gray-400">All trainees paired!</p>';
 document.getElementById('pairedTraineesList').innerHTML = pairedHtml || '<p class="text-xs text-gray-400">No pairings yet.</p>';
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