const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

const regex = /<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">.+?<h3 class="text-sm font-black text-gray-900 dark:text-white tracking-tight border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">My Receipts History<\/h3>/s;

const replace = `<div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
  \${finConfig.showPaymentSection ? \`
  <div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-full">
    <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
        <h3 class="text-sm font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Trip Fees & Payment
        </h3>
    </div>
    \${generatePaymentPortalHtml()}
  </div>
  <div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-full">
    <div class="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
        <h3 class="text-sm font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Upload Fees Paid Confirmation Screenshot
        </h3>
    </div>
    \${generateReceiptFormHtml()}
  </div>
  \` : ''}
</div>

<div class="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm mt-4">
    <h3 class="text-sm font-black text-gray-900 dark:text-white tracking-tight border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">My Receipts History</h3>`;

code = code.replace(regex, replace);
fs.writeFileSync('frontend/js/profile.js', code);