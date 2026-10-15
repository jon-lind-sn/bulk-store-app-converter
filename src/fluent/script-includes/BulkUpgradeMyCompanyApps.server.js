var BulkUpgradeMyCompanyApps = Class.create();
BulkUpgradeMyCompanyApps.prototype = Object.extendsObject(global.AbstractAjaxProcessor, (function(){  

    function updateAvailable(appGR) {
        var installedVersion = appGR.getValue("version");
        var latestVersion = appGR.getValue("latest_version");
        if (!latestVersion) return false;
        var installedArray = installedVersion.split(".");
        var latestArray = latestVersion.split(".");
        var len = Math.max(installedArray.length, latestArray.length);
        for (var i = 0; i < len; i++) {
            var installed = installedArray[i] ? parseInt(installedArray[i]) : 0;
            var latest = latestArray[i] ? parseInt(latestArray[i]) : 0;
            if (installed < latest) {
                return true;
            } else if (installed > latest) {
                return false;
            }
        }
        return false;
    }

    /**
     * Walks the candidate sys_store_app rows, keeps one entry per app name that has an update available,
     * and returns the installBatch package list. Logging matches the original script output.
     */
    function collectPackages(appGR, loadDemoData) {
        var prevName;
        var packages = [];
        var candidates = 0;
        while (appGR.next()) {
            candidates++;
            gs.info("Candidate Upgrade: " + appGR.name + " " + appGR.scope + " " + appGR.version + " -> " + appGR.latest_version);
            var curName = appGR.getValue("name");
            if (curName == prevName) {
                continue;
            }
            if (updateAvailable(appGR)) {
                prevName = curName;
                packages.push({
                    displayName: curName,
                    id: appGR.getUniqueValue(),
                    load_demo_data: loadDemoData,
                    type: "application",
                    requested_version: appGR.getValue("latest_version"),
                    // Not part of the installBatch payload, stripped before the call.
                    fromVersion: appGR.getValue("version"),
                    scope: appGR.getValue("scope")
                });
            }
        }
        return { candidates: candidates, packages: packages };
    }

    /** Calls installBatch for the packages and returns { batchId, trackerId }. */
    function installPackages(packages) {
        gs.info("\n\n------------------------------------------------\n\nLinks to track progress below the payload information\n\n(scroll down)\n\n-----------------------------------------------\n\n");

        var payload = [];
        for (var i = 0; i < packages.length; i++) {
            var p = packages[i];
            payload.push({
                displayName: p.displayName,
                id: p.id,
                load_demo_data: p.load_demo_data,
                type: p.type,
                requested_version: p.requested_version
            });
        }
        var appsPackages = {};
        appsPackages.packages = payload;
        appsPackages.name = "Update Apps";
        var data = new global.JSON().encode(appsPackages);

        var baseUrl = gs.getProperty("glide.servlet.uri");
        var update = new sn_appclient.AppUpgrader().installBatch(data);
        var updateObj = JSON.parse(update);
        gs.info(
            "\n\n------------------------------------------------\n\nOpen the Batch install link to monitor the installation progress. It may take some time for the apps to all populate in the related list. After all apps have populated the install will start and the State will change to In progress.\n\nBatch install:\n" +
            baseUrl +
            "nav_to.do?uri=sys_batch_install_plan.do?sys_id=" +
            updateObj.batch_installation_id +
            "\n\nExecution tracker:\n" +
            baseUrl +
            "nav_to.do?uri=sys_progress_worker.do?sys_id=" +
            updateObj.execution_tracker_id +
            "\n\n-----------------------------------------------\n\n"
        );
        var grSBIP = new GlideRecord('sys_batch_install_plan');
        if (grSBIP.get(updateObj.batch_installation_id)) {
            grSBIP.setValue('notes', 'It may take some time for the apps to all populate in the related list below (you can refresh the list as needed to see them populating). \n\nAfter all apps have populated the install will start and the State (above) will change to In progress. \n\nWhen the batch is done the state will update to Installed');
            grSBIP.update();
        }
        return { batchId: updateObj.batch_installation_id, trackerId: updateObj.execution_tracker_id };
    }

    function runUpgrade(appGR, queryLabel) {
        var loadDemoData = false;
        appGR.query();
        gs.info("Candidate Upgrades Found: " + appGR.getRowCount() + " in table sys_store_app. Query: " + queryLabel);
        var found = collectPackages(appGR, loadDemoData);
        var result = { candidates: found.candidates, packages: found.packages, batchId: '', trackerId: '' };

        if (found.packages.length > 0) {
            var installed = installPackages(found.packages);
            result.batchId = installed.batchId;
            result.trackerId = installed.trackerId;
        } else {
            gs.info(
                "\n\n-----------------------------------------------\n\nAll apps appear to be up-to-date. \n\nIf you think this is incorrect, use Check for updates on the Bulk App Clone Assistant page or refresh My Company Applications. This will check the store for any new updates.\n(sometimes there are apps in the Application Manager that say that there are updates but you can't actually update them)\n\n-----------------------------------------------\n\n"
            );
        }
        return result;
    }

    function upgradeByFilter(encodedQuery) {
        if (!encodedQuery) throw "Must pass in a valid encoded query, e.g. is_store_app=false or vendor=ServiceNow to use this.";
        var appGR = new GlideRecord('sys_store_app');
        appGR.addEncodedQuery(encodedQuery);
        // Name ordering keeps same-name rows adjacent so the dedupe in collectPackages works.
        appGR.orderBy('name');
        return runUpgrade(appGR, encodedQuery);
    }

    function upgradeByIds(ids) {
        if (!ids || !ids.length) return { candidates: 0, packages: [], batchId: '', trackerId: '' };
        var appGR = new GlideRecord('sys_store_app');
        appGR.addQuery('sys_id', 'IN', ids.join(','));
        appGR.addQuery('is_store_app', false);
        appGR.orderBy('name');
        return runUpgrade(appGR, 'sys_idIN' + ids.join(','));
    }

    return {
        initialize: function() {},

        /**
         * upgradeByIds
         * Batch upgrades the given sys_store_app sys_ids that have an update available. Used by BulkAppConsole.
         * Server side only: this script include is not client callable.
         *
         * @param {Array} ids - sys_store_app sys_ids
         * @returns {Object} { candidates, packages: [{ id, displayName, fromVersion, requested_version, scope }], batchId, trackerId }
         */
        upgradeByIds: function(ids) {
            return upgradeByIds(ids);
        },

        /** Exposes the version comparison to BulkAppConsole so the rule lives in one place. */
        updateAvailable: function(appGR) {
            return updateAvailable(appGR);
        },

        /**
         * upgradeByFilter
         * Batch upgrades company apps matching the provided encoded query.
         * 
         * @param {String} encodedQuery - Encoded query to filter sys_store_app records. You may also calls this as GlideAjax with ga.addParam('encoded_query', '...');
         * @returns {Object} { candidates, packages, batchId, trackerId }
         * 
         * Example queries:
         *   All ServiceNow Store Apps: "install_dateISNOTEMPTY^hide_on_ui=false^vendor=ServiceNow^ORvendorISEMPTY^latest_version!="
         *   My company's apps: is_store_app=false
         *   Specific apps: scopeINx_snc_daniels_app,x_snc_aso,x_snc_agent_home_0
         *   By company key: scopeSTARTSWITHx_snc // Change to your company prefix!!
         * Error Handling: Logs errors and handles missing records gracefully.
         * Response: Saves status information in system log 
         * NOTE: Be sure to got My Company Applications and refresh or else this utility may
         * not see any available upgrades.
         * 
         * Inspired by The ServiceNow Wizard: https://snwizard.com/update-apps/
         */
		upgradeByFilter: function(encodedQuery) {
			var query = encodedQuery || this.getParameter('sysparm_encoded_query');
			return upgradeByFilter(query);
		},

		/**
		 * upgradeMyCompanyApps
		 * Convenience method that batch upgrades all company-owned (non-store)
		 * applications to their latest available versions. Internally calls
		 * `upgradeByFilter` with the query `is_store_app=false`.
		 *
		 * @returns {Object} Same shape as upgradeByFilter. Results are also logged to the system log via `upgradeByFilter`.
		 *
		 * @example
		 * new BulkUpgradeMyCompanyApps().upgradeMyCompanyApps();
		 *
		 * @see upgradeByFilter
		 */
		upgradeMyCompanyApps: function() {
			const query = 'is_store_app=false';
			return upgradeByFilter(query);
		},

        /**
         * upgradeSavedApps
         * Batch upgrades apps in the system property bulk_convert_store_app.convertible_apps. 
         * Place a comma delimited list of scope names in that property before calling this method.
         * 
         * @returns {Object} Same shape as upgradeByFilter.
         */
        upgradeSavedApps: function() {
            const convertibleApps = gs.getProperty('bulk_convert_store_app.convertible_apps');
            if (!convertibleApps.trim()) throw "No values in system property bulk_convert_store_app.convertible_apps. This should be a comma delimited list of scope names that you own.";
            const encodedQuery = "scopeIN" + convertibleApps;

            return upgradeByFilter(encodedQuery);
        },

        type: 'BulkUpgradeMyCompanyApps'
    };
})());