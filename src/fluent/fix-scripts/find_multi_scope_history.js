// Find files whose version history spans two or more scopes, and optionally fix them.
// Status goes to the system log (source "MultiScopeHistory"). Change OPTIONS and run.
var OPTIONS = {
    // Encoded query on sys_update_version. Add conditions one at a time, e.g.
    //   'application.scopeSTARTSWITHx_snc^state=history'
    //   'application.scopeSTARTSWITHx_snc^source_table=sys_store_app'
    //   'application.scopeSTARTSWITHx_snc^nameSTARTSWITHsc_cat_item'
    filter: 'application.scopeSTARTSWITHx_snc',
    // Fixes run in this order, each optional:
    revert: false,      // 1. revert to the newest row when it is not current (e.g. 'history')
    normalize: false,   // 2. move each file's version rows into the target scope
    updateXml: 'none',  // 3. 'none', 'normalize' (move XML rows to the target scope) or 'delete_new' (delete XML rows outside it created by this run)
    limit: 3            // max files to check. Any fix needs a limit (e.g. 100). To fix more, narrow the filter and run again.
};

var finder = new MultiScopeHistoryFinder();
var r = finder.run(OPTIONS);

gs.print('Run ' + r.runId + ' (' + r.fixes + '), filter: ' + r.filter);
gs.print(r.checked + ' files checked, ' + r.found + ' span two or more scopes.');
if (r.fixes !== 'report') {
    gs.print('Reverted ' + r.revertedFiles + ', normalized ' + r.normalizedFiles + ' files (' + r.normalizedRows +
        ' rows), XML rows ' + r.xmlRows + ', failed ' + r.failedFiles + '.');
}
if (r.message) gs.print(r.message);

function printCounts(title, counts) {
    gs.print(title + ':');
    Object.keys(counts).sort().forEach(function (k) { gs.print('  ' + counts[k] + '  ' + k); });
}
printCounts('By pattern', r.summary.byPattern);
printCounts('By scope path', r.summary.byScopePath);
printCounts('By flag', r.summary.byFlag);

gs.print('Files (first ' + r.files.length + '):');
r.files.forEach(function (f) {
    gs.print('  ' + f.name + ' | ' + f.pattern + ' | ' + f.scopePath + ' | record: ' + (f.recordScope || '?') +
        ' | target: ' + (f.targetScope || '?') + ' | rows outside target: ' + f.rowsToChange +
        ' | flags: ' + (f.flags.join(',') || '-') + (f.fix ? ' | ' + f.fix : ''));
});
r.urls.versions.forEach(function (u, i) { gs.print('Version history ' + (i + 1) + ': ' + u); });
gs.print('Log for this run: ' + r.urls.log);
