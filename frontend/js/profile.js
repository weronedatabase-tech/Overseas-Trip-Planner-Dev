// ==========================================
// profile.js - Personal Profile Manager
// ==========================================
// [CONSIDERATION - SPA to MPA Migration]: Ported to use AppCore for backend calls.

let loadedFamily = [];

async function loadProfileData() {
  document.getElementById('tab-profile').innerHTML = `
  <div class="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4"><h3 class="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Family / Group Details</h3></div>
  <div id="lockedProfileBanner" class="hidden-force bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-400 p-4 rounded-2xl mb-5 shadow-sm">
      <p class="font-bold mb-1 text-sm"><i class="fa-solid fa-lock mr-1.5"></i> Editing is currently Locked.</p>
      <p class="text-xs mb-3 text-yellow-700 dark:text-yellow-500 font-medium">To request changes to your details, please contact a Committee Member:</p>
      <div id="commContactList" class="flex flex-wrap gap-2"></div>
  </div>
  <div id="profileCardsContainer" class="space-y-4">
      <div class="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm z-20 flex flex-col justify-center items-center">
          <div class="loader !w-10 !h-10 border-primary mb-3"></div>
          <span class="text-primary dark:text-blue-400 font-bold text-xs tracking-wide shadow-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 rounded-full">Loading Profile...</span>
      </div>
  </div>
  `;

  const container = document.getElementById('profileCardsContainer'); 
  const banner = document.getElementById('lockedProfileBanner'); 

  if(!AppCore.appSettings?.allowEdits) {
      banner.classList.remove('hidden-force'); 
      const cList = document.getElementById('commContactList'); 
      cList.innerHTML = '';
      if(AppCore.appSettings?.committee) {
          AppCore.appSettings.committee.forEach(c => { 
              if(c.phone) cList.innerHTML += `<a href="https://wa.me/65${c.phone}" target="_blank" class="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold px-3 py-1.5 rounded-lg shadow-sm text-xs border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition flex items-center gap-1.5"><i class="fa-brands fa-whatsapp text-green-500"></i> Chat with ${c.name}</a>`; 
          });
      }
  } else { 
      banner.classList.add('hidden-force'); 
  }

  try {
      const res = await AppCore.apiFetch('getProfile', {nric: AppCore.currentUser.nric}); 
      loadedFamily = res.family; 
      container.innerHTML = '';

      loadedFamily.forEach((m, i) => {
          let groupOpts = `<option value="">Select...</option>`;
          if(AppCore.appSettings?.projectGroups) { 
              AppCore.appSettings.projectGroups.forEach(g => { groupOpts += `<option value="${g}" ${m.group === g ? 'selected' : ''}>${g}</option>`; }); 
          }
          if(m.group && (!AppCore.appSettings?.projectGroups || !AppCore.appSettings.projectGroups.includes(m.group))) { 
              groupOpts += `<option value="${m.group}" selected>${m.group} (Archived)</option>`; 
          }
          const dynColor = typeof getProjectColor === 'function' ? getProjectColor(m.group) : 'bg-zinc-100';

          container.innerHTML += `
          <div class="bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative transition-all" id="profCard_${i}">
              <div class="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <div class="flex items-center flex-wrap gap-2">
                      <span class="font-extrabold text-base md:text-lg px-2.5 py-0.5 rounded shadow-sm border ${dynColor} leading-tight">${m.fullName}</span> 
                      <span class="text-[10px] font-black text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-md uppercase tracking-widest">${m.role}</span>
                  </div>
                  ${AppCore.appSettings?.allowEdits ? `<button onclick="enableEditMode(${i})" class="text-primary dark:text-blue-400 text-sm font-bold bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-4 py-1.5 rounded-lg transition focus:outline-none shrink-0 border border-blue-200 dark:border-blue-800/50 shadow-sm active:scale-95"><i class="fa-solid fa-pen mr-1"></i> Edit</button>` : ''}
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm text-zinc-800 dark:text-zinc-200">
                  <div><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Short Name</p><p class="font-semibold">${m.shortName || '-'}</p></div>
                  <div><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">NRIC / FIN</p><p class="font-semibold uppercase">${m.nric}</p></div>
                  <div><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Date of Birth</p><p class="font-semibold">${m.dob}</p></div>
                  <div><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Gender & Nat.</p><p class="font-semibold">${m.gender} | ${m.nationality}</p></div>
                  <div><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Contact & Email</p><p class="font-semibold">${m.contact} <span class="text-zinc-400 mx-1">|</span> ${m.email || 'N/A'}</p></div>
                  <div class="border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1.5">Project</p><span class="font-bold text-xs px-2 py-1 rounded border inline-block shadow-sm ${dynColor}">${m.group || 'None'}</span></div>
                  <div class="border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Home Address</p><p class="font-semibold leading-snug">${m.address}</p></div>
                  <div class="border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Passport No.</p><p class="font-semibold uppercase">${m.passportNo}</p></div>
                  <div class="border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Passport Expiry</p><p class="font-semibold">${m.passportExpiry}</p></div>
                  <div class="border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Emerg. Contact</p><p class="font-semibold">${m.emergencyName} (${m.emergencyRelation})<br><span class="font-mono text-zinc-600 dark:text-zinc-400 mt-0.5 inline-block">${m.emergencyContact}</span></p></div>
                  <div class="border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Dietary Needs</p><p class="font-semibold text-red-600 dark:text-red-400">${m.diet || 'None'}</p></div>
                  <div class="md:col-span-2 border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Sleeping Arrangement</p><p class="font-semibold text-blue-600 dark:text-blue-400 leading-snug">${m.sleeping || 'No special request'}</p></div>
                  <div class="md:col-span-2 border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Other Points to Note</p><p class="font-semibold leading-snug">${m.otherPoints || 'None'}</p></div>
                  ${m.role === 'CAREGIVER' ? `<div class="md:col-span-2 border-t border-zinc-100 dark:border-zinc-800 pt-3"><p class="font-bold text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">Caregiver For</p><p class="font-semibold">${m.relatedTrainee} (${m.relationship})</p></div>` : ''}
              </div>
          </div>
          
          <form id="profEdit_${i}" onsubmit="event.preventDefault(); saveProfileEdit(${i}, this.querySelector('button[type=submit]'));" class="hidden-force bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl border-2 border-primary dark:border-blue-500 space-y-4 shadow-xl">
              <div class="flex items-center gap-2 mb-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <div class="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-primary flex items-center justify-center"><i class="fa-solid fa-pen-to-square"></i></div>
                  <h4 class="font-black text-lg text-zinc-900 dark:text-white tracking-tight">Edit Details</h4>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Full Name</label><input type="text" id="edName_${i}" value="${m.fullName}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Short Name</label><input type="text" id="edShortName_${i}" value="${m.shortName || ''}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Email</label><input type="text" id="edEmail_${i}" value="${m.email}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Contact</label><input type="tel" pattern="[0-9]{8}" id="edContact_${i}" value="${m.contact}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Gender</label><select id="edGender_${i}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition cursor-pointer"><option ${m.gender==='Male'?'selected':''}>Male</option><option ${m.gender==='Female'?'selected':''}>Female</option></select></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Role</label><select id="edRole_${i}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition cursor-pointer"><option ${m.role==='TRAINEE'?'selected':''}>TRAINEE</option><option ${m.role==='CAREGIVER'?'selected':''}>CAREGIVER</option><option ${m.role==='VOLUNTEER'?'selected':''}>VOLUNTEER</option></select></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Project</label><select id="edGroup_${i}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition cursor-pointer">${groupOpts}</select></div>
                  <div class="md:col-span-2"><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Address</label><textarea id="edAddress_${i}" rows="2" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition resize-y">${m.address}</textarea></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Nationality</label><input type="text" id="edNat_${i}" value="${m.nationality}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">DOB</label><input type="text" id="edDob_${i}" value="${m.dob}" readonly onclick="openDatePicker('edDob_${i}', 'dob')" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-center font-semibold cursor-pointer bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Passport No.</label><input type="text" id="edPass_${i}" value="${m.passportNo}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm uppercase font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Passport Expiry</label><input type="text" id="edExp_${i}" value="${m.passportExpiry}" readonly onclick="openDatePicker('edExp_${i}', 'exp')" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-center font-semibold cursor-pointer bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Emergency Contact Name</label><input type="text" id="edEmName_${i}" value="${m.emergencyName}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Emergency Contact No.</label><input type="tel" pattern="[0-9]{8}" id="edEmCont_${i}" value="${m.emergencyContact}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Emergency Relation</label><input type="text" id="edEmRel_${i}" value="${m.emergencyRelation}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Dietary Needs</label><input type="text" id="edDiet_${i}" value="${m.diet}" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition"></div>
                  <div class="md:col-span-2"><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Sleeping Arrangement Request</label><textarea id="edSleep_${i}" rows="2" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition resize-y">${m.sleeping}</textarea></div>
                  <div class="md:col-span-2"><label class="text-[10px] font-bold mb-1 text-zinc-500 dark:text-zinc-400 block uppercase tracking-wider">Other Points to Note</label><textarea id="edOther_${i}" rows="2" class="w-full p-3 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-semibold bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition resize-y">${m.otherPoints}</textarea></div>
              </div>
              <div class="flex space-x-3 pt-3 mt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onclick="cancelEditMode(${i})" class="flex-1 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm font-bold py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition focus:outline-none shadow-sm">Cancel</button>
                  <button type="submit" class="flex-1 bg-primary text-white text-sm font-bold py-3 rounded-xl shadow-md hover:bg-blue-600 transition flex justify-center items-center focus:outline-none transform active:scale-95"><span class="btn-text">Save Changes</span><div class="btn-spinner spinner-white hidden-force ml-2 !w-4 !h-4 border-2"></div></button>
              </div>
          </form>
          `;
      });
  } catch (e) { 
      container.innerHTML = '<div class="bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400 p-4 rounded-xl font-bold text-sm text-center">Error loading profile data. Please try again.</div>'; 
  }
}

