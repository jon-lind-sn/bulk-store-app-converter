(function(outputs, steps, params, stepResult, assertEqual) {
    // updateAvailable() works on any object with getValue(), so a stub stands in for the sys_store_app record.
    // upgradeByIds() is only called with ids that match nothing, so installBatch is never reached.
    var up = new global.BulkUpgradeMyCompanyApps();

    function app(version, latest) {
        return { getValue: function(field) { return field === 'version' ? version : latest; } };
    }

    describe('BulkUpgradeMyCompanyApps.updateAvailable', function() {
        it('is false when the repo has no latest version', function() {
            expect(up.updateAvailable(app('1.0.0', ''))).toBe(false);
            expect(up.updateAvailable(app('1.0.0', null))).toBe(false);
        });

        it('is true only when the latest version is higher', function() {
            expect(up.updateAvailable(app('1.0.0', '1.0.1'))).toBe(true);
            expect(up.updateAvailable(app('1.0.1', '1.0.0'))).toBe(false);
            expect(up.updateAvailable(app('1.2.3', '1.2.3'))).toBe(false);
            expect(up.updateAvailable(app('1.9.0', '2.0.0'))).toBe(true);
            expect(up.updateAvailable(app('2.0.0', '1.99.99'))).toBe(false);
        });

        it('compares the parts as numbers, not as text', function() {
            expect(up.updateAvailable(app('1.9.0', '1.10.0'))).toBe(true);
            expect(up.updateAvailable(app('1.10.0', '1.9.0'))).toBe(false);
        });

        it('treats missing parts as zero', function() {
            expect(up.updateAvailable(app('1.0', '1.0.1'))).toBe(true);
            expect(up.updateAvailable(app('1.0.1', '1.0'))).toBe(false);
            expect(up.updateAvailable(app('1.0', '1.0.0'))).toBe(false);
        });
    });

    describe('BulkUpgradeMyCompanyApps.upgradeByIds', function() {
        it('does nothing for an empty list', function() {
            var expected = { candidates: 0, packages: [], batchId: '', trackerId: '' };
            expect(up.upgradeByIds([])).toEqual(expected);
            expect(up.upgradeByIds(undefined)).toEqual(expected);
        });

        it('finds no candidates for ids that do not exist', function() {
            var r = up.upgradeByIds(['00000000000000000000000000000000']);
            expect(r.candidates).toBe(0);
            expect(r.packages).toEqual([]);
            expect(r.batchId).toBe('');
            expect(r.trackerId).toBe('');
        });
    });

    describe('BulkUpgradeMyCompanyApps.upgradeByFilter', function() {
        it('refuses to run without a query', function() {
            var threw = false;
            try {
                up.upgradeByFilter('');
            } catch (e) {
                threw = true;
            }
            expect(threw).toBe(true);
        });
    });
})(outputs, steps, params, stepResult, assertEqual);
jasmine.getEnv().execute();
