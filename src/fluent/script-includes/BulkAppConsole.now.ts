import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['bulk-app-console'],
    name: 'BulkAppConsole',
    script: Now.include('./BulkAppConsole.server.js'),
    description:
        'Admin guarded GlideAjax endpoint for the Bulk App Clone Assistant page: lists apps per tab, checks prerequisites, starts upgrades, reports save status and publish previews.',
    apiName: 'global.BulkAppConsole',
    clientCallable: true,
    mobileCallable: false,
    sandboxCallable: false,
    active: true,
    $meta: {
        useEsLatest: true,
    },
})
