# Feature Plan: Bulk Publish (increment version & publish to My App Repo)

> Status: **Design complete, not yet implemented.** This document captures all
> research findings and the implementation plan so a new session can build it
> without re-investigating.

## 1. Goal (as requested)

Add a feature to the existing converter UI page that is the **inverse of the
bulk upgrade** capability. For each selected app that has a usable version
number (i.e. the version does **not** contain `CONVERTED`):

1. Figure out the **latest version already published in My App Repo**.
2. Increment it by a **minor** version each time (e.g. repo latest `1.2.x` -> `1.3.0`).
3. **Update the local app's `version` field** to that new version.
4. **Publish** the new version to My Application Repository (pre-configured target).

### Confirmed decisions from the user
1. Eligible apps may be either table (`sys_app` or `sys_store_app`). Filter is **not** strict semver — only requirement: version must **not contain `CONVERTED`**.
2. "Latest version" = the **latest already-published version in the repo** (NOT the local instance version), to avoid version collisions (local `1.1`, repo `1.2`, must push `1.3`).
3. Increment = **minor** each time.
4. **No target URL or credentials** — everything is pre-configured on the instance (internal upload).
5. **Yes**, update the local app `version` field as part of the flow.
6. UI: reuse the **existing checkboxes**; add a **button per column** (or one shared button if logic is shared). If a selected app's version contains `CONVERTED`, **alert the user** that those won't be updated and the version must be set manually first, then skip them.

## 2. Key record references (this app)

| Artifact | Name | sys_id | Source file |
|---|---|---|---|
| Application | Bulk Store App Converter (scope `global`) | `3b04bd443371c7d02e49a94a7e5c7bb3` | `metadata/sys_app_3b04bd443371c7d02e49a94a7e5c7bb3.xml` |
| UI Page | `bulk_convert_store_app_confirm` | `e50a5b297999422a982ce43dd4e39791` | `metadata/update/sys_ui_page_e50a5b297999422a982ce43dd4e39791.xml` |
| Script Include | `BulkUpgradeMyCompanyApps` | `0dd88b5493924b50244af07e2803d6e7` | `metadata/update/sys_script_include_0dd88b5493924b50244af07e2803d6e7.xml` |

> NOTE: There are two mirrored metadata folders: `metadata/` and
> `3b04bd443371c7d02e49a94a7e5c7bb3/`. Confirm which the build consumes
> (see §7). `src/fluent/` currently contains only `generated/keys.ts`.

## 3. How the existing page works (baseline to extend)

- Jelly UI page, admin-only, must be in **global** scope.
- Server-side `g2:evaluate` queries `sys_scope` and builds two arrays:
  - `jvar_store_apps` — `sys_class_name == 'sys_store_app'` AND `sn_app_api.AppStoreAPI.canConvertSysStoreApp(sysId)`.
  - `jvar_dev_apps` — `sys_class_name == 'sys_app'` AND `sn_app_api.AppStoreAPI.canConvertSysApp(sysId)`.
- Two columns render checkboxes:
  - Store column: `<input class="store-app-checkbox" value="{sys_id}">`
  - Dev column: `<input class="dev-app-checkbox" value="{sys_id}">`
  - Each item shows `name (vversion) - scope`.
- Client script helpers already present and reusable:
  - `getCheckedStoreApps()`, `getCheckedDevApps()`
  - `getAppNameFromCheckbox(sysId, className)`
  - `addStatusRow(containerId, appId, appName, status)` / `updateStatusRow(...)` — status label styles: Pending/Converting/Complete/Failed.
  - `disableCheckboxByValue(className, sysId)`
  - `pollTracker(trackerId, onComplete, onFailed)` — polls `sys_execution_tracker` via REST `/api/now/table/...` with `window.g_ck`.
- Convert actions call `GlideAjax('com.snc.apps.AppsAjaxProcessor')` -> `start` with `convertToDevelopmentApp` / `convertToStoreApp`, then `pollTracker`.

## 4. How stock "publish to My App Repo" works (reverse-engineered)

### UI Action 1 — "Publish to My Application Repository"
- `sys_ui_action` `a321f97fc3003100b9e7ff9c02d3ae61`, table **`sys_app`**, action_name `sn_appauthor_upload_to_app_repo`.
- Condition: `(current.canWrite() || sn_app_api.AppStoreAPI.canPublishToAppRepo(current.sys_id)) && gs.getProperty('sn_appauthor.allow_internal_upload','true') == 'true'`.
- onclick `checkForSkippedRecords()` (full-app publish path).

