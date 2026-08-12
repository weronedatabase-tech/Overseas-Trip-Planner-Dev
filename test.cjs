const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');
try {
  // Try to parse it
  new Function(code);
  console.log("Syntax OK");
} catch (e) {
  console.log("Syntax Error:", e);
}
