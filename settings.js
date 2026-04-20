function applyAdminVisuals() {
 const rBtn = document.getElementById('toggleRegBtn'); 
 if(rBtn) { if(appSettings.registrationOpen) { rBtn.innerHTML = `<span class="btn-text">OPEN (Click to Close)</span><div class="btn-spinner spinner-white hidden-force ml-2"></div>`; rBtn.className = "w-full px-6 py-3 bg-green-600 text-white font-extrabold rounded-lg shadow-md border-2 border-green-800 transition flex justify-center items-center"; } else { rBtn.innerHTML = `<span class="btn-text">CLOSED (Click to Open)</span><div class="btn-spinner spinner-white hidden-force ml-2"></div>`; rBtn.className = "w-full px-6 py-3 bg-red-600 text-white font-extrabold rounded-lg shadow-md border-2 border-red-800 transition flex justify-center items-center"; } }
 const sliderBtn = document.getElementById('editSliderToggle'); const sliderKnob = document.getElementById('editSliderKnob'); const statusText = document.getElementById('editStatusText');
 if (sliderBtn && sliderKnob && statusText) { if(appSettings.allowEdits) { sliderBtn.className = "relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none border-2 border-green-800 bg-green-600 shadow-inner"; sliderKnob.className = "inline-flex w-6 h-6 transform translate-x-7 bg-white rounded-full transition-transform duration-300 shadow-md items-center justify-center"; statusText.textContent = "Yes"; statusText.className = "font-extrabold text-lg text-green-600 dark:text-green-400 transition-colors"; } else { sliderBtn.className = "relative inline-flex items-center h-8 w-14 rounded-full transition-colors duration-300 focus:outline-none border-2 border-gray-400 dark:border-gray-500 bg-gray-300 dark:bg-gray-600 shadow-inner"; sliderKnob.className = "inline-flex w-6 h-6 transform translate-x-1 bg-white rounded-full transition-transform duration-300 shadow-md items-center justify-center"; statusText.textContent = "No"; statusText.className = "font-extrabold text-lg text-gray-600 dark:text-gray-400 transition-colors"; } }
}