### UI Action 2 — "Publish Customizations To My App Repo"
- `sys_ui_action` `e5f2f693531210109d3addeeff7b1208`, table **`sys_store_app`**.
- Condition adds `sn_app_customization.AppCustomizationAPI.isCustomizedApp(current.sys_id)` and `sn_appauthor.allow_customization_upload`.
- onclick `uploadToInstance()` opens `GlideModal('sn_appauthor_app_upload_to_repo')` with prefs: `sysparm_sys_id`, `sysparm_publish_to_app_store='false'`, `sysparm_is_store_app='true'`.
- This is the **customization** path (`is_customization=true`), which is **semantically different** from publishing a new full-app version.

### The modal: `app_upload_to_repo` (endpoint `sn_appauthor_app_upload_to_repo.do`)
- `sys_ui_page` `515b4963d71311004f6a0eca5e61031f`, scope `sn_appauthor` (`893ea311d71321004f6a0eca5e6103e6`).
- Flow: `doSubmit()` -> `validateVersion()` (if version changed) -> `uploadApp()`.
- `validateVersion()` calls `GlideAjax('ValidateAppVersionAjax').isPulishableVersion` with `sysparm_version`, `sysparm_app_id`, `sysparm_publish_to_store`. Returns empty string = OK, else an error message.
- `uploadApp()` opens `GlideModal('hierarchical_progress_viewer')` and sets these preferences (THIS is the actual publish trigger):

```
sysparm_sys_id            = <app scope sys_id>
sysparm_dev_notes         = <notes>
sysparm_username          = ''      // empty for internal upload
sysparm_password          = ''      // empty for internal upload
sysparm_publish_to_store  = 'false' // publishing to repo, not store
sysparm_version           = <version to publish>
sysparm_ajax_processor    = 'sn_appauthor.ScopedAppUploaderAJAX'
sysparm_target_upload_URL = <target>   // empty/default for internal repo
sysparm_renderer_expanded_levels = '0'
sysparm_renderer_hide_drill_down = true
sysparm_is_customization  = <true for store-app customization, false for full app>
```

- On `progressViewerDlg.on('executionComplete', fn)`: `trackerObj.state == 2` => success; `trackerObj.result.appLink` is the published app URL.
- `hierarchical_progress_viewer` runs the processor named in `sysparm_ajax_processor` and renders a `sys_progress_worker`. (`ui_progress_worker` macro polls `sys_progress_worker` and auto-reloads every 5s while running.)

### Server APIs identified
- `sn_app_api.AppStoreAPI.canPublishToAppRepo(sysId)` -> boolean. (Also `canConvertSysApp`, `canConvertSysStoreApp`.)
- `sn_appauthor.ScopedAppVendorInfoObtainer().obtainDisplayVersionFromAppRepo(appSysId, localVersion, publishToStore)` — contacts the configured repo. During probe it issued:
  `GET https://<repo-instance>/sn_orchestration_api_v1.do?type=verify_version&...&source_app_id=<id>&publish_to_store=false&sysparm_company_code=snc&version=1.0.1&sysparm_application_source=APP_MANAGER` and returned HTTP 200.
  Has `getErrorMessage()` fallback (used by `ValidateAppVersionAjax`).
- `sn_appauthor.ScopedAppUploaderAJAX` — **protected** (source not readable). The actual uploader/publisher, driven only via `hierarchical_progress_viewer` + `sys_progress_worker`.
- `ValidateAppVersionAjax.isPulishableVersion` (scope `sn_appauthor`) — thin wrapper over `obtainDisplayVersionFromAppRepo`.

## 5. ✅ RESOLVED — how to determine the next publishable version

Research complete. Findings:

- `ScopedAppVendorInfoObtainer` exposes: `initialize`, `obtainFromAppRepo`,
  `obtainDisplayVersionFromAppRepo`, `getErrorMessage`.
