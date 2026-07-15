// ==========================================
// auth.js - Authentication & View Management
// ==========================================
// [CONSIDERATION - SPA to MPA Migration]: Provides shims for backward compatibility 
// for modules not yet migrated to the new AppCore.apiFetch wrapper.

// Temporary Shim for backward compatibility during MPA migration
window.callBackend = async function(action, payload = {}) {
   return await AppCore.apiFetch(action, payload);
};

async function attemptLogin(btn) {
   const nric = document.getElementById('loginNric').value.trim().toUpperCase();
   const pass = document.getElementById('loginPass').value;
   const err = document.getElementById('loginError');

   if (!nric || !pass) {
       err.textContent = "Please enter NRIC and Password";
       err.classList.remove('hidden-force');
       return;
   }
   
   err.classList.add('hidden-force');
   setBtnLoading(btn, true);

   try {
       const res = await AppCore.apiFetch('login', { nric, password: pass });
       AppCore.currentUser = { nric: nric, role: res.role, name: res.name };
       localStorage.setItem('userSession', JSON.stringify(AppCore.currentUser));
       window.location.href = './dashboard.html';
   } catch (error) {
       err.textContent = error.message;
       err.classList.remove('hidden-force');
   } finally {
       setBtnLoading(btn, false);
   }
}

function togglePassword(id) {
   const el = document.getElementById(id);
   const eyeOpen = document.getElementById('eyeOpen');
   const eyeClosed = document.getElementById('eyeClosed');
   if (el.type === 'password') {
       el.type = 'text';
       eyeOpen.classList.add('hidden-force');
       eyeClosed.classList.remove('hidden-force');
   } else {
       el.type = 'password';
       eyeOpen.classList.remove('hidden-force');
       eyeClosed.classList.add('hidden-force');
   }
}

function handleEnter(e, func) {
   if (e.key === 'Enter') func();
}

function navToAuth(view) {
   document.getElementById('viewLanding').classList.add('hidden-force');
   document.getElementById('viewRegister').classList.add('hidden-force');
   document.getElementById('viewLogin').classList.add('hidden-force');
   
   if (view === 'landing') document.getElementById('viewLanding').classList.remove('hidden-force');
   if (view === 'login') document.getElementById('viewLogin').classList.remove('hidden-force');
   if (view === 'register') {
       document.getElementById('viewRegister').classList.remove('hidden-force');
       if(typeof addRegMember === 'function' && typeof regMemberCount !== 'undefined') {
           document.getElementById('membersContainer').innerHTML = '';
           regMemberCount = 0;
           addRegMember();
       }
   }
}