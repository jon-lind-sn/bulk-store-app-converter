var BulkAppConsole = Class.create();
BulkAppConsole.prototype = Object.extendsObject(global.AbstractAjaxProcessor, (function() {

    var SAVED_LIST_PROPERTY = 'bulk_convert_store_app.convertible_apps';
    var PUBLISH_LOG_PROPERTY = 'bulk_convert_store_app.publish_log';
    var NOT_ADMIN = JSON.stringify({ ok: false, error: 'admin role required' });

    function isConvertedVersion(version) {
        return /CONVERTED/i.test(String(version || ''));
    }

    function toList(csv) {
        var seen = {};
        var out = [];
        var parts = String(csv || '').split(',');
        for (var i = 0; i < parts.length; i++) {
            var v = parts[i].trim();
            if (v && !seen[v]) {
                seen[v] = true;
                out.push(v);
            }
        }
        return out;
    }

    function numeric(dateTimeStr) {
        if (!dateTimeStr) return 0;
        return new GlideDateTime(dateTimeStr).getNumericValue();
    }

    function getRestoreApps() {
        var upgrader = new global.BulkUpgradeMyCompanyApps();
        var apps = [];
        var prevName;
        var gr = new GlideRecord('sys_store_app');
        gr.addQuery('is_store_app', false);
        gr.orderBy('name');
        gr.query();
        while (gr.next()) {
            var name = gr.getValue('name');
            // Same name dedupe as upgradeByIds so the table matches what the upgrade will do.
            if (name === prevName) continue;
            prevName = name;
            var sysId = gr.getUniqueValue();
            var version = gr.getValue('version') || '';
            var latest = gr.getValue('latest_version') || '';
            var convertible = false;
            try {
                convertible = !!sn_app_api.AppStoreAPI.canConvertSysStoreApp(sysId);
            } catch (e) {
                gs.error('BulkAppConsole: error checking convertibility for ' + sysId + ': ' + e);
            }
            apps.push({
                sys_id: sysId,
                name: name || sysId,
                scope: gr.getValue('scope') || '',
                version: version,
                latest_version: latest,
                upgradeAvailable: upgrader.updateAvailable(gr),
                convertible: convertible,
                isConverted: isConvertedVersion(version),
                restorable: !!latest && !isConvertedVersion(latest)
            });
        }
        return apps;
    }

    function getSaveApps() {
        var apps = [];
        var gr = new GlideRecord('sys_app');
        // sys_store_app extends sys_app, so restrict to true dev mode apps.
        gr.addQuery('sys_class_name', 'sys_app');
        gr.orderBy('name');
        gr.query();
        while (gr.next()) {
            var sysId = gr.getUniqueValue();
            try {
                if (!sn_app_api.AppStoreAPI.canConvertSysApp(sysId)) continue;
            } catch (e) {
                gs.error('BulkAppConsole: error checking convertibility for ' + sysId + ': ' + e);
                continue;
            }
            var scope = gr.getValue('scope') || '';
            apps.push({
                sys_id: sysId,
                name: gr.getValue('name') || sysId,
                scope: scope,
                version: gr.getValue('version') || '',
                isConverted: isConvertedVersion(gr.getValue('version'))
            });
        }
        return apps;
    }

    function getLastChanged(appId) {
        // Publishing writes the app record and a sys_upgrade_plan_item, so ignore those.
        var latest = '';
        var gr = new GlideRecord('sys_metadata');
        gr.addQuery('sys_scope', appId);
        gr.addQuery('sys_class_name', 'NOT IN', 'sys_app,sys_store_app,sys_scope,sys_upgrade_plan_item');
        gr.orderByDesc('sys_updated_on');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) latest = gr.getValue('sys_updated_on');

        // Customer updates catch local edits whose file timestamp was not moved.
        var xml = new GlideRecord('sys_update_xml');
        xml.addQuery('application', appId);
        xml.addQuery('name', 'NOT LIKE', 'sys_app_%');
        xml.addQuery('name', 'NOT LIKE', 'sys_upgrade_plan_item_%');
        xml.orderByDesc('sys_updated_on');
        xml.setLimit(1);
        xml.query();
        if (xml.next() && numeric(xml.getValue('sys_updated_on')) > numeric(latest)) latest = xml.getValue('sys_updated_on');
        return latest;
    }

    function getLastPublished(appId, scope, version) {
        // 1. Each publish creates a sys_upgrade_plan_item with id = app sys_id and the published version (spiked on xare).
        var gr = new GlideRecord('sys_upgrade_plan_item');
        gr.addQuery('id', appId);
        gr.addQuery('version', version);
        gr.orderByDesc('sys_created_on');
        gr.setLimit(1);
        gr.query();
        if (gr.next()) {
            return gr.getValue('sys_created_on');
        }
        // 2. Timestamp written by this page after a publish.
        try {
            var log = JSON.parse(gs.getProperty(PUBLISH_LOG_PROPERTY, '{}'));
            if (log && log[scope]) return log[scope];
        } catch (e) {
            // fall through to in_repo
        }
        return '';
    }

    function repoHost() {
        var url = gs.getProperty('sn_appclient.repository_base_url', '') || '';
        return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    }

    /**
     * Finds App Repo's latest version of an app with verify_version probes. verify_version accepts a version only when it is
     * above the repo's latest, so the latest is the highest version it rejects. Searches major, then minor, then patch.
     * Only called when the repo has some version below the current one. Returns '' if the search does not settle.
     * A converted version (0.0.0-CONVERTED) says nothing about the repo, so the search then has no upper bound.
     */
    function findRepoLatest(obtainer, appId, currentVersion) {
        var cur = String(currentVersion || '').split('.');
        var curParts = isConvertedVersion(currentVersion) ? [-1, -1, -1] : [parseInt(cur[0], 10) || 0, parseInt(cur[1], 10) || 0, parseInt(cur[2], 10) || 0];
        var calls = 0;
        function rejected(parts) {
            calls++;
            var info = obtainer.obtainDisplayVersionFromAppRepo(appId, parts.join('.'), 'false');
            return !(info && info.allowed === true);
        }
        // Highest n in [lo, hi] where test(n) is true, given test(lo) is true. hi < 0 means no known upper bound.
        function highest(lo, hi, test) {
            if (hi < 0) {
                hi = Math.max(lo, 1);
                while (test(hi) && hi < 4096) { lo = hi; hi = hi * 2; }
                if (hi >= 4096 && test(hi)) return hi;
                hi = hi - 1;
            }
            while (lo < hi) {
                var mid = Math.floor((lo + hi + 1) / 2);
                if (test(mid)) { lo = mid; } else { hi = mid - 1; }
            }
            return lo;
        }
        var major = highest(0, curParts[0], function(n) { return n === 0 || rejected([n, 0, 0]); });
        var minorCap = major === curParts[0] ? curParts[1] : -1;
        var minor = highest(0, minorCap, function(n) { return (major === 0 && n === 0) || rejected([major, n, 0]); });
        var patchCap = major === curParts[0] && minor === curParts[1] ? curParts[2] : -1;
        var patchFloor = major === 0 && minor === 0 ? 1 : 0;
        var patch = highest(patchFloor, patchCap, function(n) { return n === patchFloor || rejected([major, minor, n]); });
        var found = [major, minor, patch];
        // Sanity check: the found version is rejected and the next patch is accepted.
        if (!rejected(found) || rejected([major, minor, patch + 1])) return '';
        gs.debug('BulkAppConsole.findRepoLatest ' + appId + ' -> ' + found.join('.') + ' in ' + calls + ' calls');
        return found.join('.');
    }

    function getPublishState(appId) {
        var result = { ok: false, saveStatus: 'check_failed', repoHost: repoHost(), repoVersion: '', currentVersion: '', lastChanged: '', lastPublished: '', nextVersion: '', isConverted: false, error: '' };
        var appGR = new GlideRecord('sys_app');
        if (!appId || !appGR.get(appId) || appGR.getValue('sys_class_name') !== 'sys_app') {
            result.code = 'not_dev';
            result.error = 'This app is no longer in development mode.';
            return result;
        }
        result.currentVersion = appGR.getValue('version') || '';
        result.isConverted = isConvertedVersion(result.currentVersion);
        var scope = appGR.getValue('scope') || '';
        var step = 'start';
        var startedAt = new GlideDateTime();

        try {
            step = 'create ScopedAppVendorInfoObtainer';
            var obtainer = new sn_appauthor.ScopedAppVendorInfoObtainer();
            step = 'ask the App Repo (verify_version) whether version ' + result.currentVersion + ' is new';
            var gate = isConvertedVersion(result.currentVersion) ? { allowed: true } : obtainer.obtainDisplayVersionFromAppRepo(appId, result.currentVersion, 'false');
            if (gate && gate.allowed === true) {
                // verify_version only accepts versions above the repo's latest, so 0.0.1 is accepted only when the repo has no version at all.
                step = 'ask the App Repo (verify_version) whether 0.0.1 is new';
                var floor = obtainer.obtainDisplayVersionFromAppRepo(appId, '0.0.1', 'false');
                if (floor && floor.allowed === true) {
                    result.saveStatus = 'not_in_repo';
                } else {
                    result.saveStatus = 'unpublished_version';
                    step = 'search for the App Repo latest version (findRepoLatest)';
                    result.repoVersion = findRepoLatest(obtainer, appId, result.currentVersion);
                }
            } else {
                step = 'read the latest local change (getLastChanged)';
                result.lastChanged = getLastChanged(appId);
                step = 'read the publish record (getLastPublished)';
                result.lastPublished = getLastPublished(appId, scope, result.currentVersion);
                if (result.lastPublished && result.lastChanged) {
                    result.saveStatus = numeric(result.lastChanged) > numeric(result.lastPublished) ? 'changed' : 'saved';
                } else if (result.lastPublished) {
                    result.saveStatus = 'saved';
                } else {
                    // App Repo has this version, but this instance has no publish record to compare against.
                    result.saveStatus = 'in_repo';
                }
            }
        } catch (e) {
            gs.error('BulkAppConsole.getPublishState verify failed for ' + appId + ': ' + e);
            result.saveStatus = 'check_failed';
            // Window for the System Log link, in the user's time zone, padded by 5 seconds.
            var winFrom = new GlideDateTime(startedAt.getValue());
            winFrom.addSeconds(-5);
            var winTo = new GlideDateTime();
            winTo.addSeconds(5);
            result.logFrom = winFrom.getDisplayValueInternal();
            result.logTo = winTo.getDisplayValueInternal();
            result.error = 'Could not check the App Repo for ' + (appGR.getValue('name') || appId) + ' (scope ' + scope + ', sys_id ' + appId + ', version ' + result.currentVersion + ').\n' +
                'Failed while trying to: ' + step + '.\n' +
                'Error: ' + e + (e && e.lineNumber ? ' (line ' + e.lineNumber + (e.fileName ? ' of ' + e.fileName : '') + ')' : '') + (e && e.stack ? '\nStack: ' + String(e.stack).substring(0, 600) : '') + '\n' +
                'App Repo host: ' + (repoHost() || 'sn_appclient.repository_base_url is empty') + '. Run by ' + gs.getUserName() + ' on ' + gs.getProperty('instance_name', '') + ' at ' + new GlideDateTime().getValue() + ' UTC.\n' +
                'The error logs link below shows System Log errors from the time of this check (search BulkAppConsole.getPublishState).';
        }

        try {
            var next = new global.BulkPublishMyCompanyApps().findNextPublishableVersion(appId, result.currentVersion);
            result.nextVersion = next.version || '';
            if (!result.nextVersion && next.repoError) result.error = next.repoError;
        } catch (e2) {
            gs.error('BulkAppConsole.getPublishState next version failed for ' + appId + ': ' + e2);
        }
        result.ok = true;
        return result;
    }

    function guarded(name, fn) {
        if (!gs.hasRole('admin')) return NOT_ADMIN;
        try {
            return JSON.stringify(fn());
        } catch (e) {
            gs.error('BulkAppConsole.' + name + ' failed: ' + e);
            return JSON.stringify({ ok: false, error: 'Server error in ' + name + ': ' + e });
        }
    }

    return {
        /** sysparm_list = restore or save. Returns { ok, apps }. */
        getApps: function() {
            var tab = String(this.getParameter('sysparm_list') || '');
            return guarded('getApps', function() {
                return { ok: true, apps: tab === 'save' ? getSaveApps() : getRestoreApps() };
            });
        },

        /** Returns { ok, isGlobal }. */
        getPrereqs: function() {
            return guarded('getPrereqs', function() {
                return { ok: true, isGlobal: gs.getCurrentApplicationScope() === 'global' };
            });
        },

        /** sysparm_sys_ids = comma list of sys_store_app sys_ids. */
        startUpgrade: function() {
            var ids = toList(String(this.getParameter('sysparm_sys_ids') || ''));
            return guarded('startUpgrade', function() {
                var res = new global.BulkUpgradeMyCompanyApps().upgradeByIds(ids);
                var packages = [];
                for (var i = 0; i < res.packages.length; i++) {
                    var p = res.packages[i];
                    packages.push({ sys_id: p.id, name: p.displayName, from: p.fromVersion, to: p.requested_version });
                }
                return { ok: true, packages: packages, batchId: res.batchId, trackerId: res.trackerId };
            });
        },

        /** sysparm_sys_id = sys_app sys_id. */
        getPublishState: function() {
            var appId = String(this.getParameter('sysparm_sys_id') || '');
            return guarded('getPublishState', function() {
                return getPublishState(appId);
            });
        },

        /** sysparm_batch_id. Returns { ok, state, stateLabel }. */
        getBatchState: function() {
            var batchId = String(this.getParameter('sysparm_batch_id') || '');
            return guarded('getBatchState', function() {
                var gr = new GlideRecord('sys_batch_install_plan');
                if (!batchId || !gr.get(batchId)) return { ok: false, error: 'Batch install plan not found.' };
                return { ok: true, state: gr.getValue('state'), stateLabel: gr.state.getDisplayValue() };
            });
        },

        /** sysparm_sys_id. Records a publish time for the app scope in the publish_log property. */
        recordPublish: function() {
            var appId = String(this.getParameter('sysparm_sys_id') || '');
            return guarded('recordPublish', function() {
                var gr = new GlideRecord('sys_app');
                if (!appId || !gr.get(appId)) return { ok: false, error: 'Application not found in sys_app.' };
                var log = {};
                try {
                    log = JSON.parse(gs.getProperty(PUBLISH_LOG_PROPERTY, '{}')) || {};
                } catch (e) {
                    log = {};
                }
                log[gr.getValue('scope')] = new GlideDateTime().getValue();
                gs.setProperty(PUBLISH_LOG_PROPERTY, JSON.stringify(log));
                return { ok: true };
            });
        },

        /** Phase 3. Returns { ok, scopes }. */
        getSavedList: function() {
            return guarded('getSavedList', function() {
                return { ok: true, scopes: toList(gs.getProperty(SAVED_LIST_PROPERTY, '')) };
            });
        },

        /** Phase 3. sysparm_scopes = comma list, trimmed and deduped before saving. */
        saveSavedList: function() {
            var scopes = toList(String(this.getParameter('sysparm_scopes') || ''));
            return guarded('saveSavedList', function() {
                gs.setProperty(SAVED_LIST_PROPERTY, scopes.join(','));
                return { ok: true, scopes: scopes };
            });
        },

        type: 'BulkAppConsole'
    };
})());
