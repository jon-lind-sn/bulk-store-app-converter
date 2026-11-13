import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['multi-scope-history-finder'],
    name: 'MultiScopeHistoryFinder',
    script: Now.include('./MultiScopeHistoryFinder.server.js'),
    description:
        'Read only. Finds files in sys_update_xml and sys_update_version whose history spans more than one scope, given a scope prefix. The version finder can limit results to files whose newest history row is not current.',
    apiName: 'global.MultiScopeHistoryFinder',
    clientCallable: false,
    mobileCallable: false,
    sandboxCallable: false,
    active: true,
})
