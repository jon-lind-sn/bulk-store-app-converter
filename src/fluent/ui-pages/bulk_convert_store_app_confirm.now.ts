import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['e50a5b297999422a982ce43dd4e39791'],
    category: 'general',
    endpoint: 'bulk_convert_store_app_confirm.do',
    description:
        'Bulk App Clone Assistant: publish dev apps to My Application Repository before a clone, then upgrade and convert store apps to development mode after it.',
    html: `<?xml version="1.0" encoding="utf-8"?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
  <j2:if test="$[gs.hasRole('admin')]">
    <g:ui_form>
      <div id="bac-root" class="container-fluid" style="margin-top: 10px;">
        <div id="page-messages"></div>
        <h3>Bulk App Clone Assistant</h3>
        <style>
          #prereq-strip { margin-bottom: 18px; }
          .bac-sub { margin: 14px 0 12px; }
          .bac-refresh-tip { font-size: 15px; }
          .bac-how summary { cursor: pointer; }
          .bac-sub-title { font-size: 18px; }
          .bac-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin: 14px 0 16px; }
          .bac-toolbar .bac-search { width: 220px; }
          .bac-toolbar .checkbox-inline { margin: 0; }
          #banner-save { margin: 0; }
          .bac-table th, .bac-table td { padding: 10px 14px !important; vertical-align: middle !important; }
          .bac-table .text-muted { margin-top: 2px; }
          .bac-table tbody tr:nth-child(even) td { background-color: rgba(0, 0, 0, 0.03); }
          .bac-table tbody tr:hover td { background-color: rgba(0, 0, 0, 0.06); }
          .bac-table tbody tr { transition: opacity 0.6s; }
          .bac-table tbody td { transition: background-color 0.6s, box-shadow 0.6s; }
          .bac-running tbody tr { opacity: 0.4; }
          .bac-running tbody tr.bac-in-run { opacity: 1; }
          .bac-table tbody tr.bac-active td { background-color: #e6f0fa; }
          .bac-table tbody tr.bac-active td:first-child { box-shadow: inset 4px 0 0 #2a7ab8; }
          #summary-bar { margin: 16px 0; }
        </style>
        <div id="prereq-strip" class="alert alert-info" style="display: none;"></div>
        <ul class="nav nav-tabs" style="margin-bottom: 10px;">
          <li id="tab-save"><a href="#" data-tab="save">Before Clone: Save Work</a></li>
          <li id="tab-restore"><a href="#" data-tab="restore">After Clone: Restore</a></li>
        </ul>
        <div id="pane-save" style="display: none;"></div>
        <div id="pane-restore" style="display: none;"></div>
        <div id="summary-bar" class="alert alert-info" style="display: none; margin-top: 10px;"></div>
        <details class="bac-how" style="margin-top: 15px;">
          <summary>How it works</summary>
          <ol>
            <li>Before a clone, open the Before Clone tab on your dev instance and publish every app whose work is not in My Application Repository (App Repo).</li>
            <li>Clone from prod. Every company app arrives in store mode.</li>
            <li>After the clone, open the After Clone tab. Upgrade and convert all upgrades apps that have a newer App Repo version, waits for the batch install, then converts every selected app to dev mode.</li>
            <li>Convert to Store only runs on apps that are saved in App Repo, so it never strands unpublished work.</li>
          </ol>
        </details>
        <p style="margin-top: 10px;"><a href="https://github.com/jon-lind-sn/bulk-store-app-converter" target="_blank" rel="noopener">Source on GitHub</a></p>
      </div>
    </g:ui_form>
  </j2:if>
</j:jelly>`,
    clientScript: `// Bulk App Clone Assistant client script. ES5 only (helsinki_es5).
var BAC = {
    tab: 'restore',
    refreshTipDismissed: false,
    run: { tab: '', ids: {} },
    busy: false,
    loader: false,
    apps: { save: [], restore: [] },
    checked: { save: {}, restore: {} },
    touched: { save: false, restore: false },
    status: { save: {}, restore: {} },
    saveState: {},
    checkStart: {},
    filters: {
        save: { q: '', needs: false, statuses: {}, failed: false },
        restore: { q: '', upgrade: false, failed: false }
    },
    prereq: null,
    batchId: '',
    loaded: { save: false, restore: false }
};

var STATUS_CLASSES = {
    'Pending': 'label-info',
    'Upgrading': 'label-warning',
    'Converting': 'label-warning',
    'Publishing': 'label-warning',
    'Complete': 'label-success',
    'Converted': 'label-success',
    'Upgraded': 'label-success',
    'Published': 'label-primary',
    'Failed': 'label-danger',
    'Skipped': 'label-default'
};

var SAVE_LABELS = {
    'saved': ['label-primary', 'Published'],
    'changed': ['label-warning', 'Changed'],
    'not_in_repo': ['label-danger', 'Not in App Repo'],
    'unpublished_version': ['label-warning', 'Unpublished'],
    'in_repo': ['label-info', 'In App Repo'],
    'check_failed': ['label-default', 'Check failed']
};

var SAVE_FILTER_ORDER = ['changed', 'unpublished_version', 'not_in_repo', 'in_repo', 'check_failed', 'saved'];

// One checkbox per save status. With none checked every app shows.
function saveChipsHtml() {
    var html = '<label class="checkbox-inline"><input type="checkbox" class="bac-chip" data-tab="save" data-chip="needs"/> Needs publishing <span class="text-muted" id="chipcount-needs"></span></label> ';
    for (var i = 0; i < SAVE_FILTER_ORDER.length; i++) {
        var key = SAVE_FILTER_ORDER[i];
        html += '<label class="checkbox-inline" id="chip-' + key + '"' + (key === 'check_failed' ? ' style="display: none;"' : '') + '><input type="checkbox" class="bac-chip" data-tab="save" data-chip="status" data-status="' + key + '"/> ' +
            esc(SAVE_LABELS[key][1]) + ' <span class="text-muted" id="chipcount-' + key + '"></span></label> ';
    }
    return html;
}

function updateSaveChipCounts() {
    var counts = {};
    for (var i = 0; i < BAC.apps.save.length; i++) {
        var st = BAC.saveState[BAC.apps.save[i].sys_id];
        if (st) { counts[st.saveStatus] = (counts[st.saveStatus] || 0) + 1; }
    }
    for (var j = 0; j < SAVE_FILTER_ORDER.length; j++) {
        var el = byId('chipcount-' + SAVE_FILTER_ORDER[j]);
        if (el) { el.textContent = '(' + (counts[SAVE_FILTER_ORDER[j]] || 0) + ')'; }
    }
    // Check failed only shows while at least one app is in that state.
    var needsEl = byId('chipcount-needs');
    if (needsEl) {
        var needs = 0;
        for (var n = 0; n < BAC.apps.save.length; n++) {
            if (isAtRisk(BAC.apps.save[n])) { needs++; }
        }
        needsEl.textContent = '(' + needs + ')';
    }
    var failChip = byId('chip-check_failed');
    if (failChip) {
        failChip.style.display = counts.check_failed ? '' : 'none';
        if (!counts.check_failed && BAC.filters.save.statuses.check_failed) {
            BAC.filters.save.statuses.check_failed = false;
            var box = failChip.getElementsByTagName('input')[0];
            if (box) { box.checked = false; }
            renderTable('save');
        }
    }
}

function shortDate(dt) {
    return dt ? String(dt).substring(0, 10) : '';
}

function saveNote(s) {
    if (s.saveStatus === 'in_repo') {
        return 'No publish record on this instance.' + (s.lastChanged ? ' Last change ' + shortDate(s.lastChanged) + '.' : '');
    }
    if (s.saveStatus === 'not_in_repo') {
        return 'Never published to the App Repo.';
    }
    if (s.saveStatus === 'unpublished_version') {
        if (s.isConverted) {
            return 'A conversion reset the version to ' + s.currentVersion + '. ' + (s.repoVersion ? 'App Repo has ' + s.repoVersion + '.' : 'The App Repo has an earlier version.');
        }
        return 'Version ' + s.currentVersion + (s.repoVersion ? ' is newer than App Repo ' + s.repoVersion + '.' : ' is not in the App Repo yet.');
    }
    if (s.saveStatus === 'changed') {
        return 'Changed ' + shortDate(s.lastChanged) + ', published ' + shortDate(s.lastPublished) + '.';
    }
    if (s.saveStatus === 'saved') {
        return 'Published ' + shortDate(s.lastPublished) + '.';
    }
    if (s.saveStatus === 'check_failed') {
        return s.error || 'The App Repo check did not return a result.';
    }
    return '';
}

function esc(s) {
    return String(s === null || s === undefined ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function byId(id) {
    return document.getElementById(id);
}

/* ---------- messages and summary ---------- */


function setSummary(html, kind) {
    var bar = byId('summary-bar');
    if (!bar) { return; }
    if (!html) {
        bar.style.display = 'none';
        bar.innerHTML = '';
        return;
    }
    bar.className = 'alert alert-' + (kind || 'info');
    bar.style.display = 'block';
    bar.innerHTML = html;
}

/* ---------- server calls ---------- */

// Same App Repo sync My Company Applications runs when it opens, so store apps get their latest_version. Always calls done.
function syncAppRepo(done) {
    var container = byId('table-restore');
    if (container) { container.innerHTML = '<p class="text-muted"><em>Checking the App Repo for new versions...</em></p>'; }
    function get(type, extra, cb) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'sn_appclient_api_v1.do?app_request_type=' + type + extra + '&uniq_param=' + new Date().getTime() + '&sysparm_ck=' + g_ck);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.setRequestHeader('X-UserToken', g_ck);
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) { return; }
            var res = null;
            try { res = JSON.parse(xhr.responseText); } catch (e) { res = null; }
            cb(res);
        };
        xhr.send();
    }
    get('list_apps_versions', '&shared_internally=true&isFirstLoad=true', function(res) {
        var trackerId = res && res.storetrackerId;
        if (!trackerId) { done(); return; }
        var attempts = 0;
        (function poll() {
            get('get_store_sync_status', '&trackerId=' + trackerId, function(st) {
                attempts++;
                if (!st || st.isComplete || attempts >= 60) { done(); return; }
                setTimeout(poll, 2000);
            });
        })();
    });
}

function callConsole(name, params, cb) {
    var ga = new GlideAjax('BulkAppConsole');
    ga.addParam('sysparm_name', name);
    for (var k in params) {
        if (params.hasOwnProperty(k)) { ga.addParam(k, params[k]); }
    }
    ga.getXMLAnswer(function(answer) {
        var data = null;
        try {
            data = JSON.parse(answer);
        } catch (err) {
            data = null;
        }
        if (!data) {
            data = { ok: false, error: 'No valid response from ' + name + '. The server returned ' + (answer === null || answer === undefined ? 'no answer (the request failed or timed out)' : 'a response that is not JSON') +
                '. Raw answer: ' + (answer === null || answer === undefined ? 'none' : String(answer).substring(0, 500)) };
        }
        cb(data);
    });
}

// Same call the stock "Switch to this Application" action makes. Convert and publish checks depend on the application picker.
function switchApplication(appId, callback) {
    var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
    ga.addParam('sysparm_function', 'changeApplication');
    ga.addParam('sysparm_value', appId);
    ga.getXML(function() {
        callback();
    });
}

// Returns a function that stops polling.
function pollTracker(trackerId, onComplete, onFailed) {
    var interval = setInterval(function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/now/table/sys_execution_tracker?sysparm_query=sys_id=' + trackerId + '&sysparm_fields=state,percent_complete,message', true);
        xhr.setRequestHeader('X-UserToken', window.g_ck);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    if (data.result && data.result.length > 0) {
                        var state = data.result[0].state;
                        if (state === '2') {
                            clearInterval(interval);
                            onComplete(data.result[0]);
                        } else if (state === '3' || state === '4') {
                            clearInterval(interval);
                            onFailed(data.result[0]);
                        }
                    }
                } else {
                    clearInterval(interval);
                    onFailed();
                }
            }
        };
        xhr.send();
    }, 3000);
    return function() { clearInterval(interval); };
}

/* ---------- row status ---------- */

function statusHtml(st) {
    if (!st) { return ''; }
    var html = '<span class="label ' + (STATUS_CLASSES[st.label] || 'label-default') + '">' + esc(st.label) + '</span>';
    if (st.note) {
        html += '<div class="text-muted" style="font-size: 90%;">';
        if (st.href) {
            html += '<a href="' + esc(st.href) + '" target="_blank">' + esc(st.note) + '</a>';
        } else {
            html += esc(st.note);
        }
        html += '</div>';
    }
    return html;
}

var ACTIVE_LABELS = { Publishing: true, Converting: true, Upgrading: true };

// Rows a run touches stay at full strength while the rest of the table dims. The row being worked on is highlighted.
function markRunRow(tab, sysId, label) {
    if (BAC.run.tab !== tab) { return; }
    BAC.run.ids[sysId] = true;
    var tr = byId('row-' + tab + '-' + sysId);
    if (!tr) { return; }
    tr.classList.add('bac-in-run');
    if (ACTIVE_LABELS[label]) { tr.classList.add('bac-active'); } else { tr.classList.remove('bac-active'); }
}

function runRowClass(tab, sysId) {
    if (BAC.run.tab !== tab || !BAC.run.ids[sysId]) { return ''; }
    var st = BAC.status[tab][sysId];
    return ' bac-in-run' + (st && ACTIVE_LABELS[st.label] ? ' bac-active' : '');
}

function setRowStatus(tab, sysId, label, note, href) {
    BAC.status[tab][sysId] = { label: label, note: note || '', href: href || '' };
    markRunRow(tab, sysId, label);
    if (tab === 'save') {
        var saveCell = byId('save-' + sysId);
        var saveApp = findApp('save', sysId);
        if (saveCell && saveApp) { saveCell.innerHTML = saveCellHtml(saveApp); }
        return;
    }
    var cell = byId('status-' + tab + '-' + sysId);
    if (cell) { cell.innerHTML = statusHtml(BAC.status[tab][sysId]); }
}

/* ---------- selection and filtering ---------- */

function findApp(tab, sysId) {
    var list = BAC.apps[tab];
    for (var i = 0; i < list.length; i++) {
        if (list[i].sys_id === sysId) { return list[i]; }
    }
    return null;
}

function isAtRisk(app) {
    var s = BAC.saveState[app.sys_id];
    return !s || s.saveStatus !== 'saved';
}

function isVisible(tab, app) {
    var f = BAC.filters[tab];
    if (f.q) {
        var hay = (app.name + ' ' + app.scope + ' ' + (app.version || '')).toLowerCase();
        if (hay.indexOf(f.q.toLowerCase()) === -1) { return false; }
    }
    if (f.failed) {
        var st = BAC.status[tab][app.sys_id];
        if (!st || st.label !== 'Failed') { return false; }
    }
    if (tab === 'restore') {
        if (f.upgrade && !app.upgradeAvailable) { return false; }
    } else {
        if (f.needs && !isAtRisk(app)) { return false; }
        var anyStatus = false;
        for (var k in f.statuses) {
            if (f.statuses[k]) { anyStatus = true; }
        }
        if (anyStatus) {
            var ss = BAC.saveState[app.sys_id];
            if (!ss || !f.statuses[ss.saveStatus]) { return false; }
        }
    }
    return true;
}

function visibleApps(tab) {
    var out = [];
    var list = BAC.apps[tab];
    for (var i = 0; i < list.length; i++) {
        if (isVisible(tab, list[i])) { out.push(list[i]); }
    }
    return out;
}

function isRowSelectable(tab, app) {
    if (tab !== 'restore') { return true; }
    return !app.gone && (app.upgradeAvailable || app.convertible);
}

function unselectableReason(app) {
    if (app.gone) { return 'Converted to dev mode. Reload the page to refresh the list.'; }
    return 'Nothing to upgrade, and the platform cannot convert this app to dev mode.';
}

function getCheckedRows(tab) {
    var out = [];
    var vis = visibleApps(tab);
    for (var i = 0; i < vis.length; i++) {
        if (BAC.checked[tab][vis[i].sys_id] && isRowSelectable(tab, vis[i])) { out.push(vis[i]); }
    }
    return out;
}

/* ---------- rendering ---------- */

function targetHtml(tab, app) {
    if (tab === 'restore') {
        if (app.isConverted && !app.restorable) {
            return '<span class="text-danger">Not in App Repo, cannot restore automatically</span>';
        }
        return app.latest_version ? esc(app.latest_version) : '<span class="text-muted">convert only</span>';
    }
    var s = BAC.saveState[app.sys_id];
    if (!s) { return '<span class="text-muted">...</span>'; }
    if (s.saveStatus === 'check_failed') { return '<span class="text-muted">&mdash;</span>'; }
    if (!s.nextVersion) { return esc(app.version); }
    return esc(app.version) + ' &rarr; ' + esc(s.nextVersion);
}

function installedHtml(tab, app) {
    var html = esc(app.version);
    return html;
}

function pad2(n) {
    return (n < 10 ? '0' : '') + n;
}

// Browser local time as 'yyyy-MM-dd HH:mm:ss', shifted by a number of seconds.
function localStamp(date, shiftSeconds) {
    var d = new Date(date.getTime() + shiftSeconds * 1000);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}

// Error level System Log entries created between two 'yyyy-MM-dd HH:mm:ss' stamps (user time zone).
function errorLogUrl(from, to) {
    var f = from.split(' ');
    var t = to.split(' ');
    var q = 'sys_created_onONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()' +
        '^level=2' +
        "^sys_created_on<=javascript:gs.dateGenerate('" + t[0] + "','" + t[1] + "')" +
        "^sys_created_on>=javascript:gs.dateGenerate('" + f[0] + "','" + f[1] + "')";
    return 'syslog_list.do?sysparm_query=' + encodeURIComponent(q) + '&sysparm_first_row=1&sysparm_view=';
}

function saveCellHtml(app) {
    // While a run is working on the app, or if it failed or was skipped, the run status takes the place of the save status.
    var run = BAC.status.save[app.sys_id];
    if (run && run.label !== 'Published') { return statusHtml(run); }
    var s = BAC.saveState[app.sys_id];
    if (!s) { return '<span class="text-muted">Checking...</span>'; }
    // Only where local changes may exist that are not in App Repo.
    var link = /^(changed|in_repo|check_failed)$/.test(s.saveStatus)
        ? '<div><a href="sys_metadata_list.do?sysparm_query=sys_scope%3D' + app.sys_id + '%5Esys_class_name!%3Dsys_metadata_delete&sysparm_view=" target="_blank">Recent changes</a></div>'
        : '';
    var def = SAVE_LABELS[s.saveStatus] || SAVE_LABELS.check_failed;
    var note = saveNote(s);
    var action = '';
    var logLink = '';
    if (s.saveStatus === 'check_failed') {
        logLink = s.logFrom && s.logTo ? '<div><a href="' + errorLogUrl(s.logFrom, s.logTo) + '" target="_blank">Error logs for this check</a></div>' : '';
        action = s.code === 'not_dev'
            ? ' <a href="#" data-action="reloadSave">Reload list</a>'
            : ' <a href="#" data-action="recheck" data-id="' + app.sys_id + '">Retry check</a>';
    }
    return '<span class="label ' + def[0] + '">' + def[1] + '</span>' +
        (note ? '<div class="' + (s.saveStatus === 'check_failed' ? 'text-danger' : 'text-muted') + '" style="font-size: 90%;' + (s.saveStatus === 'check_failed' ? ' white-space: pre-wrap;' : '') + '">' + esc(note) + action + '</div>' : '') + logLink + link;
}

function rowHtml(tab, app) {
    var selectable = isRowSelectable(tab, app);
    var checked = BAC.checked[tab][app.sys_id] && selectable;
    var rowClass = (selectable ? '' : 'text-muted') + runRowClass(tab, app.sys_id);
    var html = '<tr id="row-' + tab + '-' + app.sys_id + '"' + (rowClass ? ' class="' + rowClass + '"' : '') + '>' +
        '<td><input type="checkbox" class="bac-check" data-tab="' + tab + '" data-id="' + app.sys_id + '"' +
        (checked ? ' checked="checked"' : '') + (selectable ? '' : ' disabled="disabled" title="' + esc(unselectableReason(app)) + '"') + '/></td>' +
        '<td><strong>' + esc(app.name) + '</strong>' +
        (tab === 'restore' && app.upgradeAvailable && !app.gone ? ' <span class="label label-info">Upgrade</span>' : '') +
        '<br/><span class="text-muted">' + esc(app.scope) + '</span>' +
        ' <a href="sys_scope.do?sys_id=' + app.sys_id + '" target="_blank" title="Open record"><span class="glyphicon glyphicon-new-window"></span></a></td>' +
        '<td id="installed-' + tab + '-' + app.sys_id + '">' + installedHtml(tab, app) + '</td>' +
        '<td id="target-' + tab + '-' + app.sys_id + '">' + targetHtml(tab, app) + '</td>';
    if (tab === 'save') {
        html += '<td id="save-' + app.sys_id + '">' + saveCellHtml(app) + '</td></tr>';
    } else {
        html += '<td id="status-' + tab + '-' + app.sys_id + '">' + statusHtml(BAC.status[tab][app.sys_id]) + '</td></tr>';
    }
    return html;
}

function renderTable(tab) {
    var container = byId('table-' + tab);
    if (!container) { return; }
    var vis = visibleApps(tab);
    if (!BAC.loaded[tab]) {
        container.innerHTML = '<p class="text-muted"><em>Loading apps...</em></p>';
        return;
    }
    if (vis.length === 0) {
        container.innerHTML = '<p class="text-muted"><em>No apps to show.</em></p>';
        updateControls();
        return;
    }
    var allChecked = true;
    for (var c = 0; c < vis.length; c++) {
        if (isRowSelectable(tab, vis[c]) && !BAC.checked[tab][vis[c].sys_id]) { allChecked = false; }
    }
    var html = '<table id="tbl-' + tab + '" class="table table-condensed table-hover bac-table' + (BAC.run.tab === tab ? ' bac-running' : '') + '"><thead><tr>' +
        '<th style="width: 30px;"><input type="checkbox" class="bac-all" data-tab="' + tab + '"' + (allChecked ? ' checked="checked"' : '') + ' title="Check all visible"/></th>' +
        '<th>App</th><th>Local Version</th><th>Target Version</th>' +
        '<th>Status</th></tr></thead><tbody>';
    for (var i = 0; i < vis.length; i++) {
        html += rowHtml(tab, vis[i]);
    }
    html += '</tbody></table>';
    container.innerHTML = html;
    updateControls();
}

function renderBanner() {
    var el = byId('banner-save');
    if (!el) { return; }
    var list = BAC.apps.save;
    if (!BAC.loaded.save) { el.style.display = 'none'; return; }
    updateSaveChipCounts();
    var pending = 0, risk = 0, hiddenRisk = 0, failed = 0;
    for (var i = 0; i < list.length; i++) {
        var app = list[i];
        if (!BAC.saveState[app.sys_id]) { pending++; continue; }
        if (BAC.saveState[app.sys_id].saveStatus === 'check_failed') { failed++; }
        if (isAtRisk(app)) {
            risk++;
            if (!isVisible('save', app)) { hiddenRisk++; }
        }
    }
    el.style.display = 'block';
    if (pending > 0) {
        el.className = 'alert alert-info';
        el.textContent = 'Checking save status... ' + (list.length - pending) + ' of ' + list.length + ' apps checked.';
    } else if (risk > 0) {
        el.className = 'alert alert-warning';
        el.innerHTML = esc(risk + (risk === 1 ? ' app may have' : ' apps may have') + ' work that has not been saved yet and ' + (risk === 1 ? 'is a good candidate' : 'are good candidates') + ' for publishing before cloning.' +
            (hiddenRisk > 0 ? ' (' + hiddenRisk + ' hidden by filters)' : '')) +
            (failed > 0 ? '<div>' + esc(failed + (failed === 1 ? ' app' : ' apps') + ' could not be checked and ' + (failed === 1 ? 'is' : 'are') + ' selected so ' + (failed === 1 ? 'it is' : 'they are') + ' published.') +
                ' <a href="#" data-action="recheckAll">Retry all checks</a></div>' : '');
    } else {
        el.className = 'alert alert-success';
        el.textContent = 'All dev apps are published to the App Repo. Safe to clone.';
    }
}

function renderPrereqs() {
    var el = byId('prereq-strip');
    if (!el || !BAC.prereq) { return; }
    if (!BAC.prereq.switched) {
        el.style.display = 'none';
        return;
    }
    el.innerHTML = '<button type="button" class="close" data-action="dismissPrereq" title="Dismiss" aria-label="Dismiss">&times;</button>Scope changed to Global';
    el.style.display = '';
}

/* ---------- buttons ---------- */

function setButton(id, enabled, title) {
    var btn = byId(id);
    if (!btn) { return; }
    btn.disabled = !enabled;
    btn.title = enabled ? '' : (title || '');
}

function updateControls() {
    var blocked = BAC.busy ? 'A run is in progress.' : (BAC.loader ? 'Checking save status. This finishes shortly.' : '');
    var restoreSel = getCheckedRows('restore');
    var saveSel = getCheckedRows('save');
    var restoreMsg = blocked || (restoreSel.length === 0 ? 'Check at least one app.' : '');
    var saveMsg = blocked || (saveSel.length === 0 ? 'Check at least one app.' : '');
    setButton('btnRestoreAll', !restoreMsg, restoreMsg);
    setButton('btnUpgradeOnly', !restoreMsg, restoreMsg);
    setButton('btnConvertDevOnly', !restoreMsg, restoreMsg);
    setButton('btnPublishAll', !saveMsg, saveMsg);
    var anySaved = false;
    for (var i = 0; i < saveSel.length; i++) {
        if (canConvertToStore(saveSel[i])) { anySaved = true; }
    }
    setButton('btnConvertStore', !saveMsg && anySaved, saveMsg || 'Publish the checked apps first so they can be restored by upgrading after conversion.');
    setButton('btnLoadSaved', !blocked, blocked);
    setButton('btnSaveSelection', !blocked, blocked);
    var rc = byId('count-restore');
    if (rc) { rc.textContent = restoreSel.length + ' selected'; }
    var sc = byId('count-save');
    if (sc) { sc.textContent = saveSel.length + ' selected'; }
    var tabs = ['save', 'restore'];
    for (var t = 0; t < tabs.length; t++) {
        var li = byId('tab-' + tabs[t]);
        if (li) { li.className = BAC.tab === tabs[t] ? 'active' : ''; }
        var pane = byId('pane-' + tabs[t]);
        if (pane) { pane.style.display = BAC.tab === tabs[t] ? 'block' : 'none'; }
    }
}

function paneHtml(tab) {
    var html = '';
    if (tab === 'restore') {
        html += '<p class="bac-sub"><strong class="bac-sub-title">Company apps installed in store mode.</strong> <span class="text-muted">Run this right after the clone.</span></p>' +
            (BAC.refreshTipDismissed ? '' :
                '<div id="refresh-tip" class="alert alert-warning bac-refresh-tip">' +
                '<button type="button" class="close" data-action="dismissRefreshTip" title="Dismiss" aria-label="Dismiss">&times;</button>' +
                '<strong>After a clone, refresh <a target="_blank" href="%24mycompanyappsmgmt.do">My Company Applications</a> first.</strong> ' +
                'Then reload this page so the latest versions are visible here.' +
                '</div>') +
            '<div class="bac-toolbar">' +
            '<button type="button" id="btnRestoreAll" class="btn btn-primary" data-action="restoreAll">Upgrade and convert all</button> ' +
            '<button type="button" id="btnUpgradeOnly" class="btn btn-default btn-sm" data-action="upgradeOnly">Upgrade</button> ' +
            '<button type="button" id="btnConvertDevOnly" class="btn btn-default btn-sm" data-action="convertDevOnly">Convert to Dev</button> ' +
            '<input type="text" class="bac-search input-sm" data-tab="restore" placeholder="Search apps"/> ' +
            '<label class="checkbox-inline"><input type="checkbox" class="bac-chip" data-tab="restore" data-chip="upgrade"/> Upgrade available</label> ' +
            '<span id="count-restore" class="text-muted"></span> ' +
            '<a href="#" id="btnLoadSaved" data-action="loadSaved">Load saved list</a> ' +
            '<a href="#" id="btnSaveSelection" data-action="saveSelection">Save selection</a>' +
            '</div>';
    } else {
        html += '<p class="bac-sub"><strong class="bac-sub-title">Development mode apps.</strong> <span class="text-muted">Run this on your dev instance before it is cloned over.</span></p>' +
            '<div id="banner-save" class="alert alert-info" style="display: none;"></div>' +
            '<div class="bac-toolbar">' +
            '<button type="button" id="btnPublishAll" class="btn btn-primary" data-action="publishAll">Publish</button> ' +
            '<button type="button" id="btnConvertStore" class="btn btn-default btn-sm" data-action="convertStore">Convert to Store</button> ' +
            '<input type="text" class="bac-search input-sm" data-tab="save" placeholder="Search apps"/> ' +
            saveChipsHtml() +
            '<span id="count-save" class="text-muted"></span>' +
            '</div>';
    }
    html += '<div id="table-' + tab + '"></div>';
    return html;
}

/* ---------- loading ---------- */

function loadApps(tab, done) {
    callConsole('getApps', { sysparm_list: tab }, function(res) {
        if (!res.ok) {
            setSummary('Could not load apps: ' + esc(res.error || 'unknown error'), 'danger');
            if (done) { done(false); }
            return;
        }
        var apps = res.apps || [];
        var fresh = {};
        for (var i = 0; i < apps.length; i++) {
            var id = apps[i].sys_id;
            fresh[id] = true;
            if (BAC.checked[tab][id] === undefined) {
                BAC.checked[tab][id] = true;
            }
        }
        if (tab === 'save') {
            var prev = BAC.apps.save;
            for (var q = 0; q < prev.length; q++) {
                if (!fresh[prev[q].sys_id]) { delete BAC.saveState[prev[q].sys_id]; }
            }
        }
        // Apps a run converted to dev mode leave the store app list. Keep them on screen with their result until the page is reloaded.
        if (tab === 'restore') {
            var old = BAC.apps.restore;
            for (var k = 0; k < old.length; k++) {
                if (!fresh[old[k].sys_id] && BAC.status.restore[old[k].sys_id]) {
                    old[k].gone = true;
                    apps.push(old[k]);
                }
            }
            apps.sort(function(a, b) { return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0); });
        }
        BAC.apps[tab] = apps;
        BAC.loaded[tab] = true;
        renderTable(tab);
        if (tab === 'save') { renderBanner(); loadSaveStates(); }
        if (done) { done(true); }
    });
}

// Resumable, one app at a time. The checks do not depend on the application picker, so it is never switched here (switching shows an update set toast per app).
function loadSaveStates() {
    if (BAC.loader || BAC.busy) { return; }
    var pending = [];
    for (var i = 0; i < BAC.apps.save.length; i++) {
        var app = BAC.apps.save[i];
        if (!BAC.saveState[app.sys_id]) { pending.push(app); }
    }
    if (pending.length === 0) { applyDefaultSaveSelection(); return; }
    BAC.loader = true;
    updateControls();
    loadSaveStateNext(pending, 0);
}

function loadSaveStateNext(pending, index) {
    if (index >= pending.length || BAC.tab !== 'save' || BAC.busy) {
        BAC.loader = false;
        if (index >= pending.length) { applyDefaultSaveSelection(); }
        renderBanner();
        updateControls();
        return;
    }
    var app = pending[index];
    checkPublishState(app, 1, function() {
        var cell = byId('save-' + app.sys_id);
        if (cell) { cell.innerHTML = saveCellHtml(app); }
        var target = byId('target-save-' + app.sys_id);
        if (target) { target.innerHTML = targetHtml('save', app); }
        renderBanner();
        loadSaveStateNext(pending, index + 1);
    });
}

// One automatic retry before a row is marked Check failed.
function checkPublishState(app, attemptsLeft, done) {
    if (attemptsLeft === 1) { BAC.checkStart[app.sys_id] = new Date(); }
    callConsole('getPublishState', { sysparm_sys_id: app.sys_id }, function(res) {
        var failed = !res.ok || res.saveStatus === 'check_failed';
        if (failed && attemptsLeft > 0 && res.code !== 'not_dev') {
            checkPublishState(app, attemptsLeft - 1, done);
            return;
        }
        var began = BAC.checkStart[app.sys_id] || new Date();
        var ended = new Date();
        BAC.saveState[app.sys_id] = res.ok ? res : { saveStatus: 'check_failed', code: res.code || '', nextVersion: '', logFrom: localStamp(began, -5), logTo: localStamp(ended, 5),
            error: 'Save status check failed for ' + app.name + ' (scope ' + app.scope + ', sys_id ' + app.sys_id + ', version ' + (app.version || 'unknown') + ') after 2 attempts.\\n' +
                (res.error || 'No error detail was returned.') + '\\nBrowser time: ' + new Date().toISOString() + '.' };
        var st = BAC.saveState[app.sys_id];
        if (st.saveStatus === 'check_failed' && !st.logFrom) { st.logFrom = localStamp(began, -5); st.logTo = localStamp(ended, 5); }
        done();
    });
}

// Default selection is every app whose work is not in App Repo, unless the user already changed the selection.
function applyDefaultSaveSelection() {
    if (!BAC.touched.save) {
        for (var i = 0; i < BAC.apps.save.length; i++) {
            var app = BAC.apps.save[i];
            BAC.checked.save[app.sys_id] = isAtRisk(app);
        }
    }
    renderTable('save');
    renderBanner();
}

/* ---------- queues ---------- */

function beginQueue(tab) {
    BAC.busy = true;
    BAC.run = { tab: tab, ids: {} };
    var tbl = byId('tbl-' + tab);
    if (tbl) { tbl.classList.add('bac-running'); }
    window.onbeforeunload = function() { return 'A bulk run is still in progress.'; };
    setSummary('', '');
    updateControls();
}

// Apps published by the run are done, so they come back unchecked. Everything else keeps the user's selection.
function uncheckPublished() {
    for (var i = 0; i < BAC.apps.save.length; i++) {
        var app = BAC.apps.save[i];
        var st = BAC.saveState[app.sys_id];
        if (st && st.saveStatus === 'saved') { BAC.checked.save[app.sys_id] = false; }
    }
    renderTable('save');
}

function endQueue(run, tab) {
    BAC.busy = false;
    // Fade the dimming and highlight out before the list reloads.
    BAC.run = { tab: '', ids: {} };
    var tbl = byId('tbl-' + tab);
    if (tbl) {
        tbl.classList.remove('bac-running');
        var activeRows = tbl.querySelectorAll('tr.bac-active');
        for (var a = 0; a < activeRows.length; a++) { activeRows[a].classList.remove('bac-active'); }
    }
    window.onbeforeunload = null;
    var parts = [];
    if (run.published) { parts.push(run.published + ' published'); }
    if (run.upgraded) { parts.push(run.upgraded + ' upgraded'); }
    if (run.converted) { parts.push(run.converted + ' converted'); }
    if (run.skipped) { parts.push(run.skipped + ' skipped'); }
    if (run.failed) { parts.push(run.failed + ' failed'); }
    var html = esc(parts.length ? parts.join(', ') + '.' : 'Nothing to do.');
    if (run.failed) { html += ' <a href="#" data-action="showFailures">Show failures</a>'; }
    if (run.batchId) { html += ' <a href="sys_batch_install_plan.do?sys_id=' + run.batchId + '" target="_blank">Batch install plan</a>'; }
    setSummary(html, run.failed ? 'warning' : 'success');
    switchApplication('global', function() {
        loadApps(tab, function() {
            if (tab === 'save') { uncheckPublished(); }
            updateControls();
            if (tab === 'save') { loadSaveStates(); }
        });
    });
}

function newRun() {
    return { published: 0, upgraded: 0, converted: 0, skipped: 0, failed: 0, batchId: '' };
}

// kind is 'dev' (store app to dev mode) or 'store' (dev app to store mode).
function convertNext(kind, tab, rows, index, run, done) {
    if (index >= rows.length) { done(); return; }
    var row = rows[index];
    var appId = row.sys_id;
    function next() { convertNext(kind, tab, rows, index + 1, run, done); }
    function fail(note) {
        run.failed++;
        setRowStatus(tab, appId, 'Failed', note);
        next();
    }
    setRowStatus(tab, appId, 'Converting', '');

    var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
    ga.addParam('sysparm_name', 'start');
    ga.addParam('sysparm_function', kind === 'dev' ? 'convertToDevelopmentApp' : 'convertToStoreApp');
    ga.addParam('sysparm_sys_id', appId);
    ga.addParam('sysparm_progress_name', kind === 'dev' ? 'Converting Store application' : 'Converting application');
    ga.addParam('sysparm_ajax_processor', 'com.snc.apps.AppsAjaxProcessor');
    ga.addParam('sysparm_scope', 'global');
    ga.getXMLAnswer(function(answer) {
        if (answer && answer.trim() !== '') {
            pollTracker(answer.trim(), function() {
                run.converted++;
                setRowStatus(tab, appId, 'Converted', kind === 'dev' ? 'Now in dev mode' : 'Now in store mode');
                next();
            }, function(tracker) {
                fail(tracker && tracker.message ? tracker.message : 'Conversion failed.');
            });
        } else {
            fail('The conversion did not return a progress tracker.');
        }
    });
}

function convertStoreNext(rows, index, run, done) {
    convertNext('dev', 'restore', rows, index, run, done);
}

function convertDevNext(rows, index, run, done) {
    convertNext('store', 'save', rows, index, run, done);
}

/* ---------- After Clone: restore ---------- */

function waitForBatch(res, onDone) {
    var attempts = 0;
    var finished = false;
    var cancelTracker = pollTracker(res.trackerId, function() {}, function(tracker) {
        if (finished) { return; }
        finished = true;
        clearInterval(timer);
        onDone(false, tracker && tracker.message ? tracker.message : 'The upgrade tracker reported a failure.');
    });
    var timer = setInterval(function() {
        if (finished) { return; }
        attempts++;
        callConsole('getBatchState', { sysparm_batch_id: res.batchId }, function(state) {
            if (finished) { return; }
            if (state.ok && state.state === 'installed') {
                finished = true; clearInterval(timer); cancelTracker();
                onDone(true, '');
            } else if (state.ok && /^(failed|invalid|rolled_back|partial_install)$/.test(state.state)) {
                finished = true; clearInterval(timer); cancelTracker();
                onDone(false, 'Batch install ended as ' + state.stateLabel + '.');
            } else if (attempts >= 360) {
                finished = true; clearInterval(timer); cancelTracker();
                onDone(false, 'Still running after 30 minutes. Check the batch install plan.');
            }
        });
    }, 5000);
}

function onRestoreRun(mode) {
    var rows = getCheckedRows('restore');
    if (rows.length === 0) { return; }
    var run = newRun();
    var upRows = [];
    var i;
    if (mode !== 'convert') {
        for (i = 0; i < rows.length; i++) {
            if (rows[i].upgradeAvailable) { upRows.push(rows[i]); }
        }
    }
    beginQueue('restore');
    for (i = 0; i < rows.length; i++) { setRowStatus('restore', rows[i].sys_id, 'Pending', ''); }

    function convertPhase() {
        if (mode === 'upgrade') {
            for (var u = 0; u < rows.length; u++) {
                if (!rows[u].upgradeAvailable) {
                    run.skipped++;
                    setRowStatus('restore', rows[u].sys_id, 'Skipped', 'No newer version in the App Repo.');
                }
            }
            finishRestore();
            return;
        }
        loadApps('restore', function(ok) {
            var todo = [];
            for (var j = 0; j < rows.length; j++) {
                var fresh = findApp('restore', rows[j].sys_id);
                var st = BAC.status.restore[rows[j].sys_id];
                if (st && st.label === 'Failed') { continue; }
                if (mode === 'both' && fresh && fresh.isConverted && !fresh.restorable) {
                    // Converting now would keep the 0.0.0-CONVERTED copy instead of the App Repo version.
                    run.skipped++;
                    setRowStatus('restore', rows[j].sys_id, 'Skipped', 'No App Repo version found to upgrade to. Use Convert to Dev to convert it as it is.');
                } else if (fresh && fresh.convertible) {
                    todo.push(fresh);
                } else {
                    run.skipped++;
                    setRowStatus('restore', rows[j].sys_id, 'Skipped', 'Not eligible to convert to dev mode.');
                }
            }
            convertStoreNext(todo, 0, run, finishRestore);
        });
    }
    function finishRestore() { endQueue(run, 'restore'); }

    if (upRows.length === 0) {
        convertPhase();
        return;
    }
    var ids = [];
    for (i = 0; i < upRows.length; i++) { ids.push(upRows[i].sys_id); }
    for (i = 0; i < upRows.length; i++) { setRowStatus('restore', upRows[i].sys_id, 'Upgrading', upRows[i].version + ' to ' + upRows[i].latest_version); }
    callConsole('startUpgrade', { sysparm_sys_ids: ids.join(',') }, function(res) {
        if (!res.ok || !res.batchId) {
            for (var f = 0; f < upRows.length; f++) {
                run.failed++;
                setRowStatus('restore', upRows[f].sys_id, 'Failed', res.error || 'The upgrade did not start.');
            }
            finishRestore();
            return;
        }
        run.batchId = res.batchId;
        BAC.batchId = res.batchId;
        waitForBatch(res, function(ok, message) {
            for (var k = 0; k < upRows.length; k++) {
                if (ok) {
                    run.upgraded++;
                    setRowStatus('restore', upRows[k].sys_id, 'Upgraded', 'Now at ' + upRows[k].latest_version, 'sys_batch_install_plan.do?sys_id=' + res.batchId);
                } else {
                    run.failed++;
                    setRowStatus('restore', upRows[k].sys_id, 'Failed', message, 'sys_batch_install_plan.do?sys_id=' + res.batchId);
                }
            }
            if (ok) { convertPhase(); } else { finishRestore(); }
        });
    });
}

/* ---------- Before Clone: publish and convert to store ---------- */

function onPublishAll() {
    var rows = getCheckedRows('save');
    if (rows.length === 0) { return; }
    var run = newRun();
    beginQueue('save');
    for (var i = 0; i < rows.length; i++) { setRowStatus('save', rows[i].sys_id, 'Pending', ''); }
    publishNext(rows, 0, run);
}

function publishNext(rows, index, run) {
    if (index >= rows.length) {
        endQueue(run, 'save');
        return;
    }
    var appId = rows[index].sys_id;
    setRowStatus('save', appId, 'Publishing', '');
    switchApplication(appId, function() {
        publishApp(rows, index, run);
    });
}

function publishApp(rows, index, run) {
    var appId = rows[index].sys_id;
    var ga = new GlideAjax('BulkPublishMyCompanyApps');
    ga.addParam('sysparm_name', 'getNextPublishVersion');
    ga.addParam('sysparm_sys_id', appId);
    ga.getXMLAnswer(function(answer) {
        var info = null;
        try {
            info = JSON.parse(answer);
        } catch (err) {
            info = null;
        }
        if (!info || !info.ok) {
            run.failed++;
            setRowStatus('save', appId, 'Failed', info && info.error ? info.error : rows[index].name + ': could not determine the next version.');
            publishNext(rows, index + 1, run);
            return;
        }
        startPublish(appId, info, run, function() {
            publishNext(rows, index + 1, run);
        });
    });
}

// The version the next publish will start from: one minor above the version just published.
function nextMinorVersion(version) {
    var parts = String(version).split('.');
    return (parseInt(parts[0], 10) || 0) + '.' + ((parseInt(parts[1], 10) || 0) + 1) + '.0';
}

function startPublish(appId, info, run, onDone) {
    function fail(detail) {
        run.failed++;
        setRowStatus('save', appId, 'Failed', info.appName + ': publish failed. Version on record: ' + info.currentVersion +
            '. Last attempted version: ' + info.nextVersion + '.' + (detail ? ' ' + detail : ''));
        onDone();
    }

    var ga = new GlideAjax('sn_appauthor.ScopedAppUploaderAJAX');
    ga.addParam('sysparm_name', 'start');
    ga.addParam('sysparm_sys_id', appId);
    ga.addParam('sysparm_version', info.nextVersion);
    ga.addParam('sysparm_dev_notes', 'Published by Bulk Store App Converter');
    ga.addParam('sysparm_username', '');
    ga.addParam('sysparm_password', '');
    ga.addParam('sysparm_publish_to_store', 'false');
    ga.addParam('sysparm_target_upload_URL', '');
    ga.addParam('sysparm_is_customization', '');
    ga.addParam('sysparm_ajax_processor', 'sn_appauthor.ScopedAppUploaderAJAX');
    ga.getXMLAnswer(function(answer) {
        var trackerId = answer ? answer.trim() : '';
        if (/^[0-9a-f]{32}$/i.test(trackerId)) {
            pollTracker(trackerId, function() {
                run.published++;
                setRowStatus('save', appId, 'Published', 'Published v' + info.nextVersion + ' (was v' + info.currentVersion + ')');
                BAC.saveState[appId] = { saveStatus: 'saved', nextVersion: nextMinorVersion(info.nextVersion), currentVersion: info.nextVersion };
                var app = findApp('save', appId);
                if (app) { app.version = info.nextVersion; }
                var cell = byId('save-' + appId);
                if (cell && app) { cell.innerHTML = saveCellHtml(app); }
                renderBanner();
                callConsole('recordPublish', { sysparm_sys_id: appId }, function() {
                    onDone();
                });
            }, function(tracker) {
                fail(tracker && tracker.message ? 'Tracker said: ' + tracker.message : '');
            });
        } else {
            fail(trackerId ? 'Unexpected response from uploader: ' + trackerId : 'The uploader did not return a progress tracker.');
        }
    });
}

// Published apps, and apps whose version a conversion reset while the App Repo still has them. Both can be restored by upgrading.
function canConvertToStore(app) {
    var s = BAC.saveState[app.sys_id];
    if (!s) { return false; }
    return s.saveStatus === 'saved' || (s.isConverted && !!s.repoVersion);
}

function onConvertStore() {
    var rows = getCheckedRows('save');
    var ok = [];
    var skipped = [];
    for (var i = 0; i < rows.length; i++) {
        var s = BAC.saveState[rows[i].sys_id];
        if (canConvertToStore(rows[i])) { ok.push(rows[i]); } else { skipped.push(rows[i]); }
    }
    if (ok.length === 0) { return; }
    var msg = 'Convert ' + ok.length + ' app(s) to store mode?';
    if (skipped.length > 0) {
        var names = [];
        for (var n = 0; n < skipped.length; n++) { names.push(skipped[n].name); }
        msg += '\\n\\nSkipped because they are not saved in App Repo (publish them first so they can be restored by upgrading after conversion):\\n' + names.join('\\n');
    }
    if (!window.confirm(msg)) { return; }
    var run = newRun();
    beginQueue('save');
    for (var s1 = 0; s1 < skipped.length; s1++) {
        run.skipped++;
        setRowStatus('save', skipped[s1].sys_id, 'Skipped', 'Publish this app first so it can be restored by upgrading after conversion.');
    }
    for (var p = 0; p < ok.length; p++) { setRowStatus('save', ok[p].sys_id, 'Pending', ''); }
    convertDevNext(ok, 0, run, function() { endQueue(run, 'save'); });
}

/* ---------- saved list (Phase 3) ---------- */

function onLoadSaved() {
    callConsole('getSavedList', {}, function(res) {
        if (!res.ok) { setSummary('Could not load the saved list: ' + esc(res.error || ''), 'danger'); return; }
        applySavedList(res.scopes || []);
    });
}

function applySavedList(scopes) {
    var set = {};
    for (var i = 0; i < scopes.length; i++) { set[scopes[i]] = true; }
    for (var j = 0; j < BAC.apps.restore.length; j++) {
        var app = BAC.apps.restore[j];
        BAC.checked.restore[app.sys_id] = !!set[app.scope];
    }
    BAC.touched.restore = true;
    renderTable('restore');
}

function onSaveSelection() {
    var rows = getCheckedRows('restore');
    var scopes = [];
    for (var i = 0; i < rows.length; i++) { scopes.push(rows[i].scope); }
    callConsole('saveSavedList', { sysparm_scopes: scopes.join(',') }, function(res) {
        setSummary(res.ok ? 'Saved ' + res.scopes.length + ' scopes to bulk_convert_store_app.convertible_apps.' : 'Could not save the list: ' + esc(res.error || ''), res.ok ? 'success' : 'danger');
    });
}

/* ---------- events ---------- */

function setTab(tab) {
    BAC.tab = tab;
    try { window.localStorage.setItem('bulk_app_clone_tab', tab); } catch (e) { /* storage may be blocked */ }
    updateControls();
    renderPrereqs();
    if (BAC.busy) { return; }
    // Converting moves apps between the two lists, so reload the list every time a tab opens.
    if (tab === 'restore') {
        BAC.status.restore = {};
        syncAppRepo(function() { loadApps('restore'); });
    } else {
        loadApps(tab);
    }
}

function onClick(ev) {
    var target = ev.target || ev.srcElement;
    var link = target.closest ? target.closest('[data-tab],[data-action]') : null;
    if (!link) { return; }
    var action = link.getAttribute('data-action');
    var tabName = link.getAttribute('data-tab');
    if (tabName && !action && link.tagName === 'A') {
        ev.preventDefault();
        if (!BAC.busy) { setTab(tabName); }
        return;
    }
    if (!action || link.disabled) { return; }
    ev.preventDefault();
    if (action === 'restoreAll') { onRestoreRun('both'); }
    else if (action === 'upgradeOnly') { onRestoreRun('upgrade'); }
    else if (action === 'convertDevOnly') { onRestoreRun('convert'); }
    else if (action === 'dismissPrereq') {
        BAC.prereq.switched = false;
        byId('prereq-strip').style.display = 'none';
    }
    else if (action === 'dismissRefreshTip') {
        BAC.refreshTipDismissed = true;
        var tip = byId('refresh-tip');
        if (tip) { tip.parentNode.removeChild(tip); }
    }
    else if (action === 'publishAll') { onPublishAll(); }
    else if (action === 'convertStore') { onConvertStore(); }
    else if (action === 'loadSaved') { if (!BAC.busy) { onLoadSaved(); } }
    else if (action === 'saveSelection') { if (!BAC.busy) { onSaveSelection(); } }
    else if (action === 'recheck') { if (!BAC.busy) { delete BAC.saveState[link.getAttribute('data-id')]; loadSaveStates(); } }
    else if (action === 'recheckAll') {
        if (!BAC.busy) {
            for (var r = 0; r < BAC.apps.save.length; r++) {
                var st = BAC.saveState[BAC.apps.save[r].sys_id];
                if (st && st.saveStatus === 'check_failed') { delete BAC.saveState[BAC.apps.save[r].sys_id]; }
            }
            loadSaveStates();
        }
    }
    else if (action === 'reloadSave') { if (!BAC.busy) { loadApps('save'); } }
    else if (action === 'showFailures') {
        BAC.filters[BAC.tab].failed = true;
        renderTable(BAC.tab);
    }
}

function onChange(ev) {
    var target = ev.target || ev.srcElement;
    var cls = target.className || '';
    var tab = target.getAttribute('data-tab');
    if (/bac-all/.test(cls)) {
        var vis = visibleApps(tab);
        for (var i = 0; i < vis.length; i++) {
            if (isRowSelectable(tab, vis[i])) { BAC.checked[tab][vis[i].sys_id] = target.checked; }
        }
        BAC.touched[tab] = true;
        renderTable(tab);
    } else if (/bac-check/.test(cls)) {
        BAC.checked[tab][target.getAttribute('data-id')] = target.checked;
        BAC.touched[tab] = true;
        updateControls();
    } else if (/bac-chip/.test(cls)) {
        if (target.getAttribute('data-chip') === 'status') {
            BAC.filters[tab].statuses[target.getAttribute('data-status')] = target.checked;
        } else {
            BAC.filters[tab][target.getAttribute('data-chip')] = target.checked;
        }
        renderTable(tab);
        if (tab === 'save') { renderBanner(); }
    }
}

function onInput(ev) {
    var target = ev.target || ev.srcElement;
    if (/bac-search/.test(target.className || '')) {
        var tab = target.getAttribute('data-tab');
        BAC.filters[tab].q = target.value;
        renderTable(tab);
    }
}

function getUrlParam(name) {
    var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : '';
}

function initPage() {
    var root = byId('bac-root');
    if (!root) { return; }
    byId('pane-save').innerHTML = paneHtml('save');
    byId('pane-restore').innerHTML = paneHtml('restore');
    root.addEventListener('click', onClick);
    root.addEventListener('change', onChange);
    root.addEventListener('input', onInput);

    var tab = getUrlParam('sysparm_tab');
    if (tab !== 'save' && tab !== 'restore') {
        tab = '';
        try { tab = window.localStorage.getItem('bulk_app_clone_tab') || ''; } catch (e) { tab = ''; }
        if (tab !== 'save' && tab !== 'restore') { tab = 'restore'; }
    }
    BAC.tab = tab;
    updateControls();

    callConsole('getPrereqs', {}, function(p) {
        if (!p.ok) {
            setSummary('Could not check prerequisites: ' + esc(p.error || 'unknown error'), 'danger');
            return;
        }
        BAC.prereq = p;
        function start() {
            renderPrereqs();
            function load() {
                loadApps(BAC.tab, function(ok) {
                    if (ok && BAC.tab === 'restore' && getUrlParam('sysparm_saved') === 'true') { onLoadSaved(); }
                });
            }
            if (BAC.tab === 'restore') { syncAppRepo(load); } else { load(); }
        }
        if (!p.isGlobal) {
            switchApplication('global', function() {
                p.switched = true;
                start();
            });
        } else {
            start();
        }
    });
}

addLoadEvent(initPage);
`,
    $meta: {
        useEsLatest: true,
    },
})
