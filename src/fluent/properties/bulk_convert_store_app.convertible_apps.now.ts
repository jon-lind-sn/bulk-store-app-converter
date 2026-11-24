import { Property } from '@servicenow/sdk/core'

Property({
    $id: Now.ID['53bdd86258a14ab2b5f619b55f1acd56'],
    name: 'bulk_convert_store_app.convertible_apps',
    value: '',
    description:
        'Comma delimited list of app scope names the Bulk App Clone Assistant selects for upgrade and conversion when you use Load saved list. E.g. x_<company code>_app1,x_<company code>_app2',
    ignoreCache: true,
    roles: {
        read: ['admin'],
        write: ['admin'],
    },
})
