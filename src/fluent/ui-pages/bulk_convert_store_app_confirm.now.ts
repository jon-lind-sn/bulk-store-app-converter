import { UiPage } from '@servicenow/sdk/core'

UiPage({
    $id: Now.ID['e50a5b297999422a982ce43dd4e39791'],
    category: 'general',
    endpoint: 'bulk_convert_store_app_confirm.do',
    description:
        'Bidirectional bulk conversion: convert store apps to development mode and development apps back to store apps.',
    html: `<?xml version="1.0" encoding="utf-8"?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
  <j2:if test="$[gs.hasRole('admin')]">
    <g2:evaluate var="jvar_is_global_scope" jelly="true">var isGlobalScope = gs.getCurrentApplicationScope() === 'global';
      if (!isGlobalScope) {
        gs.addErrorMessage('BulkConvertStoreApp: You must be in a global scope to convert. Please switch your application scope to Global.');
      }
      isGlobalScope;</g2:evaluate>
    <g2:evaluate var="jvar_store_apps" object="true" jelly="true">var storeApps = [];
      var devApps = [];
      var gr = new GlideRecord('sys_scope');
      gr.orderBy('name');
      gr.query();
      while (gr.next()) {
        var sysId = gr.sys_id.toString();
        var className = gr.getValue('sys_class_name') || '';
        var appInfo = {
          sys_id: sysId,
          name: gr.getValue('name') || sysId,
          version: gr.getValue('version') || '',
          scope: gr.getValue('scope') || ''
        };
        try {
          if (className === 'sys_store_app') {
            if (sn_app_api.AppStoreAPI.canConvertSysStoreApp(sysId)) {
              storeApps.push(appInfo);
            }
          } else if (className === 'sys_app') {
            if (sn_app_api.AppStoreAPI.canConvertSysApp(sysId)) {
              devApps.push(appInfo);
            }
          }
        } catch(e) {
          gs.error('BulkConvertStoreApp: Error checking convertibility for sys_id=' + sysId + ' (' + className + '): ' + e.message);
        }
      }
      storeApps;</g2:evaluate>
    <g2:evaluate var="jvar_dev_apps" object="true" jelly="true">devApps;</g2:evaluate>
    <g:ui_form>
      <div class="container-fluid" style="margin-top: 10px;">
        <div id="page-messages" class="col-sm-12"></div>
        <div class="col-sm-12">
          <h3>Bidirectional App Conversion</h3>
          <p class="text-muted">\${gs.getMessage("Convert store apps to development mode or development apps back to store apps.")}</p>
		  <p>
		  \${gs.getMessage("Have apps that you think you should be able to convert to Dev mode but don't see here? Make sure that \`sn_appauthor.all_company_keys\` system property has your company app key, e.g. for \`x_snc\` it is \`snc\`. Use")}
		  $[SP]
		  <a target="_blank" href='https://www.servicenow.com/community/servicenow-ide-sdk-and-fluent/now-sdk-amp-cli-sn-appauthor-all-company-keys-issue-resolution/m-p/3525707'> \${gs.getMessage("this script")}</a> $[SP] \${gs.getMessage("to modify it.")}</p>
		  <p id="how-to-section">
		  <h3>How to use this</h3>
		  <ol>
		  	<li>Usually after a clone you need to upgrade the apps before converting them to dev mode. From the System Applications menu use the $[SP]<b>Bulk Upgrade ALL My Company Apps</b>$[SP] link to upgrade every app where "is_store_app=false" to the latest version. Or use $[SP]<b>Bulk Upgrade My Company Apps from System Property</b>$[SP] link to only upgrade the apps listed in the system property \`bulk_convert_store_app.convertible_apps\`.</li>
			<li>On this page select the Store apps that you want to convert to dev mode.</li>
			<li>To publish development apps, select them in the right column and click $[SP]<b>Publish New Version</b>. Each app is published to My Application Repository at the next minor version the repository accepts. Apps whose version contains CONVERTED are skipped; set their version manually first.</li>
		  </ol>
		  </p>
        </div>
        <div class="row">
          <div class="col-sm-6">
            <div class="panel panel-info">
              <div class="panel-heading">
                <h4 class="panel-title">\${gs.getMessage("Convertible Store Apps")}</h4>
              </div>
              <div class="panel-body">
                <p class="text-muted">\${gs.getMessage("Select store apps to convert to development mode.")}</p>
                <div id="store-app-checklist" style="">
                  <j2:if test="$[jvar_store_apps.length == 0]">
                    <p class="text-muted">
                      <em>\${gs.getMessage("No convertible store applications found.")}</em>
                    </p>
                  </j2:if>
                  <j2:forEach items="$[jvar_store_apps]" var="jvar_sapp">
                    <div class="checkbox" style="margin: 4px 0;">
                      <label>
                        <input type="checkbox" class="store-app-checkbox" value="$[jvar_sapp.sys_id]"></input>
                        <strong>$[jvar_sapp.name]</strong>
                        (v$[jvar_sapp.version]) -
                        <span class="text-muted">$[jvar_sapp.scope]</span>
                      </label>
                      <a href="sys_scope.do?sys_id=$[jvar_sapp.sys_id]" target="_blank" title="Open record" style="margin-left: 6px;">
                        <span class="glyphicon glyphicon-new-window"></span>
                      </a>
                    </div>
                  </j2:forEach>
                </div>
                <div style="margin-top: 10px;">
                  <j2:if test="$[jvar_is_global_scope == true]">
                    <button id="btnConvertToDev" onclick="onConvertToDev()" class="btn btn-primary" type="button">\${gs.getMessage("Convert to Dev Mode")}</button>
                  </j2:if>
                  <j2:if test="$[jvar_is_global_scope != true]">
                    <button disabled="disabled" class="btn btn-primary">\${gs.getMessage("Convert to Dev Mode")}</button>
                  </j2:if>
                </div>
                <div id="store-status-list" style="display: none; max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: #fafafa; margin-top: 10px;"></div>
              </div>
            </div>
          </div>
          <div class="col-sm-6">
            <div class="panel panel-warning">
              <div class="panel-heading">
                <h4 class="panel-title">\${gs.getMessage("Development Mode Apps")}</h4>
              </div>
              <div class="panel-body">
                <p class="text-muted">\${gs.getMessage("Select development apps to convert back to store apps.")}</p>
                <div id="dev-app-checklist" style="">
                  <j2:if test="$[jvar_dev_apps.length == 0]">
                    <p class="text-muted">
                      <em>\${gs.getMessage("No custom-scoped development applications found.")}</em>
                    </p>
                  </j2:if>
                  <j2:forEach items="$[jvar_dev_apps]" var="jvar_dapp">
                    <div class="checkbox" style="margin: 4px 0;">
                      <label>
                        <input type="checkbox" class="dev-app-checkbox" value="$[jvar_dapp.sys_id]"></input>
                        <strong>$[jvar_dapp.name]</strong>
                        (v$[jvar_dapp.version]) -
                        <span class="text-muted">$[jvar_dapp.scope]</span>
                      </label>
                      <a href="sys_scope.do?sys_id=$[jvar_dapp.sys_id]" target="_blank" title="Open record" style="margin-left: 6px;">
                        <span class="glyphicon glyphicon-new-window"></span>
                      </a>
                    </div>
                  </j2:forEach>
                </div>
                <div style="margin-top: 10px;">
                  <j2:if test="$[jvar_is_global_scope == true]">
                    <button id="btnConvertToStore" onclick="onConvertToStore()" class="btn btn-warning" type="button">\${gs.getMessage("Convert to Store App")}</button>
                  </j2:if>
                  <j2:if test="$[jvar_is_global_scope != true]">
                    <button disabled="disabled" class="btn btn-warning">\${gs.getMessage("Convert to Store App")}</button>
                  </j2:if>
                  <j2:if test="$[jvar_is_global_scope == true]">
                    <button id="btnPublish" onclick="onPublish()" class="btn btn-success" type="button" style="margin-left: 6px;" title="Bump to the next minor version that My Application Repository accepts and publish each selected app">\${gs.getMessage("Publish New Version")}</button>
                  </j2:if>
                  <j2:if test="$[jvar_is_global_scope != true]">
                    <button disabled="disabled" class="btn btn-success" style="margin-left: 6px;">\${gs.getMessage("Publish New Version")}</button>
                  </j2:if>
                </div>
                <div id="dev-status-list" style="display: none; max-height: 200px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: #fafafa; margin-top: 10px;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </g:ui_form>
  </j2:if>
</j:jelly>`,
    clientScript: `function showInfoMessage(msg) {
    var container = gel('page-messages');
    if (!container) { return; }
    var div = document.createElement('div');
    div.className = 'alert alert-info';
    div.style.marginTop = '10px';
    div.innerHTML = '<strong>Info:</strong> ' + msg;
    container.appendChild(div);
}

function showErrorMessage(msg) {
    var container = gel('page-messages');
    if (!container) { return; }
    var div = document.createElement('div');
    div.className = 'alert alert-danger';
    div.style.marginTop = '10px';
    div.textContent = msg;
    container.appendChild(div);
}

function getCheckedStoreApps() {
    var checked = [];
    var checkboxes = document.querySelectorAll('.store-app-checkbox:checked');
    for (var i = 0; i < checkboxes.length; i++) {
        checked.push(checkboxes[i].value);
    }
    return checked;
}

function getCheckedDevApps() {
    var checked = [];
    var checkboxes = document.querySelectorAll('.dev-app-checkbox:checked');
    for (var i = 0; i < checkboxes.length; i++) {
        checked.push(checkboxes[i].value);
    }
    return checked;
}

function getAppNameFromCheckbox(sysId, className) {
    var checkboxes = document.querySelectorAll('.' + className);
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].value === sysId) {
            var label = checkboxes[i].closest('label');
            if (label) {
                var strong = label.querySelector('strong');
                return strong ? strong.textContent : sysId;
            }
        }
    }
    return sysId;
}

function addStatusRow(containerId, appId, appName, status) {
    var container = gel(containerId);
    container.style.display = 'block';
    var labelClass = 'label-default';
    if (status === 'Complete') { labelClass = 'label-success'; }
    else if (status === 'Published') { labelClass = 'label-primary'; }
    else if (status === 'Failed') { labelClass = 'label-danger'; }
    else if (status === 'Converting' || status === 'Publishing') { labelClass = 'label-warning'; }
    else if (status === 'Pending') { labelClass = 'label-info'; }

    var div = document.createElement('div');
    div.className = 'conversion-result-item';
    div.id = 'result-' + containerId + '-' + appId;
    div.style.cssText = 'margin: 4px 0; padding: 2px 0;';
    div.innerHTML = '<span class="label ' + labelClass + '">' + status + '</span>' +
        '<strong style="margin-left: 6px;">' + appName + '</strong> - ' + appId +
        ' <a href="sys_scope.do?sys_id=' + appId + '" target="_blank" title="Open record" style="margin-left: 6px;"><span class="glyphicon glyphicon-new-window"></span></a>';
    container.appendChild(div);
}

function updateStatusRow(containerId, appId, status) {
    var div = document.getElementById('result-' + containerId + '-' + appId);
    if (div) {
        var span = div.querySelector('.label');
        if (span) {
            var labelClass = 'label-default';
            if (status === 'Complete') { labelClass = 'label-success'; }
            else if (status === 'Published') { labelClass = 'label-primary'; }
            else if (status === 'Failed') { labelClass = 'label-danger'; }
            else if (status === 'Converting' || status === 'Publishing') { labelClass = 'label-warning'; }
            else if (status === 'Pending') { labelClass = 'label-info'; }
            span.className = 'label ' + labelClass;
            span.textContent = status;
        }
    }
}

function disableCheckboxByValue(className, sysId) {
    var checkboxes = document.querySelectorAll('.' + className);
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].value === sysId) {
            checkboxes[i].disabled = true;
            checkboxes[i].checked = true;
        }
    }
}

function pollTracker(trackerId, onComplete, onFailed) {
    var interval = setInterval(function() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/now/table/sys_execution_tracker?sysparm_query=sys_id=' + trackerId + '&sysparm_fields=state,percent_complete,message', true);
        xhr.setRequestHeader('X-UserToken', window.g_ck);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    if (data.result && data.result.length > 0) {
                        var state = data.result[0].state;
                        if (state === '2') {
                            clearInterval(interval);
                            onComplete(data.result[0]);
                        } else if (state === '3' || state === '4') {
                            clearInterval(interval);
                            onFailed(data.result[0]);
                        }
                    }
                } else {
                    clearInterval(interval);
                    onFailed();
                }
            }
        };
        xhr.send();
    }, 3000);
}

function onConvertToDev() {
    var sysIds = getCheckedStoreApps();
    if (sysIds.length === 0) {
        alert('No store apps selected. Check at least one app from the list.');
        return;
    }
    var btn = gel('btnConvertToDev');
    btn.disabled = true;
    btn.className = 'btn btn-default';
    btn.innerHTML = 'Converting...';

    for (var i = 0; i < sysIds.length; i++) {
        var appName = getAppNameFromCheckbox(sysIds[i], 'store-app-checkbox');
        addStatusRow('store-status-list', sysIds[i], appName, 'Pending');
    }

    convertStoreNext(sysIds, 0);
}

function convertStoreNext(sysIds, index) {
    if (index >= sysIds.length) {
        var btn = gel('btnConvertToDev');
        btn.innerHTML = 'Done';
        btn.disabled = true;
        showInfoMessage('Conversion complete. Refresh the page to perform another conversion.');
        return;
    }

    var appId = sysIds[index];
    updateStatusRow('store-status-list', appId, 'Converting');

    var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
    ga.addParam('sysparm_name', 'start');
    ga.addParam('sysparm_function', 'convertToDevelopmentApp');
    ga.addParam('sysparm_sys_id', appId);
    ga.addParam('sysparm_progress_name', 'Converting Store application');
    ga.addParam('sysparm_ajax_processor', 'com.snc.apps.AppsAjaxProcessor');
    ga.addParam('sysparm_scope', 'global');
    ga.getXMLAnswer(function(answer) {
        if (answer && answer.trim() !== '') {
            pollTracker(answer.trim(), function() {
                updateStatusRow('store-status-list', appId, 'Complete');
                disableCheckboxByValue('store-app-checkbox', appId);
                convertStoreNext(sysIds, index + 1);
            }, function() {
                updateStatusRow('store-status-list', appId, 'Failed');
                convertStoreNext(sysIds, index + 1);
            });
        } else {
            updateStatusRow('store-status-list', appId, 'Failed');
            convertStoreNext(sysIds, index + 1);
        }
    });
}

function onConvertToStore() {
    var sysIds = getCheckedDevApps();
    if (sysIds.length === 0) {
        alert('No development apps selected. Check at least one app from the list.');
        return;
    }
    var btn = gel('btnConvertToStore');
    btn.disabled = true;
    btn.className = 'btn btn-default';
    btn.innerHTML = 'Converting...';

    for (var i = 0; i < sysIds.length; i++) {
        var appName = getAppNameFromCheckbox(sysIds[i], 'dev-app-checkbox');
        addStatusRow('dev-status-list', sysIds[i], appName, 'Pending');
    }

    convertDevNext(sysIds, 0);
}

function convertDevNext(sysIds, index) {
    if (index >= sysIds.length) {
        var btn = gel('btnConvertToStore');
        btn.innerHTML = 'Done';
        btn.disabled = true;
        showInfoMessage('Conversion complete. Refresh the page to perform another conversion.');
        return;
    }

    var appId = sysIds[index];
    updateStatusRow('dev-status-list', appId, 'Converting');

    var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
    ga.addParam('sysparm_name', 'start');
    ga.addParam('sysparm_function', 'convertToStoreApp');
    ga.addParam('sysparm_sys_id', appId);
    ga.addParam('sysparm_progress_name', 'Converting application');
    ga.addParam('sysparm_ajax_processor', 'com.snc.apps.AppsAjaxProcessor');
    ga.addParam('sysparm_scope', 'global');
    ga.getXMLAnswer(function(answer) {
        if (answer && answer.trim() !== '') {
            pollTracker(answer.trim(), function() {
                updateStatusRow('dev-status-list', appId, 'Complete');
                disableCheckboxByValue('dev-app-checkbox', appId);
                convertDevNext(sysIds, index + 1);
            }, function() {
                updateStatusRow('dev-status-list', appId, 'Failed');
                convertDevNext(sysIds, index + 1);
            });
        } else {
            updateStatusRow('dev-status-list', appId, 'Failed');
            convertDevNext(sysIds, index + 1);
        }
    });
}

function getCheckedEnabledDevApps() {
    var checked = [];
    var checkboxes = document.querySelectorAll('.dev-app-checkbox:checked');
    for (var i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].disabled) {
            checked.push(checkboxes[i].value);
        }
    }
    return checked;
}

function getAppVersionFromCheckbox(sysId, className) {
    var checkboxes = document.querySelectorAll('.' + className);
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].value === sysId) {
            var label = checkboxes[i].closest('label');
            var match = label ? label.textContent.match(/\\(v([^)]*)\\)/) : null;
            return match ? match[1] : '';
        }
    }
    return '';
}

function setStatusNote(containerId, appId, note, href) {
    var div = document.getElementById('result-' + containerId + '-' + appId);
    if (!div) { return; }
    var existing = div.querySelector('.status-note');
    if (existing) { existing.parentNode.removeChild(existing); }
    var span = document.createElement('div');
    span.className = 'status-note text-muted';
    span.style.cssText = 'margin-left: 6px; font-size: 90%;';
    if (href) {
        var a = document.createElement('a');
        a.href = href;
        a.target = '_blank';
        a.textContent = note;
        span.appendChild(a);
    } else {
        span.textContent = note;
    }
    div.appendChild(span);
}

function onPublish() {
    var sysIds = getCheckedEnabledDevApps();
    if (sysIds.length === 0) {
        alert('No development apps selected. Check at least one app from the list.');
        return;
    }

    var eligible = [];
    var converted = [];
    for (var i = 0; i < sysIds.length; i++) {
        var name = getAppNameFromCheckbox(sysIds[i], 'dev-app-checkbox');
        var version = getAppVersionFromCheckbox(sysIds[i], 'dev-app-checkbox');
        if (/CONVERTED/i.test(version)) {
            converted.push({ id: sysIds[i], name: name, version: version });
        } else {
            eligible.push(sysIds[i]);
        }
    }

    if (converted.length > 0) {
        var names = [];
        for (var c = 0; c < converted.length; c++) {
            names.push(converted[c].name + ' (v' + converted[c].version + ')');
        }
        alert('These apps will not be published because their version contains CONVERTED. Set a version manually first, then run again:\\n\\n' + names.join('\\n'));
    }

    var btn = gel('btnPublish');
    for (var s = 0; s < converted.length; s++) {
        addStatusRow('dev-status-list', converted[s].id, converted[s].name, 'Skipped');
        setStatusNote('dev-status-list', converted[s].id, 'Version contains CONVERTED. Set the version manually first.');
    }
    if (eligible.length === 0) {
        return;
    }

    btn.disabled = true;
    btn.className = 'btn btn-default';
    btn.style.marginLeft = '6px';
    btn.innerHTML = 'Publishing...';

    for (var e = 0; e < eligible.length; e++) {
        addStatusRow('dev-status-list', eligible[e], getAppNameFromCheckbox(eligible[e], 'dev-app-checkbox'), 'Pending');
    }

    publishNext(eligible, 0);
}

// Same call the stock "Switch to this Application" action makes. Publish permission checks depend on the application picker.
function switchApplication(appId, callback) {
    var ga = new GlideAjax('com.snc.apps.AppsAjaxProcessor');
    ga.addParam('sysparm_function', 'changeApplication');
    ga.addParam('sysparm_value', appId);
    ga.getXML(function() {
        callback();
    });
}

function finishPublish() {
    // The convert and publish actions require the Global application selected, so always end there.
    switchApplication('global', function() {
        var btn = gel('btnPublish');
        btn.innerHTML = 'Done';
        btn.disabled = true;
        showInfoMessage('Publishing complete. The application picker is back on Global. Refresh the page to publish more apps.');
    });
}

function publishNext(sysIds, index) {
    if (index >= sysIds.length) {
        finishPublish();
        return;
    }

    var appId = sysIds[index];
    updateStatusRow('dev-status-list', appId, 'Publishing');
    switchApplication(appId, function() {
        publishApp(sysIds, index);
    });
}

function publishApp(sysIds, index) {
    var appId = sysIds[index];

    var ga = new GlideAjax('BulkPublishMyCompanyApps');
    ga.addParam('sysparm_name', 'getNextPublishVersion');
    ga.addParam('sysparm_sys_id', appId);
    ga.getXMLAnswer(function(answer) {
        var info = null;
        try {
            info = JSON.parse(answer);
        } catch (err) {
            info = null;
        }
        if (!info || !info.ok) {
            var reason = info && info.error ? info.error : getAppNameFromCheckbox(appId, 'dev-app-checkbox') + ': could not determine the next version.';
            updateStatusRow('dev-status-list', appId, 'Failed');
            setStatusNote('dev-status-list', appId, reason);
            showErrorMessage(reason);
            publishNext(sysIds, index + 1);
            return;
        }
        setStatusNote('dev-status-list', appId, 'v' + info.currentVersion + ' -> v' + info.nextVersion);
        startPublish(appId, info, function() {
            publishNext(sysIds, index + 1);
        });
    });
}

function startPublish(appId, info, onDone) {
    function fail(detail) {
        var msg = info.appName + ': publish failed. Version on record: ' + info.currentVersion +
            '. Last attempted version: ' + info.nextVersion + '.' + (detail ? ' ' + detail : '');
        updateStatusRow('dev-status-list', appId, 'Failed');
        setStatusNote('dev-status-list', appId, msg);
        showErrorMessage(msg);
        onDone();
    }

    var ga = new GlideAjax('sn_appauthor.ScopedAppUploaderAJAX');
    ga.addParam('sysparm_name', 'start');
    ga.addParam('sysparm_sys_id', appId);
    ga.addParam('sysparm_version', info.nextVersion);
    ga.addParam('sysparm_dev_notes', 'Published by Bulk Store App Converter');
    ga.addParam('sysparm_username', '');
    ga.addParam('sysparm_password', '');
    ga.addParam('sysparm_publish_to_store', 'false');
    ga.addParam('sysparm_target_upload_URL', '');
    ga.addParam('sysparm_is_customization', '');
    ga.addParam('sysparm_ajax_processor', 'sn_appauthor.ScopedAppUploaderAJAX');
    ga.getXMLAnswer(function(answer) {
        var trackerId = answer ? answer.trim() : '';
        if (/^[0-9a-f]{32}$/i.test(trackerId)) {
            pollTracker(trackerId, function() {
                updateStatusRow('dev-status-list', appId, 'Published');
                setStatusNote('dev-status-list', appId, 'Published v' + info.nextVersion + ' (was v' + info.currentVersion + ')');
                disableCheckboxByValue('dev-app-checkbox', appId);
                onDone();
            }, function(tracker) {
                fail(tracker && tracker.message ? 'Tracker said: ' + tracker.message : '');
            });
        } else {
            fail(trackerId ? 'Unexpected response from uploader: ' + trackerId : 'The uploader did not return a progress tracker.');
        }
    });
}
`,
    $meta: {
        useEsLatest: true,
    },
})
