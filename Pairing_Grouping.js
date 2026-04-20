let pairingSyncTimeout = null;

function buildLogisticsUI() {
 document.getElementById('tab-logistics').innerHTML = `
   <div class="flex overflow-x-auto border-b-2 border-gray-300 dark:border-gray-700 scrollbar-hide pb-2">
     <button onclick="switchLogisticsSubTab('pairings')" id="subTab-pairings" class="px-4 py-2 font-extrabold border-b-4 border-primary text-primary whitespace-nowrap mb-[-10px] transition">1. Pairings</button>
     <button onclick="switchLogisticsSubTab('rooms')" id="subTab-rooms" class="px-4 py-2 font-extrabold border-b-4 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-10px] transition">2. Rooms</button>
     <button onclick="switchLogisticsSubTab('groups')" id="subTab-groups" class="px-4 py-2 font-extrabold border-b-4 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-10px] transition">3. Groups</button>
     <button onclick="switchLogisticsSubTab('buses')" id="subTab-buses" class="px-4 py-2 font-extrabold border-b-4 border-transparent text-gray-500 dark:text-gray-400 whitespace-nowrap mb-[-10px] transition">4. Buses</button>
   </div>
   
   <div id="log-pairings" class="space-y-4 pt-2">
     <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-700">
       <div class="flex justify-between items-center mb-2">
         <h3 class="text-xl font-bold text-gray-900 dark:text-white">Volunteer - Trainee Pairings</h3>
         <button id="btnSyncPairings" onclick="manualSyncPairings(this)" class="text-xs px-3 py-1.5 rounded font-extrabold transition flex items-center justify-center border-2 shadow-sm bg-green-100 text-green-800 border-green-400 dark:bg-green-900 dark:text-green-300 dark:border-green-700">
           <span class="btn-text">Saved</span><div class="btn-spinner ml-2 !w-3 !h-3 border-2 hidden-force"></div>
         </button>
       </div>
       <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">Tap "+ Add Vol" to assign multiple volunteers per trainee.</p>
       <div class="space-y-3"><h4 class="font-extrabold text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700 pb-1">Unassigned Trainees (<span id="unpairedCount">0</span>)</h4><div id="unpairedTraineesList" class="space-y-2"></div></div>
       <div class="space-y-3 mt-6"><h4 class="font-extrabold text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700 pb-1">Paired Trainees (<span id="pairedCount">0</span>)</h4><div id="pairedTraineesList" class="space-y-2"></div></div>
     </div>
   </div>
   <div id="log-rooms" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-t-8 border-gray-300 dark:border-gray-700 border-t-primary"><h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">1. Define Room Configurations</h3><p class="text-gray-500 dark:text-gray-400">In Development...</p></div></div>
   <div id="log-groups" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-t-8 border-gray-300 dark:border-gray-700 border-t-purple-500 text-center"><h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Smart Group Generator</h3><button class="w-full bg-purple-600 text-white font-extrabold py-3 rounded-lg shadow border-2 border-purple-800 hover:bg-purple-700">✨ Generate Proposed Groups</button></div></div>
   <div id="log-buses" class="hidden-force space-y-4"><div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-700"><h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white">Bus Allocation</h3><p class="text-gray-500 dark:text-gray-400">In Development...</p></div></div>
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
  btn.className = "text-xs px-3 py-1.5 rounded font-extrabold transition flex items-center justify-center border-2 shadow-sm"; 
  spinner.className = "btn-spinner ml-2 !w-3 !h-3 border-2 hidden-force"; 
  if(state === 'saving') { btn.classList.add('bg-yellow-100', 'text-yellow-800', 'border-yellow-400', 'dark:bg-yellow-900', 'dark:text-yellow-300', 'dark:border-yellow-700'); textSpan.textContent = "Saving..."; spinner.classList.remove('hidden-force'); spinner.classList.add('spinner-yellow'); btn.disabled = true; } 
  else if (state === 'saved') { btn.classList.add('bg-green-100', 'text-green-800', 'border-green-400', 'dark:bg-green-900', 'dark:text-green-300', 'dark:border-green-700'); textSpan.textContent = "Saved"; btn.disabled = false; } 
  else if (state === 'error') { btn.classList.add('bg-red-100', 'text-red-800', 'border-red-400', 'dark:bg-red-900', 'dark:text-red-300', 'dark:border-red-700'); textSpan.textContent = "Save Failed"; btn.disabled = false; }
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
   const famBadge = isFam ? `<span class="bg-purple-100 text-purple-800 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ml-2 border border-purple-300 align-middle inline-block">Fam</span>` : '';
   const dynColor = getProjectColor(t.group);

   let tagsHtml = '';
   tPairings.forEach(pair => {
       const vol = vols.find(v => v.nric === pair.volNric);
       const vDynColor = vol ? getProjectColor(vol.group) : '';
       tagsHtml += `<span class="bg-gray-100 dark:bg-gray-800 text-xs px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md font-bold flex items-center mb-1 mr-1 shadow-sm text-gray-800 dark:text-gray-200">
           <span class="${vDynColor} px-2 py-0.5 rounded border-2 border-gray-300 dark:border-gray-600">${vol ? vol.name : 'Unknown'}</span>
           <button onclick="unpairTrainee('${t.nric}', '${pair.volNric}')" class="ml-2 text-red-500 hover:text-red-700 font-extrabold focus:outline-none text-base leading-none">&times;</button>
       </span>`;
   });

   const cardHtml = `<div class="bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm mb-3 transition">
         <div class="flex justify-between items-start mb-2"><div class="flex items-center"><span class="font-extrabold text-lg px-2 py-1 rounded-md border-2 ${dynColor}">${t.name}</span>${famBadge}</div><button onclick="openPairingSheet('${t.nric}')" class="text-xs bg-blue-100 text-blue-700 font-extrabold px-3 py-1.5 rounded-lg border-2 border-blue-300 hover:bg-blue-200 transition whitespace-nowrap">+ Add Vol</button></div>
         <div class="flex flex-wrap mt-2 min-h-[28px]">${tagsHtml || '<span class="text-sm font-bold text-red-500">Unassigned</span>'}</div></div>`;

   if(tPairings.length > 0) { pCount++; pairedHtml += cardHtml; } else { uCount++; unpairedHtml += cardHtml; }
 });

 document.getElementById('unpairedCount').textContent = uCount; document.getElementById('pairedCount').textContent = pCount;
 document.getElementById('unpairedTraineesList').innerHTML = unpairedHtml || '<p class="text-sm font-bold text-gray-500 dark:text-gray-400">All trainees paired!</p>';
 document.getElementById('pairedTraineesList').innerHTML = pairedHtml || '<p class="text-sm font-bold text-gray-500 dark:text-gray-400">No pairings yet.</p>';
}

function openPairingSheet(traineeNric) {
 currentPairingTarget = traineeNric; 
 
 const targetTrainee = globalLogistics.participants.find(p => p.nric === traineeNric);
 let titleHtml = "Select Volunteer";
 if (targetTrainee) {
   const dynColor = getProjectColor(targetTrainee.group);
   titleHtml = `Pair Volunteer with <span class="ml-2 font-bold text-sm px-2 py-0.5 rounded border-2 ${dynColor}">${targetTrainee.name}</span>`;
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
               const isFam = familyCounts[t.poc] > 1; const famBadge = isFam ? `<span class="bg-purple-100 text-purple-800 text-[10px] uppercase font-bold tracking-wider px-1 py-0 rounded border border-purple-300 ml-1 inline-block align-middle">Fam</span>` : '';
               const dynColor = getProjectColor(t.group); return `<span class="inline-block px-2 py-0.5 border-2 border-gray-300 dark:border-gray-600 rounded-md text-xs font-bold mr-1 mb-1 ${dynColor}">${t.name}${famBadge}</span>`;
           } return '';
       }).join('');
       pairedTraineesHtml = `<div class="mt-2 text-xs text-gray-500 dark:text-gray-400 font-medium border-t-2 border-gray-200 dark:border-gray-600 pt-2 w-full">Already paired with: <br>${tNames}</div>`;
   }
   const vDynColor = getProjectColor(v.group);
   html += `<div onclick="confirmPairing('${v.nric}')" class="flex flex-col bg-white dark:bg-gray-700 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-600 transition mb-2">
       <div class="flex justify-between items-center w-full"><span class="font-extrabold text-lg px-2 py-1 rounded-md border-2 ${vDynColor}">${v.name}</span><span class="text-xs font-bold text-green-600 border border-green-600 px-2 py-0.5 rounded-full">Volunteer</span></div>
       ${pairedTraineesHtml}
     </div>`;
 });
 document.getElementById('sheetListContainer').innerHTML = html || '<p class="font-bold text-gray-500 dark:text-gray-400 p-2">No available volunteers to add.</p>';
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