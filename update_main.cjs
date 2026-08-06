const fs = require('fs');
let code = fs.readFileSync('frontend/js/main.js', 'utf8');

// Replace showParticipantSummaryModal
const oldFuncRegex = /async function showParticipantSummaryModal\(nric\) \{[\s\S]*?window\.closeParticipantSummaryModal = function\(\) \{[\s\S]*?\}/;
const newFunc = `
async function showParticipantSummaryModal(nric) {
  let modal = document.getElementById('globalParticipantModal');
  if(!modal) {
    modal = document.createElement('div');
    modal.id = 'globalParticipantModal';
    modal.className = 'fixed inset-0 bg-black/60 z-[110] flex justify-center items-center p-4 backdrop-blur-sm hidden-force overflow-y-auto';
    modal.innerHTML = \`
      <div class="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 animate-slide-up flex flex-col overflow-hidden my-auto">
        <div class="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 shrink-0 bg-gray-50 dark:bg-gray-900/50">
          <h3 class="text-base font-black text-gray-900 dark:text-white flex items-center gap-2">
            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Participant Summary
          </h3>
          <button type="button" onclick="closeParticipantSummaryModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl font-bold px-1 focus:outline-none">&times;</button>
        </div>
        <div id="gpm-content" class="p-5 flex flex-col gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div class="flex justify-center py-6"><div class="loader !w-8 !h-8 border-primary"></div></div>
        </div>
      </div>
    \`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if(e.target === modal) closeParticipantSummaryModal(); });
  }

  modal.classList.remove('hidden-force');
  const cont = document.getElementById('gpm-content');
  cont.innerHTML = \`<div class="flex justify-center py-6"><div class="loader !w-8 !h-8 border-primary"></div></div>\`;

  try {
    const res = await apiCall('getProfile', { nric: nric });
    if(res.status === 'error') throw new Error(res.message);
    const m = res.family.find(f => f.nric.toUpperCase() === nric.toUpperCase());
    if(!m) throw new Error("Participant not found");

    let groupOpts = \`<option value="">Select...</option>\`;
    if(appSettings.projectGroups) { 
      appSettings.projectGroups.forEach(g => { groupOpts += \`<option value="\${g}" \${m.group === g ? 'selected' : ''}>\${g}</option>\`; }); 
    }
    if(m.group && (!appSettings.projectGroups || !appSettings.projectGroups.includes(m.group))) { 
      groupOpts += \`<option value="\${m.group}" selected>\${m.group} (Archived)</option>\`; 
    }
    const dynColor = getProjectColor(m.group);

    window._currentModalParticipant = m;

    cont.innerHTML = \`
      <div id="gpm-view">
        <div class="flex justify-between items-start border-b border-gray-100 dark:border-gray-800 pb-2 mb-3">
          <div class="flex items-center flex-wrap gap-1.5">
            <span class="font-extrabold text-[13px] md:text-sm px-2 py-0.5 rounded shadow-sm border \${dynColor} leading-tight">\${m.fullName}</span> 
            <span class="text-[9px] font-black text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-1.5 py-0.5 rounded uppercase tracking-wider">\${m.role}</span>
          </div>
          <div class="flex gap-2">
            <button onclick="document.getElementById('gpm-view').classList.add('hidden-force'); document.getElementById('gpm-edit').classList.remove('hidden-force');" class="text-primary dark:text-blue-400 text-xs font-bold hover:bg-blue-50 dark:hover:bg-gray-800 px-2 py-1 rounded transition focus:outline-none border border-transparent hover:border-blue-200 dark:hover:border-gray-700 shadow-sm">Edit</button>
            <button onclick="deleteParticipant('\${m.nric}')" class="text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-gray-800 px-2 py-1 rounded transition focus:outline-none border border-transparent hover:border-red-200 dark:hover:border-gray-700 shadow-sm">Delete</button>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-gray-800 dark:text-gray-200">
          <div><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Short Name</p><p class="font-semibold">\${m.shortName || '-'}</p></div>
          <div><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">NRIC / FIN</p><p class="font-semibold uppercase">\${m.nric}</p></div>
          <div><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Date of Birth</p><p class="font-semibold">\${m.dob}</p></div>
          <div><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Gender & Nat.</p><p class="font-semibold">\${m.gender} | \${m.nationality}</p></div>
          <div><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Contact & Email</p><p class="font-semibold">\${m.contact} | \${m.email || 'N/A'}</p></div>
          <div class="border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-1">Project</p><span class="font-bold text-[10px] px-1.5 py-0.5 rounded border inline-block shadow-sm \${dynColor}">\${m.group || 'None'}</span></div>
          <div class="border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Home Address</p><p class="font-semibold">\${m.address}</p></div>
          <div class="border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Passport No.</p><p class="font-semibold uppercase">\${m.passportNo}</p></div>
          <div class="border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Passport Expiry</p><p class="font-semibold">\${m.passportExpiry || '-'}</p></div>
          <div class="border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Emerg. Contact</p><p class="font-semibold">\${m.emergencyName} (\${m.emergencyRelation}) - <span class="font-mono">\${m.emergencyContact}</span></p></div>
          <div class="border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Dietary Needs</p><p class="font-semibold text-red-600 dark:text-red-400">\${m.diet || 'None'}</p></div>
          <div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Sleeping Arrangement</p><p class="font-semibold text-blue-600 dark:text-blue-400">\${m.sleeping || 'No special request'}</p></div>
          <div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Other Points to Note</p><p class="font-semibold">\${m.otherPoints || 'None'}</p></div>
          <div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Medical Conditions and Medications to take note of</p><p class="font-semibold">\${m.medical || 'None'}</p></div>
          \${m.role === 'CAREGIVER' ? \`<div class="md:col-span-2 border-t border-gray-100 dark:border-gray-800 pt-2"><p class="font-bold text-gray-400 dark:text-gray-500 text-[9px] uppercase tracking-wider mb-0.5">Caregiver For</p><p class="font-semibold">\${m.relatedTrainee} (\${m.relationship})</p></div>\` : ''}
        </div>
      </div>
      
      <form id="gpm-edit" onsubmit="event.preventDefault(); submitAdminProfileEdit(this.querySelector('button[type=submit]'));" class="hidden-force space-y-3">
        <h4 class="font-black text-sm mb-1 border-b border-gray-100 dark:border-gray-800 pb-1.5 text-gray-900 dark:text-white tracking-tight">Edit Details (Admin)</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Full Name</label><input type="text" id="gpmName" value="\${m.fullName}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Short Name</label><input type="text" id="gpmShortName" value="\${m.shortName || ''}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Email</label><input type="text" id="gpmEmail" value="\${m.email}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Contact</label><input type="text" id="gpmContact" value="\${m.contact}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Role</label><select id="gpmRole" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"><option \${m.role==='TRAINEE'?'selected':''}>TRAINEE</option><option \${m.role==='CAREGIVER'?'selected':''}>CAREGIVER</option><option \${m.role==='VOLUNTEER'?'selected':''}>VOLUNTEER</option></select></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Gender</label><select id="gpmGender" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"><option \${m.gender==='Male'?'selected':''}>Male</option><option \${m.gender==='Female'?'selected':''}>Female</option></select></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Project</label><select id="gpmGroup" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">\${groupOpts}</select></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Date of Birth</label><input type="text" id="gpmDob" value="\${m.dob}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="DD Mmm YYYY"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Nationality</label><input type="text" id="gpmNat" value="\${m.nationality}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Passport No</label><input type="text" id="gpmPass" value="\${m.passportNo}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white uppercase"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Passport Expiry</label><input type="text" id="gpmExp" value="\${m.passportExpiry}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" placeholder="DD Mmm YYYY"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Dietary</label><input type="text" id="gpmDiet" value="\${m.diet}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div class="md:col-span-2"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Home Address</label><textarea id="gpmAddress" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" rows="2">\${m.address}</textarea></div>
          <div class="md:col-span-2"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Medical Conditions</label><textarea id="gpmMedical" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" rows="2">\${m.medical || ''}</textarea></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Emerg. Name</label><input type="text" id="gpmEmName" value="\${m.emergencyName}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Emerg. Contact</label><input type="text" id="gpmEmContact" value="\${m.emergencyContact}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Emerg. Relation</label><input type="text" id="gpmEmRel" value="\${m.emergencyRelation}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Sleeping</label><input type="text" id="gpmSleep" value="\${m.sleeping}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div class="md:col-span-2"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Other Points</label><input type="text" id="gpmOther" value="\${m.otherPoints}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          
          <div class="\${m.role==='CAREGIVER'?'block':'hidden-force'}"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Caregiver For</label><input type="text" id="gpmRelated" value="\${m.relatedTrainee || ''}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
          <div class="\${m.role==='CAREGIVER'?'block':'hidden-force'}"><label class="text-[10px] font-bold mb-0.5 text-gray-500 block uppercase">Relationship</label><input type="text" id="gpmRelation" value="\${m.relationship || ''}" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"></div>
        </div>
        <div class="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button type="button" onclick="document.getElementById('gpm-edit').classList.add('hidden-force'); document.getElementById('gpm-view').classList.remove('hidden-force');" class="px-4 py-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">Cancel</button>
          <button type="submit" class="px-4 py-2 text-xs font-bold text-white bg-primary rounded-lg hover:bg-blue-600 transition shadow-sm flex items-center">
             <span class="btn-text">Save Changes</span>
             <div class="btn-spinner spinner-white hidden-force ml-2 !w-3 !h-3"></div>
          </button>
        </div>
      </form>
    \`;
  } catch(e) {
    cont.innerHTML = \`<p class="text-xs font-bold text-red-500 text-center py-4">\${e.message || 'Failed to load details.'}</p>\`;
  }
}

async function submitAdminProfileEdit(btn) {
  if (!window._currentModalParticipant) return;
  setBtnLoading(btn, true);
  try {
    const p = window._currentModalParticipant;
    const upd = {
      nric: p.nric,
      fullName: document.getElementById('gpmName').value,
      shortName: document.getElementById('gpmShortName').value,
      email: document.getElementById('gpmEmail').value,
      contact: document.getElementById('gpmContact').value,
      role: document.getElementById('gpmRole').value,
      gender: document.getElementById('gpmGender').value,
      group: document.getElementById('gpmGroup').value,
      dob: document.getElementById('gpmDob').value,
      nationality: document.getElementById('gpmNat').value,
      passportNo: document.getElementById('gpmPass').value.toUpperCase(),
      passportExpiry: document.getElementById('gpmExp').value,
      diet: document.getElementById('gpmDiet').value,
      address: document.getElementById('gpmAddress').value,
      medical: document.getElementById('gpmMedical').value,
      emergencyName: document.getElementById('gpmEmName').value,
      emergencyContact: document.getElementById('gpmEmContact').value,
      emergencyRelation: document.getElementById('gpmEmRel').value,
      sleeping: document.getElementById('gpmSleep').value,
      otherPoints: document.getElementById('gpmOther').value,
      relatedTrainee: document.getElementById('gpmRelated') ? document.getElementById('gpmRelated').value : '',
      relationship: document.getElementById('gpmRelation') ? document.getElementById('gpmRelation').value : ''
    };
    
    const res = await apiCall('adminUpdateParticipant', { member: upd });
    if(res.status === 'success') {
      showToast('Participant updated successfully.');
      closeParticipantSummaryModal();
      if(typeof loadRosterData === 'function') loadRosterData();
    } else {
      throw new Error(res.message || 'Update failed');
    }
  } catch(e) {
    showToast(e.message, true);
  } finally {
    setBtnLoading(btn, false);
  }
}

async function deleteParticipant(nric) {
  if(!confirm("Are you sure you want to delete this participant? They will be moved to the Archived Participants tab.")) return;
  const btn = document.querySelector('#gpm-view button.text-red-600');
  if (btn) btn.disabled = true;
  
  try {
    const res = await apiCall('deleteParticipant', { nric });
    if(res.status === 'success') {
      showToast('Participant deleted & archived.');
      closeParticipantSummaryModal();
      if(typeof loadRosterData === 'function') loadRosterData();
    } else {
      throw new Error(res.message || 'Delete failed');
    }
  } catch(e) {
    showToast(e.message, true);
    if (btn) btn.disabled = false;
  }
}

window.closeParticipantSummaryModal = function() {
  const m = document.getElementById('globalParticipantModal');
  if(m) m.classList.add('hidden-force');
  window._currentModalParticipant = null;
}
`;

code = code.replace(oldFuncRegex, newFunc);
fs.writeFileSync('frontend/js/main.js', code);
