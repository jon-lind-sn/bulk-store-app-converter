(function(outputs, steps, params, stepResult, assertEqual) {
    // Runs as an admin. Only read only endpoints and the not found / empty input branches of the others are called.
    // Not called here: saveSavedList, startUpgrade with ids, recordPublish for a real app, getPublishState for a real dev app
    // (it asks the App Repo), and getNextPublishVersion for a real app (same reason).
    var NONE = '00000000000000000000000000000000';

    function call(cls, method, params) {
        var inst = new global[cls]();
        inst.getParameter = function(name) {
            return params && params[name] !== undefined ? params[name] : '';
        };
        return JSON.parse(inst[method]());
    }

    describe('BulkAppConsole as an admin', function() {
        it('is running as an admin', function() {
            expect(gs.hasRole('admin')).toBe(true);
        });

        it('getPrereqs reports whether the current scope is global', function() {
            var r = call('BulkAppConsole', 'getPrereqs');
            expect(r.ok).toBe(true);
            expect(r.isGlobal).toBe(gs.getCurrentApplicationScope() === 'global');
        });

        it('getSavedList returns the trimmed, deduped scopes from the property', function() {
            var seen = {};
            var expected = [];
            var parts = String(gs.getProperty('bulk_convert_store_app.convertible_apps', '')).split(',');
            for (var i = 0; i < parts.length; i++) {
                var v = parts[i].trim();
                if (v && !seen[v]) {
                    seen[v] = true;
                    expected.push(v);
                }
            }
            var r = call('BulkAppConsole', 'getSavedList');
            expect(r.ok).toBe(true);
            expect(r.scopes).toEqual(expected);
        });

        it('getApps for the Before Clone tab lists only development mode apps', function() {
            var r = call('BulkAppConsole', 'getApps', { sysparm_list: 'save' });
            expect(r.ok).toBe(true);
            expect(Array.isArray(r.apps)).toBe(true);
            for (var i = 0; i < r.apps.length; i++) {
                var a = r.apps[i];
                var gr = new GlideRecord('sys_app');
                expect(gr.get(a.sys_id)).toBe(true);
                expect(gr.getValue('sys_class_name')).toBe('sys_app');
                expect(a.scope).toBe(gr.getValue('scope') || '');
                expect(a.version).toBe(gr.getValue('version') || '');
                expect(a.isConverted).toBe(/CONVERTED/i.test(a.version));
            }
        });

        it('getApps for the After Clone tab lists one row per company store app', function() {
            var r = call('BulkAppConsole', 'getApps', { sysparm_list: 'restore' });
            expect(r.ok).toBe(true);
            expect(Array.isArray(r.apps)).toBe(true);
            var prev = null;
            for (var i = 0; i < r.apps.length; i++) {
                var a = r.apps[i];
                var gr = new GlideRecord('sys_store_app');
                expect(gr.get(a.sys_id)).toBe(true);
                expect(gr.getValue('is_store_app') === '1' || gr.getValue('is_store_app') === 'true').toBe(false);
                expect(a.name).not.toBe(prev);
                prev = a.name;
                expect(a.isConverted).toBe(/CONVERTED/i.test(a.version));
                expect(a.restorable).toBe(!!a.latest_version && !/CONVERTED/i.test(a.latest_version));
                expect(typeof a.upgradeAvailable).toBe('boolean');
                expect(typeof a.convertible).toBe('boolean');
            }
        });

        it('getBatchState reports an unknown batch', function() {
            var expected = { ok: false, error: 'Batch install plan not found.' };
            expect(call('BulkAppConsole', 'getBatchState', { sysparm_batch_id: NONE })).toEqual(expected);
            expect(call('BulkAppConsole', 'getBatchState', {})).toEqual(expected);
        });

        it('getBatchState reads the state of an existing batch', function() {
            var gr = new GlideRecord('sys_batch_install_plan');
            gr.setLimit(1);
            gr.query();
            if (!gr.next()) return; // no batch on this instance
            var r = call('BulkAppConsole', 'getBatchState', { sysparm_batch_id: gr.getUniqueValue() });
            expect(r.ok).toBe(true);
            expect(r.state).toBe(gr.getValue('state'));
            expect(r.stateLabel).toBe(gr.state.getDisplayValue());
        });

        it('getPublishState says an unknown app is not in development mode', function() {
            var r = call('BulkAppConsole', 'getPublishState', { sysparm_sys_id: NONE });
            expect(r.ok).toBe(false);
            expect(r.code).toBe('not_dev');
            expect(r.saveStatus).toBe('check_failed');
            expect(r.error).toContain('no longer in development mode');
            expect(call('BulkAppConsole', 'getPublishState', {}).code).toBe('not_dev');
        });

        it('getPublishState says a store mode app is not in development mode', function() {
            var gr = new GlideRecord('sys_store_app');
            gr.setLimit(1);
            gr.query();
            if (!gr.next()) return;
            var r = call('BulkAppConsole', 'getPublishState', { sysparm_sys_id: gr.getUniqueValue() });
            expect(r.ok).toBe(false);
            expect(r.code).toBe('not_dev');
        });

        it('startUpgrade with no ids starts nothing', function() {
            var r = call('BulkAppConsole', 'startUpgrade', { sysparm_sys_ids: '' });
            expect(r).toEqual({ ok: true, packages: [], batchId: '', trackerId: '' });
        });

        it('recordPublish refuses an unknown app', function() {
            var expected = { ok: false, error: 'Application not found in sys_app.' };
            expect(call('BulkAppConsole', 'recordPublish', { sysparm_sys_id: NONE })).toEqual(expected);
            expect(call('BulkAppConsole', 'recordPublish', {})).toEqual(expected);
        });
    });

    describe('BulkPublishMyCompanyApps as an admin', function() {
        it('getNextPublishVersion refuses an unknown app before calling the App Repo', function() {
            var r = call('BulkPublishMyCompanyApps', 'getNextPublishVersion', { sysparm_sys_id: NONE });
            expect(r.ok).toBe(false);
            expect(r.publishable).toBe(false);
            expect(r.nextVersion).toBe('');
            expect(r.error).toContain('Application not found');
            expect(call('BulkPublishMyCompanyApps', 'getNextPublishVersion', {}).ok).toBe(false);
        });
    });
})(outputs, steps, params, stepResult, assertEqual);
jasmine.getEnv().execute();
