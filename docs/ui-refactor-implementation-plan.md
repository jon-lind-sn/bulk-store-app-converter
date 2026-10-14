# UX Redesign Proposal: Bulk Store App Upgrader and Converter

> This document is written so another agent can implement it end to end. Read `docs/app-overview.md` (current behavior baseline) and `bulk-publish-feature-plan.md` (publish API research) before starting.

## Context

The real lifecycle is a clone round trip:

1. **Before clone (on the dev instance):** publish every dev app's current code to My Application Repository (App Repo) so work in progress (WIP) survives the clone.
2. **Clone** from prod. Every company app arrives in store mode at the prod version.
3. **After clone:** upgrade all store apps to the latest App Repo version (picks up the WIP published in step 1 for the apps that had it), then convert them all to dev mode.

Today step 1 lives on the page, step 3a lives in two menu modules that run a raw script and print the upgraded apps to the screen, and step 3b lives on the page again. The page is a pair of flat checkbox panels under a wall of instruction text and needs a manual refresh after every action. Goal: one page that mirrors the round trip, where the default path is a single click for each side of the clone.

## 1. Organizing idea: two tabs keyed to the clone

1. **Before Clone: Save Work** (`sys_app` dev apps). Default action: **Publish all**.
2. **After Clone: Restore** (`sys_store_app` company apps). Default action: **Upgrade and Convert**.
The user picks the tab. The tab is deep-linkable (`?sysparm_tab=restore`) so the existing menu modules can point at it.

Convert to Store App is used less often, but it stays available wherever dev apps are listed (the Before Clone tab) as a smaller secondary button beside Publish all. It is also the quickest way to reset apps to store mode when testing the After Clone flow. It is guarded so it never strands unpublished work (section 4.2).

## 2. Unified app table (replaces the two checkbox panels)

Both tabs use the same table, rendered client-side from a JSON endpoint instead of Jelly `forEach`:

| Column | Notes |
|---|---|
| Select | Check all box in the header. Every row starts checked, so the user sees everything that will run and unchecks exceptions |
| App name, scope | Link icon opens record |
| Local Version | Inline-editable on Before Clone when it contains `CONVERTED` |
| Target version | After Clone: `latest_version` (blank = no upgrade, will only convert). Before Clone: next publishable version, fetched lazily |
| Status | Pending, Upgrading, Converting, Publishing, Complete, Failed, Skipped, inline per row |

The list shows the company's own apps, using the same `is_store_app=false` logic the upgrade already uses. There is no settings drawer: the checked list is the configuration. Sticky toolbar above the table: the primary button, a search box, filter chips (`Upgrade available`, `Global scope`), and a selected count. Secondary actions sit beside the primary button as smaller outline buttons: Upgrade and Convert to Dev on After Clone, Convert to Store on Before Clone. Buttons that cannot run explain why in a tooltip.

Status lives on the row. This removes the 200px status box, the stacking red banners, and the `alert()` dialogs. One summary bar appears at the end ("18 converted, 4 upgraded first, 1 failed. [Show failures] [Batch install plan]"). The table re-fetches after each action, so no page reload. A `beforeunload` warning protects a running queue.

## 3. After Clone: Restore tab (upgrade integrated into the page)

1. Lists company store apps (`is_store_app=false`). Rows with `latest_version` above `version` are marked "Upgrade". The rest will convert directly. The user sees exactly what will happen before clicking.
2. **Upgrade and Convert** runs:
   1. One `installBatch` for the apps that have an upgrade.
   2. Poll the execution tracker (existing `pollTracker`) and `sys_batch_install_plan.state` until Installed.
   3. Re-fetch, then convert every selected app to dev with the existing queue.
3. **Check for updates** button runs `sn_appclient.UpdateChecker().checkAvailableUpdates()` (the code already has this behind `updateCheck=false`). This replaces the "refresh My Company Applications first" instruction. Offered as a prerequisite in section 6.
4. The two upgrade modules collapse into this tab: "Upgrade ALL" is the default check all selection, "from Property" is the optional Load saved list link in section 5.

## 4. Before Clone: Save Work tab

The goal of this tab is that nothing gets lost in the clone. It answers one question first: which apps have work that is not in App Repo?

