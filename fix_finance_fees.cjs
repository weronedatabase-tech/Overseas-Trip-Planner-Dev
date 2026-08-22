const fs = require('fs');
let content = fs.readFileSync('./frontend/js/finance.js', 'utf8');

const replacement = `
cont.innerHTML = \`
<div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 mb-4 flex flex-col gap-3">
    <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center gap-2">
            <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shrink-0">Global Per-Pax Fee (SGD):</label>
            <input type="number" step="0.01" value="\${baseFee}" oninput="formatMoneyInput(this, false); financeConfig.perPersonFee = parseFloat(this.value.replace(/,/g, ''))||0; queueFinanceUpdate();" onblur="formatMoneyInput(this, true); updateFinanceConfig('perPersonFee', parseFloat(this.value.replace(/,/g, ''))||0)" class="w-24 text-sm font-black border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm text-right">
        </div>
        <div class="flex flex-wrap items-center gap-2">
            <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shrink-0">PayNow Number:</label>
            <input type="text" maxlength="8" value="\${financeConfig.payNowNumber || ''}" onchange="updateFinanceConfig('payNowNumber', this.value.trim())" class="w-24 text-sm font-black border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm text-center">
            <label class="flex items-center gap-2 cursor-pointer ml-2">
                <input type="checkbox" \${financeConfig.showPaymentSection ? 'checked' : ''} onchange="updateFinanceConfig('showPaymentSection', this.checked)" class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded">
                <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Show Payment Section</span>
            </label>
        </div>
    </div>
    
    <div class="flex items-center gap-4 bg-gray-50 dark:bg-gray-950 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 mt-1 justify-between sm:justify-start">
        <div class="text-left flex-1 sm:flex-none">
            <span class="block text-[9px] uppercase font-bold text-gray-400 tracking-widest">Collected</span>
            <span class="text-sm md:text-base font-black text-green-600 dark:text-green-400">SGD \${totalCollected.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
        </div>
        <div class="w-px h-8 bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>
        <div class="text-right flex-1 sm:flex-none sm:text-left">
            <span class="block text-[9px] uppercase font-bold text-gray-400 tracking-widest">Expected Total</span>
            <span class="text-sm md:text-base font-black text-blue-700 dark:text-blue-400">SGD \${totalExpected.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
        </div>
    </div>
    
    <div class="relative mt-1">
        <input type="text" id="feeSearchInput" oninput="handleFeeSearch()" value="\${finSearchQuery}" placeholder="Fuzzy search families..." class="w-full p-2 pl-8 pr-8 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition">
        <svg class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <button onclick="clearSearch('feeSearchInput', 'handleFeeSearch')" class="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
    </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
    \${cardsHtml || '<div class="col-span-full text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-widest">No families match search.</div>'}
</div>
\`;
`;

const targetStart = 'cont.innerHTML = `\n<div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 mb-4">';
const targetEnd = `</div>\n\`;`;

let startIndex = content.indexOf(targetStart);
if (startIndex !== -1) {
    let sub = content.substring(startIndex);
    let endIndex = sub.indexOf(targetEnd) + targetEnd.length;
    let oldContent = sub.substring(0, endIndex);
    
    // Add some validation to make sure we're not replacing too much
    if (oldContent.includes('function updateFeeDeviation')) {
        console.log('Error: Found function updateFeeDeviation inside the block to replace.');
    } else {
        content = content.replace(oldContent, replacement.trim());
        fs.writeFileSync('./frontend/js/finance.js', content);
        console.log('Successfully updated finance.js');
    }
} else {
    console.log('Could not find target content in finance.js');
}

