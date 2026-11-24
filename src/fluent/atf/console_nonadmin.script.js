(function(outputs, steps, params, stepResult, assertEqual) {
    // Runs as a user with no roles. Every endpoint must refuse before it reads or changes anything.
    // The parameters are empty or point at nothing, so even a broken guard could not publish, upgrade or save.
    var DENIED = { ok: false, error: 'admin role required' };
    var NONE = '00000000000000000000000000000000';

    function endpoint(cls, params) {
        var inst = new global[cls]();
        inst.getParameter = function(name) {
            return params && params[name] !== undefined ? params[name] : '';
        };
        return inst;
    }

    describe('BulkAppConsole as a user without the admin role', function() {
        it('is not running as an admin', function() {
            expect(gs.hasRole('admin')).toBe(false);
        });

        it('denies every endpoint', function() {
            var calls = [
                ['getApps', { sysparm_list: 'save' }],
                ['getApps', { sysparm_list: 'restore' }],
                ['getPrereqs', {}],
                ['getSavedList', {}],
                ['startUpgrade', { sysparm_sys_ids: '' }],
                ['getPublishState', { sysparm_sys_id: NONE }],
                ['getBatchState', { sysparm_batch_id: NONE }],
                ['recordPublish', { sysparm_sys_id: '' }]
            ];
            for (var i = 0; i < calls.length; i++) {
                var answer = endpoint('BulkAppConsole', calls[i][1])[calls[i][0]]();
                expect(JSON.parse(answer)).toEqual(DENIED);
            }
        });
    });

    describe('BulkPublishMyCompanyApps as a user without the admin role', function() {
        it('denies the ajax method', function() {
            var answer = endpoint('BulkPublishMyCompanyApps', { sysparm_sys_id: NONE }).getNextPublishVersion();
            expect(JSON.parse(answer)).toEqual(DENIED);
        });

        it('denies the server helper without calling the App Repo', function() {
            var r = new global.BulkPublishMyCompanyApps().findNextPublishableVersion(NONE, '1.0.0');
            expect(r).toEqual({ version: '', repoError: 'admin role required' });
        });
    });
})(outputs, steps, params, stepResult, assertEqual);
jasmine.getEnv().execute();
