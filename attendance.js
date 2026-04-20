function buildAttendanceUI() {
 document.getElementById('tab-attendance').innerHTML = `
   <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-t-8 border-gray-300 dark:border-gray-700 border-t-primary admin-only">
     <div class="flex justify-between items-center mb-4 border-b-2 border-gray-200 dark:border-gray-700 pb-2"><h3 class="text-xl font-extrabold text-gray-900 dark:text-white">Take Attendance</h3><span class="bg-green-100 text-green-800 text-xs font-extrabold px-2 py-1 rounded border border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700">🟢 Online & Syncing</span></div>
     <div class="grid grid-cols-2 gap-4 mb-6"><div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Juncture</label><select id="attendanceJunctureSelect" class="w-full p-2 border-2 rounded font-bold text-sm"></select></div><div><label class="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">My Assignment</label><select class="w-full p-2 border-2 rounded font-bold text-sm"><option>All Participants</option></select></div></div>
     <div id="attendanceChecklist" class="space-y-2 border-2 border-gray-300 dark:border-gray-600 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 h-64 overflow-y-auto"><div class="loader border-primary mx-auto my-10"></div></div>
     <button class="w-full mt-4 bg-primary text-white font-extrabold py-3 rounded-lg shadow border-2 border-blue-800 flex justify-center items-center"><span class="btn-text">Submit Attendance</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
   </div>`;
}

function renderAttendanceChecklist() {
 if(!globalLogistics || !document.getElementById('attendanceChecklist')) return; let html = '';
 globalLogistics.participants.forEach(p => {
   let roleColor = p.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (p.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
   const dynColor = getProjectColor(p.group);
   html += `<label class="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition mb-2">
       <div class="flex items-center flex-wrap gap-2"><span class="font-extrabold text-lg px-2 py-1 rounded-md border-2 ${dynColor}">${p.name}</span> <span class="text-sm font-bold ${roleColor}">(${p.role})</span></div>
       <input type="checkbox" checked class="w-6 h-6 text-primary rounded-md border-2 border-gray-400 dark:border-gray-500 focus:ring-primary">
     </label>`;
 });
 document.getElementById('attendanceChecklist').innerHTML = html || '<p class="text-sm font-bold text-gray-500 dark:text-gray-400 p-2">No participants found.</p>';
 const attSel = document.getElementById('attendanceJunctureSelect'); if(attSel && appSettings.junctures) { attSel.innerHTML = ''; appSettings.junctures.forEach(j => attSel.innerHTML += `<option value="${j}">${j}</option>`); }
}