# AGENTS.md

Working notes for agents on the Bulk Store App Converter. Read `docs/ui-refactor-implementation-plan.md` for the design and `bulk-publish-feature-plan.md` for the original publish research.

## Project basics

1. now-sdk 4.13.6 Fluent project, scope `global`. Build with `npm run build`, deploy with `npm run deploy`.
2. Dev instance: xare (default now-sdk profile `xare`, basic auth; `xareo` is OAuth to the same host). Check with `npx @servicenow/sdk auth --list`. Do not pipe that command through `head`: the list is long and truncating it once led to the false claim that xare was missing.
3. Inspect the instance with `npx @servicenow/sdk query <table> -q "<encoded query>" -f <fields> -o json`. Lines starting with `[now-sdk]` are log output, not JSON. Occasional `fetch failed` responses are transient; retry.
4. The UI page `src/fluent/ui-pages/bulk_convert_store_app_confirm.now.ts` holds the Jelly `html` and the ES5 `clientScript` as template literals. Inside them, backslashes are doubled, backticks escaped, and `${` written as `\${`. Run a syntax check on the unescaped client script (`node --check`) before deploying. A newline inside a client string is written `\\n` in the file.
5. Server endpoint for the page: `BulkAppConsole` (`src/fluent/script-includes/BulkAppConsole.server.js`), client callable, every method admin guarded, all methods return JSON strings.
6. Test in the browser with chrome-devtools against `https://xare.service-now.com/bulk_convert_store_app_confirm.do`. The page globals (`BAC`, `renderTable`, `uncheckPublished`, and so on) are reachable from `evaluate_script`. Wait for `BAC.loader` to be false and every app in `BAC.saveState` before reading results. `wait_for` on the word "published" matches the "Never published" notes, so poll `BAC.busy` to detect the end of a run.
7. Navigation: the page is the module "Bulk App Clone Assistant" (renamed from "Bulk Convert My Company Apps") under the System Applications menu, which is limited to the `upgrade_admin` role. The two upgrade modules are admin only.
8. Remotes: `origin` (GitHub) and `devsnc` (`code.devsnc.com`). Branch `ui-refactor` is pushed to both. Last pushed commit: `46a1cf1`.

## Platform gotchas

1. `this.getParameter()` in a GlideAjax script include returns a Java string. `typeof` is `object`, so `=== 'save'` is false. Always wrap it in `String(... || '')`. This bug made the Before Clone tab show the After Clone list.
2. Table hierarchy: `sys_scope` is the parent; `sys_app` (development mode apps) and `sys_store_app` (apps installed in store mode) are siblings. The Before Clone tab reads `sys_app` only.
3. Browser cache serves the old client script after a deploy. Reload with cache bypass when testing.
4. `sys_batch_install_plan.state` values: `installed`, `partial_install`, `ready`, `failed`, `invalid`, `rolled_back`, `in_progress`. `sys_execution_tracker.state`: 0 Pending, 1 Running, 2 Successful, 3 Failed, 4 Cancelled.
5. Switching the application picker (`com.snc.apps.AppsAjaxProcessor.changeApplication`) shows an "update set changed" toast for every call. The save status checks flooded the screen with them. The checks do not need the picker, so the page never switches it while checking. The only per-app switch left is in `publishNext`, because the publish permission gate in `BulkPublishMyCompanyApps.server.js` (`canWrite`, `canPublishToAppRepo`) is documented as depending on the picker. Publishing from Global has not been tried. The page switches back to Global at the end of a run.

## App Repo facts (My Application Repository)

1. The instance's repo is set by `sn_appclient.repository_base_url`. The page never queries the repo instance directly; in a live environment only the instance's own tables and platform APIs are available. Work stays local to xare. Do not put the repo host name in UI text.
2. `sn_appauthor.ScopedAppVendorInfoObtainer.obtainDisplayVersionFromAppRepo(appId, version, 'false')` calls `verify_version`. It returns `{ allowed: true }` only when `version` is above the repo's latest for that app, otherwise null. It does not depend on the application picker (probed with the picker on Global and on the app).
3. Derived checks built only on that call:
   1. Current version allowed: the current version is not in the repo.
   2. `0.0.1` allowed: the repo has no version of the app at all ("Not in App Repo").
   3. Repo latest version: highest version `verify_version` rejects, found by searching major, then minor, then patch (`findRepoLatest`, about 3 to 15 calls, only for "Unpublished" apps). Verified: Bulk Store App Converter 1.1.0 locally, repo 1.0.4.