1. A banner at the top of the tab states the answer: "4 apps have work that is not in App Repo. Publish them before you clone." or "All dev apps are saved in App Repo. Safe to clone."
2. A **Save status** column (section 4.1) on every row, and a filter chip **Needs publish**.
3. Default selection is every app whose status is not Saved, so **Publish all** pushes exactly the at-risk work and does not bump versions on apps with nothing new. Check all is still available.
4. Each row shows the "1.2.5 → 1.3.0" version preview from `getPublishState`, so the bump is visible before publishing.
5. **Publish all** publishes the selection with the existing queue. Each success sets the row to Saved and updates the banner. **Convert to Store** (secondary) runs only on rows that are Saved (section 4.2).
6. A dev app shows `0.0.0-CONVERTED` only when it was converted to store mode, could not be upgraded because App Repo had no version of it, and was converted back to dev. These rows get an inline version input and are excluded from Publish all until a version is set. The guard in section 4.2 prevents new cases from this page.
7. Hide this converter app and other `global` scope apps behind the `Global scope` chip by default. They crowd the list (24 rows on xare). The banner still counts hidden apps that need publishing, and says so ("1 hidden by filters").

### 4.1 Save status detection

Statuses, from safest to riskiest:

1. **Saved**: App Repo has the current version and nothing in the app changed after it was published.
2. **Changed since publish**: App Repo has the current version, but app files were updated after the last publish.
3. **Not published**: App Repo has no version at or above the current one, including apps never published.
4. **Unknown**: a check failed or the last publish time could not be found. Treated as at risk and selected by default.

Two checks per app, both server-side in `getPublishState`:

1. **Version in App Repo**: call `obtainDisplayVersionFromAppRepo(appId, currentVersion, 'false')`, the same `verify_version` gate `getNextPublishVersion` uses. `{ allowed: true }` means the current version is above App Repo's latest, so it is Not published. Any other result means App Repo has it.
2. **Changes after publish**: compare `lastChanged` (a `GlideAggregate` MAX of `sys_updated_on` over `sys_metadata` where `sys_scope` = app) with `lastPublished`. Sources for `lastPublished`, in order:
   1. The platform's own record of the upload for that app (candidates: the `sys_progress_worker` or `sys_execution_tracker` rows created by `sn_appauthor.ScopedAppUploaderAJAX`, matched by app). Spike on xare to find which table and field identify the app reliably.
   2. A timestamp this page writes per scope after each successful publish (JSON property `bulk_convert_store_app.publish_log`). Covers publishes made from this page only.
   3. Neither found: status Unknown.

Spike findings (xare):

1. `sys_execution_tracker` and `sys_progress_worker` rows carry no app reference, so they cannot supply `lastPublished`.
2. `sys_app_version` has `source_app_id`, `version` and `publish_date` for each publish. `getPublishState` uses `MAX(publish_date)` for the app, then falls back to `bulk_convert_store_app.publish_log`.
3. `sys_batch_install_plan.state` values: `installed`, `partial_install`, `ready`, `failed`, `invalid`, `rolled_back`, `in_progress`. The page treats `installed` as success and `failed`, `invalid`, `rolled_back`, `partial_install` as failure.
4. Still open: `verify_version` for a never-published app, and whether it depends on the application picker.

Spikes on xare before building: the `verify_version` response for a never-published app, whether it depends on the application picker the way `canPublishToAppRepo` does, and the `lastPublished` source above. Record the findings in this doc.

### 4.2 Convert to Store guard

A dev app converted to store mode lands at `0.0.0-CONVERTED`, and the only fix is to upgrade it from App Repo. Converting an app whose work is not in App Repo strands that work.

1. Every dev app stays in the list. The guard only controls whether Convert to Store can run on it.
2. Convert to Store runs only on rows with status Saved. Other checked rows are skipped with the tooltip "Publish this app first so it can be restored by upgrading after conversion."
3. The confirmation names the skipped rows.
4. After Publish all succeeds, rows become Saved, so the user can publish and then convert without a reload.
5. The guard is client-side because conversion is called straight from the browser through `com.snc.apps.AppsAjaxProcessor.convertToStoreApp`. It protects users from mistakes but is not a security control. That is acceptable for an admin-only page.

### 4.3 Converted store apps on the After Clone tab

Store apps at `0.0.0-CONVERTED` (from a Convert to Store) show a **Converted** badge and count as "upgrade available" whenever `latest_version` is set, since `0` sorts below any real version. The upgrade restores them. If `latest_version` is empty, the app was never published, so upgrade cannot restore it. The row shows "Not in App Repo, cannot restore automatically" and is excluded from upgrade. Convert to Dev still runs on it, with the note "Set a version on the Before Clone tab before publishing" (section 4 item 6).

## 5. Saved app list (optional, last phase)

Check all on the company app list covers the default. For teams that always skip the same apps, two small toolbar links:

1. **Load saved list** checks only the scopes in `bulk_convert_store_app.convertible_apps`.
2. **Save selection** writes the checked scopes back, trimmed and deduped (fixes the shipped `, x_snc_food_safety1` bug). Set it in prod so it survives the clone.
3. Keep the property name for backward compatibility and reword its description: it scopes upgrade and convert.

Drop this entirely if check all proves sufficient.

## 6. Prerequisites become live checks, not prose

Replace the intro paragraph and "How to use this" list with a checklist strip that evaluates on load:

1. **Application picker is Global**: if not, the page switches to Global automatically on load (the page already calls `AppsAjaxProcessor.changeApplication`) and shows an info message: "Your application picker was switched to Global so this page can convert and publish apps." No switch back afterward. This replaces the greyed-out buttons and the red scope error.
2. **Updates checked** (After Clone only): last check time and the Check for updates button.

Each tab gets a one-line subtitle ("Run this on your dev instance before it is cloned over." / "Run this right after the clone."). Details move to a collapsible "How it works" and the README.

## 7. Security and platform feasibility

1. **Upgrade from the page is allowed.** `installBatch` runs in the session user's context from a module script or a GlideAjax call alike, and the script include is already global scope and extends `AbstractAjaxProcessor`. Set `clientCallable: true` on `BulkUpgradeMyCompanyApps` and add a `gs.hasRole('admin')` guard to every client-callable method (`BulkPublishMyCompanyApps` has none today). Add a client-callable script include ACL requiring `admin` on releases that support it.
2. **Return values instead of logging.** `upgradeByFilter` returns `void`. Return `{ candidates, skipped, batchId, trackerId }` and keep the log output for script callers.
3. **Property writes** through an admin-guarded GlideAjax method using `gs.setProperty`. The property already has `write: ['admin']`. Keep the role check server-side rather than using the REST Table API.
5. **`checkAvailableUpdates`** can be slow and may exceed a GlideAjax transaction quota. Run it as an async worker and poll, or link to My Company Applications as a fallback.
6. **Chained restore** must wait for batch completion and re-check `canConvertSysStoreApp` after upgrade, since eligibility can change.
7. **Page access** stays `admin` only. Retarget the upgrade modules to the page tab with `roles: ['admin']` (README gap 1).

## 8. Refactor scope

1. `src/fluent/ui-pages/bulk_convert_store_app_confirm.now.ts`: Jelly shell plus client-rendered tabs and table. Reuse `pollTracker`, `switchApplication`, and the convert and publish queue functions, pointing status at table rows.
2. New script include (e.g. `BulkAppConsole`, client callable, admin guarded): `getApps(tab)`, `getSavedSet`, `saveSavedSet`, `getPrereqs`, `startUpgrade(scopes)`, `getBatchState(id)`.
3. `BulkUpgradeMyCompanyApps.server.js`: structured results, add `upgradeByScopes(array)`.
4. Modules: retarget both upgrade modules to `?sysparm_tab=restore` (or retire), add admin role.
5. Property description fix. README and `docs/app-overview.md` refresh around the clone round trip.

## 9. Suggested phasing

1. Phase 1: tabs, unified table, select-all default, sticky toolbar, row status, auto-refresh, automatic switch to Global.
2. Phase 2: Save status detection with the Before Clone banner and Needs publish default selection, Convert to Store guard, publish version preview, integrated upgrade with tracker polling, chained Upgrade and Convert.
3. Phase 3: saved list load and save (if still wanted), Check for updates worker, company keys detection.

## Later

1. Copy results to the clipboard or save them to a Knowledge Base (KB) article as a record of what each clone restored.

## 10. Open decisions

1. Retire the upgrade menu modules or keep them as deep links to the After Clone tab.
2. Keep or drop the saved list property support.

## Implementation guide (for the implementing agent)

### Constraints

1. now-sdk 4.13.6 Fluent project, scope `global` (`now.config.json`). Build with `npm run build`, deploy with `npm run deploy` (now-sdk `install`). Check credentials with `npx @servicenow/sdk auth --list`. Target dev instance: xare.
2. UI page client script must be ES5 (`jsLevel: helsinki_es5`): no `let`/`const`, arrow functions, template literals, or `fetch`. Server script includes use `$meta.useEsLatest: true` and may use modern syntax.
3. The UI page `html` and `clientScript` are template literals in a `.now.ts` file. Escape `${` as `\${` and backticks inside them.
4. Keep the existing UI page endpoint `bulk_convert_store_app_confirm.do` and its `$id` so the menu module and existing installs keep working.
5. Only the platform APIs already used by this app are confirmed to work: `com.snc.apps.AppsAjaxProcessor` (`convertToDevelopmentApp`, `convertToStoreApp`, `changeApplication`), `sn_appauthor.ScopedAppUploaderAJAX`, `sn_appauthor.ScopedAppVendorInfoObtainer`, `sn_appclient.AppUpgrader().installBatch`, `sn_app_api.AppStoreAPI.canConvertSysStoreApp/canConvertSysApp/canPublishToAppRepo`, and `sys_execution_tracker` polling via the REST Table API with `window.g_ck`.

