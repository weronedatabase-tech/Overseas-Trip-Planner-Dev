const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const oldIndexHtml = `<div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (SGD)</label>
                <input type="number" step="0.01" id="landingRecAmount" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-right" placeholder="0.00">
            </div>`;

const newIndexHtml = `<div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency</label>
                    <select id="landingRecCurrency" onchange="landingCurChange()" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20">
                       <option value="SGD" selected>SGD</option>
                       <option value="MYR">MYR</option>
                       <option value="USD">USD</option>
                       <option value="EUR">EUR</option>
                       <option value="GBP">GBP</option>
                       <option value="AUD">AUD</option>
                       <option value="IDR">IDR</option>
                       <option value="THB">THB</option>
                       <option value="JPY">JPY</option>
                       <option value="KRW">KRW</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</label>
                    <input type="number" step="0.01" id="landingRecAmount" oninput="landingCalcSgd()" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-right" placeholder="0.00">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ex. Rate</label>
                    <input type="number" step="0.0001" id="landingRecRate" oninput="landingCalcSgd()" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-right" value="1">
                </div>
                <div>
                    <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">SGD Equiv</label>
                    <input type="number" step="0.01" id="landingRecSgd" readonly class="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-right" placeholder="0.00">
                </div>
            </div>`;

html = html.replace(oldIndexHtml, newIndexHtml);
fs.writeFileSync('index.html', html);

let auth = fs.readFileSync('frontend/js/auth.js', 'utf8');

const authCurFuncs = `
function landingCurChange() {
    let cur = document.getElementById('landingRecCurrency').value;
    let rate = 1;
    if (cur === 'MYR') rate = 0.28;
    // can add more default rates here if needed
    document.getElementById('landingRecRate').value = rate;
    landingCalcSgd();
}

function landingCalcSgd() {
    let amt = parseFloat(document.getElementById('landingRecAmount').value) || 0;
    let rate = parseFloat(document.getElementById('landingRecRate').value) || 1;
    document.getElementById('landingRecSgd').value = (amt * rate).toFixed(2);
}
`;

auth = auth + authCurFuncs;

const oldAuthPayload = `        const payload = {
            uploaderNric: nric,
            currency: 'SGD',
            amount: amount,
            rate: 1,
            sgdAmount: amount,`;

const newAuthPayload = `        const payload = {
            uploaderNric: nric,
            currency: document.getElementById('landingRecCurrency').value,
            amount: amount,
            rate: parseFloat(document.getElementById('landingRecRate').value) || 1,
            sgdAmount: parseFloat(document.getElementById('landingRecSgd').value) || amount,`;

auth = auth.replace(oldAuthPayload, newAuthPayload);

fs.writeFileSync('frontend/js/auth.js', auth);