4. The repo endpoint (`sn_orchestration_api_v1.do`, `OrchestrationAPI` in `dev/app-store-fluent`) also has `lookup_version` (latest display version, no date), but on the instance it is only called from Java (`AppRepoRequester.getPublishedVersion`), so scripts cannot use it.
5. Local sources that cannot answer "what version of this dev app is in the repo" (all checked):
   1. `sys_store_app.latest_version`: only exists for store mode apps. Bulk upgrade (`BulkUpgradeMyCompanyApps`) compares `version` to `latest_version` on `sys_store_app`, filled by the platform repo sync.
   2. `sys_remote_app`: repo apps not installed. Holds 3 rows on xare, none are dev apps.
   3. `sys_app_version`: no rows for the apps queried.
   4. `sn_appclient_api_v1.do?app_request_type=list_custom_apps`: My Company Applications "In Development" list. It is the local `sys_app` list and says nothing about the repo.
   5. `sn_appclient_api_v1.do?app_request_type=list_apps_versions`: the repo cache (`servedFromDB: true`). It leaves out apps present as dev apps.
   6. Not yet explored: other methods on `sn_app_api.AppStoreAPI` and `sn_appclient.AppUpgrader`.
6. `store_correlation_id` on `sys_app` can be stale or come from elsewhere. App Repo Source Orchestrator (`x_snc_aso`, 1.4.1, created 2022-04-10 by admin) carries REPOAPP0000001001, which belongs to Customer PM Engagement, an unrelated app. It has no publish trace on xare and no row in the repo, so "Never published to the App Repo" is correct for it. How it got onto xare is unknown. Do not use Customer PM Engagement as evidence for anything.
7. Next version search (`findNextPublishableVersion`): start at the local version plus one minor, keep bumping the minor until `verify_version` accepts. Jon Config is local 1.0.6 but the repo already holds 1.1.0 (REPOAPP0000001046), so the target is 1.2.0.
8. The real world case is a cloned instance, where far fewer apps are "Not in App Repo" than on xare.

## Publish traces on the instance (tested by publishing Equipment Loans 0.0.2 to 0.1.0 on 2026-10-14)

1. `sys_audit` row for `sys_app.version` (0.0.2 to 0.1.0) and one for `store_correlation_id`.
2. `sys_upgrade_plan_item` with `id` = app sys_id, `version` = published version, created at publish time. This is the publish record the page uses. Platform publishes made before this page existed left the same record. Vendor installs also create these rows.
3. Trackers: "Publish to the Application Repository", "Packaging application", "Uploading application". They carry no app reference.
4. `sys_update_xml` and `sys_update_version` for the app record (`sys_app_<id>`) and for the plan item. Exclude both when looking for local edits.
5. Publishes through now-sdk or the CI/CD API are believed not to create `sys_upgrade_plan_item` (not verified). Those apps fall back to "In App Repo".
6. The `bulk_convert_store_app.publish_log` property only exists on the instance that wrote it and is replaced by a clone. It is a weak fallback.
7. Page driven publish test on 2026-10-14: Automate Pro Integration, Change Management Customizations and Indian Food Truck each went 1.0.0 to 1.1.0 (REPOAPP0000001055 to 1057). All three came back as Published with target 1.1.0 to 1.2.0.

## Before Clone tab (getPublishState)

Statuses and labels:

1. Not in App Repo (`not_in_repo`): current version allowed and `0.0.1` allowed. Note: "Never published to the App Repo."
2. Unpublished (`unpublished_version`): current version allowed, `0.0.1` rejected. Note: "Version X is newer than App Repo Y."
3. Changed (`changed`): repo has the current version, a `sys_upgrade_plan_item` exists for it, and a local change is newer than it. Local change = newest `sys_metadata.sys_updated_on` (excluding app records and plan items) or newest `sys_update_xml` for the app (excluding `sys_app_%` and `sys_upgrade_plan_item_%`).
4. Published (`saved`, purple `label-primary`): repo has the current version and nothing changed after its plan item. Note: "Published <date>." Only this status is unchecked by default.
5. In App Repo (`in_repo`): repo has the current version but there is no plan item for it. Shows the last local change date and a "Recent changes" link.
6. Check failed (`check_failed`): retried once automatically, then shows a verbose error with "Retry check" (or "Reload list" when the app left development mode). Stays checked.
7. "Recent changes" link appears only for Changed, In App Repo, and Check failed.

