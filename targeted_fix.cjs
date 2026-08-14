const fs = require('fs');

function fix(file, Old, old, New, newLow) {
    let js = fs.readFileSync(file, 'utf8');
    
    js = js.replace(/buildMedicalUI/g, 'build' + New + 'UI');
    js = js.replace(/loadMedicalData/g, 'load' + New + 'Data');
    js = js.replace(/renderMedicalTable/g, 'render' + New + 'Table');
    js = js.replace(/handleMedicalSearch/g, 'handle' + New + 'Search');
    js = js.replace(/medicalSearchQuery/g, newLow + 'SearchQuery');
    js = js.replace(/medicalSearch/g, newLow + 'Search');
    js = js.replace(/medicalLoading/g, newLow + 'Loading');
    js = js.replace(/medicalTableBody/g, newLow + 'TableBody');
    js = js.replace(/medicalTableHead/g, newLow + 'TableHead');
    js = js.replace(/medicalTableContainer/g, newLow + 'TableContainer');
    js = js.replace(/tab-medical/g, 'tab-' + newLow);
    js = js.replace(/medicalRosterData/g, newLow + 'RosterData');
    
    // Sort and cols
    js = js.replace(/medSortRules/g, newLow + 'SortRules');
    js = js.replace(/medCols/g, newLow + 'Cols');
    js = js.replace(/medicalSortRules_v2/g, newLow + 'SortRules_v2');
    js = js.replace(/medicalCols_v2/g, newLow + 'Cols_v2');
    
    // Drag/drop functions
    js = js.replace(/initMedResize/g, 'init' + New + 'Resize');
    js = js.replace(/onMedMouseMove/g, 'on' + New + 'MouseMove');
    js = js.replace(/onMedMouseUp/g, 'on' + New + 'MouseUp');
    js = js.replace(/onMedColDragStart/g, 'on' + New + 'ColDragStart');
    js = js.replace(/onMedColDragEnd/g, 'on' + New + 'ColDragEnd');
    js = js.replace(/onMedColDragOver/g, 'on' + New + 'ColDragOver');
    js = js.replace(/onMedColDragLeave/g, 'on' + New + 'ColDragLeave');
    js = js.replace(/onMedColDrop/g, 'on' + New + 'ColDrop');
    js = js.replace(/medDraggedColId/g, newLow + 'DraggedColId');
    js = js.replace(/medResizeColId/g, newLow + 'ResizeColId');
    js = js.replace(/medStartX/g, newLow + 'StartX');
    js = js.replace(/medStartWidth/g, newLow + 'StartWidth');

    fs.writeFileSync(file, js);
}

fix('frontend/js/diet.js', 'Medical', 'medical', 'Diet', 'diet');
fix('frontend/js/other.js', 'Medical', 'medical', 'Other', 'other');

console.log("Fixed diet and other targeted");
