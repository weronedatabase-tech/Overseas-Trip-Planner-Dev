function buildAttendanceUI() {
  document.getElementById('tab-attendance').innerHTML = `
    <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-2"><h3 class="text-lg font-bold">Take Attendance</h3><span class="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded border border-green-200">🟢 Live Sync</span></div>
      <div class="grid grid-cols-2 gap-4 mb-4"><div><label class="block text-xs font-semibold text-gray-500 mb-1">Juncture</label><select id="attendanceJunctureSelect" class="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"></select></div><div><label class="block text-xs font-semibold text-gray-500 mb-1">Filter</label><select class="w-full p-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"><option>All</option></select></div></div>
      <div id="attendanceChecklist" class="space-y-2 border border-gray-200 p-2 rounded-xl bg-gray-50 h-64 overflow-y-auto"><div class="loader mx-auto my-10"></div></div>
      <button class="w-full mt-4 bg-primary text-white font-semibold py-3 rounded-xl shadow-sm hover:bg-blue-700 flex justify-center items-center"><span class="btn-text">Submit Attendance</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
    </div>`;
}

function renderAttendanceChecklist() {
  if(!globalLogistics || !document.getElementById('attendanceChecklist')) return; let html = '';
  globalLogistics.participants.forEach(p => {
    let roleColor = p.role === 'TRAINEE' ? 'text-blue-500' : (p.role === 'CAREGIVER' ? 'text-purple-500' : 'text-green-500');
    const dynColor = getProjectColor(p.group);
    html += `<label class="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:bg-blue-50 transition mb-2">
        <div class="flex items-center flex-wrap gap-2"><span class="font-bold text-sm px-2 py-0.5 rounded border ${dynColor}">${p.name}</span> <span class="text-xs font-medium ${roleColor}">${p.role}</span></div>
        <input type="checkbox" checked class="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary">
      </label>`;
  });
  document.getElementById('attendanceChecklist').innerHTML = html || '<p class="text-sm text-gray-400 p-2">No participants found.</p>';
  const attSel = document.getElementById('attendanceJunctureSelect'); if(attSel && appSettings.junctures) { attSel.innerHTML = ''; appSettings.junctures.forEach(j => attSel.innerHTML += `<option value="${j}">${j}</option>`); }
}
