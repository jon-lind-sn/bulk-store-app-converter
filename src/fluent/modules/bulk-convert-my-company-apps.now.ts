import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['0733e5a91a7247b39c8d2b650f060a31'],
    table: 'sys_app_module',
    data: {
        active: true,
        application: '9e329333c33220001875addbdfba8f56',
        hint: 'Before a clone: publish dev apps to My Application Repository. After a clone: upgrade and convert store apps to development mode.',
        link_type: 'DIRECT',
        mobile_title: 'Bulk Convert Store Apps',
        mobile_view_name: 'Mobile',
        order: 106,
        override_menu_roles: false,
        query: 'bulk_convert_store_app_confirm.do',
        require_confirmation: false,
        roles: ['admin'],
        sys_domain: 'global',
        sys_domain_path: '/',
        title: 'Bulk App Clone Assistant',
        uncancelable: false,
    },
})
