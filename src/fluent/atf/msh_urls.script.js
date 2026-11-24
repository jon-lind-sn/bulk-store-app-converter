(function(outputs, steps, params, stepResult, assertEqual) {
    // URL builders only. Nothing is queried or written.
    var finder = new global.MultiScopeHistoryFinder();
    var base = gs.getProperty('glide.servlet.uri');

    function queryOf(url, table) {
        var prefix = base + table + '_list.do?sysparm_query=';
        expect(url.indexOf(prefix)).toBe(0);
        return decodeURIComponent(url.substring(prefix.length));
    }

    describe('MultiScopeHistoryFinder.getListUrls', function() {
        it('returns no links for no names', function() {
            expect(finder.getListUrls('sys_update_version', [])).toEqual([]);
        });

        it('builds a version list grouped by name, newest recorded first', function() {
            var urls = finder.getListUrls('sys_update_version', ['a', 'b', 'c']);
            expect(urls.length).toBe(1);
            expect(queryOf(urls[0], 'sys_update_version')).toBe('nameINa,b,c^GROUPBYname^ORDERBYname^ORDERBYDESCsys_recorded_at');
        });

        it('orders update xml lists by created time', function() {
            var urls = finder.getListUrls('sys_update_xml', ['a']);
            expect(queryOf(urls[0], 'sys_update_xml')).toBe('nameINa^GROUPBYname^ORDERBYname^ORDERBYDESCsys_created_on');
        });

        it('splits the names into links of at most 80', function() {
            var names = [];
            for (var i = 0; i < 81; i++) names.push('n' + i);
            var urls = finder.getListUrls('sys_update_version', names);
            expect(urls.length).toBe(2);
            expect(queryOf(urls[1], 'sys_update_version')).toContain('nameINn80^GROUPBYname');
            expect(queryOf(urls[0], 'sys_update_version')).toContain('n79^GROUPBYname');
            expect(queryOf(urls[0], 'sys_update_version')).not.toContain('n80');
        });
    });

    describe('MultiScopeHistoryFinder.getLogUrl', function() {
        var prefix = base + 'syslog_list.do?sysparm_query=';

        it('filters the system log to one run', function() {
            var url = finder.getLogUrl('MSH-123');
            expect(url.indexOf(prefix)).toBe(0);
            expect(decodeURIComponent(url.substring(prefix.length))).toBe('source=MultiScopeHistory^messageSTARTSWITHMSH-123^ORDERBYDESCsys_created_on');
        });

        it('covers every run when the run id is empty', function() {
            var url = finder.getLogUrl('');
            expect(decodeURIComponent(url.substring(prefix.length))).toBe('source=MultiScopeHistory^ORDERBYDESCsys_created_on');
        });
    });
})(outputs, steps, params, stepResult, assertEqual);
jasmine.getEnv().execute();
