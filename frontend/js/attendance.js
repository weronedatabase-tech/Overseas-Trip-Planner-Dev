// ==========================================
// attendance.js - Live Attendance Engine
// ==========================================
// [CONSIDERATION - SPA to MPA Migration]: Utilizes AppCore for state tracking and API calls.
// Background polling drops stale data if AppCore.lastLocalChange is newer than fetch start.

let attendanceState = {}; 
let pendingAttendanceUpdates = new Set();
let attSyncTimeout = null;
let isAttendanceSyncing = false;
let attendancePollInterval = null;

let savedAttJuncture = null;
let savedAttAssignment = 'ALL';

function buildAttendanceUI() {
  document.getElementById('tab-attendance').innerHTML = `
  <div class="admin-only flex flex-col h-full min-h-0 w-full relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">

      <div class="p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0 z-10 flex flex-col gap-3 bg-white dark:bg-zinc-900 relative">
          <div class="flex justify-between items-center">
              <h3 class="text-lg md:text-xl font-black text-zinc-900 dark:text-white tracking-tight">Live Attendance</h3>
              <button id="btn-sync-attendance" onclick="manualSyncAttendance()" class="text-xs md:text-sm px-3 py-1.5 rounded-lg font-bold transition flex items-center justify-center border shadow-sm bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 focus:outline-none shrink-0 transform active:scale-95">
                  <span class="btn-text">Saved</span><div class="btn-spinner ml-1.5 !w-3.5 !h-3.5 hidden-force border-2"></div>
              </button>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="flex gap-2">
                  <div class="relative w-full">
                      <select id="attJunctureSelect" onchange="changeAttendanceContext()" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl font-bold text-sm bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none truncate cursor-pointer transition"></select>
                      <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs"></i>
                  </div>
                  <button onclick="promptNewJuncture()" class="px-4 bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 rounded-xl shadow-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 transition focus:outline-none shrink-0 transform active:scale-95 flex items-center justify-center" title="Add Juncture">
                      <i class="fa-solid fa-plus text-lg"></i>
                  </button>
              </div>
              <div class="relative">
                  <select id="attAssignmentSelect" onchange="renderAttendanceLists()" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl font-bold text-sm bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm appearance-none truncate cursor-pointer transition">
                      <option value="ALL">All Participants</option>
                  </select>
                  <i class="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none text-xs"></i>
              </div>
          </div>
          
          <div class="relative w-full">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-zinc-400 dark:text-zinc-500"></i>
              <input type="text" id="attSearchInput" oninput="handleAttendanceSearch()" placeholder="Search to mark present..." class="w-full p-3 pl-10 border border-zinc-300 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-black font-bold text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-zinc-900 dark:text-white shadow-sm transition">
              <ul id="attSearchResults" class="absolute z-50 w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl mt-2 max-h-60 overflow-y-auto hidden-force custom-scrollbar"></ul>
          </div>
      </div>

      <div class="flex flex-row flex-1 min-h-0 w-full overflow-hidden relative bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
          
          <div id="attLoadingOverlay" class="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm z-[50] hidden-force flex flex-col justify-center items-center">
              <div class="loader !w-10 !h-10 border-primary mb-3"></div>
              <span class="text-primary dark:text-blue-400 font-bold text-xs tracking-wide shadow-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 rounded-full">Loading...</span>
          </div>
          
          <div class="flex-1 min-w-0 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-red-50/30 dark:bg-red-900/10">
              <h4 class="font-black text-xs py-2.5 shrink-0 text-center uppercase tracking-widest bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-red-200 dark:border-red-800">Not Checked (<span id="attNotCheckedCount">0</span>)</h4>
              <div id="attNotCheckedList" class="flex-grow overflow-y-auto p-2 md:p-3 custom-scrollbar pb-10 space-y-2 md:space-y-3"></div>
          </div>
          
          <div class="flex-1 min-w-0 flex flex-col bg-green-50/30 dark:bg-green-900/10">
              <h4 class="font-black text-xs py-2.5 shrink-0 text-center uppercase tracking-widest bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] border-b border-green-200 dark:border-green-800">Checked (<span id="attCheckedCount">0</span>)</h4>
              <div id="attCheckedList" class="flex-grow overflow-y-auto p-2 md:p-3 custom-scrollbar pb-10 space-y-2 md:space-y-3"></div>
          </div>
      </div>

  </div>`;

  document.addEventListener('click', (e) => {
      const results = document.getElementById('attSearchResults');
      const input = document.getElementById('attSearchInput');
      if(results && !results.classList.contains('hidden-force') && e.target !== input && !results.contains(e.target)) {
          results.classList.add('hidden-force');
      }
  });
}

