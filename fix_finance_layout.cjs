const fs = require('fs');
let content = fs.readFileSync('./frontend/js/finance.js', 'utf8');

const regex = /cont\.innerHTML = `<div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-3 mb-4 flex flex-col gap-3">.*?<\/div>\n<\/div>`;/s;

let match = content.match(regex);
if (match) {
    const newBlock = `cont.innerHTML = \`<div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-2 mb-3 flex flex-col gap-2">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div class="flex flex-wrap items-center gap-2 md:gap-3">
            <div class="flex items-center gap-1.5">
                <label class="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Per-Pax (SGD):</label>
                <input type="number" step="0.01" value="\${baseFee}" oninput="formatMoneyInput(this, false); financeConfig.perPersonFee = parseFloat(this.value.replace(/,/g, ''))||0; queueFinanceUpdate();" onblur="formatMoneyInput(this, true); updateFinanceConfig('perPersonFee', parseFloat(this.value.replace(/,/g, ''))||0)" class="w-16 text-xs font-black border border-gray-300 dark:border-gray-600 rounded px-1.5 py-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm text-right">
            </div>
            <div class="flex items-center gap-1.5">
                <label class="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">PayNow:</label>
                <input type="text" maxlength="8" value="\${financeConfig.payNowNumber || ''}" onchange="updateFinanceConfig('payNowNumber', this.value.trim())" class="w-20 text-xs font-black border border-gray-300 dark:border-gray-600 rounded px-1.5 py-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm text-center">
            </div>
            <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" \${financeConfig.showPaymentSection ? 'checked' : ''} onchange="updateFinanceConfig('showPaymentSection', this.checked)" class="w-3.5 h-3.5 text-primary focus:ring-primary border-gray-300 rounded">
                <span class="text-[9px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Show Payment</span>
            </label>
        </div>
        
        <div class="flex items-center gap-3 bg-gray-50 dark:bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 w-full md:w-auto justify-between md:justify-start">
            <div class="text-left">
                <span class="block text-[8px] uppercase font-bold text-gray-400 tracking-widest leading-none mb-0.5">Collected</span>
                <span class="text-xs font-black text-green-600 dark:text-green-400 leading-none">SGD \${totalCollected.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
            </div>
            <div class="w-px h-5 bg-gray-300 dark:bg-gray-700 hidden md:block"></div>
            <div class="text-right md:text-left">
                <span class="block text-[8px] uppercase font-bold text-gray-400 tracking-widest leading-none mb-0.5">Expected Total</span>
                <span class="text-xs font-black text-blue-700 dark:text-blue-400 leading-none">SGD \${totalExpected.toLocaleString('en-US', {minimumFractionDigits:2})}</span>
            </div>
        </div>
    </div>
    
    <div class="relative">
        <input type="text" id="feeSearchInput" oninput="handleFeeSearch()" value="\${finSearchQuery}" placeholder="Fuzzy search families..." class="w-full py-1.5 pl-7 pr-7 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm transition">
        <svg class="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <button onclick="clearSearch('feeSearchInput', 'handleFeeSearch')" class="absolute right-1.5 top-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
    </div>
</div>\`;`;
    
    let newContent = content.replace(match[0], newBlock);
    fs.writeFileSync('./frontend/js/finance.js', newContent);
    console.log('Successfully compressed layout!');
} else {
    console.log('Regex did not match.');
}