Page behavior:

1. Default selection is every app that is not Published. Needs publishing is the same set as a filter.
2. Filters: search box, "Needs publishing" with count, then one checkbox per status with counts (Changed, Unpublished, Not in App Repo, In App Repo, Published). With no status ticked every app shows. Check failed has a checkbox only while at least one app is in that state, and it clears itself when the count returns to 0.
3. Banner: "N apps may have work that has not been saved yet and are good candidates for publishing before cloning." When none are left: "All dev apps are published to the App Repo. Safe to clone."
4. One Status column. During a run the run state (Pending, Publishing, Failed, Skipped) replaces the save status in the cell. After a publish the cell shows Published again.
5. After a publish run the list reloads and the published apps come back unchecked. Other selections are kept. The target column for a published app shows `<current> to <next>` (next minor above the published version).
6. When no next version can be found the target column shows the current version only. The error text is still returned when Publish is clicked.
7. Check failed error text (server side) names the app, scope, sys_id, version, the step that failed, the exception with line and stack, the repo host, user, instance and time. Client side failures (no answer, bad JSON) show the raw answer and browser time. Every Check failed row has an "Error logs for this check" link to `syslog_list.do` filtered to `level=2` in a window of about 10 seconds around the check (user time zone from the server, browser clock otherwise). The `Today` clause means a check that straddles midnight can miss entries.

## Restore tab (After Clone: Restore), not yet worked on

Observed on xare on 2026-10-14, 6 store mode apps, all checked:

1. ATF Adder (global) and Fleet Vehicle Management: installed `0.0.0-CONVERTED`, target "Not in App Repo, cannot restore automatically" in red.
2. Jon AI 1.4.0, NDA Requests 0.1.0, Peugeot 1.1.0: installed `0.0.0-CONVERTED`, marked "Upgrade".
3. Feature Requests POC: installed 0.0.2, target 0.0.2.
4. Controls: Upgrade and convert all, Upgrade, Convert to Dev, search, "Upgrade available" filter, Load saved list, Save selection. No per-status filters.
5. The red "Not in App Repo" wording is the same kind of claim removed from the Before Clone tab. It comes from the `restorable` flag in `BulkAppConsole.server.js` (line 62): `restorable = !!latest && !isConvertedVersion(latest)`, where `latest` is the app's `sys_store_app.latest_version`. The cause for these two apps (empty or converted `latest_version`) has not been checked.

## Local edit signals (from file history)

1. `sys_update_version.source_table = sys_upgrade_history`: files written by an install or upgrade from the repo.
2. `sys_update_version.source_table = sys_update_set`: local edits (and conversions, version bumps).
3. Installed vendor apps have file timestamps equal to the install time; those dates say nothing about editing.
4. No usable clone date exists on xare or yoyo (`clone_instance`, `sn_instance_clone_request`, `sn_um_lastclone_summary` empty or fetch error), so status logic does not depend on a clone date.

## User preferences for this project

1. Never hide apps from the Before Clone list (no Global scope filter). Losing work is the main risk.
2. Do not force a version bump and republish unless the app changed on this instance since it came from the repo.
3. Every status must tell the user what to do. No "Unknown".
4. Short labels: "Changed", "Unpublished", "Published", "Publish".
5. Leave the two upgrade menu modules as script modules; they share `runUpgrade` with the page.
6. Publishing on xare is fine for testing. Keep it to the apps the user names.
7. Do not mention the repo host in UI text or in chat. Say "the App Repo".
8. Keep checks local to xare. Do not lean on data from another instance.
9. Local publish history cannot prove an app is or is not in the repo. Prefer neutral, actionable wording and defaulting to publish everything that is not Published.

## Open items

1. Work through the Restore tab (see its section above), starting with why ATF Adder and Fleet Vehicle Management show "cannot restore automatically".
2. Retry for a failed app list load (only a message today).
3. "No longer in development mode" path not triggered for real.
4. Whether a publish through now-sdk or the CI/CD API writes `sys_upgrade_plan_item`.
5. Whether publishing works with the picker left on Global (would remove the last picker switch).
6. Server side Check failed text and the error log window have not been triggered by a real failure.
7. Docs refresh (`README.md`, `docs/app-overview.md`).
8. Whether to open a pull request for `ui-refactor` (pushed to `origin` and `devsnc`).