async function promptNewJuncture() {
  const name = prompt("Enter new juncture name (e.g. Day 2: Morning):");
  if(!name || !name.trim()) return;
  
  const overlay = document.getElementById('attLoadingOverlay');
  if (overlay) overlay.classList.remove('hidden-force');
  setAttSyncButtonState('loading');
  
  try {
      const res = await AppCore.apiFetch('modifyJunctures', { actionType: 'add', newName: name.trim() });
      AppCore.appSettings.junctures = res.junctures;
      localStorage.setItem('appSettings', JSON.stringify(AppCore.appSettings));
      
      const juncSel = document.getElementById('attJunctureSelect');
      juncSel.innerHTML = '';
      AppCore.appSettings.junctures.forEach(j => juncSel.innerHTML += `<option value="${j}">${j}</option>`);
      juncSel.value = name.trim();
      savedAttJuncture = name.trim();
      
      AppCore.showToast("Juncture added.");
      await changeAttendanceContext();
  } catch(e) {
      AppCore.showToast(e.message, true);
      setAttSyncButtonState('error');
  } finally {
      if (overlay) overlay.classList.add('hidden-force');
  }
}

async function renderAttendanceChecklist() {
  if(!document.getElementById('attJunctureSelect')) return;

  const juncSel = document.getElementById('attJunctureSelect');
  juncSel.innerHTML = '';
  if(AppCore.appSettings && AppCore.appSettings.junctures && AppCore.appSettings.junctures.length > 0) {
      AppCore.appSettings.junctures.forEach(j => juncSel.innerHTML += `<option value="${j}">${j}</option>`);
  } else {
      juncSel.innerHTML = `<option value="">No Junctures Defined</option>`;
  }

  if(savedAttJuncture && AppCore.appSettings.junctures && AppCore.appSettings.junctures.includes(savedAttJuncture)) {
      juncSel.value = savedAttJuncture;
  }

  const asgnSel = document.getElementById('attAssignmentSelect');
  asgnSel.innerHTML = `<option value="ALL">All Participants</option>`;
  if(AppCore.appSettings && AppCore.appSettings.activeProjects && AppCore.appSettings.activeProjects.length > 0) {
      AppCore.appSettings.activeProjects.forEach(g => asgnSel.innerHTML += `<option value="${g}">${g}</option>`);
  }

  if(savedAttAssignment && (savedAttAssignment === 'ALL' || (AppCore.appSettings.activeProjects && AppCore.appSettings.activeProjects.includes(savedAttAssignment)))) {
      asgnSel.value = savedAttAssignment;
  }

  await changeAttendanceContext();
}

async function changeAttendanceContext() {
  const juncture = document.getElementById('attJunctureSelect').value;
  savedAttJuncture = juncture;

  if(!juncture) {
      attendanceState = {};
      renderAttendanceLists();
      return;
  }

  const overlay = document.getElementById('attLoadingOverlay');
  if (overlay) overlay.classList.remove('hidden-force');
  setAttSyncButtonState('loading');

  try {
      const res = await AppCore.apiFetch('fetchAttendanceData', { juncture });
      attendanceState = res.data || {};
      renderAttendanceLists();
      setAttSyncButtonState('saved');
      startAttendancePolling();
  } catch(e) {
      AppCore.showToast("Failed to load attendance", true);
      setAttSyncButtonState('error');
  } finally {
      if (overlay) overlay.classList.add('hidden-force');
  }
}

