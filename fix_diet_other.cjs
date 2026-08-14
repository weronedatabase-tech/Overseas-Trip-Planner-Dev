const fs = require('fs');

function fixFile(file, searchStr, replaceStr, Prefix, prefix) {
    let js = fs.readFileSync(file, 'utf8');
    
    // Replace all 'Medical' with Prefix
    js = js.replace(/Medical/g, Prefix);
    // Replace all 'medical' with prefix
    js = js.replace(/medical/g, prefix);
    
    // Replace 'med' with prefix for specific things
    js = js.replace(/medSortRules/g, prefix + 'SortRules');
    js = js.replace(/medCols/g, prefix + 'Cols');
    js = js.replace(/initMedResize/g, 'init' + Prefix + 'Resize');
    js = js.replace(/onMedMouseMove/g, 'on' + Prefix + 'MouseMove');
    js = js.replace(/onMedMouseUp/g, 'on' + Prefix + 'MouseUp');
    js = js.replace(/onMedColDragStart/g, 'on' + Prefix + 'ColDragStart');
    js = js.replace(/onMedColDragEnd/g, 'on' + Prefix + 'ColDragEnd');
    js = js.replace(/onMedColDragOver/g, 'on' + Prefix + 'ColDragOver');
    js = js.replace(/onMedColDragLeave/g, 'on' + Prefix + 'ColDragLeave');
    js = js.replace(/onMedColDrop/g, 'on' + Prefix + 'ColDrop');
    js = js.replace(/medDraggedColId/g, prefix + 'DraggedColId');
    js = js.replace(/medResizeColId/g, prefix + 'ResizeColId');
    js = js.replace(/medStartX/g, prefix + 'StartX');
    js = js.replace(/medStartWidth/g, prefix + 'StartWidth');

    fs.writeFileSync(file, js);
}

// But wait, the raw medical.js is copied to diet and other?
// Let's just copy medical.js to diet.js and other.js and then do the replacements!
// Wait, I already modified the filters and views for diet and other!
// So it's better to just do the exact replacements in the current files.
