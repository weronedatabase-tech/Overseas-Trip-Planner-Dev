let financeOptions = [];
let globalFinanceRates = { "SGD": 1, "MYR": 0.28 };
let financeConfig = {
    globalPaxMode: 'individual', // 'individual', 'manual', 'auto'
    globalPaxCount: 0
};
let isFinanceCollapsed = false;

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

function toggleFinanceCollapse() {
    isFinanceCollapsed = !isFinanceCollapsed;
    renderFinanceGlobalSettings();
    renderFinanceOptions();
}

async function buildFinanceUI() {
    document.getElementById('tab-finance').innerHTML = `
    <div class="flex flex-col h-full w-full relative">
        <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-2 md:p-3 shrink-0 flex justify-between items-center z-10 shadow-sm rounded-t-xl md:rounded-none">
            <div class="flex items-center gap-2">
                <h3 class="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight">Finance Options Planner</h3>
            </div>
            <div class="flex items-center gap-1.5 md:gap-2">
                <button onclick="addFinanceOption()" class="bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-[10px] md:text-xs font-bold px-2 py-1.5 rounded-md hover:bg-blue-100 transition shadow-sm focus:outline-none shrink-0">
                    + Add Option
                </button>
                <button id="btn-save-finance" onclick="saveFinanceConfig(this)" class="bg-primary text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-md hover:bg-blue-600 transition flex items-center shadow-sm focus:outline-none shrink-0">
                    <span class="btn-text">Save</span>
                    <div class="btn-spinner spinner-white ml-1.5 !w-3 !h-3 hidden-force border-2"></div>
                </button>
            </div>
        </div>

        <div id="financeGlobalSettings" class="bg-white dark:bg-gray-800 p-2 md:p-3 shrink-0 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-2 z-10 shadow-[0_4px_10px_-5px_rgba(0,0,0,0.05)]">
            <!-- Global Pax controls injected here -->
        </div>

        <div id="financeLoadingOverlay" class="absolute inset-0 top-[90px] bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-20 flex flex-col justify-center items-center">
            <div class="loader !w-8 !h-8 border-primary mb-2"></div>
            <span class="text-primary dark:text-blue-400 font-bold text-[10px] tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">Loading Planner...</span>
        </div>

        <div class="flex-grow overflow-y-auto overflow-x-hidden p-2 md:p-4 bg-gray-50 dark:bg-gray-950 custom-scrollbar pb-10">
            <div id="financeOptionsContainer" class="flex flex-col gap-3 md:gap-4 w-full items-center pb-4 max-w-2xl mx-auto">
                <!-- Options will be rendered here vertically -->
            </div>
        </div>
    </div>
    `;

    try {
        const res = await callBackend('fetchFinance');
        globalFinanceRates = res.rates || { "SGD": 1, "MYR": 0.28 };
        
        const rawOptions = res.data?.options || (Array.isArray(res.data) ? res.data : []);
        financeConfig = res.data?.config || { globalPaxMode: 'individual', globalPaxCount: 0 };
        
        financeOptions = rawOptions.map(opt => {
            if (opt.fields && !Array.isArray(opt.fields)) {
                const newFields = [];
                for (let [k, v] of Object.entries(opt.fields)) {
                    newFields.push({
                        id: generateFinanceUUID(),
                        name: k,
                        cost: parseFloat(v.cost) || 0,
                        currency: v.currency || 'MYR',
                        remarks: v.remarks || ''
                    });
                }
                opt.fields = newFields;
            }
            if(!opt.displayCurrency) opt.displayCurrency = 'SGD';
            if(!opt.pax) opt.pax = 0;
            return opt;
        });

        if (financeOptions.length === 0) {
            addFinanceOption("Option 1", false);
        }
        
        renderFinanceGlobalSettings();
        renderFinanceOptions();
    } catch (e) {
        showToast("Failed to load finance data.", true);
    } finally {
        const overlay = document.getElementById('financeLoadingOverlay');
        if (overlay) overlay.classList.add('hidden-force');
    }
}

