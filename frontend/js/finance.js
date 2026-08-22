let financeOptions = [];
let pendingFinanceUpdates = new Map();
let pendingReceiptUpdates = new Map();
let globalFinanceRates = { "SGD": 1, "MYR": 0.28 };
let globalReceipts = [];
let financeConfig = {
globalPaxMode: 'individual', 
globalPaxCount: 0,
ts: 0,
customRates: {},
finalOptionId: null,
perPersonFee: 0,
feeDeviations: {},
feesReceived: {}
};
let isFinanceCollapsed = false;
let financeSyncTimeout = null;
let receiptSyncTimeout = null;
let financePollInterval = null;
let isFinanceSyncing = false;
let isReceiptSyncing = false;
let finSearchQuery = '';

let finDndState = { active: false, row: null, placeholder: null, container: null, optId: null, yOffset: 0, xOffset: 0 };

const defaultFinanceFields = [
'Accommodation', 'Transport', 'Day 1 Lunch', 'Day 1 Dinner', 
'Day 1 Activity', 'Day 2 Breakfast', 'Day 2 Lunch', 'Day 2 Activity', 
'Logistics', 'First Aid', 'Miscellaneous', 'Recce', 'Insurance'
];

function generateFinanceUUID() {
return 'fin_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

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
if (financeConfig.globalPaxMode === 'auto') {
    return globalLogistics && globalLogistics.participants ? globalLogistics.participants.length : 0;
} else if (financeConfig.globalPaxMode === 'manual') {
    return parseInt(financeConfig.globalPaxCount) || 0;
} else {
    return parseInt(opt.pax) || 0;
}
}

function getActualRate(currency) {
if (currency === 'SGD') return 1;
if (financeConfig.customRates && financeConfig.customRates[currency]) {
    return parseFloat(financeConfig.customRates[currency]);
}
return globalFinanceRates[currency] || 1;
}

async function buildFinanceUI() {
document.getElementById('tab-finance').innerHTML = `
<div class="sticky top-0 z-40 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shrink-0 rounded-t-xl md:rounded-none pr-2">
    <div class="flex overflow-x-auto scrollbar-hide flex-1 px-4 py-3 gap-2">
        <button onclick="switchFinanceSubTab('finalized')" id="subTab-fin-finalized" class="px-4 py-1.5 font-bold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm whitespace-nowrap text-sm transition focus:outline-none">Finalized Finances</button>
        <button onclick="switchFinanceSubTab('options')" id="subTab-fin-options" class="px-4 py-1.5 font-bold rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 whitespace-nowrap text-sm transition focus:outline-none">Trip Options</button>
        <button onclick="switchFinanceSubTab('receipts')" id="subTab-fin-receipts" class="px-4 py-1.5 font-bold rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 whitespace-nowrap text-sm transition focus:outline-none">Receipts</button>
        <button onclick="switchFinanceSubTab('fees')" id="subTab-fin-fees" class="px-4 py-1.5 font-bold rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 whitespace-nowrap text-sm transition focus:outline-none">Fee Tracker</button>
    </div>
    <div class="flex items-center shrink-0 pl-2 border-l border-gray-200 dark:border-gray-800 ml-1">
        <button id="btn-sync-finance" onclick="manualFinanceSync(this)" class="bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-md hover:bg-green-100 transition flex items-center shadow-sm focus:outline-none shrink-0">
            <span class="btn-text">Saved</span>
            <div class="btn-spinner spinner-white ml-1.5 !w-3 !h-3 hidden-force border-2"></div>
        </button>
    </div>
</div>

<div id="finLoadingOverlay" class="absolute inset-0 top-[50px] bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-20 flex flex-col justify-center items-center hidden-force">
    <div class="loader !w-8 !h-8 border-primary mb-2"></div>
    <span class="text-primary dark:text-blue-400 font-bold text-[10px] tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full mt-2">Loading Planner...</span>
</div>

<div id="fin-tab-finalized" class="flex-1 w-full p-2 md:p-4 overflow-y-auto custom-scrollbar relative"></div>
<div id="fin-tab-options" class="hidden-force flex-1 w-full p-2 md:p-4 overflow-y-auto custom-scrollbar relative"></div>
<div id="fin-tab-receipts" class="hidden-force flex-1 w-full p-2 md:p-4 overflow-y-auto custom-scrollbar relative"></div>
<div id="fin-tab-fees" class="hidden-force flex-1 w-full p-2 md:p-4 overflow-y-auto custom-scrollbar relative"></div>
`;

const overlay = document.getElementById('finLoadingOverlay');
if (overlay) overlay.classList.remove('hidden-force');

try {
    if(!globalLogistics) {
        try {
            const resLog = await apiCall('fetchLogistics'); 
            globalLogistics = resLog;
            if (typeof processDisplayNames === "function") processDisplayNames(globalLogistics.participants);
            if (typeof applyGlobalSorting === "function") globalLogistics.participants = applyGlobalSorting(globalLogistics.participants);
        } catch(e) {}
    }

    const [finRes, recRes] = await Promise.all([
        apiCall('fetchFinance').catch(e => { console.warn("fetchFinance failed", e); return { data: { options: [], config: {} }, rates: { "SGD": 1 } }; }),
        apiCall('fetchReceipts').catch(e => { console.warn("fetchReceipts failed", e); return { receipts: [] }; })
    ]);

    globalFinanceRates = finRes.rates || { "SGD": 1, "MYR": 0.28 };
    globalReceipts = recRes.receipts || [];
    
    const rawOptions = finRes.data?.options || (Array.isArray(finRes.data) ? finRes.data : []);
    financeConfig = finRes.data?.config || { globalPaxMode: 'individual', globalPaxCount: 0, ts: Date.now(), customRates: {}, finalOptionId: null, perPersonFee: 0, feeDeviations: {}, feesReceived: {}, payNowNumber: '', showPaymentSection: false };
    
    if(!financeConfig.customRates) financeConfig.customRates = {};
    if(!financeConfig.feeDeviations) financeConfig.feeDeviations = {};
    if(!financeConfig.feesReceived) financeConfig.feesReceived = {};
    
    financeOptions = rawOptions.map(opt => {
        if (opt.fields && !Array.isArray(opt.fields)) {
            const newFields = [];
            for (let [k, v] of Object.entries(opt.fields)) {
                newFields.push({ id: generateFinanceUUID(), name: k, costType: 'total', tax: 0, cost: parseFloat(v.cost) || 0, currency: v.currency || 'MYR', remarks: v.remarks || '' });
            }
            opt.fields = newFields;
        } else if (opt.fields) {
            opt.fields.forEach(f => {
                if (!f.costType) f.costType = 'total';
                if (f.tax === undefined || isNaN(f.tax)) f.tax = 0;
            });
        }
        if(!opt.displayCurrency) opt.displayCurrency = 'SGD';
        if(!opt.pax) opt.pax = 0;
        if(opt.widthSpan === undefined) opt.widthSpan = 2;
        if(!opt.ts) opt.ts = Date.now();
        if(opt._isCollapsed === undefined) opt._isCollapsed = isFinanceCollapsed;
        return opt;
    });

    if (financeOptions.length === 0) {
        addFinanceOption("Option 1", false);
    }
    
    renderAllFinanceTabs();
    startFinancePolling();
} catch (e) {
    showToast("Failed to load finance data.", true);
} finally {
    if (overlay) overlay.classList.add('hidden-force');
}
}

