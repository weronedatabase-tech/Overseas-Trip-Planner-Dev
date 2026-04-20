const projectColorPalette =[
  'bg-slate-100 border-slate-400 text-slate-900 dark:bg-slate-900 dark:border-slate-600 dark:text-slate-100',
  'bg-gray-100 border-gray-400 text-gray-900 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-100',
  'bg-zinc-100 border-zinc-400 text-zinc-900 dark:bg-zinc-900 dark:border-zinc-600 dark:text-zinc-100',
  'bg-neutral-100 border-neutral-400 text-neutral-900 dark:bg-neutral-900 dark:border-neutral-600 dark:text-neutral-100',
  'bg-stone-100 border-stone-400 text-stone-900 dark:bg-stone-900 dark:border-stone-600 dark:text-stone-100',
  'bg-amber-100 border-amber-400 text-amber-900 dark:bg-amber-900 dark:border-amber-600 dark:text-amber-100',
  'bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-100',
  'bg-lime-100 border-lime-400 text-lime-900 dark:bg-lime-900 dark:border-lime-600 dark:text-lime-100',
  'bg-green-100 border-green-400 text-green-900 dark:bg-green-900 dark:border-green-600 dark:text-green-100',
  'bg-emerald-100 border-emerald-400 text-emerald-900 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-100',
  'bg-teal-100 border-teal-400 text-teal-900 dark:bg-teal-900 dark:border-teal-600 dark:text-teal-100',
  'bg-cyan-100 border-cyan-400 text-cyan-900 dark:bg-cyan-900 dark:border-cyan-600 dark:text-cyan-100',
  'bg-sky-100 border-sky-400 text-sky-900 dark:bg-sky-900 dark:border-sky-600 dark:text-sky-100',
  'bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-100',
  'bg-indigo-100 border-indigo-400 text-indigo-900 dark:bg-indigo-900 dark:border-indigo-600 dark:text-indigo-100',
  'bg-violet-100 border-violet-400 text-violet-900 dark:bg-violet-900 dark:border-violet-600 dark:text-violet-100',
  'bg-purple-100 border-purple-400 text-purple-900 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-100',
  'bg-fuchsia-100 border-fuchsia-400 text-fuchsia-900 dark:bg-fuchsia-900 dark:border-fuchsia-600 dark:text-fuchsia-100'
];

function getProjectColor(groupName) {
 if (!groupName || groupName === 'None') return 'bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100'; 
 if (appSettings.projectColors && appSettings.projectColors[groupName]) return appSettings.projectColors[groupName];
 return 'bg-gray-100 border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100'; 
}

function getProjectAbbreviation(name) {
 const match = name.match(/\((.*?)\)/); if (match && match[1]) return match[1].substring(0,3).toUpperCase();
 const words = name.split(' ').filter(w => w.length > 0);
 if (words.length > 1) return words.slice(0,3).map(w => w[0]).join('').toUpperCase();
 return name.substring(0,3).toUpperCase();
}

function renderHeaderLegend() {
 const container = document.getElementById('headerLegend');
 if (!appSettings.activeProjects || appSettings.activeProjects.length === 0) { container.innerHTML = ''; return; }
 let html = '';
 appSettings.activeProjects.forEach(proj => {
   if(!proj) return;
   const colorCls = getProjectColor(proj); const shortName = getProjectAbbreviation(proj);
   html += `<span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold border-2 cursor-help ${colorCls}" title="${proj}">${shortName}</span>`;
 });
 container.innerHTML = html;
}

function setBtnLoading(btn, isLoading) {
  if (!btn) return; 
  const spinner = btn.querySelector('.btn-spinner');
  const icon = btn.querySelector('.btn-icon');
  const text = btn.querySelector('.btn-text');
  
  if (isLoading) { 
    btn.disabled = true; btn.classList.add('opacity-80', 'cursor-not-allowed'); 
    if (spinner) spinner.classList.remove('hidden-force'); 
    if (icon) icon.classList.add('opacity-0'); 
    if (text) text.classList.add('opacity-0'); 
  } else { 
    btn.disabled = false; btn.classList.remove('opacity-80', 'cursor-not-allowed'); 
    if (spinner) spinner.classList.add('hidden-force'); 
    if (icon) icon.classList.remove('opacity-0');
    if (text) text.classList.remove('opacity-0');
  }
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast'); t.textContent = msg;
  t.className = `fixed top-16 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-xl z-50 transition-opacity duration-300 text-sm font-bold border-2 ${isError ? 'bg-red-600 text-white border-red-800' : 'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-200'}`;
  t.classList.remove('opacity-0'); setTimeout(() => t.classList.add('opacity-0'), 4000);
}

