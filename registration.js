let regMemberCount = 0;
function addRegMember() {
  const idx = regMemberCount++;
  let groupOpts = `<option value="">Select...</option>`;
  if(appSettings.projectGroups) appSettings.projectGroups.forEach(g => { groupOpts += `<option value="${g}">${g}</option>`; });

  const html = `
    <div class="member-block bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm relative" data-idx="${idx}">
      ${idx > 0 ? `<button type="button" onclick="this.closest('.member-block').remove()" class="absolute top-4 right-4 text-red-500 font-bold text-sm hover:text-red-700 bg-red-50 px-2 py-1 rounded">Remove</button>` : `<div class="absolute top-4 right-4 bg-blue-50 text-blue-700 font-bold px-2 py-1 text-xs rounded border border-blue-200">MAIN POC</div>`}
      <h4 class="font-bold text-lg mb-4 text-gray-800 border-b border-gray-100 pb-2">Person ${idx + 1}</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Full Name</label><input required type="text" class="reg-f-name w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Email</label><input ${idx===0?'required':''} type="email" class="reg-f-email w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Role</label><select class="reg-f-role w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg" onchange="toggleTraineeFields(this)"><option value="TRAINEE">Trainee</option><option value="CAREGIVER">Caregiver</option><option value="VOLUNTEER">Volunteer</option></select></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Gender</label><select class="reg-f-gender w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"><option>Male</option><option>Female</option></select></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Contact No. (8-digit)</label><input ${idx===0?'required':''} type="tel" pattern="[0-9]{8}" class="reg-f-contact w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Date of Birth</label><input required type="text" id="dob_${idx}" readonly placeholder="DD Mmm YYYY" onclick="openDatePicker('dob_${idx}', 'dob')" class="reg-f-dob w-full p-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer text-center"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Project</label><select class="reg-f-group w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg">${groupOpts}</select></div>
        <div class="md:col-span-2"><label class="block text-xs font-semibold text-gray-500 mb-1">Home Address</label><textarea required class="reg-f-address w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg" rows="2"></textarea></div>
      </div>
      <div class="trainee-div hidden-force bg-blue-50/50 p-4 rounded-xl mb-4 border border-blue-100">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label class="block text-xs font-semibold text-gray-500 mb-1">Related Trainee's Name</label><input type="text" class="reg-f-related w-full p-2.5 bg-white border border-gray-300 rounded-lg"></div><div><label class="block text-xs font-semibold text-gray-500 mb-1">Relationship to Trainee</label><input type="text" class="reg-f-relation w-full p-2.5 bg-white border border-gray-300 rounded-lg placeholder-gray-400" placeholder="e.g. Father"></div></div>
      </div>
      <h4 class="font-bold text-sm mb-3 border-b border-gray-100 pb-1 text-gray-600">Identification</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Full NRIC / FIN</label><input required type="text" class="reg-f-nric w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg uppercase"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Nationality</label><input required type="text" class="reg-f-nat w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Passport No.</label><input required type="text" class="reg-f-pass w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg uppercase"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Passport Expiry</label><input required type="text" id="exp_${idx}" readonly placeholder="DD Mmm YYYY" onclick="openDatePicker('exp_${idx}', 'exp')" class="reg-f-exp w-full p-2.5 bg-white border border-gray-300 rounded-lg cursor-pointer text-center"></div>
      </div>
      <h4 class="font-bold text-sm mb-3 border-b border-gray-100 pb-1 text-gray-600">Medical & Emergency</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div class="md:col-span-2"><label class="block text-xs font-semibold text-gray-500 mb-1">Dietary Restrictions</label><input type="text" class="reg-f-diet w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg" placeholder="Nil if none"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Emergency Contact Name</label><input required type="text" class="reg-f-emname w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Emergency Contact No.</label><input required type="tel" pattern="[0-9]{8}" class="reg-f-emcontact w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Relation to Emerg. Contact</label><input required type="text" class="reg-f-emrelation w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg"></div>
      </div>
      <h4 class="font-bold text-sm mb-3 border-b border-gray-100 pb-1 text-gray-600">Remarks</h4>
      <div class="space-y-4">
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Sleeping Request</label><textarea class="reg-f-sleep w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg" rows="2"></textarea></div>
        <div><label class="block text-xs font-semibold text-gray-500 mb-1">Other Points</label><textarea class="reg-f-other w-full p-2.5 bg-gray-50 border border-gray-300 rounded-lg" rows="2"></textarea></div>
      </div>
    </div>`;
  document.getElementById('membersContainer').insertAdjacentHTML('beforeend', html);
}

function toggleTraineeFields(selectEl) {
  const div = selectEl.closest('.member-block').querySelector('.trainee-div');
  if(selectEl.value === 'CAREGIVER') div.classList.remove('hidden-force'); else div.classList.add('hidden-force');
}

async function submitRegistration(btn) {
  const blocks = document.querySelectorAll('.member-block'); const payloadArray =[];
  blocks.forEach(b => {
    payloadArray.push({
      fullName: b.querySelector('.reg-f-name').value, email: b.querySelector('.reg-f-email').value, role: b.querySelector('.reg-f-role').value, gender: b.querySelector('.reg-f-gender').value,
      contact: b.querySelector('.reg-f-contact').value, dob: b.querySelector('.reg-f-dob').value, group: b.querySelector('.reg-f-group').value, address: b.querySelector('.reg-f-address').value,
      relatedTrainee: b.querySelector('.reg-f-related').value, relationship: b.querySelector('.reg-f-relation').value, nric: b.querySelector('.reg-f-nric').value.toUpperCase(), nationality: b.querySelector('.reg-f-nat').value,
      passportNo: b.querySelector('.reg-f-pass').value.toUpperCase(), passportExpiry: b.querySelector('.reg-f-exp').value, diet: b.querySelector('.reg-f-diet').value, emergencyName: b.querySelector('.reg-f-emname').value,
      emergencyContact: b.querySelector('.reg-f-emcontact').value, emergencyRelation: b.querySelector('.reg-f-emrelation').value, sleeping: b.querySelector('.reg-f-sleep').value, otherPoints: b.querySelector('.reg-f-other').value
    });
  });
  setBtnLoading(btn, true);
  try { await callBackend('submitRegistration', { payload: payloadArray }); showToast("Registration Successful!"); setTimeout(() => navTo('login'), 1500); } catch (e) { showToast(e.message, true); } finally { setBtnLoading(btn, false); }
}
