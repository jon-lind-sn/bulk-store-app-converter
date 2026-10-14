# AGENTS.md

Working notes for agents on the Bulk Store App Converter. Read `docs/ui-refactor-implementation-plan.md` for the design and `bulk-publish-feature-plan.md` for the original publish research.

## Project basics

1. now-sdk 4.13.6 Fluent project, scope `global`. Build with `npm run build`, deploy with `npm run deploy`.
2. Dev instance: xare (default now-sdk profile `xare`, basic auth; `xareo` is OAuth to the same host). Check with `npx @servicenow/sdk auth --list`. Do not pipe that command through `head`: the list is long and truncating it once led to the false claim that xare was missing.
3. Inspect the instance with `npx @servicenow/sdk query <table> -q "<encoded query>" -f <fields> -o json`. Lines starting with `[now-sdk]` are log output, not JSON. Occasional `fetch failed` responses are transient; retry.
4. The UI page `src/fluent/ui-pages/bulk_convert_store_app_confirm.now.ts` holds the Jelly `html` and the ES5 `clientScript` as template literals. Inside them, backslashes are doubled, backticks escaped, and `${` written as `\${`. Run a syntax check on the unescaped client script (`node --check`) before deploying.
5. Server endpoint for the page: `BulkAppConsole` (`src/fluent/script-includes/BulkAppConsole.server.js`), client callable, every method admin guarded, all methods return JSON strings.

## Platform gotchas found during the UI refactor

1. `this.getParameter()` in a GlideAjax script include returns a Java string. `typeof` is `object`, so `=== 'save'` is false. Always wrap it in `String(... || '')`. This bug made the Before Clone tab show the After Clone list.
2. Table hierarchy: `sys_scope` is the parent; `sys_app` (development mode apps) and `sys_store_app` (apps installed in store mode) are siblings. The Before Clone tab reads `sys_app` only.
3. Browser cache serves the old client script after a deploy. Reload with cache bypass when testing.
4. `sys_batch_install_plan.state` values: `installed`, `partial_install`, `ready`, `failed`, `invalid`, `rolled_back`, `in_progress`. `sys_execution_tracker.state`: 0 Pending, 1 Running, 2 Successful, 3 Failed, 4 Cancelled.

## App Repo facts (My Application Repository)

1. The instance's repo is set by `sn_appclient.repository_base_url` (xare points to `https://zorb.service-now.com/`). The page never queries the repo instance directly; in a live environment only the instance's own tables and platform APIs are available.
2. `sn_appauthor.ScopedAppVendorInfoObtainer.obtainDisplayVersionFromAppRepo(appId, version, 'false')` calls `verify_version`. It returns `{ allowed: true }` only when `version` is above the repo's latest for that app, otherwise null. It does not depend on the application picker (probed with the picker on Global and on the app).
3. Derived checks built only on that call:
   1. Current version allowed: the current version is not in the repo.
   2. `0.0.1` allowed: the repo has no version of the app at all ("Not in App Repo").
   3. Repo latest version: highest version `verify_version` rejects, found by searching major, then minor, then patch (`findRepoLatest`, about 3 to 15 calls, only for "Unpublished" apps). Verified: Bulk Store App Converter 1.1.0 locally, repo 1.0.4.
4. The repo endpoint (`sn_orchestration_api_v1.do`, `OrchestrationAPI` in `dev/app-store-fluent`) also has `lookup_version` (latest display version, no date), but on the instance it is only called from Java (`AppRepoRequester.getPublishedVersion`), so scripts cannot use it.
5. `sys_app_version` and `sys_remote_app` are a local cache of repo metadata for store apps and apps not installed. They never hold rows for `sys_app` development mode apps, so they cannot answer "when was this dev app published".
6. `store_correlation_id` on `sys_app` can come from a different repo than the one configured. App Repo Source Orchestrator has REPOAPP0000001001, which is Customer PM Engagement in the zorb repo, and the zorb repo has no `x_snc_aso` app.

## Publish traces on the instance (tested by publishing Equipment Loans 0.0.2 to 0.1.0 on 2026-10-14)

1. `sys_audit` row for `sys_app.version` (0.0.2 to 0.1.0) and one for `store_correlation_id`.
2. `sys_upgrade_plan_item` with `id` = app sys_id, `version` = published version, created at publish time. This is the publish record the page uses. Platform publishes made before this page existed left the same record. Vendor installs also create these rows.
3. Trackers: "Publish to the Application Repository", "Packaging application", "Uploading application". They carry no app reference.
4. `sys_update_xml` and `sys_update_version` for the app record (`sys_app_<id>`) and for the plan item. Exclude both when looking for local edits.
5. Publishes through now-sdk or the CI/CD API are believed not to create `sys_upgrade_plan_item` (not verified). Those apps fall back to "In App Repo".
6. The `bulk_convert_store_app.publish_log` property only exists on the instance that wrote it and is replaced by a clone. It is a weak fallback.

## Before Clone save status (getPublishState)

1. Not in App Repo: current version allowed and `0.0.1` allowed. Note names the repo host.
2. Unpublished: current version allowed, `0.0.1` rejected. Note: "Version X is newer than App Repo Y."
3. Changed: repo has the current version, a `sys_upgrade_plan_item` exists for it, and a local change is newer than it. Local change = newest `sys_metadata.sys_updated_on` (excluding app records and plan items) or newest `sys_update_xml` for the app (excluding `sys_app_%` and `sys_upgrade_plan_item_%`).
4. Saved: repo has the current version and nothing changed after its plan item. Only this status is unchecked by default.
5. In App Repo: repo has the current version but there is no plan item for it. Shows the last local change date and a "Recent changes" link.
6. Check failed: retried once automatically, then shows the error with "Retry check" (or "Reload list" when the app left development mode). Stays checked.
7. "Recent changes" link appears only for Changed, In App Repo, and Check failed, and opens `sys_metadata_list.do?sysparm_query=sys_scope=<id>^sys_class_name!=sys_metadata_delete`.

## Local edit signals (from file history)

1. `sys_update_version.source_table = sys_upgrade_history`: files written by an install or upgrade from the repo.
2. `sys_update_version.source_table = sys_update_set`: local edits (and conversions, version bumps).
3. Installed vendor apps have file timestamps equal to the install time; those dates say nothing about editing.
4. No usable clone date exists on xare or yoyo (`clone_instance`, `sn_instance_clone_request`, `sn_um_lastclone_summary` empty or fetch error), so status logic does not depend on a clone date.

## User preferences for this project

1. Never hide apps from the Before Clone list (no Global scope filter). Losing work is the main risk.
2. Do not force a version bump and republish unless the app changed on this instance since it came from the repo.
3. Every status must tell the user what to do. No "Unknown".
4. Short labels: "Changed", "Unpublished", "Publish".
5. Leave the two upgrade menu modules as script modules; they share `runUpgrade` with the page.
6. Publishing on xare is fine for testing; keep it to one or two apps.

## Open items

1. Retry for a failed app list load (only a message today).
2. "No longer in development mode" path not triggered for real.
3. Whether a publish through now-sdk or the CI/CD API writes `sys_upgrade_plan_item`.
4. Docs refresh (`README.md`, `docs/app-overview.md`) and commit. Nothing on the `ui-refactor` branch is committed yet.
