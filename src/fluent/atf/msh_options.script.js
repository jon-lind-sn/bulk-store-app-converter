(function(outputs, steps, params, stepResult, assertEqual) {
    // Option parsing and validation. _validate() throws before any query runs, and nothing here writes.
    var finder = new global.MultiScopeHistoryFinder();

    function thrown(fn) {
        try {
            fn();
        } catch (e) {
            return String(e);
        }
        return '';
    }

    describe('MultiScopeHistoryFinder options', function() {
        it('keeps an explicit filter and parses the other options', function() {
            var o = finder._options({ filter: 'name=abc', revert: true, normalize: true, updateXml: 'normalize', limit: '7' });
            expect(o).toEqual({ filter: 'name=abc', revert: true, normalize: true, updateXml: 'normalize', limit: 7 });
        });

        it('turns a fix on only for the boolean true', function() {
            var o = finder._options({ filter: 'name=abc', revert: 'true', normalize: 1 });
            expect(o.revert).toBe(false);
            expect(o.normalize).toBe(false);
        });

        it('accepts only the known updateXml modes', function() {
            expect(finder._options({ filter: 'name=a', updateXml: 'delete_new' }).updateXml).toBe('delete_new');
            expect(finder._options({ filter: 'name=a', updateXml: 'normalize' }).updateXml).toBe('normalize');
            expect(finder._options({ filter: 'name=a', updateXml: 'bogus' }).updateXml).toBe('none');
            expect(finder._options({ filter: 'name=a' }).updateXml).toBe('none');
        });

        it('treats a missing or unreadable limit as 0', function() {
            expect(finder._options({ filter: 'name=a' }).limit).toBe(0);
            expect(finder._options({ filter: 'name=a', limit: 'abc' }).limit).toBe(0);
            expect(finder._options({ filter: 'name=a', limit: '0' }).limit).toBe(0);
        });

        it('knows which options write', function() {
            expect(finder._writes({ revert: false, normalize: false, updateXml: 'none' })).toBe(false);
            expect(finder._writes({ revert: true, normalize: false, updateXml: 'none' })).toBe(true);
            expect(finder._writes({ revert: false, normalize: true, updateXml: 'none' })).toBe(true);
            expect(finder._writes({ revert: false, normalize: false, updateXml: 'normalize' })).toBe(true);
            expect(finder._writes({ revert: false, normalize: false, updateXml: 'delete_new' })).toBe(true);
        });

        it('labels the fixes of a run', function() {
            expect(finder._fixLabel({ revert: false, normalize: false, updateXml: 'none' })).toBe('report');
            expect(finder._fixLabel({ revert: true, normalize: false, updateXml: 'none' })).toBe('revert');
            expect(finder._fixLabel({ revert: true, normalize: true, updateXml: 'none' })).toBe('revert+normalize');
            expect(finder._fixLabel({ revert: true, normalize: true, updateXml: 'delete_new' })).toBe('revert+normalize+xml_delete_new');
            expect(finder._fixLabel({ revert: false, normalize: false, updateXml: 'normalize' })).toBe('xml_normalize');
        });
    });

    describe('MultiScopeHistoryFinder validation', function() {
        it('rejects an empty filter', function() {
            expect(thrown(function() { finder._validate({ filter: '', revert: false, normalize: false, updateXml: 'none', limit: 0 }); })).not.toBe('');
        });

        it('rejects every kind of fix without a limit', function() {
            var base = { filter: 'name=abc', revert: false, normalize: false, updateXml: 'none', limit: 0 };
            var cases = [{ revert: true }, { normalize: true }, { updateXml: 'normalize' }, { updateXml: 'delete_new' }];
            for (var i = 0; i < cases.length; i++) {
                var opts = {};
                for (var k in base) opts[k] = base[k];
                for (var c in cases[i]) opts[c] = cases[i][c];
                expect(thrown(function() { finder._validate(opts); })).toContain('limit');
            }
        });

        it('allows a report without a limit and a fix with one', function() {
            expect(thrown(function() { finder._validate({ filter: 'name=abc', revert: false, normalize: false, updateXml: 'none', limit: 0 }); })).toBe('');
            expect(thrown(function() { finder._validate({ filter: 'name=abc', revert: true, normalize: true, updateXml: 'none', limit: 1 }); })).toBe('');
        });
    });

    describe('MultiScopeHistoryFinder constants and helpers', function() {
        it('exposes the four patterns', function() {
            expect(finder.PATTERNS).toEqual({
                NEWER_OTHER_SCOPE: 'newer_history_other_scope',
                NEWER_SAME_SCOPE: 'newer_history_same_scope',
                CURRENT_IS_NEWEST: 'current_is_newest',
                NO_CURRENT: 'no_current'
            });
        });

        it('picks the newest scope that is not global as the target', function() {
            expect(finder._targetScope([{ scope: 'global' }, { scope: 'x_a' }, { scope: 'x_b' }])).toBe('x_a');
            expect(finder._targetScope([{ scope: 'global' }, { scope: 'global' }])).toBe('');
            expect(finder._targetScope([])).toBe('');
        });

        it('labels an unknown scope id with the id itself', function() {
            var f = new global.MultiScopeHistoryFinder();
            expect(f._label('')).toBe('(none)');
            expect(f._label('abc123')).toBe('abc123');
            f._scopeCache.abc123 = 'x_demo_app';
            expect(f._label('abc123')).toBe('x_demo_app');
        });

        it('counts into a map', function() {
            var map = {};
            finder._count(map, 'a');
            finder._count(map, 'a');
            finder._count(map, 'b');
            expect(map).toEqual({ a: 2, b: 1 });
        });
    });
})(outputs, steps, params, stepResult, assertEqual);
jasmine.getEnv().execute();
