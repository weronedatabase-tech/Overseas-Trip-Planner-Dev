const projectColorPalette =[
 'bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200',
 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200',
 'bg-zinc-100 border-zinc-300 text-zinc-800 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-200',
 'bg-neutral-100 border-neutral-300 text-neutral-800 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-200',
 'bg-stone-100 border-stone-300 text-stone-800 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-200',
 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900 dark:border-amber-600 dark:text-amber-200',
 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-200',
 'bg-lime-100 border-lime-300 text-lime-800 dark:bg-lime-900 dark:border-lime-600 dark:text-lime-200',
 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-600 dark:text-green-200',
 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900 dark:border-emerald-600 dark:text-emerald-200',
 'bg-teal-100 border-teal-300 text-teal-800 dark:bg-teal-900 dark:border-teal-600 dark:text-teal-200',
 'bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-900 dark:border-cyan-600 dark:text-cyan-200',
 'bg-sky-100 border-sky-300 text-sky-800 dark:bg-sky-900 dark:border-sky-600 dark:text-sky-200',
 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-600 dark:text-blue-200',
 'bg-indigo-100 border-indigo-300 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-600 dark:text-indigo-200',
 'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-900 dark:border-violet-600 dark:text-violet-200',
 'bg-purple-100 border-purple-300 text-purple-800 dark:bg-purple-900 dark:border-purple-600 dark:text-purple-200',
 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800 dark:bg-fuchsia-900 dark:border-fuchsia-600 dark:text-fuchsia-200'
];

function getProjectColor(groupName) {
 if (!groupName || groupName === 'None') return 'bg-gray-100 border-gray-300 text-gray-800'; 
 if (appSettings.projectColors && appSettings.projectColors[groupName]) return appSettings.projectColors[groupName];
 return 'bg-gray-100 border-gray-300 text-gray-800'; 
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
   html += `<span class="px-2 py-0.5 rounded text-[10px] font-bold border cursor-help ${getProjectColor(proj)}" title="${proj}">${getProjectAbbreviation(proj)}</span>`;
 });
 container.innerHTML = html;
}

function setBtnLoading(btn, isLoading) {
 if (!btn) return; const spinner = btn.querySelector('.btn-spinner');
 if (isLoading) { btn.disabled = true; btn.classList.add('opacity-80', 'cursor-not-allowed'); if (spinner) spinner.classList.remove('hidden-force'); } 
 else { btn.disabled = false; btn.classList.remove('opacity-80', 'cursor-not-allowed'); if (spinner) spinner.classList.add('hidden-force'); }
}

function showToast(msg, isError = false) {
 const t = document.getElementById('toast'); t.textContent = msg;
 t.className = `fixed top-16 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-lg shadow-xl z-50 transition-opacity duration-300 text-sm font-semibold text-white border ${isError ? 'bg-red-600 border-red-700' : 'bg-gray-800 border-gray-700'}`;
 t.classList.remove('opacity-0'); setTimeout(() => t.classList.add('opacity-0'), 3000);
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
 document.querySelectorAll('.tab-btn').forEach(el => { el.classList.remove('bg-white', 'dark:bg-gray-700', 'shadow-sm', 'text-gray-900', 'dark:text-white'); el.classList.add('text-gray-500'); });
 document.getElementById(`tab-${tabId}`).classList.remove('hidden-force');
 const activeBtn = document.getElementById(`tabBtn-${tabId}`);
 if(activeBtn) { activeBtn.classList.remove('text-gray-500'); activeBtn.classList.add('bg-white', 'dark:bg-gray-700', 'shadow-sm', 'text-gray-900', 'dark:text-white'); }
 if(tabId === 'profile') loadProfileData();
 if(tabId === 'logistics') { buildLogisticsUI(); switchLogisticsSubTab('pairings'); renderPairings(); }
 if(tabId === 'attendance') { buildAttendanceUI(); renderAttendanceChecklist(); }
 if(tabId === 'settings') buildSettingsUI();
}

function injectGlobalModals() {
 document.getElementById('modalContainer').innerHTML = `
   <div id="tripSetupModal" class="fixed inset-0 bg-black/50 z-[95] hidden-force flex justify-center items-center p-4 backdrop-blur-sm transition-opacity">
     <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
       <h3 class="text-xl font-bold mb-1">Initialize Trip</h3>
       <div class="space-y-4 mb-6 mt-4">
         <div><label class="block text-xs font-semibold mb-1 text-gray-500">Trip Title</label><input type="text" id="tripTitleInput" value="MYG Overseas Trip" class="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
         <div><label class="block text-xs font-semibold mb-1 text-gray-500">Trip Year</label><input type="number" id="tripYearInput" class="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
       </div>
       <div class="flex space-x-3">
         <button onclick="cancelTripSetup()" class="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold border border-gray-300">Cancel</button>
         <button onclick="confirmTripSetup(this)" class="flex-1 bg-primary text-white py-2.5 rounded-xl font-semibold shadow flex justify-center items-center"><span class="btn-text">Open Reg</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
       </div>
     </div>
   </div>

   <div id="selectionBottomSheet" class="fixed inset-0 bg-black/50 z-[95] hidden-force flex flex-col justify-end">
     <div class="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md mx-auto overflow-hidden shadow-2xl animate-slide-up h-[70vh] flex flex-col">
       <div class="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
         <span id="sheetTitle" class="font-bold text-lg">Select</span><button type="button" onclick="closeSelectionSheet()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
       </div>
       <div class="flex-grow overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-gray-900" id="sheetListContainer"></div>
     </div>
   </div>

   <div id="colorPickerModal" class="fixed inset-0 bg-black/50 z-[96] hidden-force flex justify-center items-center p-4 backdrop-blur-sm">
     <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
       <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
         <h3 class="text-lg font-bold">Select Color</h3><button type="button" onclick="closeColorPicker()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
       </div>
       <div class="grid grid-cols-6 gap-3 mb-2" id="colorPaletteGrid"></div>
     </div>
   </div>

   <div id="datePickerSheet" class="fixed inset-0 bg-black/50 z-[90] hidden-force flex flex-col justify-end">
     <div class="bg-white dark:bg-gray-800 rounded-t-3xl w-full max-w-md mx-auto overflow-hidden shadow-2xl animate-slide-up">
       <div class="flex justify-between items-center p-4 border-b border-gray-200"><span class="font-bold text-lg">Select Date</span><button type="button" onclick="closePicker()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button></div>
       <div class="relative flex h-[200px] text-lg font-medium"><div class="picker-highlight"></div><div class="flex-1 picker-col" id="colDay"></div><div class="flex-1 picker-col" id="colMonth"></div><div class="flex-1 picker-col" id="colYear"></div></div>
       <div class="p-4 border-t border-gray-200"><button type="button" onclick="confirmPicker()" class="w-full bg-primary text-white py-3 rounded-xl font-semibold shadow">Done</button></div>
     </div>
   </div>`;
}