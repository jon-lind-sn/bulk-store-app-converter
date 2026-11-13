/**
 * MultiScopeHistoryFinder
 *
 * Finds files (update names) whose sys_update_version history spans two or more
 * scopes, groups them, and can fix them. Uses only platform tables. Status is
 * written to the system log (source "MultiScopeHistory"): one line per fixed
 * file plus a summary line per run.
 *
 * Terms:
 *   newest  = the version row with the highest sys_recorded_at, whatever its state
 *   current = the version row with state=current
 *   target  = the scope fixes move rows into: the newest scope in the history
 *             that is not global
 *
 * Fix steps, in order, each optional:
 *   1. revert    : when the newest row is not current, revert to it
 *                  (GlideappUpdateVersion.revert, same as "Revert to this version")
 *   2. normalize : re-read the rows and set application on every version row
 *                  outside the target scope
 *   3. updateXml : 'none' (default), 'normalize' (set application on the file's
 *                  sys_update_xml rows outside the target scope) or 'delete_new'
 *                  (delete sys_update_xml rows outside the target scope that this
 *                  run created, such as the one a revert writes)
 *
 * Usage (see the "Find multi-scope history files" fix script):
 *   var result = new MultiScopeHistoryFinder().run({
 *       filter: 'application.scopeSTARTSWITHx_snc',  // encoded query on sys_update_version
 *       revert: false,
 *       normalize: false,
 *       updateXml: 'none',
 *       limit: 0             // max files to check; any fix needs 1 to MAX_FIX_FILES
 *   });
 *
 * A fix always needs a limit, and the limit cannot exceed MAX_FIX_FILES, so a
 * wrong filter can never change more than that many files in one run. Narrow the
 * filter and run again to work through more.
 */
