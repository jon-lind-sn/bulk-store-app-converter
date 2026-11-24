// Opens the After Clone tab, which runs the App Repo sync (a refresh of latest versions, no publish or install).
// Then replaces the list with made up apps so selection, filters and buttons are tested with no further server call.
// No action button is clicked, so nothing is upgraded or converted.
await sn_atf.navigate('/bulk_convert_store_app_confirm.do?sysparm_tab=restore')
await screen.findByRole('heading', { name: 'Bulk App Clone Assistant', timeout: 20000 })

async function poll(fn, what) {
    for (var i = 0; i < 240; i++) {
        if (await sn_atf.evaluate(fn)) { return }
        await sn_atf.delay(500)
    }
    throw new Error('Timed out waiting for ' + what)
}

await poll(function () { return BAC.loaded.restore === true }, 'the sync and app list to finish')

const tabRestore = await screen.findBySelector('#tab-restore')
await waitFor(() => expect(tabRestore).toHaveClass('active'))
await waitFor(() => expect(screen.queryAllBySelector('#pane-save')[0]).toBeHidden())

// The sync note ends as either Refreshed or Could not refresh. Both mention the App Repo.
const note = (await screen.findBySelector('#sync-note')).textContent
expect(note).toContain('from the App Repo')

await sn_atf.evaluate(function () {
    BAC.apps.restore = [
        { sys_id: 'atf_r1', name: 'Alpha Store', scope: 'x_demo_a', version: '1.0.0', latest_version: '1.1.0', upgradeAvailable: true, convertible: true, isConverted: false, restorable: true },
        { sys_id: 'atf_r2', name: 'Beta Store', scope: 'x_demo_b', version: '2.0.0', latest_version: '2.0.0', upgradeAvailable: false, convertible: true, isConverted: false, restorable: true },
        { sys_id: 'atf_r3', name: 'Gamma Store', scope: 'x_demo_c', version: '0.0.0-CONVERTED', latest_version: '', upgradeAvailable: false, convertible: false, isConverted: true, restorable: false },
        { sys_id: 'atf_r4', name: 'Delta Store', scope: 'x_demo_d', version: '1.0.0', latest_version: '1.0.0', upgradeAvailable: false, convertible: false, isConverted: false, restorable: true }
    ]
    BAC.checked.restore = { atf_r1: true, atf_r2: true, atf_r3: true, atf_r4: true }
    BAC.status.restore = {}
    BAC.touched.restore = false
    BAC.filters.restore = { q: '', upgrade: false, failed: false }
    BAC.loaded.restore = true
    renderTable('restore')
})

const paneRestore = await screen.findBySelector('#pane-restore')
const restore = within(paneRestore)
const search = await restore.getByPlaceholderText('Search apps')
const text = function (sel) { return screen.queryAllBySelector(sel)[0].textContent.replace(/\s+/g, ' ').trim() }
function names() {
    return screen.queryAllBySelector('#tbl-restore tbody tr strong').map(function (el) { return el.textContent })
}

await waitFor(() => expect(names()).toEqual(['Alpha Store', 'Beta Store', 'Gamma Store', 'Delta Store']))

// Target column
expect(text('#target-restore-atf_r1')).toBe('1.1.0')
expect(text('#target-restore-atf_r2')).toBe('2.0.0')
expect(text('#target-restore-atf_r3')).toBe('Not in App Repo, cannot restore automatically')
expect(text('#installed-restore-atf_r3')).toBe('0.0.0-CONVERTED')

// Only the app with a newer version carries the Upgrade label
expect(text('#row-restore-atf_r1')).toContain('Upgrade')
expect(text('#row-restore-atf_r2')).not.toContain('Upgrade')

// Rows with nothing to upgrade and no way to convert are locked
const r3 = await screen.findBySelector('input.bac-check[data-id="atf_r3"]')
const r4 = await screen.findBySelector('input.bac-check[data-id="atf_r4"]')
expect(r3).toBeDisabled()
expect(r4).toBeDisabled()
expect(r4).toHaveAttribute('title', 'Nothing to upgrade, and the platform cannot convert this app to dev mode.')
expect(await screen.findBySelector('input.bac-check[data-id="atf_r1"]')).toBeEnabled()

// Only the selectable, checked rows count
await waitFor(() => expect(text('#count-restore')).toBe('2 selected'))
const both = await restore.getByRole('button', { name: 'Upgrade and Convert', exact: true })
const upgrade = await restore.getByRole('button', { name: 'Upgrade', exact: true })
const convert = await restore.getByRole('button', { name: 'Convert to Dev', exact: true })
expect(both).toBeEnabled()
expect(upgrade).toBeEnabled()
expect(convert).toBeEnabled()

// Search by scope, and the upgrade filter
await user.type(search, 'x_demo_b')
await waitFor(() => expect(names()).toEqual(['Beta Store']))
await waitFor(() => expect(text('#count-restore')).toBe('1 selected'))
await user.clear(search)
await waitFor(() => expect(names().length).toBe(4))
await user.click(await screen.findBySelector('input[data-chip="upgrade"]'))
await waitFor(() => expect(names()).toEqual(['Alpha Store']))
await user.click(await screen.findBySelector('input[data-chip="upgrade"]'))
await waitFor(() => expect(names().length).toBe(4))

// Unchecking every selectable app turns the three buttons off
await user.click(await screen.findBySelector('input.bac-all'))
await waitFor(() => expect(text('#count-restore')).toBe('0 selected'))
await waitFor(() => expect(both).toBeDisabled())
expect(upgrade).toBeDisabled()
expect(convert).toBeDisabled()
expect(both).toHaveAttribute('title', 'Check at least one app.')
