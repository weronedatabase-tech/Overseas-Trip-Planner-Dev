const fs = require('fs');
const code = fs.readFileSync('frontend/js/logistics.js', 'utf8');

let depth = 0;
let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let oldDepth = depth;
  for(let j=0; j<line.length; j++) {
    if (line[j] === '{') depth++;
    if (line[j] === '}') depth--;
  }
  if (oldDepth === 0 && depth === 1) {
    console.log("Opened at line " + (i + 1) + ": " + line.substring(0, 50));
  }
}