function buildSettingsUI() {
 document.getElementById('tab-settings').innerHTML = `
   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
     <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-700">
       <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 border-b-2 border-gray-300 dark:border-gray-700 pb-3">Registration Form</h3>
       <p class="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4">Allow new participants to sign up using the public form.</p>
       <button id="toggleRegBtn" onclick="initiateRegistrationToggle(this)" class="w-full px-6 py-3 bg-green-600 text-white font-extrabold rounded-lg shadow-md border-2 border-green-800 flex justify-center items-center"><span class="btn-text">Loading...</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
     </div>
     <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-700">
       <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 border-b-2 border-gray-300 dark:border-gray-700 pb-3">Can participants edit details?</h3>
       <div class="flex items-center space-x-4 mt-6">
         <button id="editSliderToggle" onclick="toggleEditSlider(this)" class="relative inline-flex items-center h-8 w-14 rounded-full border-2 border-gray-400 bg-gray-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary">
           <span id="editSliderKnob" class="inline-flex w-6 h-6 transform translate-x-1 bg-white rounded-full shadow-md items-center justify-center"><div id="editSliderLoader" class="loader hidden-force" style="width: 14px; height: 14px; border-width: 2px; border-top-color: #2563eb;"></div></span>
         </button>
         <span id="editStatusText" class="font-extrabold text-lg text-gray-600 dark:text-gray-400">No</span>
       </div>
     </div>
   </div>
   
   <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-700 admin-only">
     <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 border-b-2 border-gray-300 dark:border-gray-700 pb-3">Attendance Junctures</h3>
     <div class="flex space-x-3 mb-5 mt-4">
       <input type="text" id="newJunctureName" placeholder="e.g. Day 1: Dinner" class="flex-grow p-3 border-2 rounded-lg font-bold">
       <button onclick="addJuncture(this)" class="bg-primary text-white px-6 py-3 rounded-lg font-extrabold border-2 border-blue-800 flex items-center shadow-md focus:ring-2 focus:ring-blue-400"><span class="btn-text">Add</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
     </div>
     <ul id="junctureList" class="space-y-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-5 bg-gray-50 dark:bg-gray-900"></ul>
   </div>

   <div id="projectsSettingsBlock" class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-700 main-admin-only ${currentUser && currentUser.nric === 'ADMIN' ? '' : 'hidden-force'}">
     <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 border-b-2 border-gray-300 dark:border-gray-700 pb-3">Projects</h3>
     <div class="flex space-x-3 mb-5 mt-4">
       <input type="text" id="newGroupName" placeholder="e.g. Project A" class="flex-grow p-3 border-2 rounded-lg font-bold">
       <button onclick="openColorPickerForNewProject()" class="w-12 h-12 rounded-full border-4 border-gray-400 dark:border-gray-500 shadow-md transition hover:scale-105" id="newGroupColorBtn" style="background-color:#fff" title="Pick a color"></button>
       <button onclick="addProjectGroup(this)" class="bg-primary text-white px-6 py-3 rounded-lg font-extrabold border-2 border-blue-800 flex items-center shadow-md focus:ring-2 focus:ring-blue-400"><span class="btn-text">Add</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
     </div>
     <ul id="groupList" class="space-y-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-5 bg-gray-50 dark:bg-gray-900"></ul>
   </div>

   <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-gray-300 dark:border-gray-700">
     <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 border-b-2 border-gray-300 dark:border-gray-700 pb-3">Committee Members</h3>
     <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 mt-4">
       <input type="text" id="newCommName" placeholder="Full Name" class="w-full p-3 border-2 rounded-lg font-bold">
       <input type="text" id="newCommNric" placeholder="NRIC/FIN" class="w-full p-3 border-2 rounded-lg uppercase font-bold">
       <div class="flex space-x-2">
         <input type="tel" id="newCommPhone" placeholder="8-Digit Phone" pattern="[0-9]{8}" class="w-full p-3 border-2 rounded-lg font-bold">
         <button onclick="addCommittee(this)" class="bg-primary text-white px-5 py-3 rounded-lg font-extrabold border-2 border-blue-800 flex items-center shadow-md focus:ring-2 focus:ring-blue-400"><span class="btn-text">Add</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
       </div>
     </div>
     <ul id="commList" class="space-y-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-5 bg-gray-50 dark:bg-gray-900"></ul>
   </div>

   <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 border-t-8 border-gray-300 dark:border-gray-700 border-t-red-500 main-admin-only ${currentUser && currentUser.nric === 'ADMIN' ? '' : 'hidden-force'}">
     <h3 class="text-xl font-extrabold mb-3 border-b-2 border-gray-300 dark:border-gray-700 pb-3 text-red-600 dark:text-red-400">Danger Zone</h3>
     <p class="text-sm font-bold text-gray-600 dark:text-gray-400 mb-5">Archive current trip to Google Drive and wipe system for a fresh start.</p>
     <button onclick="archiveSystem(this)" class="w-full sm:w-auto bg-red-600 text-white font-extrabold py-3 px-6 rounded-lg border-2 border-red-800 flex items-center justify-center shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-400"><span class="btn-text">Archive & Reset</span><div class="btn-spinner spinner-white hidden-force ml-2"></div></button>
   </div>
 `;
 applyAdminVisuals();
 renderJunctureList(appSettings.junctures);
 if(currentUser && currentUser.nric === 'ADMIN') renderGroupList(appSettings.projectGroups);
 renderCommList(appSettings.committee);
}

