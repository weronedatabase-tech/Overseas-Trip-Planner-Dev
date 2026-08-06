const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

const oldFuncRegex = /function generateReceiptFormHtml\(\) \{[\s\S]*?<\/form>\n`;\n\}/;
const newFunc = `function generateReceiptFormHtml() {
return \`<form id="uploadReceiptForm" onsubmit="submitReceipt(event)" class="flex flex-col gap-4 flex-1">
   <div id="recError" class="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-lg text-[10px] mb-2 font-bold hidden-force"></div>
   <div id="recSuccess" class="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 p-2 rounded-lg text-[10px] mb-2 font-bold hidden-force"></div>
   
   <div class="grid grid-cols-2 gap-3">
       <div>
           <label class="block text-[10px] font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Currency</label>
           <select id="recCurrency" onchange="onReceiptCurChange()" required class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary shadow-sm">
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
           <label class="block text-[10px] font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</label>
           <input type="number" step="0.01" id="recAmount" oninput="calcReceiptSgd()" required class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary shadow-sm" placeholder="0.00">
       </div>
   </div>
   
   <div class="grid grid-cols-2 gap-3">
       <div>
           <label class="block text-[10px] font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exchange Rate</label>
           <input type="number" step="0.0001" id="recRate" oninput="calcReceiptSgd()" required class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary shadow-sm" value="1">
       </div>
       <div>
           <label class="block text-[10px] font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equivalent SGD</label>
           <input type="number" step="0.01" id="recSgd" readonly class="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 shadow-sm" placeholder="0.00">
       </div>
   </div>

   <div>
       <label class="block text-[10px] font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Screenshot File (Max 4MB)</label>
       <input type="file" id="recFile" required accept="image/*,.pdf" class="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-gray-100 file:text-gray-700 dark:file:bg-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200 dark:hover:file:bg-gray-600">
   </div>
   <div>
       <label class="block text-[10px] font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks (Optional)</label>
       <input type="text" id="recRemarks" class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-xs font-semibold bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary shadow-sm" placeholder="Any details...">
   </div>
   <div class="mt-auto pt-2">
       <button type="submit" class="w-full bg-purple-600 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm hover:bg-purple-700 transition flex justify-center items-center focus:outline-none">
          <span class="btn-text">Upload Confirmation</span><div class="btn-spinner spinner-white hidden-force ml-2 !w-3 !h-3 border-2"></div>
       </button>
   </div>
</form>\`;
}`;

code = code.replace(oldFuncRegex, newFunc);

// Update submitReceipt
const oldSubmitRegex = /const payload = \{[\s\S]*?fileData: base64.split\(\',\', 2\)\[1\]\n       \};/;
const newSubmitPayload = `const payload = {
           uploaderNric: currentUser.nric,
           currency: document.getElementById('recCurrency') ? document.getElementById('recCurrency').value : 'SGD',
           amount: document.getElementById('recAmount') ? parseFloat(document.getElementById('recAmount').value) : finalExpected,
           rate: document.getElementById('recRate') ? parseFloat(document.getElementById('recRate').value) : 1,
           sgdAmount: document.getElementById('recSgd') ? parseFloat(document.getElementById('recSgd').value) : finalExpected,
           categoryId: "Fees Payment Screenshot",
           paidByNric: currentUser.nric,
           remarks: remarks,
           fileName: file.name,
           mimeType: file.type,
           fileData: base64.split(',')[1]
       };`;

code = code.replace(/const payload = \{[\s\S]*?fileData: base64\.split\(\',\', 2\)\[1\]\n       \};/g, newSubmitPayload);
code = code.replace(/const payload = \{[\s\S]*?fileData: base64\.split\(\',\'\)\[1\]\n       \};/g, newSubmitPayload);

fs.writeFileSync('frontend/js/profile.js', code);