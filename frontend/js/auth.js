async function attemptLogin(btn) {
 const pass = document.getElementById('loginPass').value.trim();
 const err = document.getElementById('loginError');
 
 if(!pass) { 
     err.textContent = "Please enter Password"; 
     return err.classList.remove('hidden-force'); 
 }
 
 err.classList.add('hidden-force'); 
 setBtnLoading(btn, true);
 
 try {
   const res = await apiCall('login', { password: pass });
   currentUser = { nric: res.nric, role: res.role, name: res.name };
   localStorage.setItem('userSession', JSON.stringify(currentUser));
   if (currentUser.role === 'admin') {
       window.location.href = 'roster.html';
   } else {
       window.location.href = 'dashboard.html';
   }
 } catch (error) {
   err.textContent = error.message; 
   err.classList.remove('hidden-force');
 } finally {
   setBtnLoading(btn, false);
 }
}

function logout(btn) {
 if(btn) setBtnLoading(btn, true);
 localStorage.removeItem('userSession');
 currentUser = null;
 window.location.href = 'index.html';
}

function togglePassword(id) {
 const el = document.getElementById(id);
 const eyeOpen = document.getElementById('eyeOpen');
 const eyeClosed = document.getElementById('eyeClosed');
 if(el.type === 'password') {
   el.type = 'text'; 
   eyeOpen.classList.add('hidden-force'); 
   eyeClosed.classList.remove('hidden-force');
 } else {
   el.type = 'password'; 
   eyeOpen.classList.remove('hidden-force'); 
   eyeClosed.classList.add('hidden-force');
 }
}
function toggleLandingReceipt() {
    const wrapper = document.getElementById('landingReceiptFormWrapper');
    const icon = document.getElementById('receiptExpandIcon');
    if (wrapper.classList.contains('hidden-force')) {
        wrapper.classList.remove('hidden-force');
        icon.classList.add('rotate-180');
    } else {
        wrapper.classList.add('hidden-force');
        icon.classList.remove('rotate-180');
    }
}

async function submitLandingReceipt(e) {
    e.preventDefault();
    const btn = document.getElementById('landingRecBtn');
    const err = document.getElementById('landingReceiptError');
    const succ = document.getElementById('landingReceiptSuccess');
    err.classList.add('hidden-force');
    succ.classList.add('hidden-force');
    
    const nric = document.getElementById('landingRecNric').value.trim().toUpperCase();
    const amount = parseFloat(document.getElementById('landingRecAmount').value) || 0;
    const category = document.getElementById('landingRecCategory').value.trim();
    const remarks = document.getElementById('landingRecRemarks').value.trim();
    const fileInput = document.getElementById('landingRecFile');
    
    if(!nric) { err.textContent = "Uploader NRIC is required."; return err.classList.remove('hidden-force'); }
    if(amount <= 0) { err.textContent = "Amount must be greater than 0."; return err.classList.remove('hidden-force'); }
    if(!category) { err.textContent = "Category is required."; return err.classList.remove('hidden-force'); }
    if(!fileInput.files.length) { err.textContent = "Please select a file."; return err.classList.remove('hidden-force'); }
    
    const file = fileInput.files[0];
    if (file.size > 4 * 1024 * 1024) { err.textContent = "File exceeds 4MB limit."; return err.classList.remove('hidden-force'); }

    setBtnLoading(btn, true);
    try {
        const base64 = await toBase64(file);
        const payload = {
            uploaderNric: nric,
            currency: 'SGD',
            amount: amount,
            rate: 1,
            sgdAmount: amount,
            categoryId: category,
            remarks: remarks,
            fileName: file.name,
            mimeType: file.type,
            fileData: base64.split(',')[1]
        };
        const res = await apiCall('uploadReceipt', payload);
        succ.textContent = "Receipt uploaded successfully!";
        succ.classList.remove('hidden-force');
        document.getElementById('landingReceiptForm').reset();
    } catch (error) {
        err.textContent = error.message;
        err.classList.remove('hidden-force');
    } finally {
        setBtnLoading(btn, false);
    }
}