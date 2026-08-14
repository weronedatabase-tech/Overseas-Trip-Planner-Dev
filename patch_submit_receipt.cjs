const fs = require('fs');
let code = fs.readFileSync('frontend/js/profile.js', 'utf8');

code = code.replace(
  /const payload = {\s*uploaderNric: currentUser\.nric,\s*currency:/,
  `const recNricInput = document.getElementById('recNric');
       const recNameInput = document.getElementById('recName');
       const recCatInput = document.getElementById('recCategory');
       const payload = {
           uploaderNric: recNricInput ? recNricInput.value.trim() : currentUser.nric,
           uploaderName: recNameInput ? recNameInput.value.trim() : '',
           categoryId: recCatInput ? recCatInput.value : "Fees Payment Screenshot",
           currency:`
);

// We should also replace the categoryId assignment further down inside the payload object!
code = code.replace(
  /categoryId: "Fees Payment Screenshot",/,
  `// categoryId is already set above`
);

fs.writeFileSync('frontend/js/profile.js', code);
console.log("Updated submitReceipt payload");