function switchFinanceSubTab(tabId) {
['finalized', 'options', 'receipts', 'fees'].forEach(id => { 
    const el = document.getElementById(`fin-tab-${id}`);
    if(el) el.classList.add('hidden-force'); 
    const btn = document.getElementById(`subTab-fin-${id}`); 
    if(btn) { 
        btn.classList.remove('bg-blue-50', 'text-blue-700', 'dark:bg-blue-900/30', 'dark:text-blue-300', 'shadow-sm'); 
        btn.classList.add('text-gray-500', 'hover:bg-gray-100', 'dark:text-gray-400', 'dark:hover:bg-gray-800'); 
    } 
}); 
const targetEl = document.getElementById(`fin-tab-${tabId}`);
if(targetEl) targetEl.classList.remove('hidden-force'); 
const targetBtn = document.getElementById(`subTab-fin-${tabId}`); 
if(targetBtn) { 
    targetBtn.classList.remove('text-gray-500', 'hover:bg-gray-100', 'dark:text-gray-400', 'dark:hover:bg-gray-800'); 
    targetBtn.classList.add('bg-blue-50', 'text-blue-700', 'dark:bg-blue-900/30', 'dark:text-blue-300', 'shadow-sm'); 
} 

renderAllFinanceTabs();
}

function renderAllFinanceTabs() {
renderFinalizedFinances();
renderFinanceOptions();
renderReceiptsBrowser();
renderFeeTracker();
}

function updateFinanceConfig(key, value) {
if (key === 'globalPaxMode' || key === 'finalOptionId' || key === 'perPersonFee') {
    financeConfig[key] = value;
} else if (key === 'globalPaxCount') {
    financeConfig[key] = parseInt(value) || 0;
}
queueFinanceUpdate();
renderAllFinanceTabs();
}

function setFinanceSyncButtonState(state) {
const btn = document.getElementById('btn-sync-finance');
if(!btn) return;

const textSpan = btn.querySelector('.btn-text'); 
const spinner = btn.querySelector('.btn-spinner');

btn.className = "text-[10px] md:text-xs px-3 py-1.5 rounded-md font-bold transition flex items-center justify-center border shadow-sm focus:outline-none shrink-0"; 
spinner.className = "btn-spinner ml-1.5 !w-3 !h-3 hidden-force border-2"; 

if (state === 'loading') { 
    btn.classList.add('bg-gray-100', 'text-gray-500', 'border-gray-200', 'dark:bg-gray-800', 'dark:text-gray-400', 'dark:border-gray-700'); 
    textSpan.textContent = "Loading..."; 
    spinner.classList.remove('hidden-force'); 
    spinner.classList.add('spinner-primary'); 
} else if(state === 'saving') { 
    btn.classList.add('bg-yellow-50', 'text-yellow-700', 'border-yellow-200', 'dark:bg-yellow-900/30', 'dark:text-yellow-300', 'dark:border-yellow-800'); 
    textSpan.textContent = "Saving..."; 
    spinner.classList.remove('hidden-force'); 
    spinner.classList.add('spinner-yellow'); 
} else if (state === 'saved') { 
    btn.classList.add('bg-green-50', 'text-green-700', 'border-green-200', 'dark:bg-green-900/30', 'dark:text-green-300', 'dark:border-green-800'); 
    textSpan.textContent = "Saved"; 
} else if (state === 'error') { 
    btn.classList.add('bg-red-50', 'text-red-700', 'border-red-200', 'dark:bg-red-900/30', 'dark:text-red-300', 'dark:border-red-800'); 
    textSpan.textContent = "Error"; 
}
}

function queueFinanceUpdate(optId = null) {
if (optId) {
    const opt = financeOptions.find(o => o.id === optId);
    if (opt) {
        opt.ts = Date.now();
        pendingFinanceUpdates.set(optId, opt);
    }
}
financeConfig.ts = Date.now();
setFinanceSyncButtonState('saving');
if (financeSyncTimeout) clearTimeout(financeSyncTimeout);
financeSyncTimeout = setTimeout(() => { executeFinanceSync(); }, 1500); 
}

async function executeFinanceSync() {
if (pendingFinanceUpdates.size === 0 && !financeConfig.ts) return;

isFinanceSyncing = true;
setFinanceSyncButtonState('saving');

const updates = Array.from(pendingFinanceUpdates.values());
pendingFinanceUpdates.clear();

const payload = { updates: updates, config: financeConfig };

try {
    const res = await apiCall('saveFinance', { payload: payload });
    if (res.data) {
        if (res.data.config && res.data.config.ts > financeConfig.ts) {
            financeConfig = res.data.config;
            if(!financeConfig.customRates) financeConfig.customRates = {};
            if(!financeConfig.feeDeviations) financeConfig.feeDeviations = {};
            if(!financeConfig.feesReceived) financeConfig.feesReceived = {};
        }
        
        if (res.data.options && Array.isArray(res.data.options)) {
            res.data.options.forEach(sOpt => {
                let lIdx = financeOptions.findIndex(o => o.id === sOpt.id);
                if (lIdx === -1) {
                    sOpt._isCollapsed = isFinanceCollapsed;
                    financeOptions.push(sOpt);
                } else {
                    let lOpt = financeOptions[lIdx];
                    if (sOpt.ts > (lOpt.ts || 0) && !pendingFinanceUpdates.has(sOpt.id)) {
                        sOpt._isCollapsed = lOpt._isCollapsed; 
                        financeOptions[lIdx] = sOpt;
                    }
                }
            });

            const serverIds = res.data.options.map(o => o.id);
            financeOptions = financeOptions.filter(o => serverIds.includes(o.id) || pendingFinanceUpdates.has(o.id));
        }
    }
    setFinanceSyncButtonState('saved');
    if (!finDndState.active && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        renderAllFinanceTabs();
    }
} catch (e) {
    setFinanceSyncButtonState('error');
    updates.forEach(u => pendingFinanceUpdates.set(u.id, u));
} finally {
    isFinanceSyncing = false;
}
}

function queueReceiptUpdate(receipt) {
receipt.ts = Date.now();
pendingReceiptUpdates.set(receipt.id, receipt);
setFinanceSyncButtonState('saving');
if (receiptSyncTimeout) clearTimeout(receiptSyncTimeout);
receiptSyncTimeout = setTimeout(() => { executeReceiptSync(); }, 1500); 
}

