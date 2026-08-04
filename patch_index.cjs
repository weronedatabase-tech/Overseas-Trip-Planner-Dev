const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');
const search = ` </div>\n</div>\n</main>\n</div>`;
const replace = ` </div>

 <div id="landingReceiptBox" class="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 w-full animate-slide-up mt-6 border-t-4 border-t-purple-500">
   <button onclick="toggleLandingReceipt()" class="w-full flex justify-between items-center focus:outline-none">
       <h3 class="text-lg font-black text-gray-900 dark:text-white tracking-tight">Upload Receipt</h3>
       <svg id="receiptExpandIcon" class="w-6 h-6 text-gray-500 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
   </button>
   <div id="landingReceiptFormWrapper" class="hidden-force mt-5 text-left">
       <p class="text-xs text-gray-500 dark:text-gray-400 mb-4 font-bold">Please fill in the details of the receipt.</p>
       <div id="landingReceiptError" class="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-3 rounded-lg text-sm mb-4 font-bold hidden-force border border-red-200 dark:border-red-800"></div>
       <div id="landingReceiptSuccess" class="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 p-3 rounded-lg text-sm mb-4 font-bold hidden-force border border-green-200 dark:border-green-800"></div>
       <form id="landingReceiptForm" onsubmit="submitLandingReceipt(event)" class="flex flex-col gap-4">
            <div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uploader NRIC</label>
                <input type="text" id="landingRecNric" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl uppercase font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="S1234567A">
            </div>
            <div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount (SGD)</label>
                <input type="number" step="0.01" id="landingRecAmount" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-right" placeholder="0.00">
            </div>
            <div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                <input type="text" id="landingRecCategory" required class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="e.g. Flight, Accommodation, Meals">
            </div>
            <div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Receipt File</label>
                <input type="file" id="landingRecFile" required accept="image/*,.pdf" class="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-100 file:text-gray-700 dark:file:bg-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200 dark:hover:file:bg-gray-600">
            </div>
            <div>
                <label class="block text-xs font-bold mb-1 text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks (Optional)</label>
                <input type="text" id="landingRecRemarks" class="w-full p-2.5 border border-gray-300 dark:border-gray-700 rounded-xl font-bold bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20" placeholder="Details...">
            </div>
            <button type="submit" id="landingRecBtn" class="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-purple-700 transition flex justify-center items-center shadow-lg focus:outline-none mt-2">
                <span class="btn-text">Upload</span><div class="btn-spinner spinner-white hidden-force ml-2"></div>
            </button>
       </form>
   </div>
 </div>

</div>
</main>
</div>`;
code = code.replace(search, replace);
fs.writeFileSync('index.html', code);