function renderAttendanceLists() {
  const assignmentEl = document.getElementById('attAssignmentSelect');
  if(assignmentEl) savedAttAssignment = assignmentEl.value;
  const assignment = savedAttAssignment;

  const notCheckedList = document.getElementById('attNotCheckedList');
  const checkedList = document.getElementById('attCheckedList');
  if(!notCheckedList || !checkedList) return;

  if(!window.globalLogistics) {
      notCheckedList.innerHTML = '<div class="flex justify-center p-6"><div class="loader !w-6 !h-6 border-zinc-400"></div></div>';
      checkedList.innerHTML = '<div class="flex justify-center p-6"><div class="loader !w-6 !h-6 border-zinc-400"></div></div>';
      return;
  }

  let notCheckedHtml = '';
  let checkedHtml = '';
  let notCheckedCount = 0;
  let checkedCount = 0;

  const participants = window.globalLogistics.participants.filter(p => assignment === 'ALL' || p.group === assignment);

  participants.forEach(p => {
      const stateObj = attendanceState[p.nric];
      const isChecked = stateObj ? stateObj.status : false;
      const cardHtml = generateAttCard(p, isChecked);

      if(isChecked) { checkedHtml += cardHtml; checkedCount++; } 
      else { notCheckedHtml += cardHtml; notCheckedCount++; }
  });

  notCheckedList.innerHTML = notCheckedHtml || '<div class="text-center py-6 text-zinc-400 dark:text-zinc-500 font-bold text-xs uppercase tracking-widest"><i class="fa-solid fa-ghost text-2xl mb-2 opacity-50 block"></i>Empty</div>';
  checkedList.innerHTML = checkedHtml || '<div class="text-center py-6 text-zinc-400 dark:text-zinc-500 font-bold text-xs uppercase tracking-widest"><i class="fa-solid fa-ghost text-2xl mb-2 opacity-50 block"></i>Empty</div>';
  document.getElementById('attNotCheckedCount').textContent = notCheckedCount;
  document.getElementById('attCheckedCount').textContent = checkedCount;
}

