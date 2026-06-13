let financeOptions = [];
const defaultFinanceFields = [
    'Accommodation', 'Transport', 'Day 1 Lunch', 'Day 1 Dinner', 
    'Day 1 Activity', 'Day 2 Breakfast', 'Day 2 Lunch', 'Day 2 Activity', 
    'Logistics', 'First Aid', 'Miscellaneous', 'Recce'
];

async function buildFinanceUI() {
    document.getElementById('tab-finance').innerHTML = `
    <div class="flex flex-col h-full w-full relative">
        <div class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-3 shrink-0 flex justify-between items-center z-10 shadow-sm rounded-t-xl md:rounded-none">
            <div class="flex items-center gap-2">
                <h3 class="text-sm md:text-base font-black text-gray-900 dark:text-white tracking-tight">Finance Options Planner</h3>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="addFinanceOption()" class="bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 text-[10px] md:text-xs font-bold px-2.5 py-1.5 rounded-md hover:bg-blue-100 transition shadow-sm focus:outline-none">
                    + Add Option
                </button>
                <button id="btn-save-finance" onclick="saveFinanceConfig(this)" class="bg-primary text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-md hover:bg-blue-600 transition flex items-center shadow-sm focus:outline-none shrink-0">
                    <span class="btn-text">Save Changes</span>
                    <div class="btn-spinner spinner-white ml-1.5 !w-3 !h-3 hidden-force border-2"></div>
                </button>
            </div>
        </div>

        <div id="financeLoadingOverlay" class="absolute inset-0 top-[50px] bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm z-20 flex flex-col justify-center items-center">
            <div class="loader !w-8 !h-8 border-primary mb-2"></div>
            <span class="text-primary dark:text-blue-400 font-bold text-[10px] tracking-wide shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">Loading Planner...</span>
        </div>

        <div class="flex-grow overflow-x-auto overflow-y-hidden p-3 bg-gray-50 dark:bg-gray-950">
            <div id="financeOptionsContainer" class="flex gap-4 h-full items-start pb-4">
                <!-- Options will be rendered here horizontally -->
            </div>
        </div>
    </div>
    `;

    try {
        const res = await callBackend('fetchFinance');
        financeOptions = res.options && Array.isArray(res.options) ? res.options : [];
        if (financeOptions.length === 0) {
            // Initialize with one default option if empty
            addFinanceOption("Option 1", false);
        }
        renderFinanceOptions();
    } catch (e) {
        showToast("Failed to load finance data.", true);
    } finally {
        const overlay = document.getElementById('financeLoadingOverlay');
        if (overlay) overlay.classList.add('hidden-force');
    }
}

function addFinanceOption(title = "New Option", reRender = true) {
    const newOpt = {
        id: 'opt_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        title: title,
        fields: {}
    };
    
    // Initialize default fields
    defaultFinanceFields.forEach(f => {
        newOpt.fields[f] = { cost: 0, remarks: '' };
    });

    financeOptions.push(newOpt);
    if (reRender) renderFinanceOptions();
}

function removeFinanceOption(id) {
    if (!confirm("Are you sure you want to remove this option?")) return;
    financeOptions = financeOptions.filter(o => o.id !== id);
    renderFinanceOptions();
}

function updateFinanceField(optId, fieldName, key, value) {
    const opt = financeOptions.find(o => o.id === optId);
    if (opt) {
        if (!opt.fields[fieldName]) opt.fields[fieldName] = { cost: 0, remarks: '' };
        if (key === 'cost') {
            opt.fields[fieldName].cost = parseFloat(value) || 0;
            // Update total locally on the DOM to avoid re-rendering entire list and losing focus
            const totalEl = document.getElementById(`total_${optId}`);
            if (totalEl) {
                const total = Object.values(opt.fields).reduce((sum, f) => sum + (parseFloat(f.cost) || 0), 0);
                totalEl.textContent = `$${total.toFixed(2)}`;
            }
        } else if (key === 'remarks') {
            opt.fields[fieldName].remarks = value;
        } else if (key === 'title') {
            opt.title = value;
        }
    }
}

function renderFinanceOptions() {
    const container = document.getElementById('financeOptionsContainer');
    if (!container) return;

    if (financeOptions.length === 0) {
        container.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400 font-bold text-sm">No options created yet. Click '+ Add Option' to start.</div>`;
        return;
    }

    let html = '';
    financeOptions.forEach(opt => {
        const totalCost = Object.values(opt.fields).reduce((sum, f) => sum + (parseFloat(f.cost) || 0), 0);
        
        let rowsHtml = '';
        defaultFinanceFields.forEach(field => {
            const data = opt.fields[field] || { cost: 0, remarks: '' };
            rowsHtml += `
            <div class="grid grid-cols-[1fr_80px_1fr] gap-2 items-center border-b border-gray-100 dark:border-gray-800 py-1.5 last:border-0">
                <span class="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate pr-1" title="${field}">${field}</span>
                <div class="relative">
                    <span class="absolute left-2 top-1.5 text-gray-400 text-[10px]">$</span>
                    <input type="number" min="0" step="0.01" value="${data.cost || 0}" 
                           onchange="updateFinanceField('${opt.id}', '${field}', 'cost', this.value)"
                           onkeyup="updateFinanceField('${opt.id}', '${field}', 'cost', this.value)"
                           class="w-full pl-5 pr-1 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-primary">
                </div>
                <input type="text" placeholder="Remarks..." value="${data.remarks || ''}" 
                       onchange="updateFinanceField('${opt.id}', '${field}', 'remarks', this.value)"
                       class="w-full px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-[10px] font-medium text-gray-900 dark:text-white focus:outline-none focus:border-primary placeholder-gray-400">
            </div>`;
        });

        html += `
        <div class="w-80 shrink-0 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden max-h-full">
            <div class="p-3 bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
                <input type="text" value="${opt.title}" 
                       onchange="updateFinanceField('${opt.id}', '', 'title', this.value)"
                       class="font-black text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white w-2/3 focus:ring-2 focus:ring-primary/50 rounded px-1">
                <button onclick="removeFinanceOption('${opt.id}')" class="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded text-[10px] font-bold transition">Remove</button>
            </div>
            
            <div class="p-3 overflow-y-auto custom-scrollbar flex-grow space-y-1">
                <div class="grid grid-cols-[1fr_80px_1fr] gap-2 mb-1 border-b border-gray-200 dark:border-gray-700 pb-1">
                    <span class="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Category</span>
                    <span class="text-[9px] uppercase font-bold text-gray-400 tracking-wider pl-1">Est. Cost</span>
                    <span class="text-[9px] uppercase font-bold text-gray-400 tracking-wider pl-1">Remarks</span>
                </div>
                ${rowsHtml}
            </div>
            
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-100 dark:border-blue-900/50 shrink-0 flex justify-between items-center">
                <span class="font-black text-xs text-blue-800 dark:text-blue-300 uppercase tracking-widest">Total Estimated</span>
                <span id="total_${opt.id}" class="font-black text-sm text-blue-700 dark:text-blue-400 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 shadow-sm">$${totalCost.toFixed(2)}</span>
            </div>
        </div>
        `;
    });

    container.innerHTML = html;
}

async function saveFinanceConfig(btn) {
    setBtnLoading(btn, true);
    try {
        await callBackend('saveFinance', { options: financeOptions });
        showToast("Finance options saved successfully!");
    } catch(e) {
        showToast("Failed to save finance configurations.", true);
    } finally {
        setBtnLoading(btn, false);
    }
}