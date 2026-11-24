import { ScriptInclude } from '@servicenow/sdk/core'

ScriptInclude({
    $id: Now.ID['multi-scope-history-finder'],
    name: 'MultiScopeHistoryFinder',
    script: Now.include('./MultiScopeHistoryFinder.server.js'),
    description:
        'Finds files in sys_update_xml and sys_update_version whose history spans more than one scope, given a scope filter. A run only reports unless fix options are set (revert, normalize, updateXml with a limit), which change version and update XML rows. Every run writes a summary to the system log.',
    apiName: 'global.MultiScopeHistoryFinder',
    clientCallable: false,
    mobileCallable: false,
    sandboxCallable: false,
    active: true,
})