function initiateRegistrationToggle(btn) { if(!appSettings.registrationOpen) { document.getElementById('tripYearInput').value = new Date().getFullYear(); document.getElementById('tripSetupModal').classList.remove('hidden-force'); } else { executeToggleRegistration(false, '', '', btn); } }
function cancelTripSetup() { document.getElementById('tripSetupModal').classList.add('hidden-force'); }
async function confirmTripSetup(btn) { document.getElementById('tripSetupModal').classList.add('hidden-force'); await executeToggleRegistration(true, document.getElementById('tripTitleInput').value.trim() || 'MYG Overseas Trip', document.getElementById('tripYearInput').value.trim() || new Date().getFullYear(), btn); }
async function executeToggleRegistration(newState, title = '', year = '', sourceBtn = null) {
 const mainBtn = document.getElementById('toggleRegBtn'); setBtnLoading(mainBtn, true); if(sourceBtn && sourceBtn !== mainBtn) setBtnLoading(sourceBtn, true);
 try { const res = await callBackend('toggleRegistration', { status: newState, tripTitle: title, tripYear: year }); appSettings.registrationOpen = newState; const headerTripName = document.getElementById('headerTripName'); if(newState && res.tripTitle && res.tripYear) { headerTripName.textContent = `${res.tripTitle} ${res.tripYear}`; headerTripName.classList.remove('hidden-force'); } else { headerTripName.classList.add('hidden-force'); } applyAdminVisuals(); showToast(newState ? "Registration Opened" : "Registration Closed"); } catch(e) { showToast("Failed.", true); applyAdminVisuals(); } finally { setBtnLoading(mainBtn, false); if(sourceBtn && sourceBtn !== mainBtn) setBtnLoading(sourceBtn, false); }
}

async function toggleEditSlider(btn) {
 if(btn.disabled) return; const sliderLoader = document.getElementById('editSliderLoader'); const newState = !appSettings.allowEdits; btn.disabled = true; sliderLoader.classList.remove('hidden-force');
 try { await callBackend('toggleEdits', { status: newState }); appSettings.allowEdits = newState; applyAdminVisuals(); showToast(newState ? "Edits Enabled" : "Edits Locked"); } catch(e) { showToast("Failed to update.", true); applyAdminVisuals(); } finally { btn.disabled = false; sliderLoader.classList.add('hidden-force'); }
}

