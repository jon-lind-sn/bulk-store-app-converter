import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['bulk-publish-my-company-apps'],
    name: 'BulkPublishMyCompanyApps',
    script: Now.include('./BulkPublishMyCompanyApps.server.js'),
    description:
        'Supports bulk publishing of development mode apps to My Application Repository. getNextPublishVersion finds the next minor version the repo will accept by bumping and verifying.',
    apiName: 'global.BulkPublishMyCompanyApps',
    clientCallable: true,
    mobileCallable: false,
    sandboxCallable: false,
    active: true,
    $meta: {
        useEsLatest: true,
    },
})
