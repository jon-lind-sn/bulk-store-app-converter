import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['849a49979396c710244af07e2803d6df'],
    table: 'sys_app_module',
    data: {
        active: true,
        application: '9e329333c33220001875addbdfba8f56',
        hint: 'Upgrades all apps where is_store_app = false.  Works on apps in Store mode, then you can convert them to dev mode.',
        link_type: 'SCRIPT',
        mobile_title: 'Bulk Upgrade My Apps',
        mobile_view_name: 'Mobile',
        order: 106,
        override_menu_roles: false,
        query: '(new global.BulkUpgradeMyCompanyApps()).upgradeMyCompanyApps();',
        require_confirmation: true,
        roles: ['admin'],
        sys_domain: 'global',
        sys_domain_path: '/',
        title: 'Bulk Upgrade ALL My Company Apps',
        uncancelable: false,
        window_name: 'upgrade_company_apps',
    },
})
