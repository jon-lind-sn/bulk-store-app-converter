import { Test, TestSuite } from '@servicenow/sdk/core'
import '@servicenow/sdk/global'

// Non-destructive tests. Nothing here publishes to the App Repo, installs or upgrades an app, converts an app,
// saves the saved list, or runs a Scope Normalizer fix. See each description for what it reads.

const ADMIN_ROLE = '2831a114c611228501d4ea6c309d626d'

const classify = Test(
    {
        $id: Now.ID['atf_msh_classify'],
        name: 'Scope Normalizer: classify file histories',
        description:
            'Feeds made up version rows to MultiScopeHistoryFinder.classify and asserts each pattern (newer history in another scope, in the same scope, current is newest, no current), the flags, the scope path, the target scope and the rows to change. Pure logic, no queries.',
        active: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['atf_msh_classify_step'],
            jasmineVersion: '3.1',
            script: Now.include('./msh_classify.script.js'),
        })
    }
)

const options = Test(
    {
        $id: Now.ID['atf_msh_options'],
        name: 'Scope Normalizer: options and validation',
        description:
            'Asserts MultiScopeHistoryFinder parses its options strictly (a fix turns on only for boolean true, unknown updateXml modes become none, the limit defaults to 0) and that _validate rejects every kind of fix without a limit. Reads nothing beyond a filter syntax probe.',
        active: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['atf_msh_options_step'],
            jasmineVersion: '3.1',
            script: Now.include('./msh_options.script.js'),
        })
    }
)

const urls = Test(
    {
        $id: Now.ID['atf_msh_urls'],
        name: 'Scope Normalizer: list and log links',
        description:
            'Asserts getListUrls builds the grouped sys_update_version and sys_update_xml list queries, splits them into links of 80 names, and that getLogUrl filters the system log to one run or to all runs. String building only.',
        active: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['atf_msh_urls_step'],
            jasmineVersion: '3.1',
            script: Now.include('./msh_urls.script.js'),
        })
    }
)

const run = Test(
    {
        $id: Now.ID['atf_msh_run'],
        name: 'Scope Normalizer: report only runs and fix guards',
        description:
            'Runs MultiScopeHistoryFinder in report mode against a filter that matches nothing and a capped real filter, asserting the result shape, the limit message and consistent counts. Asserts every fix option throws without a limit before any query. Writes only the "done" line each run adds to the system log.',
        active: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['atf_msh_run_step'],
            jasmineVersion: '3.1',
            script: Now.include('./msh_run.script.js'),
        })
    }
)

const upgrade = Test(
    {
        $id: Now.ID['atf_bulk_upgrade'],
        name: 'Bulk upgrade helper: version comparison and empty input',
        description:
            'Asserts BulkUpgradeMyCompanyApps.updateAvailable compares versions numerically with missing parts as zero, upgradeByIds does nothing for an empty list or ids that match no app, and upgradeByFilter refuses an empty query. No install is started.',
        active: true,
    },
    (atf) => {
        atf.server.runServerSideScript({
            $id: Now.ID['atf_bulk_upgrade_step'],
            jasmineVersion: '3.1',
            script: Now.include('./bulk_upgrade.script.js'),
        })
    }
)

const nonAdmin = Test(
    {
        $id: Now.ID['atf_console_nonadmin'],
        name: 'Page server API: non-admin is denied',
        description:
            'Creates a user with no roles, impersonates it, and asserts every BulkAppConsole and BulkPublishMyCompanyApps endpoint answers "admin role required". All parameters are empty or point at nothing. The test user is rolled back by ATF.',
        active: true,
    },
    (atf) => {
        atf.server.createUser({
            $id: Now.ID['atf_console_nonadmin_user'],
            firstName: 'ATF',
            lastName: 'No Roles',
            fieldValues: { user_name: 'atf_bsac_no_roles' },
            groups: [],
            roles: [],
            impersonate: true,
        })
        atf.server.runServerSideScript({
            $id: Now.ID['atf_console_nonadmin_step'],
            jasmineVersion: '3.1',
            script: Now.include('./console_nonadmin.script.js'),
        })
    }
)

