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
    else if (status === 'Failed') { labelClass = 'label-danger'; }
    else if (status === 'Converting') { labelClass = 'label-warning'; }
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
            else if (status === 'Failed') { labelClass = 'label-danger'; }
            else if (status === 'Converting') { labelClass = 'label-warning'; }
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
                            onComplete();
                        } else if (state === '3' || state === '4') {
                            clearInterval(interval);
                            onFailed();
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
`,
    $meta: {
        useEsLatest: true,
    },
})
