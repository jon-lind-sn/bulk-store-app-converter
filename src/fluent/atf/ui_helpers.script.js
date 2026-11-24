// Calls the page's pure helper functions in the page's own JavaScript. No server call is made and no state is changed.
await sn_atf.navigate('/bulk_convert_store_app_confirm.do?sysparm_tab=save')
await screen.findByRole('heading', { name: 'Bulk App Clone Assistant', timeout: 20000 })

const r = await sn_atf.evaluate(function () {
    var out = {}
    out.esc = esc('<a href="x" t=' + "'" + 'y' + "'" + '>&</a>')
    out.escNull = esc(null)
    out.escUndef = esc(undefined)
    out.escNum = esc(0)
    out.next = [nextMinorVersion('1.4.7'), nextMinorVersion('2'), nextMinorVersion('x'), nextMinorVersion('3.0.0-SNAPSHOT')]
    out.pad = [pad2(3), pad2(12)]
    out.stamp = [
        localStamp(new Date(2026, 0, 5, 9, 3, 7), 0),
        localStamp(new Date(2026, 0, 5, 9, 3, 7), 5),
        localStamp(new Date(2026, 0, 5, 9, 3, 7), -10),
        localStamp(new Date(2026, 0, 5, 23, 59, 58), 5)
    ]
    out.url = decodeURIComponent(errorLogUrl('2026-01-05 09:03:02', '2026-01-05 09:03:12'))
    out.note = {
        inRepo: saveNote({ saveStatus: 'in_repo' }),
        inRepoDated: saveNote({ saveStatus: 'in_repo', lastChanged: '2026-01-04 10:00:00' }),
        notInRepo: saveNote({ saveStatus: 'not_in_repo' }),
        unpubRepo: saveNote({ saveStatus: 'unpublished_version', currentVersion: '1.3.0', repoVersion: '1.2.0' }),
        unpubNoRepo: saveNote({ saveStatus: 'unpublished_version', currentVersion: '1.3.0' }),
        unpubConverted: saveNote({ saveStatus: 'unpublished_version', isConverted: true, currentVersion: '0.0.0-CONVERTED', repoVersion: '1.2.0' }),
        changed: saveNote({ saveStatus: 'changed', lastChanged: '2026-01-04 10:00:00', lastPublished: '2026-01-02 10:00:00' }),
        saved: saveNote({ saveStatus: 'saved', lastPublished: '2026-01-02 10:00:00' }),
        failed: saveNote({ saveStatus: 'check_failed', error: 'boom' }),
        failedNoDetail: saveNote({ saveStatus: 'check_failed' }),
        other: saveNote({ saveStatus: 'whatever' })
    }
    out.selectable = [
        !!isRowSelectable('save', {}),
        !!isRowSelectable('restore', {}),
        !!isRowSelectable('restore', { upgradeAvailable: true }),
        !!isRowSelectable('restore', { convertible: true }),
        !!isRowSelectable('restore', { upgradeAvailable: true, convertible: true, gone: true })
    ]
    out.reasonGone = unselectableReason({ gone: true })
    out.reasonOther = unselectableReason({})
    out.targetNotInRepo = targetHtml('restore', { isConverted: true, restorable: false })
    out.targetLatest = targetHtml('restore', { latest_version: '1.2.0' })
    out.targetConvertOnly = targetHtml('restore', {})
    out.statusNone = statusHtml(null)
    out.statusFailed = statusHtml({ label: 'Failed', note: 'x<y' })
    out.statusLink = statusHtml({ label: 'Complete', note: 'Open', href: 'a.do?x=1&y=2' })
    out.statusUnknown = statusHtml({ label: 'Mystery' })
    out.tabParam = getUrlParam('sysparm_tab')
    out.noParam = getUrlParam('sysparm_nothing')
    return JSON.stringify(out)
})
const o = JSON.parse(r)

// esc
expect(o.esc).toBe('&lt;a href=&quot;x&quot; t=&#39;y&#39;&gt;&amp;&lt;/a&gt;')
expect(o.escNull).toBe('')
expect(o.escUndef).toBe('')
expect(o.escNum).toBe('0')

// versions and time stamps
expect(o.next).toEqual(['1.5.0', '2.1.0', '0.1.0', '3.1.0'])
expect(o.pad).toEqual(['03', '12'])
expect(o.stamp).toEqual(['2026-01-05 09:03:07', '2026-01-05 09:03:12', '2026-01-05 09:02:57', '2026-01-06 00:00:03'])

// error log link
expect(o.url.indexOf('syslog_list.do?sysparm_query=')).toBe(0)
expect(o.url).toContain('^level=2')
expect(o.url).toContain("sys_created_on<=javascript:gs.dateGenerate('2026-01-05','09:03:12')")
expect(o.url).toContain("sys_created_on>=javascript:gs.dateGenerate('2026-01-05','09:03:02')")

// save status notes
expect(o.note.inRepo).toBe('No publish record on this instance.')
expect(o.note.inRepoDated).toBe('No publish record on this instance. Last change 2026-01-04.')
expect(o.note.notInRepo).toBe('Never published to the App Repo.')
expect(o.note.unpubRepo).toBe('Version 1.3.0 is newer than App Repo 1.2.0.')
expect(o.note.unpubNoRepo).toBe('Version 1.3.0 is not in the App Repo yet.')
expect(o.note.unpubConverted).toBe('A conversion reset the version to 0.0.0-CONVERTED. App Repo has 1.2.0.')
expect(o.note.changed).toBe('Changed 2026-01-04, published 2026-01-02.')
expect(o.note.saved).toBe('Published 2026-01-02.')
expect(o.note.failed).toBe('boom')
expect(o.note.failedNoDetail).toBe('The App Repo check did not return a result.')
expect(o.note.other).toBe('')

// row selection and the After Clone target column
expect(o.selectable).toEqual([true, false, true, true, false])
expect(o.reasonGone).toContain('Converted to dev mode')
expect(o.reasonOther).toContain('Nothing to upgrade')
expect(o.targetNotInRepo).toContain('Not in App Repo, cannot restore automatically')
expect(o.targetLatest).toBe('1.2.0')
expect(o.targetConvertOnly).toContain('convert only')

// status labels
expect(o.statusNone).toBe('')
expect(o.statusFailed).toContain('label-danger')
expect(o.statusFailed).toContain('x&lt;y')
expect(o.statusLink).toContain('label-success')
expect(o.statusLink).toContain('href="a.do?x=1&amp;y=2"')
expect(o.statusUnknown).toContain('label-default')

// URL parameters
expect(o.tabParam).toBe('save')
expect(o.noParam).toBe('')
