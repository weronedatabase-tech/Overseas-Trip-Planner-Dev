const fs = require('fs');
let code = fs.readFileSync('frontend/css/styles.css', 'utf8');

const oldCss = `.resize-handle::after { content: ""; width: 2px; height: 50%; background-color: rgba(156, 163, 175, 0.5); border-radius: 2px; }`;
const newCss = `.resize-handle::after { content: ""; width: 4px; height: 40%; border-left: 1px solid rgba(156, 163, 175, 0.8); border-right: 1px solid rgba(156, 163, 175, 0.8); background-color: transparent; }`;

code = code.replace(oldCss, newCss);
fs.writeFileSync('frontend/css/styles.css', code);
