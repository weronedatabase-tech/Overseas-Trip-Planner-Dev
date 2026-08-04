const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

const generatePaymentRegex = /function generatePaymentPortalHtml\(\) \{.+?return \`<div class="flex flex-col gap-3">/s;

const newPaymentHtml = `function generatePaymentPortalHtml() {
if (!finConfig.showPaymentSection) return '';
const targetMembers = loadedFamily;
const hasCaregiver = targetMembers.some(m => m.role === 'CAREGIVER');
let targetNric = loadedFamily[0].pocNric || loadedFamily[0].nric;
if (!hasCaregiver) targetNric = loadedFamily[0].nric;

const baseFee = finConfig.perPersonFee || 0;
const size = targetMembers.length;
const dev = finConfig.feeDeviations?.[targetNric]?.amount || 0;
const finalExpected = (size * baseFee) + dev;
const isPaid = finConfig.feesReceived?.[targetNric] === true;

let membersListHtml = targetMembers.map(m => {
    const roleColor = m.role === 'TRAINEE' ? 'text-blue-600 dark:text-blue-400' : (m.role === 'CAREGIVER' ? 'text-purple-600 dark:text-purple-400' : 'text-green-600 dark:text-green-400');
    return \`<span class="inline-block mr-1.5"><span class="\${roleColor} font-black text-[9px] mr-0.5 border border-current px-0.5 rounded">\${m.role.substring(0,3)}</span><span class="font-bold text-xs text-gray-800 dark:text-gray-200">\${m.shortName || m.fullName}</span></span>\`;
}).join('');

if (finalExpected <= 0) {
    return \`<div class="flex flex-col items-center justify-center py-6 text-gray-400 dark:text-gray-500"><svg class="w-12 h-12 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><p class="text-xs font-bold uppercase tracking-widest">No pending fees.</p></div>\`;
}

if (isPaid) {
    return \`
    <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl flex flex-col items-center justify-center flex-1">
        <div class="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mb-3 shadow-md">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h4 class="text-lg font-black text-green-800 dark:text-green-400 uppercase tracking-widest mb-1">Payment Received</h4>
        <p class="text-xs font-bold text-green-600 dark:text-green-500">Thank you for your payment of SGD \${finalExpected.toLocaleString('en-US', {minimumFractionDigits:2})}</p>
    </div>
    \`;
}

const orderNo = targetNric.substring(0, 4) + "-" + Date.now().toString().slice(-4);
const payNowNum = finConfig.payNowNumber ? "+65" + finConfig.payNowNumber : "";
const qrStr = payNowNum ? generatePayNowStr('0', payNowNum, finalExpected, orderNo) : ""; 
const qrUrl = qrStr ? \`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=\${encodeURIComponent(qrStr)}\` : "";

return \`<div class="flex flex-col gap-3">`;

code = code.replace(generatePaymentRegex, newPaymentHtml);

const paymentTabRegex = /Trip Fees \& Payment\s*<\/h3>\s*<\/div>\s*\$\{generatePaymentPortalHtml\(\)\}\s*<\/div>\s*<div class="bg-white dark:bg-gray-900/s;
const newPaymentTabHtml = `Trip Fees & Payment
        </h3>
    </div>
    \${generatePaymentPortalHtml()}
  </div>
  \${finConfig.showPaymentSection ? \`
  <div class="bg-white dark:bg-gray-900`;

code = code.replace(paymentTabRegex, newPaymentTabHtml);

const endDivRegex = /<\/div>\s*<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mt-4">/s;
const newEndDivHtml = `</div>
  \` : ''}
</div>

<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mt-4">`;

code = code.replace(endDivRegex, newEndDivHtml);

fs.writeFileSync('frontend/js/profile.js', code);