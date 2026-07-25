document.addEventListener("DOMContentLoaded", () => {
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(err => console.warn(err));
}

const savedSession = localStorage.getItem('userSession');
if (savedSession) currentUser = JSON.parse(savedSession);

if(localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

const devModeBar = document.getElementById('devModeBar');
if (devModeBar) {
  if (ENV === 'Dev') {
    devModeBar.textContent = 'Testing';
    devModeBar.className = 'w-full bg-red-600 text-white text-center py-0.5 text-[10px] font-bold tracking-widest uppercase shrink-0 z-50';
    devModeBar.classList.remove('hidden-force');
  } else if (ENV === 'Exp') {
    devModeBar.textContent = 'Experimentation';
    devModeBar.className = 'w-full bg-purple-600 text-white text-center py-0.5 text-[10px] font-bold tracking-widest uppercase shrink-0 z-50';
    devModeBar.classList.remove('hidden-force');
  } else {
    devModeBar.classList.add('hidden-force');
  }
}

// Check Authentication boundaries
const path = window.location.pathname;
const isPublic = path.endsWith('index.html') || path.endsWith('register.html') || path === '/' || path === '';
if (!currentUser && !isPublic) {
  window.location.href = 'index.html';
  return;
}

if (currentUser) {
  const deskUserName = document.getElementById('deskUserName');
  const deskUserRole = document.getElementById('deskUserRole');
  const roleStr = currentUser.nric === 'ADMIN' ? 'Main Admin' : (currentUser.role === 'admin' ? 'Committee' : 'Participant');
  if(deskUserName) deskUserName.textContent = currentUser.name || 'User';
  if(deskUserRole) deskUserRole.textContent = roleStr;

  if (currentUser.role !== 'admin') {
      document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden-force'));
  }
  if (currentUser.nric === 'ADMIN') {
      const navProfile = document.getElementById('nav-profile');
      if(navProfile) navProfile.classList.add('hidden-force');
  }
}

// Pillar 1 Sync Safety: Track mutational interactions
document.addEventListener('input', () => { lastLocalChange = Date.now(); });
document.addEventListener('change', () => { lastLocalChange = Date.now(); });
document.addEventListener('click', (e) => {
   if(e.target.tagName === 'BUTTON' || e.target.closest('button')) lastLocalChange = Date.now();
});

// Setup Long Press for Participant Quick View
setupGlobalLongPress();

silentHydration();
});

// ==========================================
// GLOBAL LONG-PRESS PARTICIPANT VIEW
// ==========================================
let lpTimer;
let lpActive = false;
let lpStartX = 0;
let lpStartY = 0;

function setupGlobalLongPress() {
document.addEventListener('touchstart', handleLpStart, {passive: true});
document.addEventListener('mousedown', handleLpStart);
document.addEventListener('touchend', handleLpEnd);
document.addEventListener('mouseup', handleLpEnd);
document.addEventListener('touchmove', handleLpMove, {passive: true});
document.addEventListener('mousemove', handleLpMove);
}

function handleLpStart(e) {
if(e.button !== undefined && e.button !== 0) return; // Ignore right-clicks
const target = e.target.closest('[data-nric]');
if (!target) return;

const nric = target.dataset.nric;
if (!nric) return;

const clientX = e.touches ? e.touches[0].clientX : e.clientX;
const clientY = e.touches ? e.touches[0].clientY : e.clientY;
lpStartX = clientX;
lpStartY = clientY;

lpActive = true;
lpTimer = setTimeout(() => {
    if(lpActive) {
        lpActive = false;
        if(navigator.vibrate) {
            try { navigator.vibrate(50); } catch(err){}
        }
        showParticipantSummaryModal(nric);
    }
}, 600);
}

function handleLpMove(e) {
if (!lpActive) return;
const clientX = e.touches ? e.touches[0].clientX : e.clientX;
const clientY = e.touches ? e.touches[0].clientY : e.clientY;

// Only cancel long press if finger/mouse moves more than 10 pixels (allows for slight jitters on mobile screens)
if (Math.abs(clientX - lpStartX) > 10 || Math.abs(clientY - lpStartY) > 10) {
    handleLpEnd();
}
}

function handleLpEnd() {
lpActive = false;
clearTimeout(lpTimer);
}

async function showParticipantSummaryModal(nric) {
let modal = document.getElementById('globalParticipantModal');
if(!modal) {
    modal = document.createElement('div');
    modal.id = 'globalParticipantModal';
    modal.className = 'fixed inset-0 bg-black/60 z-[110] flex justify-center items-center p-4 backdrop-blur-sm hidden-force';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up flex flex-col overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-900/50">
                <h3 class="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Participant Summary
                </h3>
                <button type="button" onclick="closeParticipantSummaryModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold px-1 focus:outline-none">&times;</button>
            </div>
            <div id="gpm-content" class="p-5 flex flex-col gap-4">
                <div class="flex justify-center py-6"><div class="loader !w-8 !h-8 border-primary"></div></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if(e.target === modal) closeParticipantSummaryModal(); });
}

modal.classList.remove('hidden-force');
const cont = document.getElementById('gpm-content');
cont.innerHTML = `<div class="flex justify-center py-6"><div class="loader !w-8 !h-8 border-primary"></div></div>`;

