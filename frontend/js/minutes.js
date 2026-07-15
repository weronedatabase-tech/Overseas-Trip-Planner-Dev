// ==========================================
// minutes.js - Meeting Notes
// ==========================================
// [CONSIDERATION - SPA to MPA Migration]: Ported to use AppCore for backend
// calls and global mutation tracking. Dark mode updated to zinc.

let minutesMap = new Map();
let pendingMinutesUpdates = new Map();
let minutesSyncTimeout = null;
let minutesPollInterval = null;
let isMinutesSyncing = false;
let minutesSearchQuery = '';

function generateUUID() {
  return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatYMD(dateVal) {
  if (!dateVal) return '';
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal.trim())) {
      return dateVal.trim();
  }
  const d = new Date(dateVal);
  if (!isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
  }
  return String(dateVal);
}

function buildMinutesUI() {
  document.getElementById('tab-minutes').innerHTML = `
  <div class="flex flex-col h-full w-full relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div class="p-4 md:p-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0 flex flex-col md:flex-row justify-between items-center z-10 bg-white dark:bg-zinc-900 gap-4">
          <div class="flex items-center gap-3 w-full md:w-auto">
              <h3 class="text-lg md:text-xl font-black text-zinc-900 dark:text-white tracking-tight">Meeting Notes</h3>
              <span id="minutesSyncStatus" class="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md shadow-inner uppercase tracking-widest border border-zinc-200 dark:border-zinc-700">Synced</span>
          </div>
          
          <div class="flex w-full md:w-auto items-center gap-3 justify-end">
              <div class="relative w-full md:w-56 shrink-0">
                  <input type="text" id="minutesSearchInput" oninput="handleMinutesSearch()" placeholder="Fuzzy search notes..." class="w-full p-2.5 pl-10 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition">
                  <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-zinc-400 dark:text-zinc-500"></i>
              </div>
              <button onclick="addMinuteNote()" class="w-auto bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-blue-600 transition flex items-center justify-center shadow-md focus:outline-none shrink-0 transform active:scale-95">
                  <i class="fa-solid fa-plus md:mr-2"></i>
                  <span class="hidden md:inline">New Note</span>
              </button>
          </div>
      </div>

      <div id="minutesLoadingOverlay" class="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm z-[50] flex flex-col justify-center items-center hidden-force">
          <div class="loader !w-10 !h-10 border-primary mb-3"></div>
          <span class="text-primary dark:text-blue-400 font-bold text-xs tracking-wide shadow-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 rounded-full">Loading Notes...</span>
      </div>

      <div class="flex-grow overflow-y-auto p-4 md:p-6 bg-zinc-50 dark:bg-zinc-950 custom-scrollbar pb-10">
          <div id="minutesListContainer" class="flex flex-col gap-4 max-w-5xl mx-auto">
              <!-- Notes injected here -->
          </div>
      </div>
  </div>
  `;

  loadInitialMinutes();
}

async function loadInitialMinutes() {
  const overlay = document.getElementById('minutesLoadingOverlay');
  if (overlay) overlay.classList.remove('hidden-force');
  
  try {
      const res = await AppCore.apiFetch('fetchMinutes');
      minutesMap.clear();
      if (res.minutes && Array.isArray(res.minutes)) {
          res.minutes.forEach(m => minutesMap.set(m.id, m));
      }
      renderAllMinutes();
      startMinutesPolling();
  } catch(e) {
      AppCore.showToast("Failed to load meeting notes.", true);
  } finally {
      if (overlay) overlay.classList.add('hidden-force');
  }
}

function handleMinutesSearch() {
  minutesSearchQuery = document.getElementById('minutesSearchInput').value.toLowerCase().trim();
  renderAllMinutes();
}

function addMinuteNote() {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const newNote = {
      id: generateUUID(),
      date: today,
      content: '',
      assignedTo: '',
      ts: Date.now(),
      updatedBy: AppCore.currentUser?.name || 'Admin',
      isDeleted: false
  };
  
  minutesMap.set(newNote.id, newNote);
  queueMinuteUpdate(newNote.id);
  
  const searchInput = document.getElementById('minutesSearchInput');
  if (searchInput && searchInput.value) {
      searchInput.value = '';
      minutesSearchQuery = '';
      renderAllMinutes();
  }
  
  const container = document.getElementById('minutesListContainer');
  if(container && !minutesSearchQuery) {
      const emptyMsg = container.querySelector('.empty-notes-msg');
      if(emptyMsg) emptyMsg.remove();
      
      const noteEl = createNoteDOM(newNote);
      if (!document.getElementById(`min-card-${newNote.id}`)) {
          container.insertBefore(noteEl, container.firstChild);
      }
      
      setTimeout(() => {
          const ta = document.getElementById(`min-card-${newNote.id}`)?.querySelector('textarea');
          if(ta) ta.focus();
      }, 50);
  }
}

