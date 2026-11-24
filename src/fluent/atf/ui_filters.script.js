// Replaces the Before Clone list with three made up apps and their save status, so the search box, chips,
// banner, selection and buttons are tested without any server call. The page's real status checks are stopped first.
// No action button is clicked, so nothing is published, converted or saved.
await sn_atf.navigate('/bulk_convert_store_app_confirm.do?sysparm_tab=save')
await screen.findByRole('heading', { name: 'Bulk App Clone Assistant', timeout: 20000 })

async function poll(fn, what) {
    for (var i = 0; i < 240; i++) {
        if (await sn_atf.evaluate(fn)) { return }
        await sn_atf.delay(500)
    }
    throw new Error('Timed out waiting for ' + what)
}

await poll(function () { return BAC.loaded.save === true }, 'the app list to load')
await sn_atf.evaluate(function () { BAC.busy = true })
await poll(function () { return BAC.loader === false }, 'the save status checks to stop')

await sn_atf.evaluate(function () {
    BAC.busy = false
    BAC.apps.save = [
        { sys_id: 'atf_a', name: 'Alpha App', scope: 'x_demo_alpha', version: '1.0.0', isConverted: false },
        { sys_id: 'atf_b', name: 'Beta App', scope: 'x_demo_beta', version: '2.1.0', isConverted: false },
        { sys_id: 'atf_c', name: 'Gamma Tool', scope: 'x_demo_gamma', version: '1.0.0', isConverted: false }
    ]
    BAC.saveState = {
        atf_a: { ok: true, saveStatus: 'saved', nextVersion: '', lastPublished: '2026-01-05 10:00:00', lastChanged: '2026-01-01 10:00:00' },
        atf_b: { ok: true, saveStatus: 'changed', nextVersion: '2.2.0', lastPublished: '2026-01-02 10:00:00', lastChanged: '2026-01-04 10:00:00' },
        atf_c: { ok: true, saveStatus: 'not_in_repo', nextVersion: '1.1.0' }
    }
    BAC.status.save = {}
    BAC.checked.save = {}
    BAC.touched.save = false
    BAC.filters.save = { q: '', needs: false, statuses: {}, failed: false }
    BAC.loaded.save = true
    applyDefaultSaveSelection()
})

const paneSave = await screen.findBySelector('#pane-save')
const save = within(paneSave)
const search = await save.getByPlaceholderText('Search apps')

function names() {
    return screen.queryAllBySelector('#tbl-save tbody tr strong').map(function (el) { return el.textContent })
}
const text = function (sel) { return screen.queryAllBySelector(sel)[0].textContent.replace(/\s+/g, ' ').trim() }

// All three rows show, with their versions and save status
await waitFor(() => expect(names()).toEqual(['Alpha App', 'Beta App', 'Gamma Tool']))
expect(text('#installed-save-atf_b')).toBe('2.1.0')
expect(text('#target-save-atf_a')).toBe('1.0.0')
expect(text('#target-save-atf_b')).toMatch(/^2\.1\.0\s*\S\s*2\.2\.0$/)
expect(text('#save-atf_a')).toContain('Published')
expect(text('#save-atf_a')).toContain('Published 2026-01-05.')
expect(text('#save-atf_b')).toContain('Changed')
expect(text('#save-atf_b')).toContain('Changed 2026-01-04, published 2026-01-02.')
expect(text('#save-atf_b')).toContain('Recent changes')
expect(text('#save-atf_c')).toContain('Not in App Repo')
expect(text('#save-atf_c')).toContain('Never published to the App Repo.')
expect(text('#save-atf_c')).not.toContain('Recent changes')

// Search matches name, scope and version, ignoring case
await user.type(search, 'BETA')
await waitFor(() => expect(names()).toEqual(['Beta App']))
await user.clear(search)
await user.type(search, 'x_demo_g')
await waitFor(() => expect(names()).toEqual(['Gamma Tool']))
await user.clear(search)
await user.type(search, '2.1.0')
await waitFor(() => expect(names()).toEqual(['Beta App']))
await user.clear(search)
await user.type(search, 'zzz')
await waitFor(() => expect(text('#table-save .bac-empty')).toBe('No apps to show.'))
await user.clear(search)
await waitFor(() => expect(names().length).toBe(3))

// Default selection is every app at risk: not Alpha, which is published
await waitFor(() => expect(text('#count-save')).toBe('2 selected'))
const publish = await save.getByRole('button', { name: 'Publish', exact: true })
const toStore = await save.getByRole('button', { name: 'Convert to Store', exact: true })
expect(publish).toBeEnabled()
// Neither selected app is saved in the App Repo, so Convert to Store stays off
expect(toStore).toBeDisabled()

// "Needs publishing" hides the published app
await user.click(await screen.findBySelector('input[data-chip="needs"]'))
await waitFor(() => expect(names()).toEqual(['Beta App', 'Gamma Tool']))
expect(text('#chipcount-needs')).toBe('(2)')

// A status chip narrows further, and the banner counts what the filters hide
await user.click(await screen.findBySelector('input[data-status="not_in_repo"]'))
await waitFor(() => expect(names()).toEqual(['Gamma Tool']))
expect(text('#chipcount-not_in_repo')).toBe('(1)')
expect(text('#banner-save')).toContain('2 apps may have work that has not been saved yet')
expect(text('#banner-save')).toContain('(1 hidden by filters)')

// Clear the filters
await user.click(await screen.findBySelector('input[data-chip="needs"]'))
await user.click(await screen.findBySelector('input[data-status="not_in_repo"]'))
await waitFor(() => expect(names().length).toBe(3))

// Checking the published app turns Convert to Store on, because it is saved in the App Repo
await user.click(await screen.findBySelector('input.bac-check[data-id="atf_a"]'))
await waitFor(() => expect(text('#count-save')).toBe('3 selected'))
await waitFor(() => expect(toStore).toBeEnabled())

// The header box checks every visible app, then unchecks them on the second click
await user.click(await screen.findBySelector('input.bac-all'))
await waitFor(() => expect(text('#count-save')).toBe('3 selected'))
await waitFor(() => expect(screen.queryAllBySelector('input.bac-all')[0]).toBeChecked())
await user.click(await screen.findBySelector('input.bac-all'))
await waitFor(() => expect(text('#count-save')).toBe('0 selected'))
await waitFor(() => expect(publish).toBeDisabled())
expect(publish).toHaveAttribute('title', 'Check at least one app.')
expect(toStore).toBeDisabled()