function renderFinanceGlobalSettings() {
    const container = document.getElementById('financeGlobalSettings');
    if (!container) return;

    const autoPax = globalLogistics?.participants?.length || 0;

    container.innerHTML = `
        <div class="flex flex-wrap md:flex-nowrap justify-between items-center gap-2 w-full">
            <div class="flex flex-wrap items-center gap-2 flex-1">
                <div class="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded px-2 py-1">
                    <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shrink-0">Pax Mode:</label>
                    <select onchange="updateFinanceConfig('globalPaxMode', this.value)" class="text-xs font-bold bg-transparent text-gray-900 dark:text-white focus:outline-none cursor-pointer">
                        <option value="individual" ${financeConfig.globalPaxMode === 'individual' ? 'selected' : ''}>Individual Option</option>
                        <option value="manual" ${financeConfig.globalPaxMode === 'manual' ? 'selected' : ''}>Global Override</option>
                        <option value="auto" ${financeConfig.globalPaxMode === 'auto' ? 'selected' : ''}>Global Auto (Database)</option>
                    </select>
                </div>
                
                <div class="flex items-center gap-1.5 ${financeConfig.globalPaxMode !== 'manual' ? 'hidden-force' : ''}">
                    <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shrink-0">Global Pax:</label>
                    <input type="number" min="0" value="${financeConfig.globalPaxCount}" onchange="updateFinanceConfig('globalPaxCount', this.value)" onkeyup="updateFinanceConfig('globalPaxCount', this.value)" class="w-16 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded px-1.5 py-1 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm text-center">
                </div>
                
                <div class="flex items-center gap-1.5 ${financeConfig.globalPaxMode !== 'auto' ? 'hidden-force' : ''}">
                    <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shrink-0">Active Pax:</label>
                    <span class="text-xs font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 shadow-sm">${autoPax}</span>
                </div>
            </div>
            
            <button onclick="toggleFinanceCollapse()" class="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 px-2.5 py-1.5 rounded shadow-sm whitespace-nowrap shrink-0 transition focus:outline-none">
                ${isFinanceCollapsed ? 'Expand All Options' : 'Collapse All Options'}
            </button>
        </div>
    `;
}

function updateFinanceConfig(key, value) {
    if (key === 'globalPaxMode') {
        financeConfig[key] = value;
        renderFinanceGlobalSettings();
        renderFinanceOptions();
    } else if (key === 'globalPaxCount') {
        financeConfig[key] = parseInt(value) || 0;
        financeOptions.forEach(o => updateTotals(o.id));
        renderFinanceOptions();
    }
}

function updateFinanceOption(optId, key, value) {
    const opt = financeOptions.find(o => o.id === optId);
    if (!opt) return;
    
    if (key === 'title') {
        opt.title = value;
    } else if (key === 'pax') {
        opt.pax = parseInt(value) || 0;
        updateTotals(optId);
    } else if (key === 'displayCurrency') {
        opt.displayCurrency = value;
        updateTotals(optId);
    }
}

function updateFinanceField(optId, fieldId, key, value) {
    const opt = financeOptions.find(o => o.id === optId);
    if (!opt) return;
    const field = opt.fields.find(f => f.id === fieldId);
    if (!field) return;
    
    if (key === 'cost') {
        field.cost = parseFloat(value) || 0;
        updateTotals(optId);
    } else if (key === 'currency') {
        field.currency = value;
        updateTotals(optId);
    } else if (key === 'name') {
        field.name = value;
    } else if (key === 'remarks') {
        field.remarks = value;
    }
}