function toggleTheme() { document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); }
function goHome() { if(currentUser) return renderDashboard(); document.querySelectorAll('#mainContent > div').forEach(el => el.classList.add('hidden-force')); document.getElementById('viewLanding').classList.remove('hidden-force'); }

function navTo(view) {
 document.querySelectorAll('#mainContent > div').forEach(el => el.classList.add('hidden-force'));
 if (view === 'register') { document.getElementById('viewRegister').classList.remove('hidden-force'); document.getElementById('membersContainer').innerHTML = ''; regMemberCount = 0; addRegMember(); }
 if (view === 'login') { document.getElementById('viewLogin').classList.remove('hidden-force'); document.getElementById('loginPass').value = ''; }
}

function switchTab(tabId) {
 document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden-force'));
 document.querySelectorAll('.tab-btn').forEach(el => { el.classList.remove('border-primary', 'text-primary', 'bg-blue-50', 'dark:bg-gray-700', 'font-extrabold'); el.classList.add('border-transparent', 'text-gray-500', 'dark:text-gray-400', 'font-bold'); });
 document.getElementById(`tab-${tabId}`).classList.remove('hidden-force');
 const activeBtn = document.getElementById(`tabBtn-${tabId}`);
 if(activeBtn) { activeBtn.classList.remove('border-transparent', 'text-gray-500', 'dark:text-gray-400', 'font-bold'); activeBtn.classList.add('border-primary', 'text-primary', 'bg-blue-50', 'dark:bg-gray-700', 'font-extrabold'); }
 if(tabId === 'profile') loadProfileData();
 if(tabId === 'logistics') { buildLogisticsUI(); switchLogisticsSubTab('pairings'); renderPairings(); }
 if(tabId === 'attendance') { buildAttendanceUI(); renderAttendanceChecklist(); }
 if(tabId === 'settings') buildSettingsUI();
}

function injectGlobalModals() {
 document.getElementById('modalContainer').innerHTML = `
   <div id="tripSetupModal" class="fixed inset-0 bg-black/60 z-[95] hidden-force flex justify-center items-center p-4 backdrop-blur-sm transition-opacity">
     <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl border-4 border-primary">
       <h3 class="text-2xl font-extrabold mb-2 text-gray-900 dark:text-white border-b-2 border-gray-300 dark:border-gray-700 pb-2">Initialize Trip Setup</h3>
       <div class="space-y-5 mb-6 mt-4">
         <div><label class="block text-sm font-extrabold mb-1 text-gray-900 dark:text-gray-200">Trip Title</label><input type="text" id="tripTitleInput" value="MYG Overseas Trip" class="w-full p-3 border-2 rounded-lg font-bold"></div>
         <div><label class="block text-sm font-extrabold mb-1 text-gray-900 dark:text-gray-200">Trip Year</label><input type="number" id="tripYearInput" class="w-full p-3 border-2 rounded-lg font-bold"></div>
       </div>
       <div class="flex space-x-3">
         <button onclick="cancelTripSetup()" class="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-extrabold border-2 border-gray-400 dark:border-gray-500">Cancel</button>
         <button onclick="confirmTripSetup(this)" class="flex-1 bg-primary text-white py-3 rounded-lg font-extrabold border-2 border-blue-800 flex justify-center items-center"><span class="btn-text">Open Reg</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
       </div>
     </div>
   </div>

   <div id="selectionBottomSheet" class="fixed inset-0 bg-black/60 z-[95] hidden-force flex flex-col justify-end">
     <div class="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md mx-auto overflow-hidden shadow-2xl animate-slide-up border-t-4 border-x-4 border-gray-400 dark:border-gray-700 h-[70vh] flex flex-col">
       <div class="flex justify-between items-center p-5 border-b-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
         <span id="sheetTitle" class="font-extrabold text-xl text-gray-800 dark:text-gray-100">Select</span><button type="button" onclick="closeSelectionSheet()" class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 text-3xl font-extrabold px-3 focus:outline-none">&times;</button>
       </div>
       <div class="flex-grow overflow-y-auto p-4 space-y-2 bg-gray-100 dark:bg-gray-800" id="sheetListContainer"></div>
     </div>
   </div>

   <div id="colorPickerModal" class="fixed inset-0 bg-black/60 z-[96] hidden-force flex justify-center items-center p-4 backdrop-blur-sm">
     <div class="bg-white dark:bg-gray-800 rounded-xl w-full max-w-sm p-6 shadow-2xl border-4 border-gray-400 dark:border-gray-700">
       <div class="flex justify-between items-center mb-4 border-b-2 border-gray-300 dark:border-gray-700 pb-2">
         <h3 class="text-xl font-extrabold text-gray-900 dark:text-white">Select Color</h3>
         <button type="button" onclick="closeColorPicker()" class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 text-2xl font-extrabold px-2 focus:outline-none">&times;</button>
       </div>
       <div class="grid grid-cols-6 gap-3 mb-6" id="colorPaletteGrid"></div>
     </div>
   </div>

   <div id="datePickerSheet" class="fixed inset-0 bg-black/60 z-[90] hidden-force flex flex-col justify-end">
     <div class="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md mx-auto overflow-hidden shadow-2xl animate-slide-up border-t-4 border-x-4 border-gray-400 dark:border-gray-700">
       <div class="flex justify-between items-center p-5 border-b-2 border-gray-300 dark:border-gray-700"><span class="font-extrabold text-xl text-gray-800 dark:text-gray-100">Select Date</span><button type="button" onclick="closePicker()" class="text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 text-3xl font-extrabold px-3 focus:outline-none">&times;</button></div>
       <div class="relative flex h-[200px] text-xl font-bold"><div class="picker-highlight"></div><div class="flex-1 picker-col" id="colDay"></div><div class="flex-1 picker-col" id="colMonth"></div><div class="flex-1 picker-col" id="colYear"></div></div>
       <div class="p-5 bg-gray-50 dark:bg-gray-900 border-t-2 border-gray-300 dark:border-gray-700"><button type="button" onclick="confirmPicker()" class="w-full bg-primary text-white py-4 rounded-xl font-extrabold text-xl border-2 border-blue-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-300">Done</button></div>
     </div>
   </div>`;
}

