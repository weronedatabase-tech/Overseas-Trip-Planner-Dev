const fs = require('fs');
let code = fs.readFileSync('frontend/css/styles.css', 'utf8');

const oldCss = `.resize-handle { position: absolute; right: 0; top: 0; bottom: 0; width: 6px; cursor: col-resize; z-index: 10; touch-action: none; }
.resize-handle:hover, .resize-handle:active { background: rgba(37,99,235,0.3); }`;

const newCss = `.resize-handle { position: absolute; right: -4px; top: 25%; bottom: 25%; width: 12px; cursor: col-resize; z-index: 10; touch-action: none; border-right: 2px dotted rgba(156, 163, 175, 0.6); }
.resize-handle:hover, .resize-handle:active { background: rgba(37,99,235,0.1); border-right: 2px dotted rgba(37,99,235,0.8); }`;

code = code.replace(oldCss, newCss);
fs.writeFileSync('frontend/css/styles.css', code);