async function executeReceiptSync() {
if (pendingReceiptUpdates.size === 0) return;
isReceiptSyncing = true;
setFinanceSyncButtonState('saving');
const updates = Array.from(pendingReceiptUpdates.values());
pendingReceiptUpdates.clear();

try {
    const res = await apiCall('syncReceipts', { updates: updates });
    if (res.receipts) globalReceipts = res.receipts;
    setFinanceSyncButtonState('saved');
    renderReceiptsBrowser();
    renderFinalizedFinances();
} catch(e) {
    setFinanceSyncButtonState('error');
    updates.forEach(u => pendingReceiptUpdates.set(u.id, u));
} finally {
    isReceiptSyncing = false;
}
}

function startFinancePolling() {
if (financePollInterval) clearInterval(financePollInterval);

financePollInterval = setInterval(async () => {
    const tab = document.getElementById('tab-finance');
    if(!tab || tab.classList.contains('hidden-force') || isFinanceSyncing || isReceiptSyncing || finDndState.active) return;
    
    const fetchStartTime = Date.now();

    try {
        const [finRes, recRes] = await Promise.all([
        apiCall('fetchFinance').catch(e => { console.warn("fetchFinance failed", e); return { data: { options: [], config: {} }, rates: { "SGD": 1 } }; }),
        apiCall('fetchReceipts').catch(e => { console.warn("fetchReceipts failed", e); return { receipts: [] }; })
    ]);

        if (lastLocalChange > fetchStartTime) return; 

        let hasChanges = false;
        
        if (recRes.receipts) {
            globalReceipts = recRes.receipts;
            hasChanges = true;
        }

        if (finRes.data) {
            if (finRes.data.config && finRes.data.config.ts > (financeConfig.ts || 0)) {
                financeConfig = finRes.data.config;
                if(!financeConfig.customRates) financeConfig.customRates = {};
                if(!financeConfig.feeDeviations) financeConfig.feeDeviations = {};
                if(!financeConfig.feesReceived) financeConfig.feesReceived = {};
                hasChanges = true;
            }
            
            if (finRes.data.options && Array.isArray(finRes.data.options)) {
                finRes.data.options.forEach(sOpt => {
                    let lIdx = financeOptions.findIndex(o => o.id === sOpt.id);
                    if (lIdx === -1) {
                        sOpt._isCollapsed = isFinanceCollapsed;
                        financeOptions.push(sOpt);
                        hasChanges = true;
                    } else {
                        let lOpt = financeOptions[lIdx];
                        if (sOpt.ts > (lOpt.ts || 0) && !pendingFinanceUpdates.has(sOpt.id)) {
                            sOpt._isCollapsed = lOpt._isCollapsed;
                            financeOptions[lIdx] = sOpt;
                            hasChanges = true;
                        }
                    }
                });
                const serverIds = finRes.data.options.map(o => o.id);
                const initialLength = financeOptions.length;
                financeOptions = financeOptions.filter(o => serverIds.includes(o.id) || pendingFinanceUpdates.has(o.id));
                if (financeOptions.length !== initialLength) hasChanges = true;
            }
        }

        if (hasChanges && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            renderAllFinanceTabs();
            if (pendingFinanceUpdates.size === 0 && pendingReceiptUpdates.size === 0) setFinanceSyncButtonState('saved');
        }
    } catch (e) { }
}, 10000);
}

async function manualFinanceSync(btn) {
setFinanceSyncButtonState('loading');
try {
    if (pendingFinanceUpdates.size > 0 || financeConfig.ts) await executeFinanceSync();
    if (pendingReceiptUpdates.size > 0) await executeReceiptSync();
    showToast("Refreshed from server!");
} catch(e) {
    showToast("Sync failed.", true);
}
}

