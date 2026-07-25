const fs = require('fs');
let code = fs.readFileSync('frontend/js/finance.js', 'utf8');

const regex = /<label class="text-\[10px\] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shrink-0">Global Per-Pax Fee \(SGD\):<\/label>.+?<\/div>/s;
const replacement = `<div class="flex flex-col gap-2 w-full md:w-auto">
                <div class="flex items-center gap-2">
                    <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shrink-0">Global Per-Pax Fee (SGD):</label>
                    <input type="number" step="0.01" value="\${baseFee}" oninput="formatMoneyInput(this, false); updateFinanceConfig('perPersonFee', parseFloat(this.value.replace(/,/g, ''))||0)" onblur="formatMoneyInput(this, true); updateFinanceConfig('perPersonFee', parseFloat(this.value.replace(/,/g, ''))||0)" class="w-24 text-sm font-black border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm text-right">
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider shrink-0">PayNow Number:</label>
                    <input type="text" maxlength="8" value="\${financeConfig.payNowNumber || ''}" onchange="updateFinanceConfig('payNowNumber', this.value.trim())" class="w-24 text-sm font-black border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-sm text-center">
                    <label class="flex items-center gap-2 cursor-pointer ml-2">
                        <input type="checkbox" \${financeConfig.showPaymentSection ? 'checked' : ''} onchange="updateFinanceConfig('showPaymentSection', this.checked)" class="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded">
                        <span class="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider">Show Payment Section</span>
                    </label>
                </div>
            </div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('frontend/js/finance.js', code);
