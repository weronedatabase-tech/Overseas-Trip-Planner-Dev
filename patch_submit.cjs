const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

const submitRegex = /async function submitReceipt\(btn\) \{.+?const payload = \{.+?\}\;/s;

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