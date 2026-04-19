function buildSettingsUI() {
  document.getElementById('tab-settings').innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold mb-1">Registration Form</h3>
          <p class="text-xs text-gray-500 mb-4">Allow new participants to sign up.</p>
        </div>
        <button id="toggleRegBtn" onclick="initiateRegistrationToggle(this)" class="w-full px-4 py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-xl shadow-sm border border-gray-300 flex justify-center items-center"><span class="btn-text">Loading...</span><div class="btn-spinner hidden-force ml-2"></div></button>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="text-lg font-bold mb-1">Profile Editing</h3>
          <p class="text-xs text-gray-500 mb-4">Can participants edit their details?</p>
        </div>
        <div class="flex items-center space-x-3 bg-gray-50 p-1.5 rounded-xl border border-gray-200 w-full">
          <button id="editToggleYes" onclick="setEditState(true)" class="flex-1 py-1.5 rounded-lg font-semibold text-sm transition">Yes</button>
          <button id="editToggleNo" onclick="setEditState(false)" class="flex-1 py-1.5 rounded-lg font-semibold text-sm transition">No</button>
        </div>
      </div>
    </div>
    
    <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm admin-only">
      <h3 class="text-lg font-bold mb-1">Attendance Junctures</h3>
      <div class="flex space-x-2 mb-4 mt-2">
        <input type="text" id="newJunctureName" placeholder="e.g. Day 1: Dinner" class="flex-grow p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
        <button onclick="addJuncture(this)" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center shadow-sm"><span class="btn-text">Add</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
      </div>
      <ul id="junctureList" class="space-y-2"></ul>
    </div>

    ${currentUser && currentUser.nric === 'ADMIN' ? `
    <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <h3 class="text-lg font-bold mb-1">Projects</h3>
      <p class="text-xs text-gray-500 mb-3">Define the dropdown options for Projects.</p>
      <div class="flex space-x-2 mb-4">
        <input type="text" id="newGroupName" placeholder="e.g. Project A" class="flex-grow p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
        <button onclick="openColorPickerForNewProject()" class="w-10 h-10 rounded-full border border-gray-300 shadow-sm transition hover:scale-105" id="newGroupColorBtn" style="background-color:#fff" title="Pick color"></button>
        <button onclick="addProjectGroup(this)" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center shadow-sm"><span class="btn-text">Add</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
      </div>
      <ul id="groupList" class="space-y-2"></ul>
    </div>` : ''}

    <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
      <h3 class="text-lg font-bold mb-1">Committee Members</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 mt-2">
        <input type="text" id="newCommName" placeholder="Full Name" class="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
        <input type="text" id="newCommNric" placeholder="NRIC/FIN" class="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg uppercase text-sm font-medium">
        <div class="flex space-x-2">
          <input type="tel" id="newCommPhone" placeholder="Phone" pattern="[0-9]{8}" class="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
          <button onclick="addCommittee(this)" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold flex items-center shadow-sm"><span class="btn-text">Add</span><div class="btn-spinner spinner-white hidden-force ml-1"></div></button>
        </div>
      </div>
      <ul id="commList" class="space-y-2"></ul>
    </div>

    ${currentUser && currentUser.nric === 'ADMIN' ? `
    <div class="bg-red-50 p-5 rounded-2xl border border-red-200 shadow-sm">
      <h3 class="text-lg font-bold mb-1 text-red-700">Danger Zone</h3>
      <p class="text-xs text-red-600 mb-4">Archive trip to Google Drive and wipe system for a fresh start.</p>
      <button onclick="archiveSystem(this)" class="bg-red-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow flex justify-center items-center hover:bg-red-700 transition"><span class="btn-text">Archive & Reset</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
    </div>` : ''}
  `;
  applyAdminVisuals();
  renderJunctureList(appSettings.junctures);
  if(currentUser && currentUser.nric === 'ADMIN') renderGroupList(appSettings.projectGroups);
  renderCommList(appSettings.committee);
}

function applyAdminVisuals() {
  const rBtn = document.getElementById('toggleRegBtn'); 
  if(rBtn) { 
    if(appSettings.registrationOpen) { 
      rBtn.innerHTML = `<span class="btn-text">OPEN (Click to Close)</span><div class="btn-spinner spinner-white hidden-force ml-2"></div>`; rBtn.className = "w-full px-4 py-2.5 bg-green-600 text-white font-semibold rounded-xl shadow-sm transition flex justify-center items-center"; 
    } else { 
      rBtn.innerHTML = `<span class="btn-text">CLOSED (Click to Open)</span><div class="btn-spinner spinner-white hidden-force ml-2"></div>`; rBtn.className = "w-full px-4 py-2.5 bg-red-500 text-white font-semibold rounded-xl shadow-sm transition flex justify-center items-center"; 
    } 
  }
  const yesBtn = document.getElementById('editToggleYes'); const noBtn = document.getElementById('editToggleNo');
  if (yesBtn && noBtn) {
    if(appSettings.allowEdits) { yesBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-sm transition bg-green-600 text-white shadow"; noBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-sm transition text-gray-500 hover:bg-gray-200"; } 
    else { yesBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-sm transition text-gray-500 hover:bg-gray-200"; noBtn.className = "flex-1 py-1.5 rounded-lg font-semibold text-sm transition bg-red-500 text-white shadow"; }
  }
}

function initiateRegistrationToggle(btn) { if(!appSettings.registrationOpen) { document.getElementById('tripYearInput').value = new Date().getFullYear(); document.getElementById('tripSetupModal').classList.remove('hidden-force'); } else { executeToggleRegistration(false, '', '', btn); } }
function cancelTripSetup() { document.getElementById('tripSetupModal').classList.add('hidden-force'); }
async function confirmTripSetup(btn) { document.getElementById('tripSetupModal').classList.add('hidden-force'); await executeToggleRegistration(true, document.getElementById('tripTitleInput').value.trim() || 'MYG Overseas Trip', document.getElementById('tripYearInput').value.trim() || new Date().getFullYear(), btn); }
async function executeToggleRegistration(newState, title = '', year = '', sourceBtn = null) {
  const mainBtn = document.getElementById('toggleRegBtn'); setBtnLoading(mainBtn, true); if(sourceBtn && sourceBtn !== mainBtn) setBtnLoading(sourceBtn, true);
  try { const res = await callBackend('toggleRegistration', { status: newState, tripTitle: title, tripYear: year }); appSettings.registrationOpen = newState; const headerTripName = document.getElementById('headerTripName'); if(newState && res.tripTitle && res.tripYear) { headerTripName.textContent = `${res.tripTitle} ${res.tripYear}`; headerTripName.classList.remove('hidden-force'); } else { headerTripName.classList.add('hidden-force'); } applyAdminVisuals(); showToast(newState ? "Registration Opened" : "Registration Closed"); } catch(e) { showToast("Failed.", true); applyAdminVisuals(); } finally { setBtnLoading(mainBtn, false); if(sourceBtn && sourceBtn !== mainBtn) setBtnLoading(sourceBtn, false); }
}

async function setEditState(newState) {
  if (appSettings.allowEdits === newState) return;
  const yesBtn = document.getElementById('editToggleYes'); const noBtn = document.getElementById('editToggleNo'); yesBtn.disabled = true; noBtn.disabled = true;
  try { await callBackend('toggleEdits', { status: newState }); appSettings.allowEdits = newState; applyAdminVisuals(); showToast(newState ? "Edits Enabled" : "Edits Locked"); } catch(e) { showToast("Failed.", true); applyAdminVisuals(); } finally { yesBtn.disabled = false; noBtn.disabled = false; }
}

async function addProjectGroup(btn) {
  const name = document.getElementById('newGroupName').value.trim(); if(!name) return showToast("Project name required", true); setBtnLoading(btn, true);
  try { if(!newProjectSelectedColor) newProjectSelectedColor = getUnusedColor(); const res = await callBackend('addProjectGroup', { groupName: name, callerNric: currentUser.nric, colorClass: newProjectSelectedColor }); document.getElementById('newGroupName').value = ''; newProjectSelectedColor = null; document.getElementById('newGroupColorBtn').className = "w-10 h-10 rounded-full border border-gray-300 shadow-sm transition hover:scale-105 bg-white"; appSettings.projectGroups = res.groups; appSettings.projectColors = res.projectColors; renderGroupList(res.groups); renderHeaderLegend(); showToast("Project Added"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); }
}
async function removeProjectGroup(name, btn) { setBtnLoading(btn, true); try { const res = await callBackend('removeProjectGroup', { groupName: name, callerNric: currentUser.nric }); appSettings.projectGroups = res.groups; appSettings.projectColors = res.projectColors; renderGroupList(res.groups); renderHeaderLegend(); showToast("Project Removed"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
function renderGroupList(list) {
  const ul = document.getElementById('groupList'); if(!ul) return; ul.innerHTML = (!list || list.length === 0) ? '<li class="text-xs text-gray-400">No projects.</li>' : '';
  if(list) list.forEach(g => { const safeGroup = g.replace(/'/g, "\\'"); const dynColor = getProjectColor(g); ul.innerHTML += `<li class="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm"><div class="flex items-center space-x-2"><button onclick="openColorPicker('${safeGroup}')" class="w-6 h-6 rounded-full border shadow-sm ${dynColor}" title="Change Color"></button><span class="font-bold text-sm">${g}</span></div><button onclick="removeProjectGroup('${safeGroup}', this)" class="text-red-500 text-xs font-bold px-2 py-1 bg-red-50 rounded flex items-center hover:bg-red-100 transition"><span class="btn-text">Remove</span><div class="btn-spinner spinner-red hidden-force ml-1 !w-3 !h-3 border-2"></div></button></li>`; });
}

async function addJuncture(btn) { const name = document.getElementById('newJunctureName').value.trim(); if(!name) return showToast("Required", true); setBtnLoading(btn, true); try { const res = await callBackend('modifyJunctures', { actionType: 'add', newName: name }); document.getElementById('newJunctureName').value = ''; appSettings.junctures = res.junctures; renderJunctureList(res.junctures); showToast("Added"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
async function removeJuncture(name, btn) { setBtnLoading(btn, true); try { const res = await callBackend('modifyJunctures', { actionType: 'remove', oldName: name }); appSettings.junctures = res.junctures; renderJunctureList(res.junctures); showToast("Removed"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
async function editJuncture(oldName) { const newName = prompt(`Edit Juncture Name:`, oldName); if(!newName || newName.trim() === '' || newName.trim() === oldName) return; try { const res = await callBackend('modifyJunctures', { actionType: 'edit', oldName: oldName, newName: newName.trim() }); appSettings.junctures = res.junctures; renderJunctureList(res.junctures); showToast("Updated"); } catch(e) { showToast(e.message, true); } }
function renderJunctureList(list) { const ul = document.getElementById('junctureList'); if(!ul) return; ul.innerHTML = (!list || list.length === 0) ? '<li class="text-xs text-gray-400">No junctures.</li>' : ''; if(list) list.forEach(j => { const safeName = j.replace(/'/g, "\\'"); ul.innerHTML += `<li class="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm"><span class="font-bold text-sm">${j}</span><div class="flex space-x-2"><button onclick="editJuncture('${safeName}')" class="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-50 rounded">Edit</button><button onclick="removeJuncture('${safeName}', this)" class="text-red-500 text-xs font-bold px-2 py-1 bg-red-50 rounded flex items-center hover:bg-red-100 transition"><span class="btn-text">Remove</span><div class="btn-spinner spinner-red hidden-force ml-1 !w-3 !h-3 border-2"></div></button></div></li>`; }); const attSel = document.getElementById('attendanceJunctureSelect'); if(attSel) { attSel.innerHTML = ''; if(list) list.forEach(j => attSel.innerHTML += `<option value="${j}">${j}</option>`); } }

async function addCommittee(btn) { const name = document.getElementById('newCommName').value.trim(); const nric = document.getElementById('newCommNric').value.trim(); const phone = document.getElementById('newCommPhone').value.trim(); if(!nric || !name || !phone) return showToast("Name, NRIC, Phone required", true); setBtnLoading(btn, true); try { const res = await callBackend('addCommittee', { nric, name, phone }); document.getElementById('newCommName').value = ''; document.getElementById('newCommNric').value = ''; document.getElementById('newCommPhone').value = ''; appSettings.committee = res.list; renderCommList(res.list); showToast("Added"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
async function removeCommittee(nric, btn) { setBtnLoading(btn, true); try { const res = await callBackend('removeCommittee', { nric }); appSettings.committee = res.list; renderCommList(res.list); showToast("Removed"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
function renderCommList(list) { const ul = document.getElementById('commList'); if(!ul) return; ul.innerHTML = (!list || list.length === 0) ? '<li class="text-xs text-gray-400">No committee.</li>' : ''; if(list) list.forEach(m => { ul.innerHTML += `<li class="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm"><div><p class="font-bold text-sm">${m.name}</p><p class="text-[10px] text-gray-400 font-mono">${m.nric} | ${m.phone}</p></div><button onclick="removeCommittee('${m.nric}', this)" class="text-red-500 text-xs font-bold px-2 py-1 bg-red-50 rounded flex items-center hover:bg-red-100 transition"><span class="btn-text">Remove</span><div class="btn-spinner spinner-red hidden-force ml-1 !w-3 !h-3 border-2"></div></button></li>`; }); }

async function archiveSystem(btn) { if(!confirm("⚠️ ARE YOU SURE?\n\nThis archives the database and completely resets the system.")) return; showToast("Archiving...", false); setBtnLoading(btn, true); try { await callBackend('archiveAndReset'); showToast("Reset successful!"); setTimeout(() => { window.location.reload(); }, 2000); } catch (e) { showToast(e.message, true); setBtnLoading(btn, false); } }
