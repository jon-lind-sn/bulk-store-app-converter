(function(outputs, steps, params, stepResult, assertEqual) {
    // Report only runs. The only write is the one "done" line each run adds to the system log (source MultiScopeHistory).
    // The fix cases pass no limit, so run() must throw in _validate() before it queries or changes anything.
    var finder = new global.MultiScopeHistoryFinder();
    var NO_MATCH = 'name=__atf_no_such_update_name__';

    function thrown(fn) {
        try {
            fn();
        } catch (e) {
            return String(e);
        }
        return '';
    }

    describe('MultiScopeHistoryFinder.run (report only)', function() {
        it('returns an empty, complete report when nothing matches', function() {
            var r = finder.run({ filter: NO_MATCH });
            expect(r.runId).toMatch(/^MSH-[0-9]+$/);
            expect(r.filter).toBe(NO_MATCH);
            expect(r.fixes).toBe('report');
            expect(r.checked).toBe(0);
            expect(r.found).toBe(0);
            expect(r.failedFiles).toBe(0);
            expect(r.revertedFiles).toBe(0);
            expect(r.normalizedRows).toBe(0);
            expect(r.xmlRows).toBe(0);
            expect(r.complete).toBe(true);
            expect(r.message).toBe('');
            expect(r.files).toEqual([]);
            expect(r.summary).toEqual({ byPattern: {}, byScopePath: {}, byFlag: {} });
            expect(r.urls.versions).toEqual([]);
            expect(decodeURIComponent(r.urls.log)).toContain('messageSTARTSWITH' + r.runId);
        });

        it('stops at the limit and keeps the counts consistent', function() {
            var r = finder.run({ filter: 'nameSTARTSWITHsys_', limit: 2 });
            expect(r.checked).toBeLessThan(3);
            expect(r.found).not.toBeGreaterThan(r.checked);
            expect(r.files.length).toBe(r.found);
            if (r.complete) {
                expect(r.message).toBe('');
            } else {
                expect(r.message).toBe('Stopped at the limit of 2 files. More files match the filter.');
            }
            var patterns = 0;
            for (var p in r.summary.byPattern) patterns += r.summary.byPattern[p];
            expect(patterns).toBe(r.found);
            var allowed = ['newer_history_other_scope', 'newer_history_same_scope', 'current_is_newest', 'no_current'];
            for (var i = 0; i < r.files.length; i++) {
                expect(allowed.indexOf(r.files[i].pattern)).not.toBe(-1);
                expect(r.files[i].scopePath).toContain(' > ');
                expect(r.files[i].fix).toBe('');
            }
        });
    });

    describe('MultiScopeHistoryFinder.run (guards)', function() {
        it('refuses every fix without a limit', function() {
            var modes = [{ revert: true }, { normalize: true }, { updateXml: 'normalize' }, { updateXml: 'delete_new' }];
            for (var i = 0; i < modes.length; i++) {
                var opts = { filter: NO_MATCH };
                for (var k in modes[i]) opts[k] = modes[i][k];
                expect(thrown(function() { finder.run(opts); })).toContain('limit');
            }
        });

        it('does not turn a fix on from a string', function() {
            var r = finder.run({ filter: NO_MATCH, revert: 'true', normalize: 'true' });
            expect(r.fixes).toBe('report');
        });
    });
})(outputs, steps, params, stepResult, assertEqual);
jasmine.getEnv().execute();