const admin = Test(
    {
        $id: Now.ID['atf_console_admin'],
        name: 'Page server API: admin read endpoints',
        description:
            'Creates an admin user, impersonates it, and asserts the read only BulkAppConsole endpoints: prerequisites, saved list, both app lists (dev mode apps only, one row per company store app, computed flags), batch state, and the not found and empty input branches of getPublishState, startUpgrade and recordPublish. Never asks the App Repo, publishes or upgrades.',
        active: true,
    },
    (atf) => {
        atf.server.createUser({
            $id: Now.ID['atf_console_admin_user'],
            firstName: 'ATF',
            lastName: 'Admin',
            fieldValues: { user_name: 'atf_bsac_admin' },
            groups: [],
            roles: [ADMIN_ROLE],
            impersonate: true,
        })
        atf.server.runServerSideScript({
            $id: Now.ID['atf_console_admin_step'],
            jasmineVersion: '3.1',
            script: Now.include('./console_admin.script.js'),
        })
    }
)

const uiLayout = Test(
    {
        $id: Now.ID['atf_ui_layout'],
        name: 'Clone Assistant page: layout and tabs',
        description:
            'Opens the page on the Before Clone tab and asserts the heading, both tabs, that only the Before Clone pane shows, its buttons, search box and seven filter chips, the hidden After Clone controls, and the How it works and source links. Clicks nothing.',
        active: true,
    },
    (atf) => {
        atf.uiTestScript.runTest({
            $id: Now.ID['atf_ui_layout_step'],
            script: Now.include('./ui_layout.script.js'),
        })
    }
)

const uiFilters = Test(
    {
        $id: Now.ID['atf_ui_filters'],
        name: 'Clone Assistant page: Before Clone search, filters and selection',
        description:
            'Replaces the Before Clone list with three made up apps in the page, then asserts the version and save status cells, the search box, the Needs publishing and status chips, the banner counts, the default selection, and when Publish and Convert to Store enable. No server call and no action button.',
        active: true,
    },
    (atf) => {
        atf.uiTestScript.runTest({
            $id: Now.ID['atf_ui_filters_step'],
            script: Now.include('./ui_filters.script.js'),
        })
    }
)

const uiRestore = Test(
    {
        $id: Now.ID['atf_ui_restore'],
        name: 'Clone Assistant page: After Clone selection and filters',
        description:
            'Opens the After Clone tab (which refreshes versions from the App Repo), replaces the list with four made up apps, and asserts the target column, the Upgrade label, locked rows, the selected count, search, the Upgrade available filter, and when the three action buttons enable. No action button is clicked.',
        active: true,
    },
    (atf) => {
        atf.uiTestScript.runTest({
            $id: Now.ID['atf_ui_restore_step'],
            script: Now.include('./ui_restore.script.js'),
        })
    }
)

const uiHelpers = Test(
    {
        $id: Now.ID['atf_ui_helpers'],
        name: 'Clone Assistant page: helper functions',
        description:
            'Calls the page script functions (esc, nextMinorVersion, localStamp, errorLogUrl, saveNote, isRowSelectable, targetHtml, statusHtml, getUrlParam) in the page and asserts their output for normal, empty and special character inputs. No state is changed.',
        active: true,
    },
    (atf) => {
        atf.uiTestScript.runTest({
            $id: Now.ID['atf_ui_helpers_step'],
            script: Now.include('./ui_helpers.script.js'),
        })
    }
)

const uiNonAdmin = Test(
    {
        $id: Now.ID['atf_ui_nonadmin'],
        name: 'Clone Assistant page: hidden from non-admin',
        description:
            'Creates a user with no roles, impersonates it, opens the page, and asserts the admin gated body (tabs, heading, root element) is absent and the page script never loaded an app list.',
        active: true,
    },
    (atf) => {
        atf.server.createUser({
            $id: Now.ID['atf_ui_nonadmin_user'],
            firstName: 'ATF',
            lastName: 'UI No Roles',
            fieldValues: { user_name: 'atf_bsac_ui_no_roles' },
            groups: [],
            roles: [],
            impersonate: true,
        })
        atf.uiTestScript.runTest({
            $id: Now.ID['atf_ui_nonadmin_step'],
            script: Now.include('./ui_nonadmin.script.js'),
        })
    }
)

TestSuite({
    $id: Now.ID['atf_suite_bulk_app_clone_assistant'],
    name: 'Bulk App Clone Assistant: non-destructive tests',
    description:
        'Script include and page tests that never publish to the App Repo, install, upgrade or convert an app, or run a Scope Normalizer fix.',
    tests: [classify, options, urls, run, upgrade, nonAdmin, admin, uiLayout, uiFilters, uiRestore, uiHelpers, uiNonAdmin],
})