function updateTotals(optId) {
    const opt = financeOptions.find(o => o.id === optId);
    if (!opt) return;
    
    const pax = getActivePax(opt);
    let totalSgd = 0;
    
    opt.fields.forEach(f => {
        const rate = globalFinanceRates[f.currency] || 1;
        totalSgd += (parseFloat(f.cost) || 0) * rate;
    });
    
    const dispRate = globalFinanceRates[opt.displayCurrency] || 1;
    const totalDisp = totalSgd / dispRate;
    const cppDisp = pax > 0 ? totalDisp / pax : 0;
    
    const totEl = document.getElementById(`total_${opt.id}`);
    const cppEl = document.getElementById(`cpp_${opt.id}`);
    
    if (totEl) totEl.textContent = `${opt.displayCurrency} ${totalDisp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    if (cppEl) cppEl.textContent = `${opt.displayCurrency} ${cppDisp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function addFinanceOption(title = "New Option", reRender = true) {
    const newOpt = {
        id: generateFinanceUUID(),
        title: title,
        pax: 0,
        displayCurrency: 'SGD',
        fields: []
    };
    
    defaultFinanceFields.forEach(f => {
        newOpt.fields.push({
            id: generateFinanceUUID(),
            name: f,
            cost: 0,
            currency: 'MYR',
            remarks: ''
        });
    });

    financeOptions.unshift(newOpt);
    if(isFinanceCollapsed) toggleFinanceCollapse(); // auto expand when adding
    if (reRender) renderFinanceOptions();
}

function duplicateFinanceOption(id) {
    const opt = financeOptions.find(o => o.id === id);
    if (!opt) return;
    
    const copy = JSON.parse(JSON.stringify(opt));
    copy.id = generateFinanceUUID();
    copy.title = opt.title + " (Copy)";
    copy.fields.forEach(f => f.id = generateFinanceUUID()); // Assign new unique IDs for fields
    
    financeOptions.unshift(copy);
    if (isFinanceCollapsed) toggleFinanceCollapse();
    renderFinanceOptions();
}

function removeFinanceOption(id) {
    if (!confirm("Are you sure you want to remove this option?")) return;
    financeOptions = financeOptions.filter(o => o.id !== id);
    renderFinanceOptions();
}

function addFinanceCategory(optId) {
    const opt = financeOptions.find(o => o.id === optId);
    if(!opt) return;
    
    opt.fields.push({
        id: generateFinanceUUID(),
        name: 'New Category',
        cost: 0,
        currency: 'MYR',
        remarks: ''
    });
    renderFinanceOptions();
}

function removeFinanceCategory(optId, fieldId) {
    const opt = financeOptions.find(o => o.id === optId);
    if(!opt) return;
    
    opt.fields = opt.fields.filter(f => f.id !== fieldId);
    renderFinanceOptions();
}

function renderFinanceOptions() {
    const container = document.getElementById('financeOptionsContainer');
    if (!container) return;

    if (financeOptions.length === 0) {
        container.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 pt-10"><svg class="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="font-bold text-sm">No options created yet. Click '+ Add Option' to start planning.</p></div>`;
        return;
    }

    let html = '';
    financeOptions.forEach(opt => {
        const pax = getActivePax(opt);
        let totalSgd = 0;
        
        opt.fields.forEach(f => {
            const rate = globalFinanceRates[f.currency] || 1;
            totalSgd += (parseFloat(f.cost) || 0) * rate;
        });
        
        const dispRate = globalFinanceRates[opt.displayCurrency] || 1;
        const totalDisp = totalSgd / dispRate;
        const cppDisp = pax > 0 ? totalDisp / pax : 0;
        
        const paxInputDisabled = financeConfig.globalPaxMode !== 'individual';

        html += `
        <div class="w-full shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
            <!-- Header -->
            <div class="p-2 md:p-3 bg-gray-50/80 dark:bg-gray-900/50 flex justify-between items-center gap-2 shrink-0 ${isFinanceCollapsed ? '' : 'border-b border-gray-200 dark:border-gray-700'}">
                <input type="text" value="${opt.title}" 
                       onchange="updateFinanceOption('${opt.id}', 'title', this.value)"
                       class="font-black text-base md:text-lg bg-transparent border-b border-transparent focus:border-primary outline-none text-gray-900 dark:text-white flex-1 min-w-0 px-1 transition pb-0.5">
                <div class="flex gap-1.5 shrink-0">
                    <button onclick="duplicateFinanceOption('${opt.id}')" class="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 p-1.5 md:px-2 md:py-1.5 rounded transition" title="Duplicate Option">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </button>
                    <button onclick="removeFinanceOption('${opt.id}')" class="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 p-1.5 md:px-2 md:py-1.5 rounded transition" title="Delete Option">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
            
            <!-- Collapsible Body (Pax & Categories) -->
            <div class="${isFinanceCollapsed ? 'hidden-force' : 'flex flex-col'}">
                <div class="px-2 md:px-3 py-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <label class="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Pax Count ${paxInputDisabled ? '(Global)' : ''}</label>
                    <input type="number" min="0" value="${pax}" 
                        ${paxInputDisabled ? 'disabled' : ''} 
                        onchange="updateFinanceOption('${opt.id}', 'pax', this.value)" 
                        onkeyup="updateFinanceOption('${opt.id}', 'pax', this.value)"
                        class="w-20 text-xs font-bold px-2 py-1 bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-600 rounded text-center focus:outline-none focus:ring-1 focus:ring-primary ${paxInputDisabled ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-500' : ''}">
                </div>
                
                <div class="p-2 bg-white dark:bg-gray-800 flex flex-col gap-1.5 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    ${opt.fields.map(f => {
                        return `
                        <div class="flex flex-col w-full bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-lg border border-transparent focus-within:border-gray-200 dark:focus-within:border-gray-700 transition">
                            <div class="flex items-center gap-1.5 w-full">
                                <button onclick="removeFinanceCategory('${opt.id}', '${f.id}')" class="text-red-400 hover:text-red-600 p-1 shrink-0 transition" title="Delete Category">
                                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                                <input type="text" value="${f.name}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'name', this.value)" class="flex-1 min-w-[80px] bg-transparent text-xs font-bold text-gray-800 dark:text-gray-100 outline-none px-0.5 border-b border-transparent focus:border-primary transition" placeholder="Category Name">
                                <select onchange="updateFinanceField('${opt.id}', '${f.id}', 'currency', this.value)" class="w-[65px] shrink-0 bg-white dark:bg-gray-950 text-[11px] font-bold border border-gray-300 dark:border-gray-600 rounded py-1 pl-1 pr-0 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm cursor-pointer">
                                    ${getCurrencyOptions(f.currency)}
                                </select>
                                <input type="number" step="0.01" min="0" value="${f.cost}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'cost', this.value)" onkeyup="updateFinanceField('${opt.id}', '${f.id}', 'cost', this.value)" class="w-[75px] shrink-0 bg-white dark:bg-gray-950 text-xs font-bold border border-gray-300 dark:border-gray-600 rounded p-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm" placeholder="0.00">
                            </div>
                            <div class="flex w-full pl-7 mt-0.5">
                                <input type="text" value="${f.remarks}" onchange="updateFinanceField('${opt.id}', '${f.id}', 'remarks', this.value)" class="flex-1 w-full min-w-0 bg-transparent text-[11px] font-medium text-gray-500 dark:text-gray-400 outline-none px-0.5 border-b border-transparent focus:border-primary transition" placeholder="Remarks...">
                            </div>
                        </div>
                        `;
                    }).join('')}
                    <div class="pt-1 px-1">
                        <button onclick="addFinanceCategory('${opt.id}')" class="w-full py-1.5 border border-dashed border-blue-300 dark:border-blue-800 rounded-lg text-blue-600 dark:text-blue-400 text-[11px] font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">+ Add Custom Category</button>
                    </div>
                </div>
            </div>
            
            <!-- Totals Section -->
            <div class="p-2 md:p-3 bg-blue-50/80 dark:bg-blue-900/20 shrink-0 flex flex-col gap-1.5 ${isFinanceCollapsed ? 'border-t border-gray-200 dark:border-gray-700' : 'border-t border-blue-100 dark:border-blue-900/50'}">
                <div class="${isFinanceCollapsed ? 'hidden-force' : 'flex'} justify-between items-center pb-2 border-b border-blue-200/50 dark:border-blue-800/50 mb-1">
                    <span class="font-bold text-[10px] md:text-[11px] text-blue-800 dark:text-blue-300 uppercase tracking-widest">Currency for Totals</span>
                    <select onchange="updateFinanceOption('${opt.id}', 'displayCurrency', this.value)" 
                        class="w-[90px] text-xs font-bold px-2 py-1 bg-white dark:bg-gray-950 border border-blue-300 dark:border-blue-700 rounded focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer shadow-sm text-blue-900 dark:text-blue-100">
                        ${getCurrencyOptions(opt.displayCurrency)}
                    </select>
                </div>
                
                <div class="flex justify-between items-center">
                    <span class="font-black text-xs md:text-sm text-blue-800 dark:text-blue-300 uppercase tracking-widest">Total Estimated</span>
                    <span id="total_${opt.id}" class="font-black text-base md:text-lg text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 shadow-sm leading-none">${opt.displayCurrency} ${totalDisp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="font-black text-xs md:text-sm text-emerald-800 dark:text-emerald-400 uppercase tracking-widest">Cost Per Pax</span>
                    <span id="cpp_${opt.id}" class="font-black text-base md:text-lg text-emerald-700 dark:text-emerald-400 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-800 shadow-sm leading-none">${opt.displayCurrency} ${cppDisp.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

async function saveFinanceConfig(btn) {
    setBtnLoading(btn, true);
    try {
        const payload = {
            options: financeOptions,
            config: financeConfig
        };
        await callBackend('saveFinance', { payload: payload });
        showToast("Finance options saved successfully!");
    } catch(e) {
        showToast("Failed to save finance configurations.", true);
    } finally {
        setBtnLoading(btn, false);
    }
}