// Color Picker Helpers
function getUnusedColor() {
  const used = Object.values(appSettings.projectColors || {});
  const unused = projectColorPalette.filter(c => !used.includes(c));
  return unused.length > 0 ? unused[0] : projectColorPalette[0];
}

function openColorPickerForNewProject() {
  pendingColorGroupTarget = 'NEW';
  if(!newProjectSelectedColor) newProjectSelectedColor = getUnusedColor();
  renderColorPickerGrid(); document.getElementById('colorPickerModal').classList.remove('hidden-force');
}
function openColorPicker(groupName) {
  pendingColorGroupTarget = groupName; renderColorPickerGrid(); document.getElementById('colorPickerModal').classList.remove('hidden-force');
}
function closeColorPicker() { document.getElementById('colorPickerModal').classList.add('hidden-force'); }

function renderColorPickerGrid() {
  const grid = document.getElementById('colorPaletteGrid');
  const usedColors = Object.values(appSettings.projectColors || {});
  let html = '';
  projectColorPalette.forEach(colorCls => {
    let isUsed = usedColors.includes(colorCls);
    let isCurrent = false;
    if (pendingColorGroupTarget === 'NEW') { isCurrent = (colorCls === newProjectSelectedColor); } 
    else { isCurrent = (colorCls === appSettings.projectColors[pendingColorGroupTarget]); if(isCurrent) isUsed = false; }
    
    const opacity = isUsed ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer hover:scale-110';
    const ring = isCurrent ? 'ring-4 ring-primary ring-offset-2 dark:ring-offset-gray-800' : '';
    const onclick = isUsed ? '' : `onclick="selectColor('${colorCls}')"`;
    const bgMatch = colorCls.match(/bg-[a-z]+-[0-9]+/); const bgClass = bgMatch ? bgMatch[0] : 'bg-gray-200';
    
    html += `<div ${onclick} class="w-10 h-10 rounded-full border-2 border-gray-400 shadow-sm transition-all ${bgClass} ${opacity} ${ring}"></div>`;
  });
  grid.innerHTML = html;
}

async function selectColor(colorClass) {
  closeColorPicker();
  if (pendingColorGroupTarget === 'NEW') {
    newProjectSelectedColor = colorClass;
    const bgMatch = colorClass.match(/bg-[a-z]+-[0-9]+/);
    document.getElementById('newGroupColorBtn').className = `w-12 h-12 rounded-full border-4 border-gray-400 shadow-md transition hover:scale-105 ${bgMatch ? bgMatch[0] : 'bg-gray-200'}`;
  } else {
    showToast("Updating color...", false);
    try {
      const res = await callBackend('addProjectGroup', { groupName: pendingColorGroupTarget, callerNric: currentUser.nric, colorClass: colorClass });
      appSettings.projectGroups = res.groups; appSettings.projectColors = res.projectColors;
      if (typeof renderGroupList === "function") renderGroupList(res.groups); 
      renderHeaderLegend(); showToast("Color Updated!");
    } catch(e) { showToast(e.message, true); }
  }
}