var MultiScopeHistoryFinder = Class.create();
MultiScopeHistoryFinder.prototype = {
    LOG_SOURCE: 'MultiScopeHistory',
    BATCH_SIZE: 200,
    LINK_NAME_LIMIT: 80,
    KEEP_FILES: 500,
    MAX_FIX_FILES: 100,

    PATTERNS: {
        NEWER_OTHER_SCOPE: 'newer_history_other_scope',
        NEWER_SAME_SCOPE: 'newer_history_same_scope',
        CURRENT_IS_NEWEST: 'current_is_newest',
        NO_CURRENT: 'no_current'
    },

    initialize: function () {
        this._scopeCache = {};
    },

    // --------------------------------------------------------------------- run

    run: function (options) {
        var opts = this._options(options || {});
        var runId = 'MSH-' + String(new GlideDateTime().getValue()).replace(/[^0-9]/g, '');
        var result = {
            runId: runId,
            filter: opts.filter,
            fixes: this._fixLabel(opts),
            checked: 0,
            found: 0,
            revertedFiles: 0,
            normalizedFiles: 0,
            normalizedRows: 0,
            xmlRows: 0,
            failedFiles: 0,
            complete: false,
            summary: { byPattern: {}, byScopePath: {}, byFlag: {} },
            files: [],
            message: ''
        };

        this._validate(opts);

        var agg = new GlideAggregate('sys_update_version');
        agg.addEncodedQuery(opts.filter);
        agg.groupBy('name');
        agg.orderBy('name');
        agg.query();

        var batch = [];
        var stopped = false;
        while (agg.next()) {
            batch.push(agg.getValue('name'));
            var size = opts.limit ? Math.min(this.BATCH_SIZE, opts.limit - result.checked) : this.BATCH_SIZE;
            if (batch.length < size) continue;
            this._processBatch(batch, opts, result);
            batch = [];
            if (opts.limit && result.checked >= opts.limit) {
                stopped = agg.hasNext();
                break;
            }
        }
        if (!stopped && batch.length) this._processBatch(batch, opts, result);

        result.complete = !stopped;
        if (stopped) result.message = 'Stopped at the limit of ' + opts.limit + ' files. More files match the filter.';

        result.urls = {
            versions: this.getListUrls('sys_update_version', result.files.map(function (f) { return f.name; })),
            log: this.getLogUrl(runId)
        };
        this._log(runId + ' | done | filter=' + opts.filter + ' | fixes=' + result.fixes +
            ' | checked=' + result.checked + ' | found=' + result.found +
            ' | reverted=' + result.revertedFiles + ' | normalizedFiles=' + result.normalizedFiles +
            ' | normalizedRows=' + result.normalizedRows + ' | xmlRows=' + result.xmlRows + ' | failed=' + result.failedFiles +
            ' | complete=' + result.complete +
            ' | summary=' + JSON.stringify(result.summary));
        return result;
    },

    /**
     * Group one file's rows. Pure: no queries.
     * rows: [{ id, app, scope, state, recorded, sourceTable, createdOn }]
     * xmlByScope: { scope: count } for the same name in sys_update_xml
     * recordScope: scope value of the record itself, or '' when not found
     * Returns null when the rows cover fewer than two scopes.
     */
    classify: function (name, rows, xmlByScope, recordScope) {
        rows = this._sortNewestFirst(rows);

        var path = [];
        for (var i = rows.length - 1; i >= 0; i--) {
            if (path.indexOf(rows[i].scope) < 0) path.push(rows[i].scope);
        }
        if (path.length < 2) return null;

        var newest = rows[0];
        var currents = rows.filter(function (r) { return r.state === 'current'; });
        var current = currents[0] || null;

        var pattern;
        if (!current) pattern = this.PATTERNS.NO_CURRENT;
        else if (current === newest) pattern = this.PATTERNS.CURRENT_IS_NEWEST;
        else if (current.scope !== newest.scope) pattern = this.PATTERNS.NEWER_OTHER_SCOPE;
        else pattern = this.PATTERNS.NEWER_SAME_SCOPE;

        var targetScope = this._targetScope(rows);
        var xmlScopes = Object.keys(xmlByScope || {}).sort();

        var flags = [];
        if (currents.length > 1) flags.push('multiple_current');
        if (current && current.scope !== newest.scope) flags.push('current_in_older_scope');
        if (!recordScope) flags.push('record_not_found');
        if (recordScope && current && recordScope !== current.scope) flags.push('record_scope_differs_from_current');
        if (recordScope && recordScope !== newest.scope) flags.push('record_scope_differs_from_newest');
        if (!targetScope) flags.push('no_target_scope');
        if (!xmlScopes.length) flags.push('no_update_xml');
        if (xmlScopes.length > 1) flags.push('update_xml_multi_scope');
        if (targetScope && xmlScopes.length && xmlScopes.indexOf(targetScope) < 0) flags.push('update_xml_not_in_target_scope');

        return {
            name: name,
            pattern: pattern,
            scopePath: path.join(' > '),
            currentScope: current ? current.scope : '',
            currentId: current ? current.id : '',
            newestScope: newest.scope,
            newestId: newest.id,
            recordScope: recordScope || '',
            targetScope: targetScope,
            newestState: newest.state,
            newestSource: newest.sourceTable,
            newerThanCurrent: current ? rows.indexOf(current) : rows.length,
            versionCount: rows.length,
            xmlScopes: xmlScopes.join(', '),
            flags: flags,
            rowsToChange: targetScope ? rows.filter(function (r) { return r.scope !== targetScope; }) : [],
            rows: rows
        };
    },

    // -------------------------------------------------------------------- urls

    // sys_update_version or sys_update_xml lists for names, grouped by name.
    getListUrls: function (table, names) {
        var urls = [];
        var base = gs.getProperty('glide.servlet.uri');
        var order = table === 'sys_update_version' ? 'sys_recorded_at' : 'sys_created_on';
        for (var i = 0; i < names.length; i += this.LINK_NAME_LIMIT) {
            var q = 'nameIN' + names.slice(i, i + this.LINK_NAME_LIMIT).join(',') + '^GROUPBYname^ORDERBYname^ORDERBYDESC' + order;
            urls.push(base + table + '_list.do?sysparm_query=' + encodeURIComponent(q));
        }
        return urls;
    },

    // System log entries for one run (or every run when runId is empty).
    getLogUrl: function (runId) {
        var q = 'source=' + this.LOG_SOURCE + (runId ? '^messageSTARTSWITH' + runId : '') + '^ORDERBYDESCsys_created_on';
        return gs.getProperty('glide.servlet.uri') + 'syslog_list.do?sysparm_query=' + encodeURIComponent(q);
    },

    // --------------------------------------------------------------- internals

    _options: function (o) {
        var xml = String(o.updateXml || 'none');
        return {
            filter: String(o.filter === undefined || o.filter === null ? 'application.scopeSTARTSWITHx_snc' : o.filter),
            revert: o.revert === true,
            normalize: o.normalize === true,
            updateXml: xml === 'normalize' || xml === 'delete_new' ? xml : 'none',
            limit: parseInt(o.limit, 10) || 0
        };
    },

    _writes: function (opts) {
        return opts.revert || opts.normalize || opts.updateXml !== 'none';
    },

    _fixLabel: function (opts) {
        var parts = [];
        if (opts.revert) parts.push('revert');
        if (opts.normalize) parts.push('normalize');
        if (opts.updateXml !== 'none') parts.push('xml_' + opts.updateXml);
        return parts.length ? parts.join('+') : 'report';
    },

    _validate: function (opts) {
        if (!opts.filter) throw 'MultiScopeHistoryFinder: a filter is required';
        var probe = new GlideRecord('sys_update_version');
        if (typeof probe.isValidEncodedQuery === 'function' && !probe.isValidEncodedQuery(opts.filter)) {
            throw 'MultiScopeHistoryFinder: invalid filter for sys_update_version: ' + opts.filter;
        }
        if (this._writes(opts) && (opts.limit < 1 || opts.limit > this.MAX_FIX_FILES)) {
            throw 'MultiScopeHistoryFinder: revert, normalize and updateXml need a limit from 1 to ' + this.MAX_FIX_FILES +
                '. Narrow the filter and run again to fix more.';
        }
    },

    _sortNewestFirst: function (rows) {
        return rows.slice().sort(function (a, b) {
            if (a.recorded !== b.recorded) return a.recorded < b.recorded ? 1 : -1;
            return a.createdOn < b.createdOn ? 1 : a.createdOn > b.createdOn ? -1 : 0;
        });
    },

    // rows are newest first.
    _targetScope: function (rows) {
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].scope !== 'global') return rows[i].scope;
        }
        return '';
    },

    _processBatch: function (names, opts, result) {
        var list = names.join(',');
        var rowsByName = this._versionRows(list);

        var xmlByName = {};
        var appIds = {};
        var xa = new GlideAggregate('sys_update_xml');
        xa.addQuery('name', 'IN', list);
        xa.addAggregate('COUNT');
        xa.groupBy('name');
        xa.groupBy('application');
        xa.query();
        while (xa.next()) {
            var xApp = xa.getValue('application') || '';
            appIds[xApp] = true;
            var xName = xa.getValue('name');
            (xmlByName[xName] = xmlByName[xName] || {})[xApp] = parseInt(xa.getAggregate('COUNT'), 10);
        }

        var recordApps = this._recordScopes(names);
        for (var r in recordApps) appIds[recordApps[r]] = true;
        for (var nm in rowsByName) rowsByName[nm].forEach(function (row) { appIds[row.app] = true; });
        this._scopeLabels(Object.keys(appIds));

        for (var n in rowsByName) {
            var rows = rowsByName[n];
            var xml = {};
            var byApp = xmlByName[n] || {};
            for (var a in byApp) xml[this._label(a)] = (xml[this._label(a)] || 0) + byApp[a];

            var g = this.classify(n, rows, xml, recordApps[n] ? this._label(recordApps[n]) : '');
            if (!g) continue;

            result.found++;
            this._count(result.summary.byPattern, g.pattern);
            this._count(result.summary.byScopePath, g.scopePath);
            (g.flags.length ? g.flags : ['none']).forEach(function (f) { this._count(result.summary.byFlag, f); }, this);

            if (this._writes(opts)) this._fixFile(result, g, opts);

            if (result.files.length < this.KEEP_FILES) {
                result.files.push({
                    name: g.name, pattern: g.pattern, scopePath: g.scopePath,
                    currentScope: g.currentScope, newestScope: g.newestScope,
                    recordScope: g.recordScope, targetScope: g.targetScope,
                    newestState: g.newestState, newestSource: g.newestSource,
                    newerThanCurrent: g.newerThanCurrent, versionCount: g.versionCount,
                    xmlScopes: g.xmlScopes, flags: g.flags,
                    rowsToChange: g.rowsToChange.length, fix: g.fix || ''
                });
            }
        }
        result.checked += names.length;
    },

    // Version rows by name, with scope labels filled in from the cache.
    _versionRows: function (list) {
        var rowsByName = {};
        var gr = new GlideRecord('sys_update_version');
        gr.addQuery('name', 'IN', list);
        gr.query();
        while (gr.next()) {
            var name = gr.getValue('name');
            var app = gr.getValue('application') || '';
            (rowsByName[name] = rowsByName[name] || []).push({
                id: gr.getUniqueValue(),
                app: app,
                scope: app,
                state: gr.getValue('state') || '',
                recorded: gr.getValue('sys_recorded_at') || '',
                sourceTable: gr.getValue('source_table') || '',
                createdOn: gr.getValue('sys_created_on') || ''
            });
        }
        var ids = {};
        for (var n in rowsByName) rowsByName[n].forEach(function (r) { ids[r.app] = true; });
        this._scopeLabels(Object.keys(ids));
        for (var m in rowsByName) rowsByName[m].forEach(function (r) { r.scope = this._label(r.app); }, this);
        return rowsByName;
    },

    // Revert, normalize and update XML for one file, in that order. One log line.
    _fixFile: function (result, g, opts) {
        var notes = [];
        var fileStart = new GlideDateTime();
        try {
            if (!g.targetScope) throw 'no target scope';
            var targetId = this._scopeIdFor(g.targetScope);
            if (!targetId) throw 'no scope id for ' + g.targetScope;

            // 1. revert to the newest row when it is not current
            if (opts.revert) {
                if (g.pattern === this.PATTERNS.NEWER_OTHER_SCOPE || g.pattern === this.PATTERNS.NEWER_SAME_SCOPE) {
                    var guv = new GlideappUpdateVersion();
                    var ok = guv.revert(g.newestId);
                    var head = this._currentRow(g.name);
                    notes.push('revert ' + g.newestId + ' ' + (ok ? 'ok' : 'FAILED') +
                        (head ? ', new current ' + head.id + ' in ' + head.scope : ', no current row after revert'));
                    if (!ok) throw 'revert failed';
                    result.revertedFiles++;
                } else {
                    notes.push('revert skipped (' + g.pattern + ')');
                }
            }

            // 2. normalize every version row into the target scope (re-read after the revert)
            if (opts.normalize) {
                var rows = this._versionRows(g.name)[g.name] || [];
                var moved = [];
                rows.forEach(function (r) {
                    if (r.app === targetId) return;
                    var v = new GlideRecord('sys_update_version');
                    if (!v.get(r.id)) return;
                    v.setWorkflow(false);
                    v.setValue('application', targetId);
                    if (v.update()) moved.push(r.id + ' ' + r.scope + ' (' + r.state + ')');
                });
                notes.push('versions moved: ' + (moved.length ? moved.join(', ') : 'none'));
                if (moved.length) {
                    result.normalizedFiles++;
                    result.normalizedRows += moved.length;
                }
            }

            // 3. update XML rows outside the target scope
            if (opts.updateXml !== 'none') {
                var x = new GlideRecord('sys_update_xml');
                x.addQuery('name', g.name);
                x.addQuery('application', '!=', targetId);
                if (opts.updateXml === 'delete_new') x.addQuery('sys_created_on', '>=', fileStart);
                x.query();
                var touched = [];
                while (x.next()) {
                    var label = x.getUniqueValue() + ' ' + this._label(x.getValue('application'));
                    if (opts.updateXml === 'delete_new') {
                        if (x.deleteRecord()) touched.push(label);
                    } else {
                        x.setWorkflow(false);
                        x.setValue('application', targetId);
                        if (x.update()) touched.push(label);
                    }
                }
                notes.push('xml ' + opts.updateXml + ': ' + (touched.length ? touched.join(', ') : 'none'));
                result.xmlRows += touched.length;
            }
            g.fix = notes.join('; ');
            this._log(result.runId + ' | fixed | ' + g.name + ' | ' + g.scopePath + ' -> ' + g.targetScope +
                ' | pattern=' + g.pattern + ' | ' + g.fix);
        } catch (e) {
            result.failedFiles++;
            g.fix = 'FAILED: ' + e + (notes.length ? ' (' + notes.join('; ') + ')' : '');
            this._log(result.runId + ' | failed | ' + g.name + ' | ' + g.fix);
        }
    },

    _currentRow: function (name) {
        var gr = new GlideRecord('sys_update_version');
        gr.addQuery('name', name);
        gr.addQuery('state', 'current');
        gr.orderByDesc('sys_recorded_at');
        gr.setLimit(1);
        gr.query();
        if (!gr.next()) return null;
        this._scopeLabels([gr.getValue('application')]);
        return { id: gr.getUniqueValue(), scope: this._label(gr.getValue('application')) };
    },

    // Scope (sys_id) of the record behind each name, for names shaped <table>_<sys_id>.
    _recordScopes: function (names) {
        var byTable = {};
        names.forEach(function (n) {
            var m = /^(.+)_([0-9a-f]{32})$/.exec(n);
            if (m) (byTable[m[1]] = byTable[m[1]] || {})[m[2]] = n;
        });
        var out = {};
        for (var table in byTable) {
            var rec = new GlideRecord(table);
            if (!rec.isValid() || !rec.isValidField('sys_scope')) continue;
            rec.addQuery('sys_id', 'IN', Object.keys(byTable[table]).join(','));
            rec.query();
            while (rec.next()) out[byTable[table][rec.getUniqueValue()]] = rec.getValue('sys_scope');
        }
        return out;
    },

    _scopeLabels: function (ids) {
        var cache = this._scopeCache;
        var missing = ids.filter(function (id) { return id && !cache.hasOwnProperty(id); });
        if (missing.length) {
            var sc = new GlideRecord('sys_scope');
            sc.addQuery('sys_id', 'IN', missing.join(','));
            sc.query();
            while (sc.next()) cache[sc.getUniqueValue()] = sc.getValue('scope');
            missing.forEach(function (id) { if (!cache.hasOwnProperty(id)) cache[id] = id; });
        }
        return cache;
    },

    _label: function (id) {
        return this._scopeCache[id] || id || '(none)';
    },

    _scopeIdFor: function (scope) {
        for (var id in this._scopeCache) if (this._scopeCache[id] === scope) return id;
        var sc = new GlideRecord('sys_scope');
        return sc.get('scope', scope) ? sc.getUniqueValue() : '';
    },

    _count: function (map, key) {
        map[key] = (map[key] || 0) + 1;
    },

    _log: function (msg) {
        gs.log(msg, this.LOG_SOURCE);
    },

    type: 'MultiScopeHistoryFinder'
};
