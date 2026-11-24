// The page body is gated on the admin role, so a user with no roles must get no tabs and no server calls.
await sn_atf.navigate('/bulk_convert_store_app_confirm.do?sysparm_tab=save')

for (var i = 0; i < 40; i++) {
    if ((await sn_atf.evaluate(function () { return document.readyState })) === 'complete') { break }
    await sn_atf.delay(250)
}
// Let the page's load handlers run before looking for something that must be absent.
await sn_atf.delay(1500)

expect(await screen.queryBySelector('#bac-root')).toBeNull()
expect(await screen.queryByText('Bulk App Clone Assistant')).toBeNull()
expect(await screen.queryByRole('link', { name: 'Before Clone: Save Work' })).toBeNull()

// If the page script still loaded, it must not have asked the server for any list.
const loaded = await sn_atf.evaluate(function () {
    return typeof BAC === 'undefined' ? 'no script' : String(BAC.loaded.save || BAC.loaded.restore)
})
expect(['no script', 'false']).toContain(loaded)
