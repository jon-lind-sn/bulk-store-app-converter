var BulkPublishMyCompanyApps = Class.create();
BulkPublishMyCompanyApps.prototype = Object.extendsObject(global.AbstractAjaxProcessor, (function(){

    // Upper bound on outbound verify_version calls per app when searching for the next publishable version.
    var MAX_VERSION_ATTEMPTS = 3;

    /**
     * Strips any non-numeric suffix (e.g. "-SNAPSHOT") and returns [major, minor, patch] as integers.
     * "1.2" -> [1, 2, 0]; "1" -> [1, 0, 0]; "" -> [0, 0, 0].
     */
    function normalize(version) {
        var parts = String(version || '').split('.');
        var result = [];
        for (var i = 0; i < 3; i++) {
            var n = parseInt(parts[i], 10);
            result.push(isNaN(n) ? 0 : n);
        }
        return result;
    }

    /** Minor increment with patch reset: [x, y, z] -> [x, y + 1, 0]. */
    function minorBump(parts) {
        return [parts[0], parts[1] + 1, 0];
    }

    function toVersionString(parts) {
        return parts.join('.');
    }

    function isConvertedVersion(version) {
        return /CONVERTED/i.test(String(version || ''));
    }

    /**
     * Finds the next publishable version for an app by minor-bumping until My App Repo accepts it.
     * verify_version only answers "is this version strictly greater than the latest published?",
     * so the first allowed candidate is (repo latest + 1 minor) without reading the latest directly.
     */
    function findNextPublishableVersion(appId, localVersion) {
        var obtainer = new sn_appauthor.ScopedAppVendorInfoObtainer();
        // A dev app that was converted to store mode and back has no real version. Start at 1.0.0 instead of bumping.
        var candidate = isConvertedVersion(localVersion) ? [1, 0, 0] : minorBump(normalize(localVersion));
        var lastAttempted = '';
        for (var i = 0; i < MAX_VERSION_ATTEMPTS; i++) {
            var candidateStr = toVersionString(candidate);
            lastAttempted = candidateStr;
            var info = obtainer.obtainDisplayVersionFromAppRepo(appId, candidateStr, 'false');
            if (info && info.allowed === true) {
                return { version: candidateStr };
            }
            candidate = minorBump(candidate);
        }
        var repoError = '';
        try {
            repoError = obtainer.getErrorMessage() || '';
        } catch (e) {
            // getErrorMessage is best effort
        }
        return {
            version: '',
            lastAttempted: lastAttempted,
            repoError: repoError
        };
    }

    function getNextPublishVersion(appId) {
        var result = {
            ok: false,
            appName: '',
            currentVersion: '',
            nextVersion: '',
            lastAttemptedVersion: '',
            publishable: false,
            isConverted: false,
            error: ''
        };

        var appGR = new GlideRecord('sys_app');
        if (!appId || !appGR.get(appId)) {
            result.error = 'Application not found in sys_app (only development mode apps can be published).';
            return result;
        }

        result.appName = appGR.getValue('name') || appId;
        result.currentVersion = appGR.getValue('version') || '';

        // Same gate as the stock "Publish to My Application Repository" UI action. The page switches the application
        // picker to this app first, because both checks depend on it.
        var canWrite = appGR.canWrite();
        var canPublish = sn_app_api.AppStoreAPI.canPublishToAppRepo(appId);
        result.publishable = canWrite || canPublish;
        if (!result.publishable) {
            result.error = result.appName + ' (version on record ' + result.currentVersion + '): you do not have permission to publish this application to My Application Repository (canWrite=' + canWrite + ', canPublishToAppRepo=' + canPublish + ').';
            return result;
        }

        var next = findNextPublishableVersion(appId, result.currentVersion);
        if (!next.version) {
            result.lastAttemptedVersion = next.lastAttempted;
            result.error = result.appName + ': no publishable version found after ' + MAX_VERSION_ATTEMPTS + ' attempts. ' +
                'Version on record: ' + result.currentVersion + '. Last attempted version: ' + next.lastAttempted + '.' +
                (next.repoError ? ' Repository said: ' + next.repoError : '');
            return result;
        }

        result.nextVersion = next.version;
        result.ok = true;
        return result;
    }

    return {
        /**
         * getNextPublishVersion
         * Computes the next version of a development mode app that My Application Repository will accept.
         * Call as GlideAjax with sysparm_name=getNextPublishVersion and sysparm_sys_id=<sys_app sys_id>.
         *
         * @returns {String} JSON: { ok, appName, currentVersion, nextVersion, lastAttemptedVersion, publishable, isConverted, error }
         */
        getNextPublishVersion: function() {
            var appId = '';
            if (!gs.hasRole('admin')) {
                return JSON.stringify({ ok: false, error: 'admin role required' });
            }
            try {
                appId = this.getParameter('sysparm_sys_id');
                return JSON.stringify(getNextPublishVersion(appId));
            } catch (e) {
                gs.error('BulkPublishMyCompanyApps.getNextPublishVersion failed for ' + appId + ': ' + e);
                return JSON.stringify({ ok: false, error: 'Server error while finding the next version for ' + appId + ': ' + e });
            }
        },

        /**
         * Server side helper for BulkAppConsole. Returns { version, lastAttempted, repoError }.
         * Not meant for GlideAjax (it takes arguments), and guarded the same way as the ajax methods.
         */
        findNextPublishableVersion: function(appId, localVersion) {
            if (!gs.hasRole('admin')) {
                return { version: '', repoError: 'admin role required' };
            }
            return findNextPublishableVersion(appId, localVersion);
        },

        type: 'BulkPublishMyCompanyApps'
    };
})());
