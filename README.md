# Bulk Store App Converter

A global-scope ServiceNow utility for administrators to bulk-convert applications between store mode (`sys_store_app`) and development mode (`sys_app`).

## What It Does

This app provides a single UI page with two side-by-side panels for bidirectional app conversion:

- **Left Panel — "Convertible Store Apps"**: Lists store applications eligible to be converted to development mode. Uses `sn_app_api.AppStoreAPI.canConvertSysStoreApp()` as the eligibility filter.
- **Right Panel — "Development Mode Apps"**: Lists custom-scoped development applications eligible to be converted back to store/repo mode. Uses `sn_app_api.AppStoreAPI.canConvertSysApp()` as the eligibility filter.

Both panels support batch selection (checkboxes) and sequential conversion with real-time status tracking.

![Bulk Store App Converter screenshot](bulk-store-app-converter.jpg)

## How to Use

1. Navigate to **System Applications > Bulk Convert Store Apps** in the application navigator.
2. Ensure your application scope is set to **Global** (required for conversion operations).
3. Check the apps you want to convert in either panel.
4. Click **Convert to Dev Mode** (left) or **Convert to Store App** (right).
5. Watch the inline status progress: `Pending` → `Converting` → `Complete`/`Failed`.
6. After all conversions finish, refresh the page to see the updated lists (apps will move between panels).

## Components

| Record | Table | sys_id |
| --- | --- | --- |
| `bulk_convert_store_app_confirm` (UI Page) | `sys_ui_page` | `e50a5b297999422a982ce43dd4e39791` |
| `bulk_convert_store_app.convertible_apps` (Property) | `sys_properties` | `53bdd86258a14ab2b5f619b55f1acd56` |
| "Bulk Convert Store Apps" (Module) | `sys_app_module` | `0733e5a91a7247b39c8d2b650f060a31` |

## How Conversion Works

Conversions are initiated via GlideAjax calling `com.snc.apps.AppsAjaxProcessor` with:

- `sysparm_function: 'convertToDevelopmentApp'` (store → dev)
- `sysparm_function: 'convertToStoreApp'` (dev → store)

Each conversion starts a background progress worker. The page polls `sys_execution_tracker` every 3 seconds until the job completes before starting the next conversion in the batch.

### Server-Side Logic

The page queries `sys_scope` (parent table of both `sys_store_app` and `sys_app`) sorted alphabetically by name. For each record, it checks `sys_class_name` and calls the appropriate API:

- `sys_store_app` + `canConvertSysStoreApp() = true` → left panel
- `sys_app` + `canConvertSysApp() = true` → right panel

## Requirements

- **Role**: `admin`
- **Scope**: Must be in Global scope to perform conversions
- **Platform**: ServiceNow (Washington DC+)

## Bundling / Export

Since this is a global-scope app, there is no "Publish to Source Control" option. To transport to another instance:

1. Find the update sets containing the latest versions of each component (see table above).
2. Merge them into a single update set.
3. Export that update set as XML and import on the target instance.