async function addProjectGroup(btn) {
 const name = document.getElementById('newGroupName').value.trim(); if(!name) return showToast("Project name required", true); setBtnLoading(btn, true);
 try { if(!newProjectSelectedColor) newProjectSelectedColor = getUnusedColor(); const res = await callBackend('addProjectGroup', { groupName: name, callerNric: currentUser.nric, colorClass: newProjectSelectedColor }); document.getElementById('newGroupName').value = ''; newProjectSelectedColor = null; document.getElementById('newGroupColorBtn').className = "w-12 h-12 rounded-full border-4 border-gray-400 dark:border-gray-500 shadow-md transition hover:scale-105 bg-white dark:bg-gray-800"; appSettings.projectGroups = res.groups; appSettings.projectColors = res.projectColors; renderGroupList(res.groups); renderHeaderLegend(); showToast("Project Added"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); }
}
async function removeProjectGroup(name, btn) { setBtnLoading(btn, true); try { const res = await callBackend('removeProjectGroup', { groupName: name, callerNric: currentUser.nric }); appSettings.projectGroups = res.groups; appSettings.projectColors = res.projectColors; renderGroupList(res.groups); renderHeaderLegend(); showToast("Project Removed"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
function renderGroupList(list) {
 const ul = document.getElementById('groupList'); if(!ul) return; ul.innerHTML = (!list || list.length === 0) ? '<li class="text-sm font-bold text-gray-500 dark:text-gray-400">No projects defined yet.</li>' : '';
 if(list) list.forEach(g => { const safeGroup = g.replace(/'/g, "\\'"); const dynColor = getProjectColor(g); ul.innerHTML += `<li class="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"><div class="flex items-center space-x-3"><button onclick="openColorPicker('${safeGroup}')" class="w-8 h-8 rounded-full border-2 cursor-pointer shadow-sm ${dynColor}" title="Change Color"></button><span class="font-extrabold text-lg text-gray-900 dark:text-white">${g}</span></div><button onclick="removeProjectGroup('${safeGroup}', this)" class="text-red-600 dark:text-red-400 text-sm font-extrabold px-4 py-2 border-2 border-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg flex justify-center items-center focus:outline-none"><span class="btn-text">Remove</span><div class="btn-spinner spinner-red hidden-force ml-2"></div></button></li>`; });
}

async function addJuncture(btn) { const name = document.getElementById('newJunctureName').value.trim(); if(!name) return showToast("Required", true); setBtnLoading(btn, true); try { const res = await callBackend('modifyJunctures', { actionType: 'add', newName: name }); document.getElementById('newJunctureName').value = ''; appSettings.junctures = res.junctures; renderJunctureList(res.junctures); showToast("Added"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
async function removeJuncture(name, btn) { setBtnLoading(btn, true); try { const res = await callBackend('modifyJunctures', { actionType: 'remove', oldName: name }); appSettings.junctures = res.junctures; renderJunctureList(res.junctures); showToast("Removed"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
async function editJuncture(oldName) { const newName = prompt(`Edit Juncture Name:`, oldName); if(!newName || newName.trim() === '' || newName.trim() === oldName) return; try { const res = await callBackend('modifyJunctures', { actionType: 'edit', oldName: oldName, newName: newName.trim() }); appSettings.junctures = res.junctures; renderJunctureList(res.junctures); showToast("Updated"); } catch(e) { showToast(e.message, true); } }
function renderJunctureList(list) { const ul = document.getElementById('junctureList'); if(!ul) return; ul.innerHTML = (!list || list.length === 0) ? '<li class="text-sm font-bold text-gray-500 dark:text-gray-400">No junctures defined yet.</li>' : ''; if(list) list.forEach(j => { const safeName = j.replace(/'/g, "\\'"); ul.innerHTML += `<li class="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"><span class="font-extrabold text-lg text-gray-900 dark:text-white">${j}</span><div class="flex space-x-2"><button onclick="editJuncture('${safeName}')" class="text-blue-600 dark:text-blue-400 text-sm font-extrabold px-3 py-2 border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg focus:outline-none">Edit</button><button onclick="removeJuncture('${safeName}', this)" class="text-red-600 dark:text-red-400 text-sm font-extrabold px-3 py-2 border-2 border-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg flex justify-center items-center focus:outline-none"><span class="btn-text">Remove</span><div class="btn-spinner spinner-red hidden-force ml-2"></div></button></div></li>`; }); const attSel = document.getElementById('attendanceJunctureSelect'); if(attSel) { attSel.innerHTML = ''; if(list) list.forEach(j => attSel.innerHTML += `<option value="${j}">${j}</option>`); } }

async function addCommittee(btn) { const name = document.getElementById('newCommName').value.trim(); const nric = document.getElementById('newCommNric').value.trim(); const phone = document.getElementById('newCommPhone').value.trim(); if(!nric || !name || !phone) return showToast("Name, NRIC, Phone required", true); setBtnLoading(btn, true); try { const res = await callBackend('addCommittee', { nric, name, phone }); document.getElementById('newCommName').value = ''; document.getElementById('newCommNric').value = ''; document.getElementById('newCommPhone').value = ''; appSettings.committee = res.list; renderCommList(res.list); showToast("Added"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
async function removeCommittee(nric, btn) { setBtnLoading(btn, true); try { const res = await callBackend('removeCommittee', { nric }); appSettings.committee = res.list; renderCommList(res.list); showToast("Removed"); } catch(e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); } }
function renderCommList(list) { const ul = document.getElementById('commList'); if(!ul) return; ul.innerHTML = (!list || list.length === 0) ? '<li class="text-sm font-bold text-gray-500 dark:text-gray-400">No committee members assigned yet.</li>' : ''; if(list) list.forEach(m => { ul.innerHTML += `<li class="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"><div><p class="font-extrabold text-lg text-gray-900 dark:text-white">${m.name}</p><p class="text-sm text-gray-500 dark:text-gray-400 font-mono font-bold">${m.nric} | ${m.phone}</p></div><button onclick="removeCommittee('${m.nric}', this)" class="text-red-600 dark:text-red-400 text-sm font-extrabold px-4 py-2 border-2 border-red-600 dark:border-red-500 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg flex justify-center items-center focus:outline-none"><span class="btn-text">Remove</span><div class="btn-spinner spinner-red hidden-force ml-2"></div></button></li>`; }); }

async function archiveSystem(btn) { if(!confirm("⚠️ ARE YOU SURE?\n\nThis archives the database and completely resets the system.")) return; showToast("Archiving...", false); setBtnLoading(btn, true); try { await callBackend('archiveAndReset'); showToast("Reset successful!"); setTimeout(() => { window.location.reload(); }, 2000); } catch (e) { showToast(e.message, true); setBtnLoading(btn, false); } }