try {
    const res = await apiCall('getParticipantSummary', { nric: nric });
    const s = res.summary;
    
    const roleColor = s.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (s.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
    
    cont.innerHTML = `
        <div class="flex flex-col">
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Name</span>
            <span class="font-black text-lg text-gray-900 dark:text-white leading-tight">${s.fullName}</span>
            <span class="text-xs font-bold text-gray-500">${s.shortName || '-'}</span>
        </div>
        <div class="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Role & Gender</span>
                <span class="text-xs font-black ${roleColor} border px-1.5 py-0.5 rounded shadow-sm">${s.role}</span>
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1">${s.gender}</span>
            </div>
            <div>
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Project</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded border shadow-sm ${getProjectColor(s.group)}">${s.group || 'None'}</span>
            </div>
        </div>
        <div class="border-t border-gray-100 dark:border-gray-700 pt-4 space-y-3">
            <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-500">Room</span>
                <span class="text-xs font-bold text-gray-900 dark:text-white">${s.roomName}</span>
            </div>
            <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                <span class="text-[10px] font-black uppercase tracking-widest text-gray-500">Pairings</span>
                <span class="text-xs font-bold text-gray-900 dark:text-white text-right max-w-[60%] truncate">${s.pairings}</span>
            </div>
            <div class="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-100 dark:border-blue-800/50">
                <span class="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Payment</span>
                <span class="text-xs font-black ${s.paymentStatus === 'Paid' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}">${s.paymentStatus}</span>
            </div>
        </div>
    `;
} catch(e) {
    cont.innerHTML = `<p class="text-xs font-bold text-red-500 text-center py-4">Failed to load details.</p>`;
}
}

window.closeParticipantSummaryModal = function() {
const m = document.getElementById('globalParticipantModal');
if(m) m.classList.add('hidden-force');
}

async function silentHydration() {
if (isHydrated) return;
try {
  const config = await apiCall('getSettings');
  appSettings = config;
  localStorage.setItem('appSettings', JSON.stringify(appSettings));
  
  const tripStr = (appSettings.tripTitle && appSettings.tripYear) ? `${appSettings.tripTitle} ${appSettings.tripYear}` : '';
  const titleEls = ['deskTripName', 'mobTripName', 'unauthTripName'];
  titleEls.forEach(id => {
    const el = document.getElementById(id);
    if(el) {
      if(tripStr) { el.textContent = tripStr; el.classList.remove('hidden-force'); }
      else { el.classList.add('hidden-force'); }
    }
  });
  
  const landingRegBox = document.getElementById('landingRegBox');
  if (landingRegBox) {
      if (appSettings.registrationOpen) landingRegBox.classList.remove('hidden-force');
      else landingRegBox.classList.add('hidden-force');
  }

  renderHeaderLegend();
  isHydrated = true;

  // Custom initializations based on active page
  if(window.initPage) window.initPage();
} catch (e) {
  console.warn("Hydration failed silently", e);
  const cachedSettings = localStorage.getItem('appSettings');
  if (cachedSettings) appSettings = JSON.parse(cachedSettings);
} finally {
  const viewLoading = document.getElementById('viewLoading');
  if(viewLoading) viewLoading.classList.add('hidden-force');
}
}

function processDisplayNames(participants) {
if(!participants) return;
const nameCounts = {};
participants.forEach(p => {
    p.shortName = (p.shortName || '').trim().toUpperCase();
    p.name = (p.name || '').trim().toUpperCase();
    const sName = p.shortName || p.name;
    nameCounts[sName] = (nameCounts[sName] || 0) + 1;
});
participants.forEach(p => {
    const sName = p.shortName || p.name;
    if (nameCounts[sName] > 1) {
        const roleChar = p.role ? p.role.charAt(0).toUpperCase() : 'U';
        const projAcr = p.group ? getProjectAbbreviation(p.group) : 'N/A';
        p.displayName = `${sName} (${roleChar}) (${projAcr})`;
    } else {
        p.displayName = sName;
    }
});
const displayCounts = {};
participants.forEach(p => { displayCounts[p.displayName] = (displayCounts[p.displayName] || 0) + 1; });
participants.forEach(p => {
    if (displayCounts[p.displayName] > 1) {
        const sName = p.shortName || p.name;
        const roleChar = p.role ? p.role.charAt(0).toUpperCase() : 'U';
        const projAcr = p.group ? getProjectAbbreviation(p.group) : 'N/A';
        const words = p.name.split(' ');
        let extraChar = '';
        if (words.length > 1) {
            const diffWord = words.find(w => w !== sName);
            if(diffWord) extraChar = diffWord.charAt(0) + '.';
            else extraChar = words[1].charAt(0) + '.';
        } else {
            extraChar = p.name.charAt(0) + '.';
        }
        p.displayName = `${sName} ${extraChar} (${roleChar}) (${projAcr})`;
    }
});
const finalCounts = {};
participants.forEach(p => { finalCounts[p.displayName] = (finalCounts[p.displayName] || 0) + 1; });
participants.forEach(p => {
    if (finalCounts[p.displayName] > 1 && p.nric) {
        p.displayName = `${p.displayName} [${p.nric.slice(-4)}]`;
    }
});
}
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
