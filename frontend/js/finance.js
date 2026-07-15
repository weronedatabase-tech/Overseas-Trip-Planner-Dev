// ==========================================
// finance.js - Finance Options Planner
// ==========================================
// [CONSIDERATION - SPA to MPA Migration]: Fully ported to use AppCore for backend
// calls and global mutation tracking. Dark mode updated from gray/slate to zinc/black.

let financeOptions = [];
let pendingFinanceUpdates = new Map();
let globalFinanceRates = { "SGD": 1, "MYR": 0.28 };
let financeConfig = { globalPaxMode: 'individual', globalPaxCount: 0, ts: 0, customRates: {} };
let isFinanceCollapsed = false;
let financeSyncTimeout = null;
let financePollInterval = null;
let isFinanceSyncing = false;

let finDndState = { active: false, row: null, placeholder: null, container: null, optId: null, yOffset: 0, xOffset: 0 };

const defaultFinanceFields = ['Accommodation', 'Transport', 'Day 1 Lunch', 'Day 1 Dinner', 'Day 1 Activity', 'Day 2 Breakfast', 'Day 2 Lunch', 'Day 2 Activity', 'Logistics', 'First Aid', 'Miscellaneous', 'Recce', 'Insurance'];

function generateFinanceUUID() { return 'fin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); }

function getCurrencyOptions(selected) {
  const top = ["SGD", "MYR"];
  const rest = ["USD", "EUR", "GBP", "AUD", "IDR", "THB", "JPY", "KRW", "TWD", "PHP", "VND"];
  let html = '';
  top.forEach(c => html += `<option value="${c}" ${c === selected ? 'selected' : ''}>${c}</option>`);
  html += `<option disabled>──────────</option>`;
  rest.forEach(c => html += `<option value="${c}" ${c === selected ? 'selected' : ''}>${c}</option>`);
  return html;
}

function getActivePax(opt) {
  if (financeConfig.globalPaxMode === 'auto') return window.globalLogistics?.participants?.length || 0;
  if (financeConfig.globalPaxMode === 'manual') return parseInt(financeConfig.globalPaxCount) || 0;
  return parseInt(opt.pax) || 0;
}

function getActualRate(currency) {
  if (currency === 'SGD') return 1;
  if (financeConfig.customRates && financeConfig.customRates[currency]) return parseFloat(financeConfig.customRates[currency]);
  return globalFinanceRates[currency] || 1;
}

function toggleFinanceCollapse() {
  isFinanceCollapsed = !isFinanceCollapsed;
  financeOptions.forEach(o => o._isCollapsed = isFinanceCollapsed);
  renderFinanceGlobalSettings();
  renderFinanceOptions();
}

function toggleIndividualFinanceCollapse(id) {
  const opt = financeOptions.find(o => o.id === id);
  if (opt) { opt._isCollapsed = !opt._isCollapsed; renderFinanceOptions(); }
}

function cycleFinanceOptionWidth(optId) {
  const opt = financeOptions.find(o => o.id === optId);
  if (opt) {
      opt.widthSpan = (opt.widthSpan || 2) + 1;
      if (opt.widthSpan > 3) opt.widthSpan = 1;
      queueFinanceUpdate(optId);
      renderFinanceOptions();
  }
}

window.formatMoneyInput = function(input, isBlur) {
  let cursorStart = input.selectionStart;
  let oldLen = input.value.length;
  let val = input.value.replace(/[^0-9.]/g, '');
  if(val === '') { input.value = ''; return; }
  
  let parts = val.split('.');
  if(parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
  
  if (isBlur) {
      let number = parseFloat(val);
      input.value = !isNaN(number) ? number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
  } else {
      parts = val.split('.');
      let whole = parts[0] ? parseFloat(parts[0]).toLocaleString('en-US') : '0';
      input.value = parts.length > 1 ? whole + '.' + parts[1].substring(0, 2) : whole;
      
      let newLen = input.value.length;
      let diff = newLen - oldLen;
      let newCursor = cursorStart + diff;
      try { input.setSelectionRange(newCursor, newCursor); } catch(e){}
  }
};

function openFinanceRatesModal() {
  const list = document.getElementById('financeRatesList');
  let html = '<p class="text-[10px] text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed font-medium">Override live exchange rates. Value represents 1 foreign unit in SGD.</p>';
  Object.keys(globalFinanceRates).forEach(c => {
      if(c === 'SGD') return;
      const live = globalFinanceRates[c] || 0;
      const custom = (financeConfig.customRates && financeConfig.customRates[c]) ? financeConfig.customRates[c] : '';
      html += `
      <div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/80 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition hover:border-primary">
          <div class="font-black text-sm text-zinc-800 dark:text-zinc-200 w-16 text-center shrink-0">1 ${c}</div>
          <div class="font-bold text-sm text-zinc-400 px-2 shrink-0">=</div>
          <div class="flex-1 min-w-0 pr-3">
              <input type="number" step="0.0001" placeholder="Live: ${live.toFixed(4)}" value="${custom}" 
                  onchange="setCustomRate('${c}', this.value)" 
                  class="w-full text-sm font-bold p-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-zinc-900 dark:text-white transition shadow-sm placeholder-zinc-400">
          </div>
          <div class="font-black text-sm text-zinc-800 dark:text-zinc-200 shrink-0">SGD</div>
      </div>`;
  });
  list.innerHTML = html;
  document.getElementById('financeRatesModal').classList.remove('hidden-force');
}

function closeFinanceRatesModal() { document.getElementById('financeRatesModal').classList.add('hidden-force'); }

function setCustomRate(currency, value) {
  AppCore.trackMutation();
  if (!financeConfig.customRates) financeConfig.customRates = {};
  if (value.trim() === '') delete financeConfig.customRates[currency];
  else financeConfig.customRates[currency] = parseFloat(value);
  
  financeOptions.forEach(o => updateTotals(o.id));
  renderFinanceOptions();
  queueFinanceUpdate();
}

function setFinanceSyncButtonState(state) {
  const btn = document.getElementById('btn-sync-finance');
  if(!btn) return;
  const textSpan = btn.querySelector('.btn-text'); const spinner = btn.querySelector('.btn-spinner');
  btn.className = "text-xs md:text-sm px-4 py-2 rounded-lg font-bold transition flex items-center justify-center border shadow-sm focus:outline-none shrink-0 transform active:scale-95"; 
  spinner.className = "btn-spinner ml-2 !w-3.5 !h-3.5 hidden-force border-2"; 

  if (state === 'loading') { 
      btn.classList.add('bg-zinc-100', 'text-zinc-500', 'border-zinc-200', 'dark:bg-zinc-800', 'dark:text-zinc-400'); textSpan.textContent = "Loading..."; spinner.classList.remove('hidden-force'); spinner.classList.add('spinner-primary'); 
  } else if(state === 'saving') { 
      btn.classList.add('bg-yellow-50', 'text-yellow-700', 'border-yellow-200', 'dark:bg-yellow-900/30', 'dark:text-yellow-300'); textSpan.textContent = "Saving..."; spinner.classList.remove('hidden-force'); spinner.classList.add('spinner-yellow'); 
  } else if (state === 'saved') { 
      btn.classList.add('bg-green-50', 'text-green-700', 'border-green-200', 'dark:bg-green-900/30', 'dark:text-green-300'); textSpan.textContent = "Saved"; 
  } else if (state === 'error') { 
      btn.classList.add('bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/30', 'dark:text-red-300'); textSpan.textContent = "Error"; 
  }
}

function queueFinanceUpdate(optId = null) {
  AppCore.trackMutation();
  if (optId) {
      const opt = financeOptions.find(o => o.id === optId);
      if (opt) { opt.ts = Date.now(); pendingFinanceUpdates.set(optId, opt); }
  }
  financeConfig.ts = Date.now();
  setFinanceSyncButtonState('saving');
  if (financeSyncTimeout) clearTimeout(financeSyncTimeout);
  financeSyncTimeout = setTimeout(() => { executeFinanceSync(); }, 1500); 
}

async function executeFinanceSync() {
  if (pendingFinanceUpdates.size === 0 && !financeConfig.ts) return;
  isFinanceSyncing = true; setFinanceSyncButtonState('saving');
  
  const updates = Array.from(pendingFinanceUpdates.values());
  pendingFinanceUpdates.clear();

  try {
      const res = await AppCore.apiFetch('saveFinance', { payload: { updates, config: financeConfig } });
      if (res && res.data) {
          if (res.data.config && res.data.config.ts > financeConfig.ts) {
              financeConfig = res.data.config;
              if(!financeConfig.customRates) financeConfig.customRates = {};
              renderFinanceGlobalSettings();
          }
          if (res.data.options && Array.isArray(res.data.options)) {
              let hasChanges = false;
              res.data.options.forEach(sOpt => {
                  let lIdx = financeOptions.findIndex(o => o.id === sOpt.id);
                  if (lIdx === -1) { sOpt._isCollapsed = isFinanceCollapsed; financeOptions.push(sOpt); hasChanges = true; } 
                  else {
                      let lOpt = financeOptions[lIdx];
                      if (sOpt.ts > (lOpt.ts || 0) && !pendingFinanceUpdates.has(sOpt.id)) {
                          sOpt._isCollapsed = lOpt._isCollapsed; financeOptions[lIdx] = sOpt; hasChanges = true;
                      }
                  }
              });
              const serverIds = res.data.options.map(o => o.id);
              const initialLength = financeOptions.length;
              financeOptions = financeOptions.filter(o => serverIds.includes(o.id) || pendingFinanceUpdates.has(o.id));
              if (financeOptions.length !== initialLength) hasChanges = true;
              if(hasChanges && !finDndState.active) renderFinanceOptions();
          }
      }
      setFinanceSyncButtonState('saved');
  } catch (e) {
      setFinanceSyncButtonState('error');
      updates.forEach(u => pendingFinanceUpdates.set(u.id, u));
  } finally {
      isFinanceSyncing = false;
  }
}

function startFinancePolling() {
  if (financePollInterval) clearInterval(financePollInterval);
  financePollInterval = setInterval(async () => {
      if(isFinanceSyncing || finDndState.active) return;
      try {
          const res = await AppCore.apiFetch('fetchFinance', {}, true);
          if (res && res.data) {
              let hasChanges = false;
              if (res.data.config && res.data.config.ts > (financeConfig.ts || 0)) {
                  financeConfig = res.data.config;
                  if(!financeConfig.customRates) financeConfig.customRates = {};
                  renderFinanceGlobalSettings(); hasChanges = true;
              }
              if (res.data.options && Array.isArray(res.data.options)) {
                  res.data.options.forEach(sOpt => {
                      let lIdx = financeOptions.findIndex(o => o.id === sOpt.id);
                      if (lIdx === -1) { sOpt._isCollapsed = isFinanceCollapsed; financeOptions.push(sOpt); hasChanges = true; } 
                      else {
                          let lOpt = financeOptions[lIdx];
                          if (sOpt.ts > (lOpt.ts || 0) && !pendingFinanceUpdates.has(sOpt.id)) {
                              sOpt._isCollapsed = lOpt._isCollapsed; financeOptions[lIdx] = sOpt; hasChanges = true;
                          }
                      }
                  });
                  const serverIds = res.data.options.map(o => o.id);
                  const initialLength = financeOptions.length;
                  financeOptions = financeOptions.filter(o => serverIds.includes(o.id) || pendingFinanceUpdates.has(o.id));
                  if (financeOptions.length !== initialLength) hasChanges = true;
                  if (hasChanges && !finDndState.active) { renderFinanceOptions(); if (pendingFinanceUpdates.size === 0) setFinanceSyncButtonState('saved'); }
              }
          }
      } catch (e) {}
  }, 8000);
}

async function manualFinanceSync(btn) {
  setFinanceSyncButtonState('loading');
  try { await executeFinanceSync(); AppCore.showToast("Refreshed from server!"); } 
  catch(e) { AppCore.showToast("Sync failed.", true); }
}

async function buildFinanceUI() {
  document.getElementById('tab-finance').innerHTML = `
  <div class="flex flex-col h-full w-full relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
    <div class="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 md:p-5 shrink-0 flex flex-col md:flex-row justify-between items-center z-10 bg-white dark:bg-zinc-900 gap-4 relative">
        <div class="flex items-center gap-3">
            <h3 class="text-lg md:text-xl font-black text-zinc-900 dark:text-white tracking-tight">Finance Planner</h3>
        </div>
        <div class="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end">
            <button onclick="addFinanceOption()" class="bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 text-xs md:text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition shadow-sm focus:outline-none shrink-0 transform active:scale-95 flex items-center"><i class="fa-solid fa-plus mr-1.5"></i> Add Option</button>
            <button id="btn-sync-finance" onclick="manualFinanceSync(this)" class="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 text-xs md:text-sm font-bold px-4 py-2 rounded-lg hover:bg-green-100 transition flex items-center shadow-sm focus:outline-none shrink-0 transform active:scale-95"><span class="btn-text">Saved</span><div class="btn-spinner ml-1.5 !w-3.5 !h-3.5 hidden-force border-2"></div></button>
        </div>
    </div>

    <div id="financeGlobalSettings" class="bg-zinc-50 dark:bg-zinc-950 p-3 md:p-4 shrink-0 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center gap-3 z-10 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.05)] relative"></div>

    <div id="financeLoadingOverlay" class="absolute inset-0 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm z-[50] flex flex-col justify-center items-center">
        <div class="loader !w-10 !h-10 border-primary mb-3"></div>
        <span class="text-primary dark:text-blue-400 font-bold text-xs tracking-wide shadow-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-4 py-1.5 rounded-full">Loading Planner...</span>
    </div>

    <div class="flex-grow overflow-y-auto overflow-x-hidden p-3 md:p-5 bg-zinc-50/50 dark:bg-zinc-950/50 custom-scrollbar pb-10">
        <div id="financeOptionsContainer" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5 w-full items-start pb-4 max-w-full mx-auto"></div>
    </div>
    
    <div id="financeRatesModal" class="fixed inset-0 bg-black/60 z-[100] hidden-force flex justify-center items-center p-4 backdrop-blur-sm transition-opacity">
        <div class="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 m-auto animate-slide-up flex flex-col max-h-[90vh]">
            <div class="flex justify-between items-center mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-3 shrink-0">
                <h3 class="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2"><i class="fa-solid fa-money-bill-transfer text-primary"></i> Exchange Rates</h3>
                <button type="button" onclick="closeFinanceRatesModal()" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 text-2xl font-bold px-1 focus:outline-none shrink-0">&times;</button>
            </div>
            <div id="financeRatesList" class="overflow-y-auto custom-scrollbar flex-grow space-y-3 pb-2"></div>
            <div class="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 shrink-0 flex justify-end">
                <button onclick="closeFinanceRatesModal()" class="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold shadow-md hover:bg-blue-600 transition focus:outline-none transform active:scale-95 text-lg">Done</button>
            </div>
        </div>
    </div>
  </div>
  `;

  try {
      const res = await AppCore.apiFetch('fetchFinance');
      globalFinanceRates = res.rates || { "SGD": 1, "MYR": 0.28 };
      
      const rawOptions = res.data?.options || (Array.isArray(res.data) ? res.data : []);
      financeConfig = res.data?.config || { globalPaxMode: 'individual', globalPaxCount: 0, ts: Date.now(), customRates: {} };
      if(!financeConfig.customRates) financeConfig.customRates = {};
      
      financeOptions = rawOptions.map(opt => {
          if (opt.fields && !Array.isArray(opt.fields)) {
              const newFields = [];
              for (let [k, v] of Object.entries(opt.fields)) {
                  newFields.push({ id: generateFinanceUUID(), name: k, costType: 'total', tax: 0, cost: parseFloat(v.cost) || 0, currency: v.currency || 'MYR', remarks: v.remarks || '' });
              }
              opt.fields = newFields;
          } else if (opt.fields) {
              opt.fields.forEach(f => { if (!f.costType) f.costType = 'total'; if (f.tax === undefined || isNaN(f.tax)) f.tax = 0; });
          }
          if(!opt.displayCurrency) opt.displayCurrency = 'SGD'; if(!opt.pax) opt.pax = 0;
          if(opt.widthSpan === undefined) opt.widthSpan = 2; if(!opt.ts) opt.ts = Date.now();
          if(opt._isCollapsed === undefined) opt._isCollapsed = isFinanceCollapsed;
          return opt;
      });

      if (financeOptions.length === 0) addFinanceOption("Option 1", false);
      
      renderFinanceGlobalSettings();
      renderFinanceOptions();
      startFinancePolling();
  } catch (e) {
      AppCore.showToast("Failed to load finance data.", true);
  } finally {
      const overlay = document.getElementById('financeLoadingOverlay');
      if (overlay) overlay.classList.add('hidden-force');
  }
}

function renderFinanceGlobalSettings() {
  const container = document.getElementById('financeGlobalSettings');
  if (!container) return;
  const autoPax = window.globalLogistics?.participants?.length || 0;

  container.innerHTML = `
    <div class="flex flex-col md:flex-row justify-between items-center gap-3 w-full">
        <div class="flex flex-wrap items-center gap-3 flex-1 w-full md:w-auto">
            <div class="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 shadow-sm flex-1 md:flex-none">
                <label class="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider shrink-0"><i class="fa-solid fa-users mr-1"></i> Pax Mode:</label>
                <select onchange="updateFinanceConfig('globalPaxMode', this.value)" class="text-xs font-bold bg-transparent text-zinc-900 dark:text-white focus:outline-none cursor-pointer w-full">
                    <option value="individual" ${financeConfig.globalPaxMode === 'individual' ? 'selected' : ''}>Manual (Individual)</option>
                    <option value="manual" ${financeConfig.globalPaxMode === 'manual' ? 'selected' : ''}>Manual (Global)</option>
                    <option value="auto" ${financeConfig.globalPaxMode === 'auto' ? 'selected' : ''}>Total Auto Pax</option>
                </select>
            </div>
            <div class="flex items-center gap-2 ${financeConfig.globalPaxMode !== 'manual' ? 'hidden-force' : ''}">
                <label class="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider shrink-0">Global Pax:</label>
                <input type="number" min="0" value="${financeConfig.globalPaxCount}" onchange="updateFinanceConfig('globalPaxCount', this.value)" onkeyup="updateFinanceConfig('globalPaxCount', this.value)" class="hide-spinners w-16 text-sm font-bold border border-zinc-300 dark:border-zinc-600 rounded-lg px-2 py-1.5 bg-white dark:bg-black text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm text-center transition">
            </div>
            <div class="flex items-center gap-2 ${financeConfig.globalPaxMode !== 'auto' ? 'hidden-force' : ''}">
                <label class="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 tracking-wider shrink-0">Active Pax:</label>
                <span class="text-sm font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm">${autoPax}</span>
            </div>
        </div>
        <div class="flex gap-2 w-full md:w-auto">
            <button onclick="openFinanceRatesModal()" class="flex-1 md:flex-none text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-lg shadow-sm whitespace-nowrap shrink-0 transition hover:bg-blue-100 dark:hover:bg-blue-900/50 focus:outline-none flex items-center justify-center gap-1.5 transform active:scale-95"><i class="fa-solid fa-coins"></i> Rates</button>
            <button onclick="toggleFinanceCollapse()" class="flex-1 md:flex-none text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 px-4 py-2 rounded-lg shadow-sm whitespace-nowrap shrink-0 transition hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none transform active:scale-95"><i class="fa-solid ${isFinanceCollapsed ? 'fa-expand' : 'fa-compress'} mr-1"></i> ${isFinanceCollapsed ? 'Expand All' : 'Collapse All'}</button>
        </div>
    </div>
  `;
}

function updateFinanceConfig(key, value) {
  if (key === 'globalPaxMode') { financeConfig[key] = value; queueFinanceUpdate(); renderFinanceGlobalSettings(); renderFinanceOptions(); } 
  else if (key === 'globalPaxCount') { financeConfig[key] = parseInt(value) || 0; queueFinanceUpdate(); financeOptions.forEach(o => updateTotals(o.id)); renderFinanceOptions(); }
}

function updateFinanceOption(optId, key, value) {
  const opt = financeOptions.find(o => o.id === optId); if (!opt) return;
  if (key === 'title') opt.title = value;
  else if (key === 'pax') { opt.pax = parseInt(value) || 0; updateTotals(optId); }
  else if (key === 'displayCurrency') { opt.displayCurrency = value; updateTotals(optId); }
  queueFinanceUpdate(optId);
}

function updateFinanceField(optId, fieldId, key, value) {
  const opt = financeOptions.find(o => o.id === optId); if (!opt) return;
  const field = opt.fields.find(f => f.id === fieldId); if (!field) return;

  if (key === 'cost') { field.cost = parseFloat(String(value).replace(/,/g, '')) || 0; updateTotals(optId); } 
  else if (key === 'tax') { field.tax = parseFloat(value) || 0; updateTotals(optId); } 
  else if (key === 'costType') { field.costType = value; updateTotals(optId); } 
  else if (key === 'currency') { field.currency = value; updateTotals(optId); } 
  else if (key === 'name') field.name = value;
  else if (key === 'remarks') field.remarks = value;
  
  queueFinanceUpdate(optId);
  if (key === 'costType') renderFinanceOptions(); 
}

function updateTotals(optId) {
  const opt = financeOptions.find(o => o.id === optId); if (!opt) return;
  const pax = getActivePax(opt);
  let totalSgd = 0;
  opt.fields.forEach(f => {
      const rate = getActualRate(f.currency); const baseCost = parseFloat(f.cost) || 0; const taxPct = parseFloat(f.tax) || 0;
      const rawCost = f.costType === 'per_pax' ? (baseCost * pax) : baseCost;
      totalSgd += (rawCost * (1 + (taxPct / 100))) * rate;
  });
  const dispRate = getActualRate(opt.displayCurrency);
  const totalDisp = totalSgd / dispRate;
  const cppDisp = pax > 0 ? totalDisp / pax : 0;
  
  const totEl = document.getElementById(`total_${opt.id}`); const cppEl = document.getElementById(`cpp_${opt.id}`);
  if (totEl) totEl.textContent = `${opt.displayCurrency} ${totalDisp.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
  if (cppEl) cppEl.textContent = `${opt.displayCurrency} ${cppDisp.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function addFinanceOption(title = "New Option", reRender = true) {
  const newOpt = { id: generateFinanceUUID(), title: title, pax: 0, displayCurrency: 'SGD', widthSpan: 2, ts: Date.now(), _isCollapsed: false, fields: [] };
  defaultFinanceFields.forEach(f => { newOpt.fields.push({ id: generateFinanceUUID(), name: f, costType: 'total', tax: 0, cost: 0, currency: 'MYR', remarks: '' }); });
  financeOptions.unshift(newOpt); queueFinanceUpdate(newOpt.id);
  if (reRender) renderFinanceOptions();
}

function duplicateFinanceOption(id) {
  const opt = financeOptions.find(o => o.id === id); if (!opt) return;
  const copy = JSON.parse(JSON.stringify(opt));
  copy.id = generateFinanceUUID(); copy.title = opt.title + " (Copy)"; copy.ts = Date.now(); copy._isCollapsed = false;
  copy.fields.forEach(f => f.id = generateFinanceUUID()); 
  financeOptions.unshift(copy); queueFinanceUpdate(copy.id); renderFinanceOptions();
}

function removeFinanceOption(id) {
  if (!confirm("Are you sure you want to remove this option?")) return;
  financeOptions = financeOptions.filter(o => o.id !== id);
  financeConfig.ts = Date.now(); pendingFinanceUpdates.delete(id);
  setFinanceSyncButtonState('saving');
  if (financeSyncTimeout) clearTimeout(financeSyncTimeout);
  financeSyncTimeout = setTimeout(async () => {
      isFinanceSyncing = true;
      try { await AppCore.apiFetch('saveFinance', { payload: { options: financeOptions, config: financeConfig } }); setFinanceSyncButtonState('saved'); } 
      catch(e) { setFinanceSyncButtonState('error'); } 
      finally { isFinanceSyncing = false; }
  }, 500);
  renderFinanceOptions();
}

function addFinanceCategory(optId) {
  const opt = financeOptions.find(o => o.id === optId); if(!opt) return;
  opt.fields.push({ id: generateFinanceUUID(), name: 'New Category', costType: 'total', tax: 0, cost: 0, currency: 'MYR', remarks: '' });
  queueFinanceUpdate(optId); renderFinanceOptions();
}

function removeFinanceCategory(optId, fieldId) {
  const opt = financeOptions.find(o => o.id === optId); if(!opt) return;
  opt.fields = opt.fields.filter(f => f.id !== fieldId);
  queueFinanceUpdate(optId); renderFinanceOptions();
}

// Drag & Drop
function startFinDrag(e) {
  if(e.type === 'mousedown' && e.button !== 0) return; e.preventDefault(); 
  const handle = e.currentTarget; const row = handle.closest('.fin-cat-row'); const container = row.closest('.fin-cat-container');
  const clientY = e.touches ? e.touches[0].clientY : e.clientY; const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const rect = row.getBoundingClientRect();

  finDndState = { active: true, row: row, container: container, optId: container.dataset.optId, yOffset: clientY - rect.top, xOffset: clientX - rect.left, placeholder: document.createElement('div') };
  finDndState.placeholder.className = 'fin-cat-placeholder bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed border-primary/50 rounded-xl my-1.5 transition-all';
  finDndState.placeholder.style.height = rect.height + 'px';
  row.parentNode.insertBefore(finDndState.placeholder, row);

  row.style.position = 'fixed'; row.style.zIndex = '9999'; row.style.width = rect.width + 'px'; row.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'; row.classList.add('opacity-95', 'ring-2', 'ring-primary');
  updateFinDragPosition(clientY, clientX);

  document.addEventListener('mousemove', moveFinDrag, {passive: false}); document.addEventListener('touchmove', moveFinDrag, {passive: false});
  document.addEventListener('mouseup', endFinDrag); document.addEventListener('touchend', endFinDrag);
}

function moveFinDrag(e) {
  if(!finDndState.active) return; e.preventDefault(); 
  const clientY = e.touches ? e.touches[0].clientY : e.clientY; const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  updateFinDragPosition(clientY, clientX);

  const siblings = Array.from(finDndState.container.querySelectorAll('.fin-cat-row:not(.fin-cat-placeholder):not([style*="position: fixed"])'));
  let nextElement = null;
  for(let sib of siblings) { const rect = sib.getBoundingClientRect(); if(clientY < rect.top + rect.height / 2) { nextElement = sib; break; } }
  if(nextElement) finDndState.container.insertBefore(finDndState.placeholder, nextElement); else finDndState.container.appendChild(finDndState.placeholder);
}

function updateFinDragPosition(y, x) { finDndState.row.style.top = (y - finDndState.yOffset) + 'px'; finDndState.row.style.left = (x - finDndState.xOffset) + 'px'; }

function endFinDrag(e) {
  if(!finDndState.active) return; finDndState.active = false;
  document.removeEventListener('mousemove', moveFinDrag); document.removeEventListener('touchmove', moveFinDrag);
  document.removeEventListener('mouseup', endFinDrag); document.removeEventListener('touchend', endFinDrag);

  finDndState.placeholder.parentNode.insertBefore(finDndState.row, finDndState.placeholder);
  finDndState.placeholder.remove(); finDndState.row.style = ''; finDndState.row.classList.remove('opacity-95', 'ring-2', 'ring-primary');
  reorderFieldsInModel(finDndState.optId); renderFinanceOptions(); 
}

function reorderFieldsInModel(optId) {
  const opt = financeOptions.find(o => o.id === optId); if(!opt) return;
  const container = document.querySelector(`.fin-cat-container[data-opt-id="${optId}"]`); if(!container) return;
  const newFields = [];
  container.querySelectorAll('.fin-cat-row').forEach(row => { const field = opt.fields.find(f => f.id === row.dataset.fieldId); if(field) newFields.push(field); });
  opt.fields = newFields; queueFinanceUpdate(optId);
}

function renderFinanceOptions() {
  const container = document.getElementById('financeOptionsContainer'); if (!container) return;
  if (financeOptions.length === 0) {
      container.innerHTML = `<div class="w-full col-span-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500 pt-10"><i class="fa-solid fa-ghost text-4xl mb-4 opacity-50"></i><p class="font-bold text-sm">No options created yet. Click '+ Add Option' to start planning.</p></div>`;
      return;
  }

  let html = '';
  financeOptions.forEach(opt => {
      const pax = getActivePax(opt);
      let totalSgd = 0;
      opt.fields.forEach(f => {
          const rate = getActualRate(f.currency); const baseCost = parseFloat(f.cost) || 0; const taxPct = parseFloat(f.tax) || 0;
          totalSgd += ((f.costType === 'per_pax' ? baseCost * pax : baseCost) * (1 + (taxPct / 100))) * rate;
      });
      const dispRate = getActualRate(opt.displayCurrency);
      const totalDisp = totalSgd / dispRate;
      const cppDisp = pax > 0 ? totalDisp / pax : 0;
      
      const paxInputDisabled = financeConfig.globalPaxMode !== 'individual';
      const isLocalCollapsed = opt._isCollapsed !== undefined ? opt._isCollapsed : false;
      const spanClass = opt.widthSpan === 3 ? 'col-span-1 lg:col-span-2 xl:col-span-3' : (opt.widthSpan === 2 ? 'col-span-1 lg:col-span-2 xl:col-span-2' : 'col-span-1');

      html += `
      <div class="w-full shrink-0 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden h-fit transition-all duration-300 ${spanClass}">
          <div class="p-3 md:p-4 bg-zinc-50/80 dark:bg-zinc-900/80 flex justify-between items-center gap-3 shrink-0 ${isLocalCollapsed ? '' : 'border-b border-zinc-200 dark:border-zinc-800'}">
              <input type="text" value="${opt.title}" onchange="updateFinanceOption('${opt.id}', 'title', this.value)" class="font-black text-lg md:text-xl bg-transparent border-b border-transparent focus:border-primary outline-none text-zinc-900 dark:text-white flex-1 min-w-0 px-2 transition pb-0.5">
              <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="cycleFinanceOptionWidth('${opt.id}')" class="hidden lg:flex text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none items-center justify-center transition shadow-sm" title="Toggle Width"><i class="fa-solid fa-arrows-left-right text-sm"></i></button>
                  <button onclick="toggleIndividualFinanceCollapse('${opt.id}')" class="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:outline-none flex items-center justify-center transition shadow-sm"><i class="fa-solid fa-chevron-${isLocalCollapsed ? 'down' : 'up'} text-sm"></i></button>
                  <button onclick="duplicateFinanceOption('${opt.id}')" class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm border border-blue-200 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/50" title="Duplicate"><i class="fa-regular fa-copy text-sm"></i></button>
                  <button onclick="removeFinanceOption('${opt.id}')" class="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 w-8 h-8 rounded-lg flex items-center justify-center transition shadow-sm border border-red-200 dark:border-red-800/50 hover:bg-red-100 dark:hover:bg-red-900/50" title="Delete"><i class="fa-solid fa-trash text-sm"></i></button>
              </div>
          </div>
          <div class="${isLocalCollapsed ? 'hidden-force' : 'flex flex-col'}">
              <div class="px-3 md:px-4 py-3 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                  <label class="text-[10px] md:text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">Pax Count ${paxInputDisabled ? '(Global)' : ''}</label>
                  <input type="number" min="0" value="${pax}" ${paxInputDisabled ? 'disabled' : ''} onchange="updateFinanceOption('${opt.id}', 'pax', this.value)" onkeyup="updateFinanceOption('${opt.id}', 'pax', this.value)" class="hide-spinners w-24 text-sm font-bold px-3 py-1.5 bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition shadow-sm ${paxInputDisabled ? 'opacity-60 cursor-not-allowed' : ''}">
              </div>
              <div class="fin-cat-container p-3 md:p-4 bg-zinc-50/30 dark:bg-zinc-950/30 flex flex-col gap-3 max-h-[55vh] overflow-y-auto custom-scrollbar" data-opt-id="${opt.id}">
                  ${opt.fields.map(f => {
                      const costTypeColorClass = f.costType === 'per_pax' ? 'bg-purple-100 text-purple-900 border-purple-400 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700' : 'bg-green-100 text-green-900 border-green-400 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700';
                      const displayCostStr = parseFloat(f.cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                      return `
                      <div class="fin-cat-row flex flex-col w-full bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 focus-within:border-primary dark:focus-within:border-primary transition shadow-sm hover:shadow-md group" data-field-id="${f.id}">
                          <div class="flex items-center gap-2 w-full mb-2">
                              <div class="fin-drag-handle cursor-grab active:cursor-grabbing p-1 shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition" onmousedown="startFinDrag(event)" ontouchstart="startFinDrag(event)"><i class="fa-solid fa-grip-vertical text-sm pointer-events-none"></i></div>
                              <button onclick="removeFinanceCategory('${opt.id}', '${f.id}')" class="text-red-400 hover:text-red-600 p-1 shrink-0 transition md:opacity-0 group-hover:opacity-100" title="Delete Category"><i class="fa-solid fa-xmark text-sm"></i></button>
                              <input type="text" value="${f.name}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'name', this.value)" class="flex-1 min-w-[80px] bg-transparent text-sm md:text-base font-bold text-zinc-900 dark:text-zinc-100 outline-none px-1 border-b border-transparent focus:border-primary transition" placeholder="Category Name">
                          </div>
                          <div class="flex items-center flex-wrap gap-2 pl-[46px] w-full">
                              <select onchange="updateFinanceField('${opt.id}', '${f.id}', 'currency', this.value)" class="w-[70px] shrink-0 bg-zinc-50 dark:bg-black text-xs font-bold border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 pl-2 outline-none focus:border-primary cursor-pointer shadow-sm transition">${getCurrencyOptions(f.currency)}</select>
                              <select onchange="updateFinanceField('${opt.id}', '${f.id}', 'costType', this.value)" class="w-[75px] shrink-0 text-xs font-extrabold border rounded-lg py-2 px-1 outline-none cursor-pointer shadow-sm transition ${costTypeColorClass}"><option value="total" ${f.costType !== 'per_pax' ? 'selected' : ''}>Total</option><option value="per_pax" ${f.costType === 'per_pax' ? 'selected' : ''}>/Pax</option></select>
                              <input type="text" value="${displayCostStr}" oninput="formatMoneyInput(this, false); updateFinanceField('${opt.id}', '${f.id}', 'cost', this.value)" onblur="formatMoneyInput(this, true); updateFinanceField('${opt.id}', '${f.id}', 'cost', this.value)" class="w-[110px] shrink-0 bg-zinc-50 dark:bg-black text-sm font-bold border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 outline-none focus:border-primary text-right shadow-sm transition" placeholder="0.00">
                              <div class="flex items-center gap-1 w-[80px] shrink-0 bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg px-2 py-1.5 outline-none focus-within:border-primary shadow-sm transition"><span class="text-[10px] font-bold text-zinc-400">+</span><input type="number" step="0.1" min="0" value="${f.tax || ''}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'tax', this.value)" onkeyup="updateFinanceField('${opt.id}', '${f.id}', 'tax', this.value)" class="hide-spinners w-full bg-transparent text-sm font-bold outline-none text-right" placeholder="Tax"><span class="text-[10px] font-bold text-zinc-500">%</span></div>
                              <input type="text" value="${f.remarks}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'remarks', this.value)" class="flex-1 min-w-[120px] bg-transparent text-xs font-medium text-zinc-500 dark:text-zinc-400 outline-none px-2 border-b border-transparent focus:border-primary transition" placeholder="Remarks...">
                          </div>
                      </div>`;
                  }).join('')}
                  <div class="pt-2"><button onclick="addFinanceCategory('${opt.id}')" class="w-full py-3 border-2 border-dashed border-blue-300 dark:border-blue-800/50 rounded-xl text-blue-600 dark:text-blue-400 text-sm font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition flex items-center justify-center gap-2 shadow-sm"><i class="fa-solid fa-plus"></i> Add Custom Category</button></div>
              </div>
          </div>
          <div class="p-4 bg-blue-50/80 dark:bg-blue-900/20 shrink-0 flex flex-col gap-2 border-t border-blue-100 dark:border-blue-800/50">
              <div class="${isLocalCollapsed ? 'hidden-force' : 'flex'} justify-between items-center pb-3 border-b border-blue-200/50 dark:border-blue-800/50 mb-2">
                  <span class="font-bold text-xs text-blue-800 dark:text-blue-300 uppercase tracking-widest">Currency for Totals</span>
                  <select onchange="updateFinanceOption('${opt.id}', 'displayCurrency', this.value)" class="w-[100px] text-sm font-bold px-3 py-1.5 bg-white dark:bg-black border border-blue-300 dark:border-blue-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm text-blue-900 dark:text-blue-100 transition">${getCurrencyOptions(opt.displayCurrency)}</select>
              </div>
              <div class="flex justify-between items-center"><span class="font-black text-sm text-blue-800 dark:text-blue-300 uppercase tracking-widest">Total Estimated</span><span id="total_${opt.id}" class="font-black text-lg md:text-xl text-blue-700 dark:text-blue-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm leading-none">${opt.displayCurrency} ${totalDisp.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
              <div class="flex justify-between items-center mt-1"><span class="font-black text-sm text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Cost Per Pax</span><span id="cpp_${opt.id}" class="font-black text-lg md:text-xl text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-sm leading-none">${opt.displayCurrency} ${cppDisp.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
          </div>
      </div>`;
  });
  container.innerHTML = html;
}