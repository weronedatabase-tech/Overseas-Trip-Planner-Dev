const fs = require('fs');
const code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

let depth = 0;
let lastDepth = 0;
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for(let j=0; j<line.length; j++) {
    if (line[j] === '{') depth++;
    if (line[j] === '}') depth--;
  }
  if (depth < 0) {
    console.log("Unmatched closing brace at line " + (i + 1));
    process.exit(1);
  }
}
if (depth > 0) {
  console.log("Unclosed opening braces: " + depth + " left open.");
} else {
  console.log("Braces are balanced.");
}
