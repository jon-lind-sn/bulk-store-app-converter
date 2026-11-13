# Scope Normalizer

Tooling in the Bulk Store App Converter app that finds application files whose version history spans more than one scope, and repairs them so every version row sits in the app's scope with the newest version current. It is built with the [ServiceNow SDK](https://github.com/ServiceNow/sdk) and runs on the instance as a script include called from a fix script.

## The Problem

A file is one metadata record, identified by its update name (for example `sc_cat_item_<sys_id>`). Its history lives in `sys_update_version`: one row per change, each with an `application` (scope), a `state` (`current`, `previous`, `history`) and a `sys_recorded_at` timestamp. Its captured changes live in `sys_update_xml`.

The broken files share this shape:

1. The record was customized in `global` through update sets. Those version rows are in `global`, and the last one holds `state=current`.
2. A scoped app (for example Telephony Catalog, `x_snc_telephony_0`) containing the same record was then installed or deployed. The install wrote a new version row in the app scope with `source_table=sys_store_app` and `state=history`.
3. The install did not move the `current` flag. The newest row by timestamp is a skipped `history` row in the app scope, and `current` stays on an older `global` row.
4. The `sys_update_xml` rows stay in `global`. The record's own `sys_scope` often stays `global` too.

The goal is to remove `global` from these histories: every version row in the app scope, the newest version applied and current, and optionally the Extensible Markup Language (XML) update rows cleaned up.

Example from yoyo, `sc_cat_item_4a17d6a3ff133100ba13ffffffffffe7` (Apple Watch) before the fix:

| Recorded at | State | Source | Scope |
|---|---|---|---|
| 2026-11-13 16:29:49 | History | Store Application: Telephony Catalog | x_snc_telephony_0 |
| 2026-11-13 15:56:25 | Current | Update Set: Apple Watch - Global 2 | global |
| 2026-11-13 15:55:00 | Previous | Update Set: Apple Watch - Global 1 | global |
| 2026-11-13 05:32:12 | Previous | System Upgrades (baseline) | global |

## Terms

1. **Newest**: the version row with the highest `sys_recorded_at`, whatever its state.
2. **Current**: the version row with `state=current`. In the broken files it is older than the newest row.
3. **Target scope**: the scope the fix moves rows into. It is the newest scope in the history that is not `global`.

## Components

1. `src/fluent/script-includes/MultiScopeHistoryFinder.server.js`: the `MultiScopeHistoryFinder` script include (global, not client callable). All logic lives here.
2. `src/fluent/script-includes/MultiScopeHistoryFinder.now.ts`: its Fluent definition.
3. `src/fluent/fix-scripts/find_multi_scope_history.js`: the script body of the fix script "Find multi-scope history files". Edit `OPTIONS` at the top, then run it.
4. `src/fluent/fix-scripts/find_multi_scope_history.now.ts`: its Fluent definition (`sys_script_fix` record).

No custom tables. Status goes to the system log, so the tool adds no storage cost for customers.

## Detection

`run(options)` works in batches so it scales to hundreds of thousands of files:

1. A `GlideAggregate` on `sys_update_version` with the `filter` encoded query, grouped and ordered by `name`, streams candidate names. Only rows matching the filter pick candidates.
2. Each batch of 200 names loads every version row for those names (all scopes), the `sys_update_xml` counts per name and scope, and the record's own `sys_scope` for names shaped `<table>_<sys_id>`.
3. `classify()` groups each file's rows. Files whose rows cover fewer than two scopes are dropped.
4. The run stops at `limit` files. A report with no `limit` checks every file the filter matches, so use the filter to work on one app or one group of files at a time.

`classify()` is pure (no queries), which is how it is unit tested offline with Node (see Testing, step 2).

### Patterns

1. `newer_history_other_scope`: the newest row is not current and sits in a different scope from the current row. This is the main broken case.
2. `newer_history_same_scope`: the newest row is not current and shares the current row's scope. An older row in another scope (often a `global` upgrade baseline) makes the history multi-scope.
3. `current_is_newest`: the history is multi-scope but already current.
4. `no_current`: no row has `state=current`.

### Flags

1. `current_in_older_scope`: the current row is outside the newest row's scope. Deleting the rows outside the newest scope would delete the current row.
2. `multiple_current`: more than one row has `state=current`.
3. `record_not_found`: the name does not map to a record (for example `sys_ui_related_*` names).
4. `record_scope_differs_from_current` and `record_scope_differs_from_newest`: the record's `sys_scope` disagrees with that row.
5. `no_target_scope`: every row is in `global`, so `app` has no target.
6. `no_update_xml`, `update_xml_multi_scope`, `update_xml_not_in_target_scope`: the state of the file's `sys_update_xml` rows.

## Fixes

Each step is optional and they run in this order for every matching file:

1. **Revert** (`revert: true`). When the newest row is not current (either `newer_history_*` pattern), call `new GlideappUpdateVersion().revert(newestId)`. This is the same call the "Revert to this version" related link makes through `RevertUpdateVersionAjax`. It applies the newest version's payload to the record and creates a new current version row with `reverted_from` pointing at the history row.
2. **Normalize** (`normalize: true`). Re-read the file's rows after the revert, then set `application` to the target scope on every version row outside it. Updates use `setWorkflow(false)` and change only `application`.
3. **Update XML** (`updateXml`).
   1. `none` (default): leave `sys_update_xml` alone.
   2. `normalize`: set `application` to the target scope on the file's XML rows outside it. The rows keep their original update set.
   3. `delete_new`: delete XML rows outside the target scope that this run created, such as the row a revert writes.

Safety rules:

1. Any fix requires a `limit` (e.g. 100), so a wrong filter cannot change every file in one run. To fix more, narrow the filter and run again.
2. An invalid filter is rejected before the run starts (`isValidEncodedQuery`), so it never matches every row.
3. A failure on one file is logged and counted, and the run moves on to the next file.

## Options

| Option | Default | Meaning |
|---|---|---|
| `filter` | `application.scopeSTARTSWITHx_snc` | Encoded query on `sys_update_version` that picks candidate rows. The scope field is `application`, so filter on `application.scope`. `sys_scope.name` is the display name ("Telephony Catalog"). |
| `revert` | `false` | Fix step 1. |
| `normalize` | `false` | Fix step 2. |
| `updateXml` | `none` | Fix step 3: `none`, `normalize` or `delete_new`. |
| `limit` | `0` | Maximum files to check. A fix requires a limit (e.g. 100). |

Filter examples, added one condition at a time:

1. `application.scopeSTARTSWITHx_snc^state=history`
2. `application.scopeSTARTSWITHx_snc^source_table=sys_store_app`
3. `application.scope=x_snc_telephony_0`
4. `application.scopeSTARTSWITHx_snc^name=sc_cat_item_73b1bafa9752cd1021983d1e6253afb5` (one file)

## Output and Status

1. The fix script prints the run ID, counts, a summary by pattern, scope path and flag, one line per file (first 500), version list links grouped by name, and a link to the run's log entries.
2. The system log (`syslog`, source `MultiScopeHistory`) gets one `fixed` or `failed` line per file. Each line names the reverted row, the new current row and its scope, every moved version row with its old scope and state, and every XML row touched. A `done` line per run holds the options, counts and summary. These lines are the record of what changed and how to undo it.
3. The system log rotates, so copy anything to keep long term.
4. `syslog` is large. Query it with a time window first (for example `sys_created_on>javascript:gs.minutesAgoStart(10)^source=MultiScopeHistory`), or the Table API request times out.

## Testing

The test instance is yoyo (now-sdk credential alias `yoyo`). Each test touches one file or one scope.

1. **Report first.** Run the fix script with the default options (report only) and check the counts and patterns against the version rows.
2. **Unit test `classify()` offline.** Load the script include in Node with a stub `Class.create`, feed it rows pulled from yoyo with `npx @servicenow/sdk query`, and check pattern, target scope and the rows to move. This also covered the case where a revert lands in `global` (the target is still the app scope).
3. **Record the before state.** Query the file's `sys_update_version` rows, `sys_update_xml` rows and the record's `sys_scope` and `sys_updated_on`.
4. **Set one-file options.** Edit `OPTIONS` in `find_multi_scope_history.js` (filter on the file name, `limit: 1`, the fixes under test), run `node --check`, `npm run build`, then `npx @servicenow/sdk install -a yoyo`.
5. **Run the fix script** from its form with Run Fix Script, then Proceed.
6. **Compare.** Read the run's log lines, then query the version rows, XML rows and record again and compare with step 3.
7. **Restore** the report-only defaults in `OPTIONS` and deploy again.

## Results on yoyo

Report run with the default filter: 2506 files checked in about 4.5 seconds, 7 multi-scope files.

1. 5 catalog items in `newer_history_other_scope`: 2 in Telephony Catalog (`global > x_snc_telephony_0`) and 3 in Enterprise Services Catalog (`global > x_snc_enterprise_0`).
2. 2 files in `newer_history_same_scope`: `pc_hardware_cat_item_060f3afa3731300054b6a3549dbe5d3e` (Apple iPad 3, Telephony Catalog, `global > x_snc_telephony_0` through its upgrade baseline) and `sys_ui_related_sn_releaseops_deployment_request_null` (`x_snc_relops_help > sn_releaseops`).

Files fixed with the script include (revert, then normalize, `updateXml: 'none'`), except Apple Watch:

| File | Record scope | Fix | Result |
|---|---|---|---|
| `sc_cat_item_4a17d6a3ff133100ba13ffffffffffe7` (Apple Watch) | global | Normalize, then "Revert to this version" in the user interface (UI) | 5 rows in Telephony Catalog, newest current. 1 new global XML row (Default update set). |
| `sc_cat_item_73b1bafa9752cd1021983d1e6253afb5` (Apple iPhone 13 pro) | global | Script: revert, then normalize | 5 rows in Telephony Catalog, newest current. 1 new global XML row (Default update set). |
| `pc_hardware_cat_item_060f3afa3731300054b6a3549dbe5d3e` (Apple iPad 3) | x_snc_telephony_0 | Script: revert, then normalize | 5 rows in Telephony Catalog, newest current. New XML row in Telephony Catalog. |
| `sc_cat_item_73237ada4fff0200086eeed18110c7fc` (Endpoint Security) | global | Script: revert, then normalize | 5 rows in Enterprise Services Catalog, newest current. 1 new global XML row (Default update set). |
| `sc_cat_item_c0c5b2db4fbf4200086eeed18110c718` (Provision a Database) | global | Script: revert, then normalize | 5 rows in Enterprise Services Catalog, newest current. 1 new global XML row (Default update set). |
| `sc_cat_item_f3937ada4fff0200086eeed18110c7f2` (VM Provisioning) | global | Script: revert, then normalize | 5 rows in Enterprise Services Catalog, newest current. 1 new global XML row (Default update set). |

Next install of each app after the fix, deployed through App Engine Management Center (AEMC): Telephony Catalog 1.0.7 and Enterprise Services Catalog 1.0.3, each with a scoped edit to the fixed items. All 6 files installed with disposition Inserted (`changed=true`) and none skipped. Every record moved from `global` to the app scope, and every version row is in the app scope.

Not yet fixed: the releaseops related list.

## Findings

1. **Normalize alone fixes only the scope.** It does not make the newest row current. The revert does that.
2. **The revert creates a new row.** It leaves the history row as `history` and adds a current row copied from it, with `reverted_from` set. The previous current row becomes `previous`.
3. **The revert's new version row takes the reverted row's scope.** On Apple iPhone 13 pro it landed in Telephony Catalog even with older rows still in `global`.
4. **The revert's new XML row follows the record's scope.** Records still in `global` get a new `global` XML row in the user's current update set. Records already in the app scope get an app-scope XML row.
5. **The revert applies the history payload, system fields included.** The record's `sys_updated_on` takes the timestamp stored in that version.
6. **The revert works from a fix script.** With the application picker on Global it succeeded for a `global` record and for a Telephony Catalog record.
7. **The UI link needs write access to the record.** "Revert to this version" is hidden unless `GlideappUpdateVersion.canWriteRecordInVersion` is true. With the picker on Enterprise Services Catalog it was hidden for a `global` record. Switching the picker to Global showed it, and also switched the update set to Default (Global).
8. **The record's `sys_scope` is not changed by any step.** After the fix, Apple Watch, Apple iPhone 13 pro and the 3 Enterprise Services Catalog items were still `global` records with app-scope history.
9. **The next install moves the record into the app scope.** On the first app install after the fix, every fixed record moved from `global` to the app scope and was applied (Inserted), with no skip.
10. **The next install adds a current version from the update set.** Next to the app's `history` row (source `sys_store_app`), the install creates a new `current` version whose source is the installing user's current update set (Default on yoyo), in the same second. Every version row stays in the app scope.
11. **The old `global` XML rows do not cause a skip.** The fixed files kept their `global` `sys_update_xml` rows, plus the revert's new one, and still installed cleanly.

## Platform Gotchas

1. `GlideDateTime.getValue()` returns a Java string. Calling `.replace` on it fails with an ambiguous Java method error. Wrap it in `String()`.
2. A Fluent `Table()` in a global app builds with column names that lack the `u_` prefix, but the instance drops those columns on install. Use `u_` on every column of a `u_` table.
3. Removing a `Table()` definition, or adding `Now.del('sys_db_object', ...)`, does not drop the table on install. The instance ignores table deletes from an app install, and the table form's Delete needs a browser prompt.
4. Fix script output repeats "Unable to find vtable operation for operation id {}". It is platform noise and shows up on every run.

## Open Items

1. Decide on the releaseops related list (`newer_history_same_scope`, record not found).
2. The `global` XML rows do not block the next install (Findings 11). Decide whether to clean them up anyway, and test `updateXml: 'delete_new'` and `'normalize'` on one file each if so.
3. Test the revert with the application picker on an unrelated scope.
4. Delete the leftover `u_msh_run` and `u_msh_file` tables on yoyo (by hand, `u_msh_file` first, with the picker on Bulk Store App Converter).
