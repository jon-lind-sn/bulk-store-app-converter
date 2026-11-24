(function(outputs, steps, params, stepResult, assertEqual) {
    // Pure logic: classify() runs no queries, so this test reads and writes nothing.
    function row(id, scope, state, recorded, created) {
        return { id: id, app: scope, scope: scope, state: state, recorded: recorded, sourceTable: 'sys_update_set', createdOn: created || recorded };
    }
    var finder = new global.MultiScopeHistoryFinder();

    describe('MultiScopeHistoryFinder.classify', function() {
        it('flags a newer history row in another scope while an older global row is current', function() {
            var rows = [
                row('r2', 'global', 'current', '2026-01-02 00:00:00'),
                row('r3', 'x_demo_app', 'history', '2026-01-03 00:00:00'),
                row('r1', 'global', 'previous', '2026-01-01 00:00:00')
            ];
            var g = finder.classify('sc_cat_item_abc', rows, { global: 2 }, 'global');
            expect(g.pattern).toBe('newer_history_other_scope');
            expect(g.scopePath).toBe('global > x_demo_app');
            expect(g.newestId).toBe('r3');
            expect(g.currentId).toBe('r2');
            expect(g.currentScope).toBe('global');
            expect(g.newestScope).toBe('x_demo_app');
            expect(g.newestState).toBe('history');
            expect(g.targetScope).toBe('x_demo_app');
            expect(g.newerThanCurrent).toBe(1);
            expect(g.versionCount).toBe(3);
            expect(g.xmlScopes).toBe('global');
            expect(g.flags).toEqual(['current_in_older_scope', 'record_scope_differs_from_newest', 'update_xml_not_in_target_scope']);
            expect(g.rowsToChange.map(function(r) { return r.id; })).toEqual(['r2', 'r1']);
        });

        it('flags a newer history row in the same scope as the current row', function() {
            var rows = [
                row('r1', 'global', 'previous', '2026-01-01 00:00:00'),
                row('r2', 'x_demo_app', 'current', '2026-01-02 00:00:00'),
                row('r3', 'x_demo_app', 'history', '2026-01-03 00:00:00')
            ];
            var g = finder.classify('f', rows, { x_demo_app: 1 }, 'x_demo_app');
            expect(g.pattern).toBe('newer_history_same_scope');
            expect(g.scopePath).toBe('global > x_demo_app');
            expect(g.newerThanCurrent).toBe(1);
            expect(g.flags).toEqual([]);
            expect(g.rowsToChange.length).toBe(1);
            expect(g.rowsToChange[0].id).toBe('r1');
        });

        it('reports current_is_newest with no flags when the history is healthy', function() {
            var rows = [
                row('r1', 'global', 'previous', '2026-01-01 00:00:00'),
                row('r2', 'x_demo_app', 'current', '2026-01-02 00:00:00')
            ];
            var g = finder.classify('f', rows, { x_demo_app: 2 }, 'x_demo_app');
            expect(g.pattern).toBe('current_is_newest');
            expect(g.newerThanCurrent).toBe(0);
            expect(g.flags).toEqual([]);
        });

        it('reports no_current when no row has state current', function() {
            var rows = [
                row('r1', 'global', 'previous', '2026-01-01 00:00:00'),
                row('r2', 'x_demo_app', 'history', '2026-01-02 00:00:00')
            ];
            var g = finder.classify('f', rows, { x_demo_app: 1 }, 'x_demo_app');
            expect(g.pattern).toBe('no_current');
            expect(g.currentId).toBe('');
            expect(g.currentScope).toBe('');
            expect(g.newerThanCurrent).toBe(2);
            expect(g.flags).toEqual([]);
        });

        it('returns null when the history covers fewer than two scopes', function() {
            expect(finder.classify('f', [row('r1', 'x_demo_app', 'current', '2026-01-01 00:00:00'), row('r2', 'x_demo_app', 'previous', '2026-01-02 00:00:00')], {}, 'x_demo_app')).toBeNull();
            expect(finder.classify('f', [row('r1', 'global', 'current', '2026-01-01 00:00:00')], {}, 'global')).toBeNull();
            expect(finder.classify('f', [], {}, '')).toBeNull();
        });

        it('adds multiple_current, record_not_found and no_update_xml flags', function() {
            var rows = [
                row('r1', 'global', 'current', '2026-01-01 00:00:00'),
                row('r2', 'x_demo_app', 'current', '2026-01-02 00:00:00')
            ];
            var g = finder.classify('f', rows, {}, '');
            expect(g.pattern).toBe('current_is_newest');
            expect(g.flags).toEqual(['multiple_current', 'record_not_found', 'no_update_xml']);
        });

        it('adds record scope and multi scope update xml flags', function() {
            var rows = [
                row('r1', 'global', 'previous', '2026-01-01 00:00:00'),
                row('r2', 'x_demo_app', 'current', '2026-01-02 00:00:00')
            ];
            var g = finder.classify('f', rows, { global: 1, x_demo_app: 1 }, 'global');
            expect(g.flags).toEqual(['record_scope_differs_from_current', 'record_scope_differs_from_newest', 'update_xml_multi_scope']);
            expect(g.xmlScopes).toBe('global, x_demo_app');
        });

        it('breaks a tie on the recorded time with the created time', function() {
            var rows = [
                row('rA', 'global', 'current', '2026-01-02 00:00:00', '2026-01-02 00:00:05'),
                row('rB', 'x_demo_app', 'history', '2026-01-02 00:00:00', '2026-01-02 00:00:09')
            ];
            var g = finder.classify('f', rows, { global: 1 }, 'global');
            expect(g.newestId).toBe('rB');
            expect(g.pattern).toBe('newer_history_other_scope');
        });

        it('does not reorder the rows it was given', function() {
            var rows = [
                row('r1', 'global', 'previous', '2026-01-01 00:00:00'),
                row('r2', 'x_demo_app', 'current', '2026-01-02 00:00:00')
            ];
            finder.classify('f', rows, {}, 'x_demo_app');
            expect(rows[0].id).toBe('r1');
            expect(rows[1].id).toBe('r2');
        });
    });
})(outputs, steps, params, stepResult, assertEqual);
jasmine.getEnv().execute();
