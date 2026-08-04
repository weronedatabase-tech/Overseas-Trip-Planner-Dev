const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

const regex = /function generateReceiptFormHtml\(\) \{.+?function onReceiptCurChange\(\) \{/s;

const replace = `function generateReceiptFormHtml() {
return \`
<form id="uploadReceiptForm" onsubmit="submitReceipt(event)" class="flex flex-col gap-4 flex-1">
    <div id="recError" class="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 p-2 rounded-lg text-[10px] mb-2 font-bold hidden-force"></div>
    <div id="recSuccess" class="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 p-2 rounded-lg text-[10px] mb-2 font-bold hidden-force"></div>
    
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
</form>
\`;
}

function onReceiptCurChange() {
`;

code = code.replace(regex, replace);

const submitRegex = /async function submitReceipt\(e\) \{.+?const payload = \{.+?\}\;/s;

const submitReplace = `async function submitReceipt(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const err = document.getElementById('recError');
    const succ = document.getElementById('recSuccess');
    err.classList.add('hidden-force');
    succ.classList.add('hidden-force');

    const remarks = document.getElementById('recRemarks').value.trim();
    const fileInput = document.getElementById('recFile');
    
    if(!fileInput.files.length) { err.textContent = "Please select a file."; return err.classList.remove('hidden-force'); }
    const file = fileInput.files[0];
    if (file.size > 4 * 1024 * 1024) { err.textContent = "File exceeds 4MB limit."; return err.classList.remove('hidden-force'); }

    setBtnLoading(btn, true);
    try {
        const base64 = await toBase64(file);
        
        let targetNric = loadedFamily[0].pocNric || loadedFamily[0].nric;
        if (!loadedFamily.some(m => m.role === 'CAREGIVER')) targetNric = loadedFamily[0].nric;
        const size = loadedFamily.length;
        const baseFee = finConfig.perPersonFee || 0;
        const dev = finConfig.feeDeviations?.[targetNric]?.amount || 0;
        const finalExpected = (size * baseFee) + dev;

        const payload = {
            uploaderNric: currentUser.nric,
            currency: 'SGD',
            amount: finalExpected,
            rate: 1,
            sgdAmount: finalExpected,
            categoryId: "Fees Payment Screenshot",
            paidByNric: currentUser.nric,
            remarks: remarks,
            fileName: file.name,
            mimeType: file.type,
            fileData: base64.split(',')[1]
        };`;

code = code.replace(submitRegex, submitReplace);

fs.writeFileSync('frontend/js/profile.js', code);