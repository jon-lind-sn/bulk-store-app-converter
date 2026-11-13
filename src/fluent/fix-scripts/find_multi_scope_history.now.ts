import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['fix-find-multi-scope-history'],
    table: 'sys_script_fix',
    data: {
        name: 'Find multi-scope history files',
        description:
            'Finds files whose version history spans two or more scopes, using MultiScopeHistoryFinder. Reports only by default. Optional fixes revert to the newest version, move version rows into the app scope and update the file\'s update XML rows. Every run and change is logged to the system log (source MultiScopeHistory). Set OPTIONS at the top of the script.',
        script: Now.include('./find_multi_scope_history.js'),
    },
})
