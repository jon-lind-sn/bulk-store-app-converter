import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['bulk-app-company'],
    name: 'BulkAppCompany',
    script: Now.include('./BulkAppCompany.server.js'),
    description:
        'Reads the company code (vendor key) from the glide.appcreator.company.code and sn_appauthor.all_company_keys system properties and builds the company scope prefixes (x_<company code>_) used by the Bulk App Clone Assistant and the Scope Normalizer.',
    apiName: 'global.BulkAppCompany',
    clientCallable: false,
    mobileCallable: false,
    sandboxCallable: false,
    active: true,
})