function deleteMinuteNote(id) {
  if (!confirm("Delete this meeting note?")) return;
  const note = minutesMap.get(id);
  if(note) {
      note.isDeleted = true;
      note.ts = Date.now();
      note.updatedBy = AppCore.currentUser?.name || 'Admin';
      queueMinuteUpdate(id);
      
      const el = document.getElementById(`min-card-${id}`);
      if(el) {
          el.classList.add('opacity-0', 'scale-95');
          setTimeout(() => el.remove(), 200);
      }
  }
}

function handleMinuteInput(id, field, value) {
  AppCore.trackMutation(); // [CONSIDERATION - OPTIMISTIC UI] Block polling overwrites
  const note = minutesMap.get(id);
  if(note) {
      note[field] = value;
      note.ts = Date.now();
      note.updatedBy = AppCore.currentUser?.name || 'Admin';
      queueMinuteUpdate(id);
      
      const byEl = document.getElementById(`min-by-${id}`);
      if(byEl) {
          const timeStr = new Date(note.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          byEl.textContent = `${timeStr} by ${note.updatedBy}`;
          byEl.classList.add('text-primary', 'border-primary/50');
          setTimeout(() => byEl.classList.remove('text-primary', 'border-primary/50'), 2000);
      }
  }
}

function queueMinuteUpdate(id) {
  pendingMinutesUpdates.set(id, minutesMap.get(id));
  updateMinutesSyncUI('saving');
  
  if (minutesSyncTimeout) clearTimeout(minutesSyncTimeout);
  minutesSyncTimeout = setTimeout(() => {
      executeMinutesSync();
  }, 1500); 
}

async function executeMinutesSync() {
  if (pendingMinutesUpdates.size === 0) return;
  
  isMinutesSyncing = true;
  updateMinutesSyncUI('saving');
  
  const updates = Array.from(pendingMinutesUpdates.values());
  pendingMinutesUpdates.clear();
  
  try {
      const res = await AppCore.apiFetch('syncMinutes', { updates: updates, takenBy: AppCore.currentUser?.name || 'Admin' });
      
      if (res && res.minutes) {
          res.minutes.forEach(sNote => {
              const lNote = minutesMap.get(sNote.id);
              if (!lNote || (sNote.ts > lNote.ts && !pendingMinutesUpdates.has(sNote.id))) {
                  minutesMap.set(sNote.id, sNote);
                  updateNoteDOM(sNote);
              }
          });
      }
      updateMinutesSyncUI('saved');
  } catch(e) {
      updates.forEach(u => pendingMinutesUpdates.set(u.id, u));
      updateMinutesSyncUI('error');
  } finally {
      isMinutesSyncing = false;
  }
}

function startMinutesPolling() {
  if (minutesPollInterval) clearInterval(minutesPollInterval);
  
  minutesPollInterval = setInterval(async () => {
      if (isMinutesSyncing) return;
      
      try {
          // [CONSIDERATION - OPTIMISTIC UI]: `true` flags this as a background poll
          const res = await AppCore.apiFetch('fetchMinutes', {}, true);
          if (res && res.minutes) {
              let hasRemoteChanges = false;
              res.minutes.forEach(sNote => {
                  const lNote = minutesMap.get(sNote.id);
                  if (!lNote || (sNote.ts > lNote.ts && !pendingMinutesUpdates.has(sNote.id))) {
                      minutesMap.set(sNote.id, sNote);
                      updateNoteDOM(sNote);
                      hasRemoteChanges = true;
                  }
              });
              
              if (hasRemoteChanges && pendingMinutesUpdates.size === 0) {
                  updateMinutesSyncUI('saved');
              }
          }
      } catch(e) {
          // silent polling fail
      }
  }, 8000);
}

function renderAllMinutes() {
  const container = document.getElementById('minutesListContainer');
  if (!container) return;
  
  let sorted = Array.from(minutesMap.values())
      .filter(n => !n.isDeleted)
      .sort((a, b) => b.ts - a.ts); 
      
  if (minutesSearchQuery) {
      sorted = sorted.filter(n => {
          return (n.content && n.content.toLowerCase().includes(minutesSearchQuery)) ||
                 (n.assignedTo && n.assignedTo.toLowerCase().includes(minutesSearchQuery)) ||
                 (n.date && n.date.toLowerCase().includes(minutesSearchQuery)) ||
                 (n.updatedBy && n.updatedBy.toLowerCase().includes(minutesSearchQuery));
      });
  }
      
  if (sorted.length === 0) {
      if (minutesSearchQuery) {
          container.innerHTML = `<div class="empty-notes-msg w-full py-10 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500"><i class="fa-solid fa-ghost text-3xl mb-3 opacity-50"></i><p class="text-xs font-bold uppercase tracking-widest">No matching notes found.</p></div>`;
      } else {
          container.innerHTML = `<div class="empty-notes-msg w-full py-10 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500"><i class="fa-solid fa-ghost text-3xl mb-3 opacity-50"></i><p class="text-xs font-bold uppercase tracking-widest">No meeting notes found</p></div>`;
      }
      return;
  }
  
  container.innerHTML = '';
  sorted.forEach(note => {
      container.appendChild(createNoteDOM(note));
  });
}

function updateNoteDOM(note) {
  const card = document.getElementById(`min-card-${note.id}`);
  
  if (note.isDeleted) {
      if (card) card.remove();
      return;
  }
  
  if (minutesSearchQuery) {
      const matches = (note.content && note.content.toLowerCase().includes(minutesSearchQuery)) ||
                      (note.assignedTo && note.assignedTo.toLowerCase().includes(minutesSearchQuery)) ||
                      (note.date && note.date.toLowerCase().includes(minutesSearchQuery)) ||
                      (note.updatedBy && note.updatedBy.toLowerCase().includes(minutesSearchQuery));
      if (!matches) {
          if (card) card.remove();
          return;
      }
  }
  
  if (!card) {
      const container = document.getElementById('minutesListContainer');
      if (container) {
          const emptyMsg = container.querySelector('.empty-notes-msg');
          if(emptyMsg) emptyMsg.remove();
          container.insertBefore(createNoteDOM(note), container.firstChild);
      }
      return;
  }
  
  const dateEl = card.querySelector('.note-date');
  const contentEl = card.querySelector('.note-content');
  const assignedEl = card.querySelector('.note-assigned');
  const metaEl = card.querySelector('.note-meta');
  
  if (document.activeElement !== dateEl) dateEl.value = formatYMD(note.date);
  if (document.activeElement !== contentEl) contentEl.value = note.content;
  if (document.activeElement !== assignedEl) assignedEl.value = note.assignedTo;
  
  if (metaEl) {
      const timeStr = new Date(note.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      metaEl.textContent = `${timeStr} by ${note.updatedBy}`;
  }
}

function createNoteDOM(note) {
  const div = document.createElement('div');
  div.id = `min-card-${note.id}`;
  div.className = "bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 transform";
  
  const timeStr = note.ts ? new Date(note.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'New';
  
  div.innerHTML = `
      <div class="flex justify-between items-center bg-zinc-50/80 dark:bg-zinc-900/50 p-3 md:p-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div class="flex items-center gap-3">
              <input type="date" value="${formatYMD(note.date)}" 
                  class="note-date min-w-[130px] [color-scheme:light] dark:[color-scheme:dark] text-sm font-bold text-zinc-900 dark:text-white bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 shadow-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                  onchange="handleMinuteInput('${note.id}', 'date', this.value)">
              <span id="min-by-${note.id}" class="note-meta text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest hidden md:inline-block border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded bg-white dark:bg-zinc-800 shadow-sm transition-colors">${timeStr} by ${note.updatedBy}</span>
          </div>
          <button onclick="deleteMinuteNote('${note.id}')" class="text-zinc-400 hover:text-red-500 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-2 rounded-lg shadow-sm hover:bg-red-50 dark:hover:bg-zinc-700 transition focus:outline-none transform active:scale-95">
              <i class="fa-solid fa-trash text-sm"></i>
          </button>
      </div>
      <div class="p-4 md:p-5">
          <textarea 
              class="note-content w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y shadow-inner min-h-[120px] transition"
              placeholder="Salient points, decisions made, or important notes..."
              oninput="handleMinuteInput('${note.id}', 'content', this.value)">${note.content}</textarea>
      </div>
      <div class="bg-blue-50/50 dark:bg-blue-900/10 p-3 md:p-4 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
              <i class="fa-solid fa-user-tag text-sm"></i>
          </div>
          <input type="text" value="${note.assignedTo}" 
              class="note-assigned w-full bg-white dark:bg-black border border-blue-200 dark:border-blue-800/50 rounded-lg px-3 py-2 text-sm font-bold text-blue-800 dark:text-blue-300 placeholder-blue-300 dark:placeholder-blue-700/50 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"
              placeholder="Tag follow-ups (e.g. John, Alice)..."
              oninput="handleMinuteInput('${note.id}', 'assignedTo', this.value)">
      </div>
  `;
  
  return div;
}

function updateMinutesSyncUI(state) {
  const el = document.getElementById('minutesSyncStatus');
  if (!el) return;
  
  if (state === 'saving') {
      el.textContent = "Syncing...";
      el.className = "ml-2 text-[10px] font-bold text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-1 rounded-md shadow-inner uppercase tracking-widest transition-colors border border-yellow-200 dark:border-yellow-800/50";
  } else if (state === 'saved') {
      el.textContent = "Saved";
      el.className = "ml-2 text-[10px] font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-md shadow-inner uppercase tracking-widest transition-colors border border-green-200 dark:border-green-800/50";
      setTimeout(() => {
          if (pendingMinutesUpdates.size === 0) {
              el.className = "ml-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md shadow-inner uppercase tracking-widest transition-colors border border-zinc-200 dark:border-zinc-700";
          }
      }, 2000);
  } else if (state === 'error') {
      el.textContent = "Offline / Error";
      el.className = "ml-2 text-[10px] font-bold text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded-md shadow-inner uppercase tracking-widest transition-colors border border-red-200 dark:border-red-800/50";
  }
}