import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['0dd88b5493924b50244af07e2803d6e7'],
    name: 'BulkUpgradeMyCompanyApps',
    script: Now.include('./BulkUpgradeMyCompanyApps.server.js'),
    description:
        'Script to bulk upgrade your company\'s applications to the latest versions.  It will either use the system property bulk_convert_store_app.convertible_apps (containing scope names) or you may call it yourself and pass a filter for the apps you wish to upgrade (e.g. "is_store_app=false" will usually return all of your custom apps).',
    apiName: 'global.BulkUpgradeMyCompanyApps',
    clientCallable: false,
    mobileCallable: false,
    sandboxCallable: false,
    active: true,
    $meta: {
        useEsLatest: true,
    },
})
