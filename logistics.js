let pairingSyncTimeout = null;

function buildLogisticsUI() {
 document.getElementById('tab-logistics').innerHTML = `
   <div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-200">
     <button onclick="switchLogisticsSubTab('pairings')" id="subTab-pairings" class="px-4 py-2 font-semibold border-b-2 border-primary text-primary whitespace-nowrap mb-[-9px] transition">1. Pairings</button>
     <button onclick="switchLogisticsSubTab('rooms')" id="subTab-rooms" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 whitespace-nowrap mb-[-9px] transition">2. Rooms</button>
     <button onclick="switchLogisticsSubTab('groups')" id="subTab-groups" class="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-500 whitespace-nowrap mb-[-9px] transition">3. Groups</button>
   </div>
   
   <div id="log-pairings" class="space-y-4 pt-2">
     <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
       <div class="flex justify-between items-center mb-2">
         <h3 class="text-lg font-bold">Volunteer Pairings</h3>
         <button id="btnSyncPairings" onclick="manualSyncPairings(this)" class="text-xs px-3 py-1.5 rounded-md font-bold transition flex items-center bg-green-100 text-green-800 border border-green-400 shadow-sm">
           <span class="btn-text">Saved</span><div class="btn-spinner spinner-primary hidden-force ml-2 !w-3 !h-3"></div>
         </button>
       </div>
       <p class="text-xs text-gray-500 mb-4">Tap "+ Add Vol" to assign multiple volunteers per trainee.</p>
       <div class="space-y-3"><h4 class="font-bold text-gray-800 border-b border-gray-100 pb-1 text-sm">Unassigned Trainees (<span id="unpairedCount">0</span>)</h4><div id="unpairedTraineesList" class="space-y-2"></div></div>
       <div class="space-y-3 mt-6"><h4 class="font-bold text-gray-800 border-b border-gray-100 pb-1 text-sm">Paired Trainees (<span id="pairedCount">0</span>)</h4><div id="pairedTraineesList" class="space-y-2"></div></div>
     </div>
   </div>
   <div id="log-rooms" class="hidden-force space-y-4"><div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"><p class="text-sm text-gray-500">Room builder in development...</p></div></div>
   <div id="log-groups" class="hidden-force space-y-4"><div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"><p class="text-sm text-gray-500">Group builder in development...</p></div></div>
 `;
}

function switchLogisticsSubTab(tabId) {['pairings', 'rooms', 'groups'].forEach(id => { 
   document.getElementById(`log-${id}`).classList.add('hidden-force'); 
   const btn = document.getElementById(`subTab-${id}`); 
   if(btn) { btn.classList.remove('border-primary', 'text-primary'); btn.classList.add('border-transparent', 'text-gray-500'); } 
 }); 
 document.getElementById(`log-${tabId}`).classList.remove('hidden-force'); 
 const targetBtn = document.getElementById(`subTab-${tabId}`); 
 if(targetBtn) { targetBtn.classList.remove('border-transparent', 'text-gray-500'); targetBtn.classList.add('border-primary', 'text-primary'); } 
}

async function loadLogisticsData() { 
 try { const res = await callBackend('fetchLogistics'); globalLogistics = res; renderPairings(); } catch(e) { showToast("Failed to load logistics.", true); } 
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
   const famBadge = isFam ? `<span class="bg-purple-100 text-purple-800 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-purple-200 align-middle inline-block ml-1">Fam</span>` : '';
   const dynColor = getProjectColor(t.group);

   let tagsHtml = '';
   tPairings.forEach(pair => {
       const vol = vols.find(v => v.nric === pair.volNric);
       const vDynColor = vol ? getProjectColor(vol.group) : '';
       tagsHtml += `<span class="text-xs px-2 py-1 border rounded-md font-medium flex items-center mb-1 mr-1 shadow-sm ${vDynColor}">
           ${vol ? vol.name : 'Unknown'} 
           <button onclick="unpairTrainee('${t.nric}', '${pair.volNric}')" class="ml-1.5 text-gray-500 hover:text-red-600 font-bold focus:outline-none">&times;</button>
       </span>`;
   });

   const cardHtml = `<div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-2 transition hover:border-gray-300">
         <div class="flex justify-between items-start mb-2"><div class="flex items-center flex-wrap gap-1"><span class="font-bold text-sm px-2 py-0.5 rounded border ${dynColor}">${t.name}</span>${famBadge}</div><button onclick="openPairingSheet('${t.nric}')" class="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded-md border border-blue-200 hover:bg-blue-100 transition whitespace-nowrap">+ Vol</button></div>
         <div class="flex flex-wrap mt-2 min-h-[26px]">${tagsHtml || '<span class="text-xs font-medium text-gray-400">Unassigned</span>'}</div></div>`;

   if(tPairings.length > 0) { pCount++; pairedHtml += cardHtml; } else { uCount++; unpairedHtml += cardHtml; }
 });

 document.getElementById('unpairedCount').textContent = uCount; document.getElementById('pairedCount').textContent = pCount;
 document.getElementById('unpairedTraineesList').innerHTML = unpairedHtml || '<p class="text-xs text-gray-400">All trainees paired!</p>';
 document.getElementById('pairedTraineesList').innerHTML = pairedHtml || '<p class="text-xs text-gray-400">No pairings yet.</p>';
}

function openPairingSheet(traineeNric) {
 currentPairingTarget = traineeNric; document.getElementById('sheetTitle').textContent = "Select Volunteer"; document.getElementById('selectionBottomSheet').classList.remove('hidden-force');
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
               const isFam = familyCounts[t.poc] > 1; const famBadge = isFam ? `<span class="bg-purple-100 text-purple-800 text-[9px] uppercase font-bold px-1 py-0 rounded border border-purple-200 inline-block align-middle ml-0.5">Fam</span>` : '';
               const dynColor = getProjectColor(t.group); return `<span class="inline-block px-1.5 py-0.5 border rounded text-[10px] font-medium mr-1 mb-1 ${dynColor}">${t.name}${famBadge}</span>`;
           } return '';
       }).join('');
       pairedTraineesHtml = `<div class="mt-1 text-[11px] text-gray-400 border-t border-gray-100 pt-1 w-full leading-tight">Already paired with: <br>${tNames}</div>`;
   }
   const vDynColor = getProjectColor(v.group);
   html += `<div onclick="confirmPairing('${v.nric}')" class="flex flex-col bg-white p-3 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-blue-50 transition mb-2">
       <div class="flex justify-between items-center w-full"><span class="font-bold text-sm px-2 py-0.5 rounded border ${vDynColor}">${v.name}</span><span class="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Volunteer</span></div>
       ${pairedTraineesHtml}
     </div>`;
 });
 document.getElementById('sheetListContainer').innerHTML = html || '<p class="text-sm text-gray-400 p-2">No available volunteers.</p>';
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