/**
 * BulkAppCompany
 *
 * Reads the company code (vendor key) of this instance. Every company scope is
 * x_<company code>_<app>. Nothing is hardcoded: the value comes from system properties.
 *
 *   glide.appcreator.company.code     main source
 *   sn_appauthor.all_company_keys     extra keys, when a company has more than one
 *
 * get() returns { codes: ['abc'], prefixes: ['x_abc_'], source: '<property name(s)>' }.
 * Each prefix ends with an underscore, so x_abc_ never matches x_abcd_.
 * getFilter() returns an encoded query on sys_update_version for those prefixes, or '' when none are found.
 */
var BulkAppCompany = Class.create();
BulkAppCompany.prototype = {
    PROP_CODE: 'glide.appcreator.company.code',
    PROP_KEYS: 'sn_appauthor.all_company_keys',

    MISSING_MESSAGE: 'No company code found. The company code is the vendor key in your app scopes (the `abc` in `x_abc_myapp`). ' +
        'It is read from the system property `glide.appcreator.company.code`, plus any extra keys in `sn_appauthor.all_company_keys`. ' +
        'To check them, open `sys_properties.list` and search for those names.',

    initialize: function () {},

    get: function () {
        var codes = [];
        var sources = [];
        var self = this;
        [this.PROP_CODE, this.PROP_KEYS].forEach(function (name) {
            var added = false;
            self._split(gs.getProperty(name, '')).forEach(function (code) {
                if (codes.indexOf(code) < 0) {
                    codes.push(code);
                    added = true;
                }
            });
            if (added) sources.push(name);
        });
        return {
            codes: codes,
            prefixes: codes.map(function (c) { return 'x_' + c + '_'; }),
            source: sources.join(' and ')
        };
    },

    getFilter: function () {
        return this.get().prefixes.map(function (p) { return 'application.scopeSTARTSWITH' + p; }).join('^OR');
    },

    // Trim, lowercase, and drop anything that cannot be part of a scope.
    _split: function (value) {
        return String(value || '').split(/[\s,;]+/).map(function (v) {
            return v.toLowerCase().replace(/[^a-z0-9]/g, '');
        }).filter(function (v) { return v; });
    },

    type: 'BulkAppCompany'
};
