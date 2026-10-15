import { Property } from '@servicenow/sdk/core'

Property({
    $id: Now.ID['53bdd86258a14ab2b5f619b55f1acd56'],
    name: 'bulk_convert_store_app.convertible_apps',
    value: 'x_snc_auto_parts1,x_snc_equip_loan1,x_snc_food_safety1',
    description:
        'Comma delimited list of app scope names the Bulk App Clone Assistant selects for upgrade and conversion when you use Load saved list. E.g. x_snc_auto_parts1,x_snc_equip_check',
    ignoreCache: true,
    roles: {
        read: ['admin'],
        write: ['admin'],
    },
})
