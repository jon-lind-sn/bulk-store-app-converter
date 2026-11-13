import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['fix-find-multi-scope-history'],
    table: 'sys_script_fix',
    data: {
        name: 'Find multi-scope history files',
        description:
            'Read only against the update tables. Uses MultiScopeHistoryFinder to identify and group files whose version history spans two or more scopes, records them in u_msh_run and u_msh_file, and prints list links. Set OPTIONS at the top of the script.',
        script: Now.include('./find_multi_scope_history.js'),
    },
})
