const fs = require('fs');
const acorn = require('acorn');
const code = fs.readFileSync('frontend/js/logistics.js', 'utf8');
try {
  acorn.parse(code, {ecmaVersion: 2020});
  console.log("No syntax error found by acorn");
} catch(e) {
  console.log("Error at line " + e.loc.line + " col " + e.loc.column);
  console.log("Message: " + e.message);
}