// ==========================================
// TAB 1: FINALIZED FINANCES
// ==========================================
function renderFinalizedFinances() {
const cont = document.getElementById('fin-tab-finalized');
if(!cont || cont.classList.contains('hidden-force')) return;

if(!financeConfig.finalOptionId) {
    cont.innerHTML = `
<div class="max-w-6xl mx-auto flex flex-col gap-6 p-2 md:p-6 pb-20">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Receipts Browser</h2>
            <p class="text-sm text-gray-500 mt-1">Manage and track uploaded receipts and reimbursements.</p>
        </div>
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2.5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Receipts</span>
            <span class="text-lg font-black text-blue-600 dark:text-blue-400">${activeReceipts.length}</span>
        </div>
    </div>
    
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
                <thead class="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    <tr>
                        <th class="py-4 px-6 font-bold">Date</th>
                        <th class="py-4 px-6 font-bold">Personnel</th>
                        <th class="py-4 px-6 font-bold">Category</th>
                        <th class="py-4 px-6 text-right font-bold">Original Amount</th>
                        <th class="py-4 px-6 text-right font-bold">SGD Eqv.</th>
                        <th class="py-4 px-6 font-bold">Remarks</th>
                        <th class="py-4 px-6 text-center font-bold">Status</th>
                        <th class="py-4 px-6 text-center font-bold">Proof</th>
                        <th class="py-4 px-6 text-center font-bold">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    </div>
</div>
`;
    return;
}

const opt = financeOptions.find(o => o.id === financeConfig.finalOptionId && !o.isDeleted);
if(!opt) {
    cont.innerHTML = `
<div class="max-w-6xl mx-auto flex flex-col gap-6 p-2 md:p-6 pb-20">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Receipts Browser</h2>
            <p class="text-sm text-gray-500 mt-1">Manage and track uploaded receipts and reimbursements.</p>
        </div>
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2.5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Receipts</span>
            <span class="text-lg font-black text-blue-600 dark:text-blue-400">${activeReceipts.length}</span>
        </div>
    </div>
    
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
                <thead class="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    <tr>
                        <th class="py-4 px-6 font-bold">Date</th>
                        <th class="py-4 px-6 font-bold">Personnel</th>
                        <th class="py-4 px-6 font-bold">Category</th>
                        <th class="py-4 px-6 text-right font-bold">Original Amount</th>
                        <th class="py-4 px-6 text-right font-bold">SGD Eqv.</th>
                        <th class="py-4 px-6 font-bold">Remarks</th>
                        <th class="py-4 px-6 text-center font-bold">Status</th>
                        <th class="py-4 px-6 text-center font-bold">Proof</th>
                        <th class="py-4 px-6 text-center font-bold">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    </div>
</div>
`;
    return;
}

const pax = getActivePax(opt);
let grandPlannedSgd = 0;
let grandActualSgd = 0;

let rowsHtml = '';

opt.fields.forEach(f => {
    const rate = getActualRate(f.currency);
    const baseCost = parseFloat(f.cost) || 0;
    const taxPct = parseFloat(f.tax) || 0;
    const rawCost = f.costType === 'per_pax' ? (baseCost * pax) : baseCost;
    const plannedSgd = (rawCost * (1 + (taxPct / 100))) * rate;
    
    const actualSgd = globalReceipts
        .filter(r => r.categoryId === f.id && !r.isDeleted)
        .reduce((sum, r) => sum + r.sgdAmount, 0);

    grandPlannedSgd += plannedSgd;
    grandActualSgd += actualSgd;

    const diff = plannedSgd - actualSgd;
    const diffClass = diff < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';

    rowsHtml += `
    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
        <td class="py-3.5 px-6 text-sm font-semibold text-gray-900 dark:text-gray-100">${f.name}</td>
        <td class="py-3.5 px-6 text-sm font-medium text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">${plannedSgd.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
        <td class="py-3.5 px-6 text-sm font-bold text-blue-600 dark:text-blue-400 text-right whitespace-nowrap">${actualSgd.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
        <td class="py-3.5 px-6 text-sm font-black ${diffClass} text-right whitespace-nowrap">${diff > 0 ? '+' : ''}${diff.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
    </tr>`;
});

cont.innerHTML = `
<div class="max-w-6xl mx-auto flex flex-col gap-6 p-2 md:p-6 pb-20">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Receipts Browser</h2>
            <p class="text-sm text-gray-500 mt-1">Manage and track uploaded receipts and reimbursements.</p>
        </div>
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2.5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Receipts</span>
            <span class="text-lg font-black text-blue-600 dark:text-blue-400">${activeReceipts.length}</span>
        </div>
    </div>
    
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
                <thead class="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    <tr>
                        <th class="py-4 px-6 font-bold">Date</th>
                        <th class="py-4 px-6 font-bold">Personnel</th>
                        <th class="py-4 px-6 font-bold">Category</th>
                        <th class="py-4 px-6 text-right font-bold">Original Amount</th>
                        <th class="py-4 px-6 text-right font-bold">SGD Eqv.</th>
                        <th class="py-4 px-6 font-bold">Remarks</th>
                        <th class="py-4 px-6 text-center font-bold">Status</th>
                        <th class="py-4 px-6 text-center font-bold">Proof</th>
                        <th class="py-4 px-6 text-center font-bold">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    </div>
</div>
`;

let html = '<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4 w-full items-start pb-4 max-w-full mx-auto">';

const activeOptions = financeOptions.filter(o => !o.isDeleted);

if (activeOptions.length === 0) {
    html += `<div class="w-full col-span-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 pt-10"><p class="font-bold text-sm">No options created yet.</p></div>`;
} else {
    activeOptions.forEach(opt => {
        const pax = getActivePax(opt);
        let totalSgd = 0;
        opt.fields.forEach(f => {
            const rate = getActualRate(f.currency);
            const baseCost = parseFloat(f.cost) || 0;
            const taxPct = parseFloat(f.tax) || 0;
            const rawCost = f.costType === 'per_pax' ? (baseCost * pax) : baseCost;
            totalSgd += (rawCost * (1 + (taxPct / 100))) * rate;
        });
        
        const dispRate = getActualRate(opt.displayCurrency);
        const totalDisp = totalSgd / dispRate;
        const cppDisp = pax > 0 ? totalDisp / pax : 0;
        const paxInputDisabled = financeConfig.globalPaxMode !== 'individual';
        const isLocalCollapsed = opt._isCollapsed !== undefined ? opt._isCollapsed : false;
        const spanClass = opt.widthSpan === 3 ? 'col-span-1 lg:col-span-2 xl:col-span-3' : (opt.widthSpan === 2 ? 'col-span-1 lg:col-span-2 xl:col-span-2' : 'col-span-1');
        
        const isFinal = financeConfig.finalOptionId === opt.id;
        const finalBadge = isFinal ? `<span class="bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/40 dark:text-green-400 dark:border-green-800 text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-widest shrink-0">FINALIZED</span>` : '';

        html += `
        <div class="w-full shrink-0 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-sm border ${isFinal ? 'border-2 border-blue-400 dark:border-blue-500 shadow-[0_4px_20px_-5px_rgba(59,130,246,0.2)]' : 'border-gray-100 dark:border-gray-800'} overflow-hidden h-fit transition-all duration-300 ${spanClass}">
            <div class="px-4 py-3 ${isFinal ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'bg-gray-50/50 dark:bg-gray-800/20'} flex flex-wrap justify-between items-center gap-3 shrink-0 ${isLocalCollapsed ? '' : 'border-b border-gray-100 dark:border-gray-800'}">
                <div class="flex items-center flex-1 min-w-0 gap-3">
                    <input type="text" value="${opt.title}" onchange="updateFinanceOption('${opt.id}', 'title', this.value)" class="font-black text-lg bg-transparent border-b border-transparent focus:border-primary outline-none text-gray-900 dark:text-white flex-1 min-w-[120px] transition">
                    ${isFinal ? '<span class="bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-800 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm uppercase tracking-widest shrink-0">FINALIZED</span>' : ''}
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                    <button onclick="updateFinanceConfig('finalOptionId', '${isFinal ? '' : opt.id}')" class="${isFinal ? 'text-gray-500 hover:text-red-500 bg-gray-100 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-100 bg-blue-50'} dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-bold transition focus:outline-none shadow-sm" title="${isFinal ? 'Remove Final Status' : 'Mark as Finalized'}">
                        ${isFinal ? 'Unfinalize' : 'Make Final'}
                    </button>
                    <button onclick="cycleFinanceOptionWidth('${opt.id}')" class="hidden lg:flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 rounded-lg transition bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none" title="Toggle Width">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 8L4 12l4 4m8-8l4 4-4 4"></path></svg>
                    </button>
                    <button onclick="toggleIndividualFinanceCollapse('${opt.id}')" class="flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 w-8 h-8 rounded-lg transition bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none" title="Collapse/Expand">
                        <svg class="w-4 h-4 transform transition-transform ${isLocalCollapsed ? '' : 'rotate-180'}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button onclick="duplicateFinanceOption('${opt.id}')" class="flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 w-8 h-8 rounded-lg transition hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></button>
                    <button onclick="removeFinanceOption('${opt.id}')" class="flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 w-8 h-8 rounded-lg transition hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                </div>
            </div>
            
            <div class="${isLocalCollapsed ? 'hidden-force' : 'flex flex-col'}">
                <div class="px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-50 dark:border-gray-800/50 flex justify-between items-center">
                    <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pax Count ${paxInputDisabled ? '(Global)' : ''}</label>
                    <input type="number" min="0" value="${pax}" ${paxInputDisabled ? 'disabled' : ''} onchange="updateFinanceOption('${opt.id}', 'pax', this.value)" class="hide-spinners w-20 text-sm font-bold px-2 py-1 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary/20 ${paxInputDisabled ? 'opacity-50 cursor-not-allowed text-gray-400' : ''}">
                </div>
                
                <div class="fin-cat-container p-3 bg-gray-50/30 dark:bg-gray-900/20 flex flex-col gap-2.5 max-h-[50vh] overflow-y-auto custom-scrollbar" data-opt-id="${opt.id}">
                    ${opt.fields.map(f => {
                        const costTypeColorClass = f.costType === 'per_pax' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-400 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700/50' : 'bg-green-50 text-green-700 border-green-200 focus:border-green-400 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50';
                        const displayCostStr = parseFloat(f.cost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        return `
                        <div class="fin-cat-row flex flex-col w-full bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 focus-within:border-gray-300 dark:focus-within:border-gray-500 transition shadow-sm" data-field-id="${f.id}">
                            <div class="flex items-center gap-2 w-full mb-2">
                                <div class="fin-drag-handle cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 transition" onmousedown="startFinDrag(event)" ontouchstart="startFinDrag(event)"><svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" /></svg></div>
                                <button onclick="removeFinanceCategory('${opt.id}', '${f.id}')" class="text-red-400 hover:text-red-600 p-1 shrink-0 transition" title="Delete Category"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                                <input type="text" value="${f.name}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'name', this.value)" class="flex-1 min-w-[80px] bg-transparent text-sm font-bold text-gray-800 dark:text-gray-200 outline-none px-1 border-b border-transparent focus:border-primary transition" placeholder="Category Name">
                            </div>
                            <div class="flex items-center flex-wrap gap-2 pl-9 w-full">
                                <select onchange="updateFinanceField('${opt.id}', '${f.id}', 'currency', this.value)" class="w-[70px] shrink-0 bg-gray-50 dark:bg-gray-900 text-xs font-bold border border-gray-200 dark:border-gray-700 rounded-lg py-1.5 pl-2 outline-none focus:border-primary shadow-sm cursor-pointer">${getCurrencyOptions(f.currency)}</select>
                                <select onchange="updateFinanceField('${opt.id}', '${f.id}', 'costType', this.value)" class="w-[75px] shrink-0 text-xs font-bold border rounded-lg py-1.5 px-2 outline-none shadow-sm cursor-pointer transition-colors ${costTypeColorClass}"><option value="total" ${f.costType !== 'per_pax' ? 'selected' : ''}>Total</option><option value="per_pax" ${f.costType === 'per_pax' ? 'selected' : ''}>/Pax</option></select>
                                <input type="text" value="${displayCostStr}" oninput="formatMoneyInput(this, false); updateFinanceField('${opt.id}', '${f.id}', 'cost', this.value)" onblur="formatMoneyInput(this, true); updateFinanceField('${opt.id}', '${f.id}', 'cost', this.value)" class="w-[100px] shrink-0 bg-white dark:bg-gray-900 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-right" placeholder="0.00">
                                <div class="flex items-center gap-1 w-[75px] shrink-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none focus-within:border-primary focus-within:ring-1 focus-within:ring-primary shadow-sm"><span class="text-[10px] font-bold text-gray-400">+</span><input type="number" step="0.1" min="0" value="${f.tax || ''}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'tax', this.value)" class="hide-spinners w-full bg-transparent text-xs font-bold outline-none text-right" placeholder="Tax"><span class="text-[10px] font-bold text-gray-500">%</span></div>
                                <input type="text" value="${f.remarks}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'remarks', this.value)" class="flex-1 min-w-[120px] bg-transparent text-xs font-medium text-gray-500 dark:text-gray-400 outline-none px-1 border-b border-transparent focus:border-primary transition" placeholder="Remarks...">
                            </div>
                        </div>`;
                    }).join('')}
                    <div class="pt-2 px-1">
                        <button onclick="addFinanceCategory('${opt.id}')" class="w-full py-2.5 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition">+ Add Custom Category</button>
                    </div>
                </div>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-800/40 shrink-0 flex flex-col gap-3 ${isLocalCollapsed ? 'border-t border-gray-100 dark:border-gray-800' : 'border-t border-gray-100 dark:border-gray-800'}">
                <div class="${isLocalCollapsed ? 'hidden-force' : 'flex'} justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                    <span class="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Currency for Totals</span>
                    <select onchange="updateFinanceOption('${opt.id}', 'displayCurrency', this.value)" class="w-[90px] text-xs font-bold px-2.5 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none cursor-pointer shadow-sm text-gray-700 dark:text-gray-200">${getCurrencyOptions(opt.displayCurrency)}</select>
                </div>
                <div class="flex justify-between items-center">
                    <span class="font-black text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest">Total Estimated</span>
                    <span id="total_${opt.id}" class="font-black text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm leading-none">${opt.displayCurrency} ${totalDisp.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="font-black text-xs text-blue-500 uppercase tracking-widest">Cost Per Pax</span>
                    <span id="cpp_${opt.id}" class="font-black text-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm leading-none">${opt.displayCurrency} ${cppDisp.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </div>
        </div>`;
    });
}
html += '</div>';
cont.innerHTML = globalSettingsHtml + html;
}