function generateAttCard(p, isChecked) {
  const dynColor = typeof window.getProjectColor === 'function' ? window.getProjectColor(p.group) : 'bg-zinc-100 border-zinc-300 text-zinc-900 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-100';
  const roleColor = p.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (p.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');

  return `
  <div id="att-card-${p.nric}" class="relative bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 flex items-center justify-between gap-2 select-none active:scale-95 cursor-pointer hover:border-primary dark:hover:border-primary" onclick="toggleAttendanceStatus('${p.nric}', ${!isChecked})">
      <div class="flex items-start min-w-0 flex-1">
          <div class="flex flex-col min-w-0 flex-1 gap-1.5">
              <span class="font-extrabold text-xs md:text-sm px-2.5 py-1 rounded-md border shadow-sm ${dynColor} max-w-full break-words whitespace-normal leading-tight text-left">${p.displayName || p.name}</span>
              <span class="text-[9px] font-black ${roleColor} w-max bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 uppercase tracking-widest shadow-sm">${p.role.substring(0,3).toUpperCase()}</span>
          </div>
      </div>
      <div class="shrink-0 flex items-center justify-center pl-2">
         <div class="w-6 h-6 rounded-md flex items-center justify-center border transition-colors shadow-sm ${isChecked ? 'bg-green-500 border-green-600 text-white shadow-inner' : 'bg-zinc-50 border-zinc-300 dark:bg-black dark:border-zinc-700 text-transparent'}">
             <i class="fa-solid fa-check text-sm"></i>
         </div>
      </div>
  </div>`;
}

function handleAttendanceSearch() {
  const query = document.getElementById('attSearchInput').value.toLowerCase().trim();
  const resultsContainer = document.getElementById('attSearchResults');
  if(!query) { resultsContainer.classList.add('hidden-force'); return; }

  const assignment = document.getElementById('attAssignmentSelect').value;
  const participants = window.globalLogistics.participants.filter(p => {
      if(assignment !== 'ALL' && p.group !== assignment) return false;
      return (p.displayName || p.name || '').toLowerCase().includes(query);
  });

  resultsContainer.innerHTML = participants.map(p => {
      const isChecked = attendanceState[p.nric] ? attendanceState[p.nric].status : false;
      const dynColor = typeof window.getProjectColor === 'function' ? window.getProjectColor(p.group) : 'bg-zinc-100';
      return `
      <li class="px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 cursor-pointer flex justify-between items-center border-b border-zinc-100 dark:border-zinc-700 transition last:border-0" onclick="selectFromSearch('${p.nric}')">
         <span class="font-bold text-xs md:text-sm ${dynColor} px-2 py-1 rounded-lg border max-w-[70%] break-words shadow-sm">${p.displayName || p.name}</span>
         ${isChecked ? '<span class="text-[9px] bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded shadow-sm font-black uppercase tracking-wider">Checked</span>' : '<span class="text-[9px] bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded shadow-sm font-black uppercase tracking-wider">NOT Checked</span>'}
      </li>`;
  }).join('') || '<li class="px-4 py-3 text-xs font-bold text-zinc-500 dark:text-zinc-400 text-center"><i class="fa-solid fa-ghost mr-1 opacity-50"></i> No matches found.</li>';
  resultsContainer.classList.remove('hidden-force');
}

function selectFromSearch(nric) {
  document.getElementById('attSearchInput').value = '';
  document.getElementById('attSearchResults').classList.add('hidden-force');
  toggleAttendanceStatus(nric, true);
}

function toggleAttendanceStatus(nric, forceState) {
  AppCore.trackMutation();
  attendanceState[nric] = { status: forceState, ts: Date.now() }; 
  pendingAttendanceUpdates.add(nric);
  renderAttendanceLists();

  if (attSyncTimeout) clearTimeout(attSyncTimeout);
  attSyncTimeout = setTimeout(() => { executeAttendanceSync(); }, 800);

  setTimeout(() => {
      const card = document.getElementById(`att-card-${nric}`);
      if(card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const ringColor = forceState ? 'ring-green-400' : 'ring-red-400';
          const bgColor = forceState ? 'bg-green-50 dark:bg-green-900/50' : 'bg-red-50 dark:bg-red-900/50';
          card.classList.add('ring-2', ringColor, 'scale-[1.02]');
          card.className += ` ${bgColor}`;
          setTimeout(() => {
              card.classList.remove('ring-2', ringColor, 'scale-[1.02]');
              card.className = card.className.replace(` ${bgColor}`, '');
          }, 800);
      }
  }, 50);
}

async function executeAttendanceSync() {
  if(pendingAttendanceUpdates.size === 0) return;
  const juncture = document.getElementById('attJunctureSelect').value;
  if(!juncture) return;

  isAttendanceSyncing = true;
  setAttSyncButtonState('saving');

  const batch = new Set(pendingAttendanceUpdates);
  pendingAttendanceUpdates.clear();

  const updates = Array.from(batch).map(nric => ({
      nric: nric,
      status: attendanceState[nric]?.status || false,
      ts: attendanceState[nric]?.ts || Date.now()
  }));

  try {
      await AppCore.apiFetch('syncAttendanceUpdate', { 
          juncture: juncture, 
          updates: updates, 
          takenBy: AppCore.currentUser?.name || 'User' 
      });
      setAttSyncButtonState('saved');
  } catch(e) {
      AppCore.showToast("Sync failed. Retrying...", true);
      setAttSyncButtonState('error');
      batch.forEach(nric => pendingAttendanceUpdates.add(nric));
  } finally {
      isAttendanceSyncing = false;
  }
}

async function manualSyncAttendance() {
  if(pendingAttendanceUpdates.size > 0) await executeAttendanceSync();
  setAttSyncButtonState('loading');
  try {
      const juncture = document.getElementById('attJunctureSelect').value;
      if(juncture) {
          const res = await AppCore.apiFetch('fetchAttendanceData', { juncture });
          const remoteData = res.data || {};
          window.globalLogistics.participants.forEach(p => {
              const rEntry = remoteData[p.nric] || { status: false, ts: 0 };
              const lEntry = attendanceState[p.nric] || { status: false, ts: 0 };
              if(rEntry.ts > lEntry.ts && !pendingAttendanceUpdates.has(p.nric)) {
                  attendanceState[p.nric] = { status: rEntry.status, ts: rEntry.ts };
              }
          });
          renderAttendanceLists();
      }
      setAttSyncButtonState('saved');
      AppCore.showToast("Refreshed from server!");
  } catch(e) {
      setAttSyncButtonState('error');
  }
}

function startAttendancePolling() {
  if(attendancePollInterval) clearInterval(attendancePollInterval);
  attendancePollInterval = setInterval(async () => {
      if(isAttendanceSyncing) return;
      const juncture = document.getElementById('attJunctureSelect').value;
      if(!juncture) return;

      try {
          const res = await AppCore.apiFetch('fetchAttendanceData', { juncture }, true);
          if(!res || !res.data) return;
          const remoteData = res.data || {};
          let hasChanges = false;
          
          window.globalLogistics.participants.forEach(p => {
              const rEntry = remoteData[p.nric] || { status: false, ts: 0 };
              const lEntry = attendanceState[p.nric] || { status: false, ts: 0 };
              if(rEntry.ts > lEntry.ts && !pendingAttendanceUpdates.has(p.nric)) {
                  attendanceState[p.nric] = { status: rEntry.status, ts: rEntry.ts };
                  hasChanges = true;
              }
          });

          if(hasChanges) {
              renderAttendanceLists();
              const searchInput = document.getElementById('attSearchInput');
              const searchResults = document.getElementById('attSearchResults');
              if (searchInput && searchInput.value && searchResults && !searchResults.classList.contains('hidden-force')) {
                  handleAttendanceSearch();
              }
          }
      } catch(e) { }
  }, 8000);
}

function setAttSyncButtonState(state) {
  const btn = document.getElementById('btn-sync-attendance');
  if(!btn) return;
  const textSpan = btn.querySelector('.btn-text'); const spinner = btn.querySelector('.btn-spinner');
  btn.className = "text-xs md:text-sm px-3 py-1.5 rounded-lg font-bold transition flex items-center justify-center border shadow-sm focus:outline-none shrink-0 transform active:scale-95"; 
  spinner.className = "btn-spinner ml-1.5 !w-3.5 !h-3.5 hidden-force border-2"; 

  if (state === 'loading') { 
      btn.classList.add('bg-zinc-100', 'text-zinc-500', 'border-zinc-200', 'dark:bg-zinc-800', 'dark:text-zinc-400'); textSpan.textContent = "Loading..."; spinner.classList.remove('hidden-force'); spinner.classList.add('spinner-primary'); 
  } else if(state === 'saving') { 
      btn.classList.add('bg-yellow-50', 'text-yellow-700', 'border-yellow-200', 'dark:bg-yellow-900/30', 'dark:text-yellow-300'); textSpan.textContent = "Saving..."; spinner.classList.remove('hidden-force'); spinner.classList.add('spinner-yellow'); 
  } else if (state === 'saved') { 
      btn.classList.add('bg-green-50', 'text-green-700', 'border-green-200', 'dark:bg-green-900/30', 'dark:text-green-300'); textSpan.textContent = "Saved"; 
  } else if (state === 'error') { 
      btn.classList.add('bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/30', 'dark:text-red-300'); textSpan.textContent = "Error"; 
  }
}