const fs = require('fs');

function setSelectValue(file, val) {
    let js = fs.readFileSync(file, 'utf8');
    // Remove selected from Custom Views
    js = js.replace(/<option value="" disabled selected>Custom Views<\/option>/, '<option value="" disabled>Custom Views</option>');
    // Add selected to the current view
    const regex = new RegExp('<option value="' + val + '">');
    js = js.replace(regex, '<option value="' + val + '" selected>');
    fs.writeFileSync(file, js);
}

setSelectValue('frontend/js/medical.js', 'medical.html');
setSelectValue('frontend/js/diet.js', 'diet.html');
setSelectValue('frontend/js/expired.js', 'expired.html');
setSelectValue('frontend/js/other.js', 'other.html');

console.log("Fixed select values");
