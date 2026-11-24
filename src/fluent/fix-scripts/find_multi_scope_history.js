// Find files whose version history spans two or more scopes, and optionally fix them.
// Status goes to the system log (source "MultiScopeHistory"). Change OPTIONS and run.
var OPTIONS = {
    // Encoded query on sys_update_version. Empty uses your company's app scopes: x_<company code>_, where the
    // company code comes from the glide.appcreator.company.code system property (plus sn_appauthor.all_company_keys).
    // To narrow it, add conditions one at a time, e.g.
    //   'application.scopeSTARTSWITHx_<company code>_^state=history'
    //   'application.scopeSTARTSWITHx_<company code>_^source_table=sys_store_app'
    //   'application.scope=x_<company code>_myapp^nameSTARTSWITHsc_cat_item'
    filter: '',
    // Fixes run in this order, each optional:
    revert: false,      // 1. revert to the newest row when it is not current (e.g. 'history')
    normalize: false,   // 2. move each file's version rows into the target scope
    updateXml: 'none',  // 3. 'none', 'normalize' (move XML rows to the target scope) or 'delete_new' (delete XML rows outside it created by this run)
    limit: 0            // 0 = no cap for reports. Any fix needs a limit of 1 or more. Start with 1, then widen.
};

var finder = new MultiScopeHistoryFinder();
var r = finder.run(OPTIONS);

gs.print('Filter: ' + r.filter + ' (from ' + r.filterSource + ')');
gs.print('Run ' + r.runId + ' (' + r.fixes + ')');
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
