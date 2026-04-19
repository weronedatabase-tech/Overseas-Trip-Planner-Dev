const DEV_MODE = true; 
const URLS = {
  DEV: "https://script.google.com/macros/s/AKfycby48gbzI_4V0TEJ0Gra4Qb_J3xywBA6A792d2reGx0QWUx-6QFEKRWBTmr8mGG86osg/exec",
  PROD: "https://script.google.com/macros/s/AKfycbz4OLZtR2lX97MrGZVaNg13Lrzvwgy7mBfQr7PgoQGK617sL8ZCkKvZD2hIZodus-O_/exec"
};
const API_URL = DEV_MODE ? URLS.DEV : URLS.PROD;

let currentUser = null; 
let appSettings = { registrationOpen: false, allowEdits: false, committee:[], projectGroups:[], projectColors:{}, activeProjects:[], junctures:[], tripTitle:'', tripYear:'' };
let globalLogistics = null; 

window.onload = async () => {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
  if(DEV_MODE) document.getElementById('devModeBar').classList.remove('hidden-force');
  if(localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
  
  const savedSession = localStorage.getItem('userSession');
  if(savedSession) currentUser = JSON.parse(savedSession);
  
  injectGlobalModals(); // From ui.js
  await fetchConfig();
  if(currentUser) renderDashboard(); else goHome();
};

async function callBackend(action, payload = {}) {
  try {
    const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action, ...payload }), headers: { 'Content-Type': 'text/plain;charset=utf-8' }});
    if(!res.ok) throw new Error("Network error."); 
    const data = await res.json();
    if(data.status === 'error') throw new Error(data.message); 
    return data;
  } catch (err) {
    if(err.message.includes('Failed to fetch')) { showToast("Auth required.", true); setTimeout(() => window.open(API_URL, '_blank'), 2000); }
    else { throw err; }
  }
}

async function fetchConfig() {
  try {
    const config = await callBackend('getSettings'); appSettings = config;
    const regBox = document.getElementById('landingRegBox');
    if(appSettings.registrationOpen) regBox.classList.remove('hidden-force'); else regBox.classList.add('hidden-force');
    const headerTripName = document.getElementById('headerTripName');
    if (appSettings.tripTitle && appSettings.tripYear) { 
      headerTripName.textContent = `${appSettings.tripTitle} ${appSettings.tripYear}`; headerTripName.classList.remove('hidden-force'); 
    } else { headerTripName.classList.add('hidden-force'); }
    renderHeaderLegend();
    if(currentUser && currentUser.role === 'admin') buildSettingsUI(); // Rebuild settings UI on fetch
  } catch (e) { showToast("Error syncing settings.", true); } finally { document.getElementById('viewLoading').classList.add('hidden-force'); }
}

function updateApp(btn) {
  setBtnLoading(btn, true); showToast("Updating app...");
  if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(regs => { for(let r of regs) r.unregister(); }); }
  setTimeout(() => location.reload(true), 1000);
}