function enableEditMode(i) { 
  document.getElementById(`profCard_${i}`).classList.add('hidden-force'); 
  document.getElementById(`profEdit_${i}`).classList.remove('hidden-force'); 
}
function cancelEditMode(i) { 
  document.getElementById(`profEdit_${i}`).classList.add('hidden-force'); 
  document.getElementById(`profCard_${i}`).classList.remove('hidden-force'); 
}

async function saveProfileEdit(i, btn) {
  setBtnLoading(btn, true);

  const updated = {
      nric: loadedFamily[i].nric, fullName: document.getElementById(`edName_${i}`).value, shortName: document.getElementById(`edShortName_${i}`).value, email: document.getElementById(`edEmail_${i}`).value, role: document.getElementById(`edRole_${i}`).value, gender: document.getElementById(`edGender_${i}`).value,
      contact: document.getElementById(`edContact_${i}`).value, dob: document.getElementById(`edDob_${i}`).value, group: document.getElementById(`edGroup_${i}`).value, address: document.getElementById(`edAddress_${i}`).value,
      nationality: document.getElementById(`edNat_${i}`).value, passportNo: document.getElementById(`edPass_${i}`).value.toUpperCase(), passportExpiry: document.getElementById(`edExp_${i}`).value, diet: document.getElementById(`edDiet_${i}`).value,
      emergencyName: document.getElementById(`edEmName_${i}`).value, emergencyContact: document.getElementById(`edEmCont_${i}`).value, emergencyRelation: document.getElementById(`edEmRel_${i}`).value, sleeping: document.getElementById(`edSleep_${i}`).value,
      otherPoints: document.getElementById(`edOther_${i}`).value, relatedTrainee: loadedFamily[i].relatedTrainee, relationship: loadedFamily[i].relationship
  };
  
  try { 
      await AppCore.apiFetch('updateProfile', {member: updated}); 
      AppCore.showToast("Profile Updated!"); 
      loadProfileData(); 
  } catch (e) { 
      AppCore.showToast(e.message, true); 
  } finally { 
      setBtnLoading(btn, false);
  }
}