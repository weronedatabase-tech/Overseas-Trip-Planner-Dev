async function attemptLogin(btn) {
  const nric = document.getElementById('loginNric').value.trim().toUpperCase(); const pass = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if(!nric || !pass) { err.textContent = "Please enter NRIC and Password"; return err.classList.remove('hidden-force'); }
  err.classList.add('hidden-force'); setBtnLoading(btn, true);
  try {
    const res = await callBackend('login', { nric, password: pass }); currentUser = { nric: nric, role: res.role, name: res.name };
    localStorage.setItem('userSession', JSON.stringify(currentUser)); renderDashboard();
  } catch (error) { err.textContent = error.message; err.classList.remove('hidden-force'); } finally { setBtnLoading(btn, false); }
}

function logout(btn) { setBtnLoading(btn, true); localStorage.removeItem('userSession'); currentUser = null; window.location.reload(); }

function renderDashboard() {
  document.querySelectorAll('#mainContent > div').forEach(el => el.classList.add('hidden-force'));
  document.getElementById('viewDashboard').classList.remove('hidden-force');
  document.getElementById('welcomeUserText').textContent = `Welcome, ${currentUser.name || 'User'}!`;
  
  let badgeText = 'Role: Participant'; if (currentUser.nric === 'ADMIN') badgeText = 'Role: Main Admin'; else if (currentUser.role === 'admin') badgeText = 'Role: Committee Member'; 
  document.getElementById('userRoleBadge').textContent = badgeText;

  if(currentUser.role === 'admin') { 
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden-force')); 
    if (currentUser.nric === 'ADMIN') { document.getElementById('tabBtn-profile').classList.add('hidden-force'); } 
    else { document.getElementById('tabBtn-profile').classList.remove('hidden-force'); }
    switchTab('settings'); loadLogisticsData(); 
  } else { 
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden-force')); 
    document.getElementById('tabBtn-profile').classList.remove('hidden-force'); switchTab('profile'); 
  }
}

function togglePassword(id) { 
  const el = document.getElementById(id); const eyeOpen = document.getElementById('eyeOpen'); const eyeClosed = document.getElementById('eyeClosed');
  if(el.type === 'password') { el.type = 'text'; eyeOpen.classList.add('hidden-force'); eyeClosed.classList.remove('hidden-force'); } 
  else { el.type = 'password'; eyeOpen.classList.remove('hidden-force'); eyeClosed.classList.add('hidden-force'); } 
}
function handleEnter(e, func) { if(e.key === 'Enter') func(); }