### Step 1: server endpoint `BulkAppConsole`

New files `src/fluent/script-includes/BulkAppConsole.now.ts` and `.server.js`, modeled on `BulkPublishMyCompanyApps.now.ts` (`clientCallable: true`, `apiName: 'global.BulkAppConsole'`, extends `global.AbstractAjaxProcessor`). Every public method starts with an admin guard that returns `JSON.stringify({ ok: false, error: 'admin role required' })` when `!gs.hasRole('admin')`. All methods return JSON strings.

1. `getApps` (`sysparm_tab` = `restore` | `save`):
   1. `restore`: `sys_store_app` where `is_store_app=false`, ordered by name. Row: `{ sys_id, name, scope, version, latest_version, upgradeAvailable, convertible }`. `upgradeAvailable` reuses the `updateAvailable` comparison from `BulkUpgradeMyCompanyApps.server.js` (move it to a shared exported helper or duplicate it with a comment). `convertible` = `canConvertSysStoreApp(sys_id)`. Dedupe by name like `upgradeByFilter` does.
   2. `save`: `sys_app` where `canConvertSysApp(sys_id)` is true (same filter as today's right panel). Row: `{ sys_id, name, scope, version, isConverted, isGlobal, isSelf }` where `isSelf` = sys_id `3b04bd443371c7d02e49a94a7e5c7bb3`. Save status is fetched lazily by `getPublishState` because it makes an outbound call per app.
   3. `restore` rows also carry `isConverted` (version contains `CONVERTED`) and `restorable` (`latest_version` not empty).
   4. Wrap each per-app API call in try/catch and log like the current Jelly evaluate does.
2. `getPrereqs`: `{ isGlobal }`. 
3. `startUpgrade` (`sysparm_sys_ids` comma list): builds the same package payload as `upgradeByFilter` for the given ids, calls `installBatch`, writes the batch plan note, returns `{ ok, packages: [{ sys_id, name, from, to }], batchId, trackerId }`.
4. `getPublishState` (`sysparm_sys_id`): `{ ok, saveStatus: 'saved' | 'changed' | 'not_published' | 'unknown', currentVersion, lastChanged, lastPublished, nextVersion }`. Runs both section 4.1 checks, then reuses `findNextPublishableVersion` from `BulkPublishMyCompanyApps.server.js` for `nextVersion` (export it or move it to a shared helper). The Before Clone preview calls this instead of `getNextPublishVersion`.
5. `getBatchState` (`sysparm_batch_id`): returns `{ state, stateLabel }` from `sys_batch_install_plan`.
6. Phase 3 only: `getSavedList` and `saveSavedList` (`sysparm_scopes`) over `bulk_convert_store_app.convertible_apps` using `gs.getProperty`/`gs.setProperty`, trimming and deduping.

Also add the same admin guard to `BulkPublishMyCompanyApps.getNextPublishVersion`.

### Step 2: refactor `BulkUpgradeMyCompanyApps.server.js`

1. Make `upgradeByFilter` return `{ candidates, packages, batchId, trackerId }` while keeping every existing `gs.info` line, so the menu modules behave as before.
2. Add an internal `upgradeByIds(ids)` used by `BulkAppConsole.startUpgrade` so payload building lives in one place.
3. Leave `clientCallable: false`. The page talks only to `BulkAppConsole`.

### Step 3: rebuild the UI page

File: `src/fluent/ui-pages/bulk_convert_store_app_confirm.now.ts`.

1. Jelly keeps only: the `gs.hasRole('admin')` gate, `<g:ui_form>`, a `#page-messages` container, the checklist strip container, two tab buttons, one table container per tab, and a summary bar container. Remove the server-side `g2:evaluate` app queries and the scope error message.
2. On load (`addLoadEvent`): call `getPrereqs`. If `isGlobal` is false, call the existing `switchApplication('global', cb)` and on success `showInfoMessage('Your application picker was switched to Global so this page can convert and publish apps.')`. Then load the active tab (`sysparm_tab` URL param, else last tab in localStorage wrapped in try/catch, else `restore`).
3. Table renderer `renderTable(tab, rows)`: header check all checkbox, all rows checked by default, columns per section 2, a status cell per row with id `status-<tab>-<sys_id>`. Search box and filter chips filter client-side. Check all applies to visible rows only. Escape app names before inserting HTML.
4. Status: replace `addStatusRow`/`updateStatusRow` with `setRowStatus(tab, sysId, status, note)` that writes into the row's status cell. Keep the existing label colors (Pending info, Upgrading/Converting/Publishing warning, Complete success, Published primary, Failed danger, Skipped default). `setStatusNote` content (for example "Published v1.3.0 (was v1.2.5)") goes in the same cell.
5. Reuse as-is, changing only how they read selection and report status: `pollTracker`, `switchApplication`, `convertStoreNext`, `convertDevNext`, `publishNext`, `publishApp`, `startPublish`, `finishPublish`. Selection comes from `getCheckedRows(tab)` returning `[{ sys_id, name, version }]` instead of reading label text from the DOM.
6. After Clone tab buttons:
   1. **Upgrade and Convert** (primary): `startUpgrade` for checked rows with `upgradeAvailable`, mark them Upgrading, `pollTracker(trackerId)` then poll `getBatchState` every 5 seconds until Installed (fail the batch rows on error), re-fetch `getApps('restore')`, then run the convert queue on the checked rows that are now `convertible`. Rows checked but not convertible get Skipped with a note.
   2. **Upgrade** and **Convert to Dev** (outline): the two halves of the chain.
   3. Check for updates: Phase 3, see section 3 item 3 and section 7 item 5.
7. Before Clone tab buttons: **Publish all** (primary) runs the existing publish queue; `CONVERTED` rows render an inline version input and are Skipped unless edited (write the edited version via a GlideAjax `setAppVersion` admin-guarded method on `BulkAppConsole`, Phase 2). **Convert to Store** (outline) runs the existing `convertDevNext` queue on checked rows whose Save status is Saved, after a confirmation listing skipped rows (section 4.2). After each successful publish, set that row to Saved, write `bulk_convert_store_app.publish_log`, and update the banner. Default selection on this tab is every row not Saved. Publish preview: when the tab loads, call `getPublishState` per row in sequence and fill Target version. It must run after `switchApplication(appId)` per row, as the publish code does today, then switch back to Global at the end.
8. During any queue: disable both tabs' action buttons, set `window.onbeforeunload` to warn, clear it when the queue finishes, write the summary bar, and re-fetch the tab.
9. Replace all `alert()` calls with inline messages in the summary bar.
10. Remove the intro paragraph and "How to use this" list. Add the per-tab one-line subtitle and a collapsed `<details>` "How it works" block.

### Step 4: modules, property, docs, version

1. `modules/bulk-upgrade-all-my-company-apps.now.ts` and `modules/bulk-upgrade-my-company-apps-from-property.now.ts`: add `roles: ['admin']`. Decision 1 in section 10 decides whether they also retarget to `bulk_convert_store_app_confirm.do?sysparm_tab=restore` (DIRECT link) or stay as scripts.
2. `modules/bulk-convert-my-company-apps.now.ts`: retitle to "Bulk App Clone Assistant" (or similar) and update its hint.
3. `properties/bulk_convert_store_app.convertible_apps.now.ts`: remove the space in the default value and reword the description. Add `properties/bulk_convert_store_app.publish_log.now.ts` (JSON, default `{}`, admin read and write) for section 4.1.
4. Bump `package.json` version to 1.1.0.
5. Update `README.md` (new screenshot, clone round trip workflow, role requirement) and `docs/app-overview.md`.

### Phase 3 items not detailed above

Saved list links, Check for updates async worker, company keys detection. Each needs a short spike on xare first. Record findings in this doc before building.

## Verification

1. Before Clone with a never-published dev app: Save status is Not published, the banner counts it, it is checked by default, and Convert to Store skips it. Publish it: the row becomes Saved, the banner updates, and Convert to Store then converts it.
2. Edit a file in a Saved app: on reload it shows Changed since publish and is checked by default.
3. A store app at `0.0.0-CONVERTED` with a `latest_version` shows the Converted badge on After Clone, and Upgrade restores the real version.
4. `npm run build` and deploy to xare with now-sdk.
5. Non-admin user: page empty, and each new GlideAjax method returns an authorization error.
6. After Clone with one app that has `latest_version` above `version`: Upgrade and Convert upgrades that one, waits for Installed, then converts all. Batch plan link works and the table re-fetches.
7. Check all box toggles every visible row; unchecking one excludes it from the run.
8. Load the page with the picker set to a scoped app: the picker switches to Global, the info message appears, and all buttons are enabled.
9. Before Clone preview matches what `getPublishState` returns for `nextVersion`. Publish one app and confirm the version in App Repo.