- `obtainDisplayVersionFromAppRepo(appSysId, version, publishToStore)` is a
  **yes/no gate**, not a version lookup. It calls the configured repo:
  `GET <repo>/sn_orchestration_api_v1.do?type=verify_version&...&version=<version>&publish_to_store=false&sysparm_company_code=snc`
  and returns:
  - `{ "allowed": true }` when `version` is publishable (strictly greater than the repo's latest published for that app), or
  - `null` / not-`{allowed:true}` when it is not (already published / too low).
  - Observed: `1.0.1` -> `null`, `0.0.1` -> `null`, `9.9.9` -> `{allowed:true}` for CICD Pipeline.
- `obtainFromAppRepo(...)` returns **company/vendor config** (`type=obtain_vendor_info`),
  e.g. `{ key:"snc", allow_internal_upload:true, allow_store_upload:false, upload_url:"" , ... }`.
  `upload_url:""` + `allow_internal_upload:true` confirms **default internal upload, no URL/creds** (decision #4). It does NOT return app versions.
- **No API exposes the repo's latest version directly**, and there is no local
  cache of it (the repo is remote: `zorb.service-now.com`, company `JonCo`/`snc`).

### ✅ Chosen algorithm: iterative "minor-bump + verify"
Because `verify_version` tells us whether a candidate version is allowed (i.e.
strictly greater than the repo's latest), we find the next version by bumping
until allowed — this *implicitly* finds "latest repo version + 1 minor" without
needing to read the latest value:

```js
candidate = minorBump(normalize(localVersion));   // X.(Y+1).0
for (i=0; i<CAP; i++) {                            // CAP e.g. 100
  info = obt.obtainDisplayVersionFromAppRepo(appId, s(candidate), 'false');
  if (info && info.allowed === true) return s(candidate);   // publishable
  candidate = minorBump(candidate);                // X.(Y+2).0, ...
}
// if none allowed within CAP -> error (surface to user)
```

**Validated against the live repo:** local `1.0.1` -> candidate `1.1.0` ->
`verify_version` returned `{allowed:true}` -> **next = `1.1.0` in a single call.**
This satisfies the user's collision requirement (local `1.1`, repo `1.2` -> the
loop skips `1.2.0` as not-allowed and lands on `1.3.0`). Typical cost: 1-3
outbound calls per app; cap bounds the worst case.

- `normalize(v)`: strip any non-numeric suffix (handles `-SNAPSHOT` etc.; `CONVERTED` is already excluded upstream), split on `.`, pad to 3 parts.
- `minorBump([x,y,z])` = `[x, y+1, 0]` (minor increment, patch reset to 0 — decision #3).
- Publishable detection = `info && info.allowed === true`.

### `canPublishToAppRepo` probe results (sample)
Most sampled apps returned `false`; **CICD Pipeline** (`global`, `1.0.1`)
returned `true`. The page should treat publishability per-app via
`current.canWrite() || canPublishToAppRepo(sysId)` (same as the stock UI action),
since the page runs as admin.

## 6. Implementation plan

### 6a. New Script Include — `BulkPublishMyCompanyApps` (client-callable, this app, global)
AbstractAjaxProcessor-style **or** plain class exposed via a thin AJAX wrapper.
Methods:

- `getNextPublishVersion(appSysId)` — returns JSON:
  `{ ok, currentVersion, nextVersion, publishable, isConverted, triedCount, error }`.
  - Reads the app record (`sys_app` or `sys_store_app`) for `currentVersion`.
  - `isConverted = /CONVERTED/i.test(currentVersion)` -> if true, `ok:false`, skip.
  - `publishable = canWrite || sn_app_api.AppStoreAPI.canPublishToAppRepo(appSysId)`.
  - `nextVersion` via the **§5 iterative minor-bump + verify algorithm** (not a direct
    repo-latest read, since no API exposes it): start `minorBump(normalize(currentVersion))`,
    loop calling `sn_appauthor.ScopedAppVendorInfoObtainer().obtainDisplayVersionFromAppRepo(appSysId, candidate, 'false')`
    until `info.allowed === true`, capped (e.g. 100). If no allowed version within the
    cap -> `ok:false` with error.
- `applyVersionAndPrepare(appSysId, nextVersion)` — sets the app record's
  `version` field to `nextVersion` (decision #5) and returns confirmation.
  (Confirm whether this must happen **before** launching the publish modal, or
  whether `sysparm_version` alone drives both publish and record update — verify
  during implementation.)

Pattern/version lookups must follow **current Fluent docs** when authored as
Fluent, but these are platform APIs called from server script — no Fluent typing needed.

### 6b. UI Page changes — `bulk_convert_store_app_confirm`
- Add a **"Publish New Version"** button to **each** column (Store + Dev),
  styled like the existing convert buttons, both calling a shared
  `onPublish(columnType)` client function (logic is shared; the only difference
  is which checkbox class is read). Reuse existing checkboxes.
- Gate buttons on global scope (same `jvar_is_global_scope` pattern already used).
- Optionally annotate each list item with its version (already shown) so the
  user can see `CONVERTED` apps.

### 6c. Client script additions (reuse existing helpers)
- `onPublish(columnType)`:
  1. Gather checked sys_ids via `getCheckedStoreApps()` / `getCheckedDevApps()`.
  2. If none selected -> alert, return.
  3. Partition selected apps into `converted` (name/version contains `CONVERTED`)
     and `eligible`. If any `converted`, show an **alert**: those won't be updated
     and the version must be set manually before running. Continue with `eligible` only.
  4. Add status rows (`Pending`) for eligible apps.
  5. Sequential loop (like `convertStoreNext`): for each app ->
     - `updateStatusRow(..., 'Publishing')`
     - `GlideAjax BulkPublishMyCompanyApps.getNextPublishVersion(appId)`.
       - If `!ok`/`!publishable` -> `Failed` (+reason), continue.
     - `GlideAjax BulkPublishMyCompanyApps.applyVersionAndPrepare(appId, nextVersion)` (if needed pre-publish).
     - Launch `GlideModal('hierarchical_progress_viewer')` with the stock prefs
       from §4 (`sysparm_ajax_processor='sn_appauthor.ScopedAppUploaderAJAX'`,
       `sysparm_publish_to_store='false'`, `sysparm_is_customization='false'`,
       `sysparm_version=nextVersion`, `sysparm_sys_id=appId`, blank
       username/password/target for internal).
     - On `executionComplete`: `state==2` -> `Complete` + `disableCheckboxByValue`;
       else `Failed`. Then process next app.
- Add `Publishing` label style to `addStatusRow`/`updateStatusRow` (e.g. `label-warning`).

> UX note: Option A (reuse the stock `hierarchical_progress_viewer` modal per app)
> is the **recommended** approach because it reuses the supported, protected
> `ScopedAppUploaderAJAX` publish path exactly. Trade-off: a progress dialog
> appears per app (sequential). Option B (custom server publish + `pollTracker`
> like the convert flow) would be seamless but requires a safe server entry point
> into the protected uploader, which was not found — only pursue if a supported
> server method is confirmed.

### 6d. `is_customization` decision
- For publishing a **new full-app version**, use `sysparm_is_customization='false'`
  for BOTH `sys_app` and `sys_store_app` selections. The customization path
  (UI Action 2) is a different feature and is **not** what this requests.
- Therefore the publish **logic is shared** across both columns -> a single
  shared `onPublish` routine; per-column buttons are purely for UX parity.

## 7. Fluent / build environment issue to resolve

- The IDE reported: *"No fluent project detected in this workspace. Docs will be
  available once there is an app with installed dependencies."* and `src/fluent/`
  has only `generated/keys.ts`. The UI page + script include exist only as **XML
  metadata**, not Fluent `Record()` definitions.
- User expects this to be editable in Fluent. Before implementing:
  1. Verify `package.json` has the SDK dependency and run **`install_dependencies`**
     (node_modules likely missing -> that's why Fluent docs are unavailable).
  2. Run **`build`** to confirm the project compiles and to see which metadata
     folder is authoritative (`metadata/` vs `3b04bd.../`).
  3. Decide authoring form:
     - **Option A (lowest risk):** edit the existing **XML** files directly
       (`metadata/update/sys_ui_page_...xml` and add a new
       `sys_script_include_...xml`), then build + install.
     - **Option B (Fluent):** author the Script Include as a Fluent `Record()`/
       appropriate type and (optionally) migrate the UI page. Only do this once
       Fluent docs are available; follow `search_fluent_docs` ->
       `explain_fluent_doc` workflow for the correct API (do not hand-write Fluent
       from memory).
- Whichever form: keep the change minimal and do not touch unrelated metadata or
  `package.json` dependency versions.

## 8. Validation plan
1. `build` -> fix any diagnostics.
2. `install` (new update set / checkpoint).
3. `ui_diagnostics` on the UI page (add `uxpcb` cache-bust param to any script
   includes if applicable — Jelly page, so mainly verify it renders and the new
   buttons appear, console is clean).
4. Manual: on a **non-production/test app** that is publishable and NOT converted,
   select it, run publish, confirm:
   - version read from repo, minor-bumped correctly,
   - local `version` updated,
   - publish succeeds (`state==2`, `appLink` returned),
   - a `CONVERTED` app selected alongside triggers the warning alert and is skipped.

## 9. Risks / notes
- `ScopedAppUploaderAJAX` is protected; do not attempt to replicate it — drive it
  via `hierarchical_progress_viewer` only.
- Publishing performs a **real outbound upload** to the configured repo. Test with
  a disposable app first; publishes are not trivially reversible.
- `canPublishToAppRepo` returned `false` for most apps in the sample — ensure the
  per-app publishable check surfaces a clear reason when an app can't be published.
- Confirm minor-bump semantics with repo state (repo `1.2.3` -> `1.3.0`). Verify
  that a `.0` patch reset is acceptable (assumed yes).
