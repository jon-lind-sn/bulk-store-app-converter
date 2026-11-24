// Opens the Before Clone tab through sysparm_tab so the page never starts the App Repo sync that the After Clone tab runs.
// Only looks at the page. No button is clicked.
await sn_atf.navigate('/bulk_convert_store_app_confirm.do?sysparm_tab=save')

await screen.findByRole('heading', { name: 'Bulk App Clone Assistant', timeout: 20000 })

// Tabs
await screen.findByRole('link', { name: 'Before Clone: Save Work' })
await screen.findByRole('link', { name: 'After Clone: Restore' })
const tabSave = await screen.findBySelector('#tab-save')
const tabRestore = await screen.findBySelector('#tab-restore')
await waitFor(() => expect(tabSave).toHaveClass('active'))
expect(tabRestore).not.toHaveClass('active')

// Only the Before Clone pane shows
const paneSave = await screen.findBySelector('#pane-save')
const paneRestore = await screen.findBySelector('#pane-restore')
await waitFor(() => expect(paneSave).toBeVisible())
await waitFor(() => expect(paneRestore).toBeHidden())

// Before Clone pane
const save = within(paneSave)
await save.findByText('Development mode apps.')
await save.getByRole('button', { name: 'Publish', exact: true })
await save.getByRole('button', { name: 'Convert to Store', exact: true })
await save.getByPlaceholderText('Search apps')
// One chip for "Needs publishing" plus one per save status. Check failed stays hidden until a check fails.
const chips = await save.queryAllBySelector('input.bac-chip')
expect(chips.length).toBe(7)
expect((await save.queryAllBySelector('#count-save')).length).toBe(1)

// After Clone pane is built but hidden, so look for its controls with hidden: true
const restore = within(paneRestore)
await restore.getByRole('button', { name: 'Upgrade and Convert', hidden: true, exact: true })
await restore.getByRole('button', { name: 'Upgrade', hidden: true, exact: true })
await restore.getByRole('button', { name: 'Convert to Dev', hidden: true, exact: true })
await restore.getByRole('link', { name: 'Load saved list', hidden: true })
await restore.getByRole('link', { name: 'Save selection', hidden: true })

// Help and source link
await screen.getByText('How it works')
const source = await screen.getByRole('link', { name: 'Source on GitHub' })
expect(source).toHaveAttribute('target', '_blank')