function openFinanceRatesModal() {
const list = document.getElementById('financeRatesList');
let html = '<p class="text-[10px] text-gray-500 dark:text-gray-400 mb-3 leading-tight">Override the live exchange rates used for calculations. Rates represent the value of 1 foreign unit in SGD.</p>';
Object.keys(globalFinanceRates).forEach(c => {
    if(c === 'SGD') return;
    const live = globalFinanceRates[c] || 0;
    const custom = (financeConfig.customRates && financeConfig.customRates[c]) ? financeConfig.customRates[c] : '';
    html += `
    <div class="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 p-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div class="font-black text-xs text-gray-800 dark:text-gray-200 w-16 text-center shrink-0">1 ${c}</div>
        <div class="font-bold text-xs text-gray-400 dark:text-gray-500 px-2 shrink-0">=</div>
        <div class="flex-1 min-w-0 pr-2">
            <input type="number" step="0.0001" placeholder="Live: ${live.toFixed(4)}" value="${custom}" 
                onchange="setCustomRate('${c}', this.value)" 
                class="w-full text-sm font-bold p-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-950 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-gray-900 dark:text-white transition shadow-sm placeholder-gray-400">
        </div>
        <div class="font-black text-xs text-gray-800 dark:text-gray-200 shrink-0">SGD</div>
    </div>`;
});
list.innerHTML = html;
document.getElementById('financeRatesModal').classList.remove('hidden-force');
}

function closeFinanceRatesModal() {
document.getElementById('financeRatesModal').classList.add('hidden-force');
}

function setCustomRate(currency, value) {
if (!financeConfig.customRates) financeConfig.customRates = {};
if (value.trim() === '') delete financeConfig.customRates[currency];
else financeConfig.customRates[currency] = parseFloat(value);
financeOptions.forEach(o => updateTotals(o.id));
renderFinanceOptions();
queueFinanceUpdate();
}

function toggleFinanceCollapse() {
isFinanceCollapsed = !isFinanceCollapsed;
financeOptions.forEach(o => o._isCollapsed = isFinanceCollapsed);
renderFinanceOptions();
}

