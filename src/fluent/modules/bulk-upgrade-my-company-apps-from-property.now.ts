import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['bd9797d093564b50244af07e2803d611'],
    table: 'sys_app_module',
    data: {
        active: true,
        application: '9e329333c33220001875addbdfba8f56',
        hint: 'Upgrades eligible apps by comma delimited scope name in sys property `bulk_convert_store_app.convertible_apps`. BE SURE TO REFRESH MY COMPANY APPS!',
        link_type: 'SCRIPT',
        mobile_title: 'Bulk Upgrade My Apps',
        mobile_view_name: 'Mobile',
        order: 106,
        override_menu_roles: false,
        query: '(new global.BulkUpgradeMyCompanyApps()).upgradeSavedApps();',
        require_confirmation: true,
        roles: ['admin'],
        sys_domain: 'global',
        sys_domain_path: '/',
        title: 'Bulk Upgrade My Company Apps from Property',
        uncancelable: false,
        window_name: 'upgrade_company_apps',
    },
})
