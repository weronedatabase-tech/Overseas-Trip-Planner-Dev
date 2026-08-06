const fs = require('fs');
let code = fs.readFileSync('frontend/js/participants.js', 'utf8');

const oldDragStart = `window.onColDragStart = function(e, colId) {
draggedColId = colId;
e.dataTransfer.effectAllowed = "move";
e.target.classList.add('opacity-50');
}`;

const newDragStart = `window.onColDragStart = function(e, colId) {
if (resizingCol) {
    e.preventDefault();
    return;
}
draggedColId = colId;
e.dataTransfer.effectAllowed = "move";
e.target.classList.add('opacity-50');
}`;

code = code.replace(oldDragStart, newDragStart);
fs.writeFileSync('frontend/js/participants.js', code);