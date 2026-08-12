const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');
code = code.replace(/async \nwindow\.showRosterBreakdownModal/g, "window.showRosterBreakdownModal");
fs.writeFileSync('frontend/js/participants.js', code);