function toggleIndividualFinanceCollapse(id) {
const opt = financeOptions.find(o => o.id === id);
if (opt) {
    opt._isCollapsed = !opt._isCollapsed;
    renderFinanceOptions();
}
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

function updateFinanceOption(optId, key, value) {
const opt = financeOptions.find(o => o.id === optId);
if (!opt) return;
if (key === 'title') opt.title = value;
else if (key === 'pax') { opt.pax = parseInt(value) || 0; updateTotals(optId); }
else if (key === 'displayCurrency') { opt.displayCurrency = value; updateTotals(optId); }
queueFinanceUpdate(optId);
}

function updateFinanceField(optId, fieldId, key, value) {
const opt = financeOptions.find(o => o.id === optId);
if (!opt) return;
const field = opt.fields.find(f => f.id === fieldId);
if (!field) return;

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
const opt = financeOptions.find(o => o.id === optId);
if (!opt) return;
const pax = getActivePax(opt);
let totalSgd = 0;
opt.fields.forEach(f => {
    const rate = getActualRate(f.currency);
    const rawCost = f.costType === 'per_pax' ? ((parseFloat(f.cost)||0) * pax) : (parseFloat(f.cost)||0);
    totalSgd += (rawCost * (1 + ((parseFloat(f.tax)||0) / 100))) * rate;
});
const dispRate = getActualRate(opt.displayCurrency);
const totalDisp = totalSgd / dispRate;
const cppDisp = pax > 0 ? totalDisp / pax : 0;

const totEl = document.getElementById(`total_${opt.id}`);
const cppEl = document.getElementById(`cpp_${opt.id}`);
if (totEl) totEl.textContent = `${opt.displayCurrency} ${totalDisp.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
if (cppEl) cppEl.textContent = `${opt.displayCurrency} ${cppDisp.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function addFinanceOption(title = "New Option", reRender = true) {
const newOpt = {
    id: generateFinanceUUID(), title: title, pax: 0, displayCurrency: 'SGD', widthSpan: 2, ts: Date.now(), _isCollapsed: false, isDeleted: false, fields: []
};
defaultFinanceFields.forEach(f => {
    newOpt.fields.push({ id: generateFinanceUUID(), name: f, costType: 'total', tax: 0, cost: 0, currency: 'MYR', remarks: '' });
});
financeOptions.unshift(newOpt);
queueFinanceUpdate(newOpt.id);
if (reRender) renderFinanceOptions();
}

function duplicateFinanceOption(id) {
const opt = financeOptions.find(o => o.id === id);
if (!opt) return;
const copy = JSON.parse(JSON.stringify(opt));
copy.id = generateFinanceUUID();
copy.title = opt.title + " (Copy)";
copy.ts = Date.now();
copy._isCollapsed = false;
copy.isDeleted = false;
copy.fields.forEach(f => f.id = generateFinanceUUID()); 
financeOptions.unshift(copy);
queueFinanceUpdate(copy.id);
renderFinanceOptions();
}

function removeFinanceOption(id) {
if (!confirm("Are you sure you want to remove this option?")) return;
const opt = financeOptions.find(o => o.id === id);
if (opt) {
    opt.isDeleted = true;
    opt.ts = Date.now();
    if(financeConfig.finalOptionId === id) financeConfig.finalOptionId = null;
    queueFinanceUpdate(id);
    renderAllFinanceTabs();
}
}

function addFinanceCategory(optId) {
const opt = financeOptions.find(o => o.id === optId);
if(!opt) return;
opt.fields.push({ id: generateFinanceUUID(), name: 'New Category', costType: 'total', tax: 0, cost: 0, currency: 'MYR', remarks: '' });
queueFinanceUpdate(optId);
renderFinanceOptions();
}

function removeFinanceCategory(optId, fieldId) {
const opt = financeOptions.find(o => o.id === optId);
if(!opt) return;
opt.fields = opt.fields.filter(f => f.id !== fieldId);
queueFinanceUpdate(optId);
renderFinanceOptions();
}

function startFinDrag(e) {
if(e.type === 'mousedown' && e.button !== 0) return; 
e.preventDefault(); 
const handle = e.currentTarget;
const row = handle.closest('.fin-cat-row');
const container = row.closest('.fin-cat-container');
const clientY = e.touches ? e.touches[0].clientY : e.clientY;
const clientX = e.touches ? e.touches[0].clientX : e.clientX;
const rect = row.getBoundingClientRect();

finDndState = {
    active: true, row: row, container: container, optId: container.dataset.optId,
    yOffset: clientY - rect.top, xOffset: clientX - rect.left,
    placeholder: document.createElement('div')
};
finDndState.placeholder.className = 'fin-cat-placeholder bg-blue-50/50 dark:bg-blue-900/20 border-2 border-dashed border-primary/50 rounded-lg my-1 transition-all';
finDndState.placeholder.style.height = rect.height + 'px';
row.parentNode.insertBefore(finDndState.placeholder, row);
row.style.position = 'fixed'; row.style.zIndex = '9999'; row.style.width = rect.width + 'px';
row.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'; row.classList.add('opacity-95');
updateFinDragPosition(clientY, clientX);
document.addEventListener('mousemove', moveFinDrag, {passive: false});
document.addEventListener('touchmove', moveFinDrag, {passive: false});
document.addEventListener('mouseup', endFinDrag);
document.addEventListener('touchend', endFinDrag);
}

function moveFinDrag(e) {
if(!finDndState.active) return;
e.preventDefault(); 
const clientY = e.touches ? e.touches[0].clientY : e.clientY;
const clientX = e.touches ? e.touches[0].clientX : e.clientX;
updateFinDragPosition(clientY, clientX);
const siblings = Array.from(finDndState.container.querySelectorAll('.fin-cat-row:not(.fin-cat-placeholder):not([style*="position: fixed"])'));
let nextElement = null;
for(let sib of siblings) {
    const rect = sib.getBoundingClientRect();
    if(clientY < rect.top + rect.height / 2) { nextElement = sib; break; }
}
if(nextElement) finDndState.container.insertBefore(finDndState.placeholder, nextElement);
else finDndState.container.appendChild(finDndState.placeholder);
}

function updateFinDragPosition(y, x) {
finDndState.row.style.top = (y - finDndState.yOffset) + 'px';
finDndState.row.style.left = (x - finDndState.xOffset) + 'px';
}

function endFinDrag(e) {
if(!finDndState.active) return;
finDndState.active = false;
document.removeEventListener('mousemove', moveFinDrag); document.removeEventListener('touchmove', moveFinDrag);
document.removeEventListener('mouseup', endFinDrag); document.removeEventListener('touchend', endFinDrag);
finDndState.placeholder.parentNode.insertBefore(finDndState.row, finDndState.placeholder);
finDndState.placeholder.remove();
finDndState.row.style = ''; finDndState.row.classList.remove('opacity-95');
reorderFieldsInModel(finDndState.optId);
renderFinanceOptions(); 
}

function reorderFieldsInModel(optId) {
const opt = financeOptions.find(o => o.id === optId);
if(!opt) return;
const container = document.querySelector(`.fin-cat-container[data-opt-id="${optId}"]`);
if(!container) return;
const newFields = [];
container.querySelectorAll('.fin-cat-row').forEach(row => {
    const fId = row.dataset.fieldId; const field = opt.fields.find(f => f.id === fId);
    if(field) newFields.push(field);
});
opt.fields = newFields;
queueFinanceUpdate(optId);
}

// ==========================================
// TAB 3: RECEIPTS BROWSER
// ==========================================
function renderReceiptsBrowser() {
const cont = document.getElementById('fin-tab-receipts');
if(!cont || cont.classList.contains('hidden-force')) return;

const activeReceipts = globalReceipts.filter(r => !r.isDeleted).sort((a,b) => b.ts - a.ts);

let optMap = {};
if (financeConfig.finalOptionId) {
    const opt = financeOptions.find(o => o.id === financeConfig.finalOptionId);
    if (opt) opt.fields.forEach(f => optMap[f.id] = f.name);
}

let rowsHtml = '';
if(activeReceipts.length === 0) {
    rowsHtml = '<tr><td colspan="9" class="py-12 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">No receipts uploaded.</td></tr>';
} else {
    activeReceipts.forEach(r => {
        const dateStr = new Date(r.ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const catName = optMap[r.categoryId] || 'Unknown Category';
        
        let uploaderName = r.uploaderNric;
        let payerName = r.paidByNric || r.uploaderNric;
        
        if(globalLogistics && globalLogistics.participants) {
            const up = globalLogistics.participants.find(x => x.nric === r.uploaderNric);
            if(up) uploaderName = up.shortName || up.name;
            else if (r.uploaderName) uploaderName = r.uploaderName;
            
            const pp = globalLogistics.participants.find(x => x.nric === payerName);
           if(pp) payerName = pp.shortName || pp.name;
           else if (r.uploaderName && payerName === r.uploaderNric) payerName = r.uploaderName;
        }

        const isReimClass = r.isReimbursed ? 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-800 shadow-sm' : 'text-gray-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700';

        rowsHtml += `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
            <td class="py-4 px-6 text-sm font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">${dateStr}</td>
            <td class="py-4 px-6 text-sm leading-tight">
               <div class="font-bold text-gray-900 dark:text-gray-100">${uploaderName}</div>
               <div class="font-bold text-blue-600 dark:text-blue-400 text-[10px] uppercase mt-1">Paid: ${payerName}</div>
            </td>
            <td class="py-4 px-6 text-sm font-bold text-gray-800 dark:text-gray-200 max-w-[150px] truncate" title="${catName}">${catName}</td>
            <td class="py-4 px-6 text-sm font-bold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">${r.currency} ${r.amount.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
            <td class="py-4 px-6 text-sm font-black text-gray-900 dark:text-gray-100 text-right whitespace-nowrap">SGD ${r.sgdAmount.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
            <td class="py-4 px-6 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title="${r.remarks}">${r.remarks || '-'}</td>
            <td class="py-4 px-6 text-center">
                <button onclick="toggleReceiptReimbursed('${r.id}', ${!r.isReimbursed})" class="text-[10px] font-bold px-3 py-1.5 rounded-full border transition focus:outline-none uppercase tracking-widest whitespace-nowrap ${isReimClass}">
                    ${r.isReimbursed ? 'Reimbursed' : 'Pending'}
                </button>
            </td>
            <td class="py-4 px-6 text-center">
                ${r.fileUrl ? '<a href="${r.fileUrl}" target="_blank" class="inline-flex items-center justify-center p-2 text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></a>' : '-'}
            </td>
            <td class="py-4 px-6 text-center">
                <button onclick="deleteReceipt('${r.id}')" class="text-gray-400 hover:text-red-500 transition p-2 bg-gray-50 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30 rounded-lg focus:outline-none"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </td>
        </tr>`;
    });
}

cont.innerHTML = `
<div class="max-w-6xl mx-auto flex flex-col gap-6 p-2 md:p-6 pb-20">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Receipts Browser</h2>
            <p class="text-sm text-gray-500 mt-1">Manage and track uploaded receipts and reimbursements.</p>
        </div>
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2.5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <span class="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Receipts</span>
            <span class="text-lg font-black text-blue-600 dark:text-blue-400">${activeReceipts.length}</span>
        </div>
    </div>
    
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
                <thead class="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                    <tr>
                        <th class="py-4 px-6 font-bold">Date</th>
                        <th class="py-4 px-6 font-bold">Personnel</th>
                        <th class="py-4 px-6 font-bold">Category</th>
                        <th class="py-4 px-6 text-right font-bold">Original Amount</th>
                        <th class="py-4 px-6 text-right font-bold">SGD Eqv.</th>
                        <th class="py-4 px-6 font-bold">Remarks</th>
                        <th class="py-4 px-6 text-center font-bold">Status</th>
                        <th class="py-4 px-6 text-center font-bold">Proof</th>
                        <th class="py-4 px-6 text-center font-bold">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800/50">
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    </div>
</div>
`;
}

function toggleReceiptReimbursed(id, status) {
const rec = globalReceipts.find(r => r.id === id);
if(rec) {
    rec.isReimbursed = status;
    queueReceiptUpdate(rec);
    renderReceiptsBrowser();
}
}

function deleteReceipt(id) {
if(!confirm("Are you sure you want to delete this receipt? It will be removed from the Actual Cost summation.")) return;
const rec = globalReceipts.find(r => r.id === id);
if(rec) {
    rec.isDeleted = true;
    queueReceiptUpdate(rec);
    renderReceiptsBrowser();
    renderFinalizedFinances();
}
}

// ==========================================
// TAB 4: TRIP FEES TRACKER
// ==========================================
function handleFeeSearch() {
finSearchQuery = document.getElementById('feeSearchInput').value.toLowerCase().trim();
renderFeeTracker();
}

function renderFeeTracker() {
const cont = document.getElementById('fin-tab-fees');
if(!cont || cont.classList.contains('hidden-force')) return;
if(!globalLogistics || !globalLogistics.participants) return;

const groups = {};
globalLogistics.participants.forEach(p => {
    const targetPoc = p.pocNric || p.nric;
    if(!groups[targetPoc]) groups[targetPoc] = [];
    groups[targetPoc].push(p);
});

const baseFee = financeConfig.perPersonFee || 0;
let totalExpected = 0;
let totalCollected = 0;
let cardsData = [];

Object.keys(groups).forEach(poc => {
    processFeeCard(poc, groups[poc]);
});

function processFeeCard(poc, members) {
    const size = members.length;
    const dev = financeConfig.feeDeviations?.[poc]?.amount || 0;
    const rem = financeConfig.feeDeviations?.[poc]?.remarks || '';
    const isPaid = financeConfig.feesReceived?.[poc] === true;
    
    const finalExpected = (size * baseFee) + dev;
    
    totalExpected += finalExpected;
    if (isPaid) totalCollected += finalExpected;

    let match = true;
    if (finSearchQuery) {
        match = members.some(m => {
            const dName = ((m.shortName || m.name) || '').toLowerCase();
            return dName.includes(finSearchQuery) || (m.nric || '').toLowerCase().includes(finSearchQuery);
        });
    }

    if (match) cardsData.push({ poc, members, size, dev, rem, isPaid, finalExpected });
}

cardsData.sort((a,b) => {
    if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1; 
    return b.size - a.size;
});

let cardsHtml = '';
cardsData.forEach(c => {
    let membersHtml = c.members.map(m => {
        const roleColor = m.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (m.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
        return `<span class="inline-block mr-1.5"><span class="${roleColor} font-black text-[9px] mr-0.5 border border-current px-0.5 rounded">${m.role.substring(0,3)}</span><span class="font-bold text-xs text-gray-800 dark:text-gray-200">${m.shortName || m.name}</span></span>`;
    }).join('');

    const paidClass = c.isPaid ? 'bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    const checkColor = c.isPaid ? 'text-green-600 dark:text-green-400 bg-green-200 dark:bg-green-900' : 'text-transparent bg-gray-100 dark:bg-gray-700';

    cardsHtml += `
    <div class="flex flex-col p-4 rounded-2xl border ${paidClass} shadow-sm transition relative overflow-hidden group">
        <div class="flex justify-between items-start gap-3 mb-4">
            <div class="flex flex-col flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span class="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/50 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700">Size: ${c.size}</span>
                    ${c.isPaid ? `<span class="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-md border border-green-300 dark:border-green-700/50">Paid</span>` : ''}
                </div>
                <div class="leading-tight">${membersHtml}</div>
            </div>
            
            <button onclick="toggleFeeReceived('${c.poc}', ${!c.isPaid})" class="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0 transition shadow-sm hover:scale-105 focus:outline-none bg-white dark:bg-gray-800 ${c.isPaid ? 'border-green-500 ring-2 ring-green-400 ring-offset-2 dark:ring-offset-gray-900' : ''}">
                <div class="w-7 h-7 rounded-full flex items-center justify-center transition-colors ${checkColor}">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                </div>
            </button>
        </div>

        <div class="grid grid-cols-2 gap-3 p-3 bg-gray-50/50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-800">
            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Custom Dev. (SGD)</label>
                <input type="text" value="${Number(c.dev||0).toLocaleString('en-US', {minimumFractionDigits:2})}" oninput="formatMoneyInput(this, false); if(!financeConfig.feeDeviations['${c.poc}']) financeConfig.feeDeviations['${c.poc}'] = {}; financeConfig.feeDeviations['${c.poc}'].amount = parseFloat(this.value.replace(/,/g, ''))||0; queueFinanceUpdate();" onblur="formatMoneyInput(this, true); updateFeeDeviation('${c.poc}', 'amount', this.value)" class="w-full px-3 py-1.5 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-right" ${c.isPaid ? 'disabled opacity-50' : ''}>
            </div>
            <div>
                <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Final Expected</label>
                <div class="w-full px-3 py-1.5 text-sm font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm text-right">
                    ${c.finalExpected.toLocaleString('en-US', {minimumFractionDigits:2})}
                </div>
            </div>
            <div class="col-span-2">
                <input type="text" value="${c.rem}" onchange="updateFeeDeviation('${c.poc}', 'remarks', this.value)" placeholder="Remarks for deviation (e.g. Subsidy applied)" class="w-full px-3 py-2 text-xs font-medium border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" ${c.isPaid ? 'disabled opacity-50' : ''}>
            </div>
        </div>
    </div>`;
});

cont.innerHTML = `
<div class="max-w-6xl mx-auto flex flex-col gap-6 p-2 md:p-6 pb-20">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div class="flex-1 min-w-0 w-full">
            <h2 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight mb-4">Fee Tracker</h2>
            <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-3">
                    <label class="text-[10px] uppercase font-bold text-gray-400 tracking-widest shrink-0">Global Per-Pax Fee:</label>
                    <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">SGD</span>
                        <input type="text" value="${Number(baseFee||0).toLocaleString('en-US', {minimumFractionDigits:2})}" oninput="formatMoneyInput(this, false); financeConfig.perPersonFee = parseFloat(this.value.replace(/,/g, ''))||0; queueFinanceUpdate();" onblur="formatMoneyInput(this, true); updateFinanceConfig('perPersonFee', parseFloat(this.value.replace(/,/g, ''))||0)" class="w-32 text-sm font-black border border-gray-200 dark:border-gray-700 rounded-lg pl-10 pr-3 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-right transition-shadow">
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <label class="text-[10px] uppercase font-bold text-gray-400 tracking-widest shrink-0">PayNow Number:</label>
                    <input type="text" maxlength="16" value="${financeConfig.payNowNumber || ''}" onchange="updateFinanceConfig('payNowNumber', this.value.trim())" class="w-32 text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm text-center transition-shadow">
                    <label class="flex items-center gap-2 cursor-pointer ml-1 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                        <input type="checkbox" ${financeConfig.showPaymentSection ? 'checked' : ''} onchange="updateFinanceConfig('showPaymentSection', this.checked)" class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded">
                        <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-widest">Show in Profile</span>
                    </label>
                </div>
            </div>
        </div>
        
        <div class="flex items-center gap-6 bg-gray-50 dark:bg-gray-800/40 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm w-full lg:w-auto shrink-0">
            <div class="text-right">
                <span class="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Total Collected</span>
                <span class="text-xl font-black text-green-600 dark:text-green-400">SGD ${totalCollected.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
            </div>
            <div class="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>
            <div class="text-right">
                <span class="block text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-1">Expected Total</span>
                <span class="text-xl font-black text-blue-600 dark:text-blue-400">SGD ${totalExpected.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
            </div>
        </div>
    </div>
    
    <div class="relative w-full">
        <input type="text" id="feeSearchInput" oninput="handleFeeSearch()" value="${finSearchQuery}" placeholder="Fuzzy search families by name or NRIC..." class="w-full p-3.5 pl-11 pr-11 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm transition">
        <svg class="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <button onclick="clearSearch('feeSearchInput', 'handleFeeSearch')" class="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        ${cardsHtml || '<div class="col-span-full text-center py-12 text-gray-400 text-sm font-bold uppercase tracking-widest">No families match search.</div>'}
    </div>
</div>
`;
}

function updateFeeDeviation(poc, field, value) {
if (!financeConfig.feeDeviations) financeConfig.feeDeviations = {};
if (!financeConfig.feeDeviations[poc]) financeConfig.feeDeviations[poc] = { amount: 0, remarks: '' };

if (field === 'amount') {
    financeConfig.feeDeviations[poc].amount = parseFloat(String(value).replace(/,/g, '')) || 0;
} else {
    financeConfig.feeDeviations[poc].remarks = value;
}

queueFinanceUpdate();


}

function toggleFeeReceived(poc, status) {
if (!financeConfig.feesReceived) financeConfig.feesReceived = {};
financeConfig.feesReceived[poc] = status;
queueFinanceUpdate();
renderFeeTracker();
}