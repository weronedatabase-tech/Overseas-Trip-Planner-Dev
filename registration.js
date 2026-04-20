function addRegMember() {
  const idx = regMemberCount++; 
  let groupOpts = `<option value="">Select...</option>`;
  
  if (appSettings.projectGroups) {
    appSettings.projectGroups.forEach(g => { 
      groupOpts += `<option value="${g}">${g}</option>`; 
    });
  }

  const isMain = idx === 0;
  const req = isMain ? 'required' : '';
  
  const headerBtn = isMain 
    ? `<div class="absolute top-4 right-4 bg-primary text-white font-extrabold px-3 py-1 text-sm rounded border-2 border-blue-800">MAIN POC</div>` 
    : `<button type="button" onclick="this.closest('.member-block').remove()" class="absolute top-4 right-4 text-red-600 dark:text-red-400 font-extrabold border-2 border-red-600 dark:border-red-400 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 transition focus:outline-none">Remove</button>`;

  const headerHtml = `
    ${headerBtn}
    <h4 class="font-extrabold text-2xl mb-4 border-b-2 border-gray-300 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">Person ${idx + 1}</h4>
  `;

  const personalInfoHtml = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Full Name</label><input required type="text" class="reg-f-name w-full p-3 border-2 rounded-lg"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Email</label><input ${req} type="email" class="reg-f-email w-full p-3 border-2 rounded-lg"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Role</label><select class="reg-f-role w-full p-3 border-2 rounded-lg font-bold" onchange="toggleTraineeFields(this)"><option value="TRAINEE">Trainee</option><option value="CAREGIVER">Caregiver</option><option value="VOLUNTEER">Volunteer</option></select></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Gender</label><select class="reg-f-gender w-full p-3 border-2 rounded-lg font-bold"><option>Male</option><option>Female</option></select></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Contact Number (8-digit)</label><input ${req} type="tel" pattern="[0-9]{8}" class="reg-f-contact w-full p-3 border-2 rounded-lg"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Date of Birth</label><input required type="text" id="dob_${idx}" readonly placeholder="DD Mmm YYYY" onclick="openDatePicker('dob_${idx}', 'dob')" class="reg-f-dob w-full p-3 border-2 rounded-lg font-bold text-center cursor-pointer bg-white dark:bg-gray-700"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Project</label><select class="reg-f-group w-full p-3 border-2 rounded-lg font-bold">${groupOpts}</select></div>
      <div class="md:col-span-2"><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Home Address</label><textarea required class="reg-f-address w-full p-3 border-2 rounded-lg" rows="2"></textarea></div>
    </div>
  `;

  const caregiverHtml = `
    <div class="trainee-div hidden-force bg-blue-50 dark:bg-gray-700 p-5 rounded-lg mb-6 border-2 border-blue-200 dark:border-gray-600">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Related Trainee's Name</label><input type="text" class="reg-f-related w-full p-3 border-2 rounded-lg"></div>
        <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Relationship to Trainee</label><input type="text" class="reg-f-relation w-full p-3 border-2 rounded-lg placeholder-gray-400 dark:placeholder-gray-500" placeholder="e.g. Father, Mother, Sibling"></div>
      </div>
    </div>
  `;

  const identityHtml = `
    <h4 class="font-extrabold text-lg mb-4 border-b-2 border-gray-300 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">Identification</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Full NRIC / FIN</label><input required type="text" class="reg-f-nric w-full p-3 border-2 rounded-lg uppercase"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Nationality</label><input required type="text" class="reg-f-nat w-full p-3 border-2 rounded-lg"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Passport No.</label><input required type="text" class="reg-f-pass w-full p-3 border-2 rounded-lg uppercase"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Passport Expiry</label><input required type="text" id="exp_${idx}" readonly placeholder="DD Mmm YYYY" onclick="openDatePicker('exp_${idx}', 'exp')" class="reg-f-exp w-full p-3 border-2 rounded-lg font-bold text-center cursor-pointer bg-white dark:bg-gray-700"></div>
    </div>
  `;

  const medicalHtml = `
    <h4 class="font-extrabold text-lg mb-4 border-b-2 border-gray-300 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">Medical & Emergency</h4>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
      <div class="md:col-span-2"><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Dietary Restrictions</label><input type="text" class="reg-f-diet w-full p-3 border-2 rounded-lg" placeholder="Nil if none"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Emergency Contact Name</label><input required type="text" class="reg-f-emname w-full p-3 border-2 rounded-lg"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Emergency Contact Number (8-digit)</label><input required type="tel" pattern="[0-9]{8}" class="reg-f-emcontact w-full p-3 border-2 rounded-lg"></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Relationship to Emerg. Contact</label><input required type="text" class="reg-f-emrelation w-full p-3 border-2 rounded-lg"></div>
    </div>
  `;

  const remarksHtml = `
    <h4 class="font-extrabold text-lg mb-4 border-b-2 border-gray-300 dark:border-gray-700 pb-2 text-gray-900 dark:text-white">Remarks</h4>
    <div class="space-y-5">
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Sleeping Arrangement Request</label><textarea class="reg-f-sleep w-full p-3 border-2 rounded-lg" rows="2"></textarea></div>
      <div><label class="block text-sm font-bold mb-1 text-gray-900 dark:text-gray-200">Other Points to Note</label><textarea class="reg-f-other w-full p-3 border-2 rounded-lg" rows="2"></textarea></div>
    </div>
  `;

  const finalHtml = `
    <div class="member-block bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-400 dark:border-gray-600 shadow-md relative" data-idx="${idx}">
      ${headerHtml}
      ${personalInfoHtml}
      ${caregiverHtml}
      ${identityHtml}
      ${medicalHtml}
      ${remarksHtml}
    </div>
  `;

  document.getElementById('membersContainer').insertAdjacentHTML('beforeend', finalHtml);
}

function toggleTraineeFields(selectEl) { 
  const div = selectEl.closest('.member-block').querySelector('.trainee-div'); 
  if(selectEl.value === 'CAREGIVER') {
    div.classList.remove('hidden-force'); 
  } else {
    div.classList.add('hidden-force'); 
  }
}

async function submitRegistration(btn) {
  let finalData = new Array();
  let blocks = document.getElementsByClassName('member-block');

  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];

    let pName = b.querySelector('.reg-f-name').value;
    let pEmail = b.querySelector('.reg-f-email').value;
    let pRole = b.querySelector('.reg-f-role').value;
    let pGender = b.querySelector('.reg-f-gender').value;
    let pContact = b.querySelector('.reg-f-contact').value;
    let pDob = b.querySelector('.reg-f-dob').value;
    let pGroup = b.querySelector('.reg-f-group').value;
    let pAddress = b.querySelector('.reg-f-address').value;
    
    let pRelated = b.querySelector('.reg-f-related').value;
    let pRelation = b.querySelector('.reg-f-relation').value;
    
    let pNric = b.querySelector('.reg-f-nric').value.toUpperCase();
    let pNat = b.querySelector('.reg-f-nat').value;
    let pPass = b.querySelector('.reg-f-pass').value.toUpperCase();
    let pExp = b.querySelector('.reg-f-exp').value;
    
    let pDiet = b.querySelector('.reg-f-diet').value;
    let pEmName = b.querySelector('.reg-f-emname').value;
    let pEmContact = b.querySelector('.reg-f-emcontact').value;
    let pEmRelation = b.querySelector('.reg-f-emrelation').value;
    
    let pSleep = b.querySelector('.reg-f-sleep').value;
    let pOther = b.querySelector('.reg-f-other').value;

    let memberObj = {
      fullName: pName, email: pEmail, role: pRole, gender: pGender,
      contact: pContact, dob: pDob, group: pGroup, address: pAddress,
      relatedTrainee: pRelated, relationship: pRelation, 
      nric: pNric, nationality: pNat, passportNo: pPass, passportExpiry: pExp, 
      diet: pDiet, emergencyName: pEmName, emergencyContact: pEmContact, emergencyRelation: pEmRelation, 
      sleeping: pSleep, otherPoints: pOther
    };

    finalData.push(memberObj);
  }

  setBtnLoading(btn, true);
  
  try { 
    await callBackend('submitRegistration', { payload: finalData }); 
    showToast("Registration Successful! Please login."); 
    setTimeout(function() { navTo('login'); }, 1500); 
  } catch (e) { 
    showToast(e.message, true); 
  } finally { 
    setBtnLoading(btn, false); 
  }
}