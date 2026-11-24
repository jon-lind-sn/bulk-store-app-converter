#!/usr/bin/env bash
#
# now-sdk2.sh: a now-sdk-style command line that talks to an instance only through
# scoped REST APIs (the now_sdk routes and sn_cicd), so a restricted client
# credentials token is enough. Local work (build, pack, clean, explain) is done by
# the stock Now SDK from this project's devDependencies.
#
#   now-sdk2.sh build                     now-sdk build, then the update-set payload for install
#   now-sdk2.sh install                   install the built app through now_sdk/install
#   now-sdk2.sh auth                      check the credential: token scope and now_sdk/auth
#   now-sdk2.sh cicd testsuite run        --test-suite-name <name> | --test-suite-sys-id <id>
#   now-sdk2.sh cicd publish              [--app-version <v>] [--app-sys-id <id>] [--dev-notes <text>]
#   now-sdk2.sh cicd install              [--app-version <v>] [--app-sys-id <id>]
#   now-sdk2.sh cicd rollback             --app-version <v> [--app-sys-id <id>]
#   now-sdk2.sh <anything else>           passed through to the stock now-sdk
#
# Credentials, the same variables the Now SDK reads in CI mode:
#   SN_SDK_INSTANCE_URL, SN_SDK_OAUTH_CLIENT_ID, SN_SDK_OAUTH_CLIENT_SECRET
#
# Optional:
#   NOW_SDK_API_PATH   base path of the now_sdk REST API (default api/global/now_sdk)
#   NOW_SDK2_TIMEOUT   seconds to wait for an install or job (default 1800)
#
# Requires bash, curl and python3 (all on GitHub-hosted Ubuntu and macOS runners).

set -uo pipefail

TOOLS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAYLOAD_DIR="dist/now-sdk2"
API_PATH="${NOW_SDK_API_PATH:-api/global/now_sdk}"
TIMEOUT="${NOW_SDK2_TIMEOUT:-1800}"
TOKEN=""

log() { echo "[now-sdk2] $*"; }
die() { echo "[now-sdk2] ERROR: $*" >&2; exit 1; }
sdk() { npx --no-install @servicenow/sdk "$@"; }

# json '<python expression on d>' reads JSON on stdin; prints '' when the expression fails.
json() {
    python3 -c "import json,sys
try:
    d=json.load(sys.stdin)
    v=$1
    print('' if v is None else v)
except Exception:
    print('')"
}

config_value() { python3 -c "import json;print(json.load(open('$1')).get('$2',''))" 2>/dev/null; }

require_credentials() {
    local v
    for v in SN_SDK_INSTANCE_URL SN_SDK_OAUTH_CLIENT_ID SN_SDK_OAUTH_CLIENT_SECRET; do
        [[ -n "${!v:-}" ]] || die "Set ${v} (the instance URL and the OAuth client credentials)."
    done
    INSTANCE_URL="${SN_SDK_INSTANCE_URL%/}"
}

# Requests a client_credentials token once per run. Never prints it.
token() {
    [[ -n "$TOKEN" ]] && return 0
    require_credentials
    local resp
    resp=$(curl -sS -X POST "${INSTANCE_URL}/oauth_token.do" \
        --data-urlencode "grant_type=client_credentials" \
        --data-urlencode "client_id=${SN_SDK_OAUTH_CLIENT_ID}" \
        --data-urlencode "client_secret=${SN_SDK_OAUTH_CLIENT_SECRET}") || die "Token request to ${INSTANCE_URL} failed."
    TOKEN=$(echo "$resp" | json "d.get('access_token')")
    TOKEN_SCOPE=$(echo "$resp" | json "d.get('scope')")
    [[ -n "$TOKEN" ]] || die "No token from ${INSTANCE_URL}: $(echo "$resp" | json "d.get('error','')+' '+d.get('error_description','')")"
}

# api METHOD PATH [curl args...]: sets HTTP_CODE and BODY.
api() {
    local method="$1" path="$2" out; shift 2
    token
    out=$(curl -sS -X "$method" "${INSTANCE_URL}/${path}" -H "Authorization: Bearer ${TOKEN}" \
        -H "Accept: application/json" -w $'\n%{http_code}' "$@") || die "Request to ${path} failed."
    HTTP_CODE="${out##*$'\n'}"
    BODY="${out%$'\n'*}"
}

# Fails with the instance's error message unless the last call returned 2xx.
expect_ok() {
    [[ "$HTTP_CODE" == 2?? ]] && return 0
    local msg
    msg=$(echo "$BODY" | json "(d['error'].get('message','') + (': ' + str(d['error']['detail']) if d['error'].get('detail') else ''))")
    case "$HTTP_CODE" in
        401|403) die "$1 was refused (HTTP ${HTTP_CODE}${msg:+: ${msg}}). Check that the OAuth integration's auth scope covers this API." ;;
        *) die "$1 failed (HTTP ${HTTP_CODE}${msg:+: ${msg}})." ;;
    esac
}

# Polls sn_cicd/progress until the job ends. Sets PROGRESS_BODY. Fails unless status is 2.
poll() {
    local id="$1" what="$2" start status pct last="" msg
    start=$(date +%s)
    while :; do
        api GET "api/sn_cicd/progress/${id}"
        expect_ok "Progress check for ${what}"
        status=$(echo "$BODY" | json "d['result']['status']")
        pct=$(echo "$BODY" | json "d['result'].get('percent_complete','')")
        if [[ "$pct" != "$last" ]]; then log "${what}: ${pct:-0}%"; last="$pct"; fi
        case "$status" in
            2) PROGRESS_BODY="$BODY"; return 0 ;;
            3|4)
                msg=$(echo "$BODY" | json "d['result'].get('status_message','') or d['result'].get('error','')")
                die "${what} $([[ "$status" == 3 ]] && echo failed || echo was canceled)${msg:+: ${msg}}" ;;
        esac
        (( $(date +%s) - start > TIMEOUT )) && die "${what} did not finish within ${TIMEOUT} seconds (progress ${id})."
        sleep 5
    done
}

# Starts an async sn_cicd job and waits for it.
run_job() {
    local what="$1" path="$2" id
    api POST "$path"
    expect_ok "$what"
    id=$(echo "$BODY" | json "d['result']['links']['progress']['id']")
    [[ -n "$id" ]] || die "${what} returned no progress id."
    poll "$id" "$what"
}

payload_file() { ls "${PAYLOAD_DIR}"/*.xml 2>/dev/null | head -1; }

app_sys_id_default() { config_value now.config.json scopeId; }
app_version_default() { config_value package.json version; }

# Parses --name value pairs into OPT_<name> variables (dashes become underscores).
parse_opts() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --*=*) local k="${1%%=*}" v="${1#*=}"; k="${k#--}"; printf -v "OPT_${k//-/_}" '%s' "$v"; shift ;;
            --*) local k="${1#--}"; [[ $# -ge 2 ]] || die "Missing value for $1"; printf -v "OPT_${k//-/_}" '%s' "$2"; shift 2 ;;
            *) die "Unexpected argument: $1" ;;
        esac
    done
}

urlencode() { python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1"; }

cmd_build() {
    [[ -f now.config.json ]] || die "Run this from a Fluent project directory (no now.config.json here)."
    sdk build "$@" || die "now-sdk build failed."
    rm -rf "$PAYLOAD_DIR" && mkdir -p "$PAYLOAD_DIR"
    python3 "${TOOLS_DIR}/gen_update_set.py" dist/app "$PAYLOAD_DIR" >/dev/null || die "Could not generate the install payload from dist/app."
    log "Install payload: $(payload_file)"
}

cmd_install() {
    [[ -f now.config.json ]] || die "Run this from a Fluent project directory (no now.config.json here)."
    [[ -n "$(payload_file)" ]] || { log "No install payload yet, building first."; cmd_build; }
    local file scope tracker rollback
    file=$(payload_file)
    scope=$(config_value now.config.json scope)
    log "Starting installation of ${scope} $(app_version_default) to ${SN_SDK_INSTANCE_URL:-?} through now_sdk/install..."
    api POST "${API_PATH}/install" -H "Content-Type: application/xml" --data-binary @"$file"
    expect_ok "now_sdk/install"
    tracker=$(echo "$BODY" | json "d['result']['tracker_id']")
    rollback=$(echo "$BODY" | json "d['result'].get('rollback_id','')")
    [[ -n "$tracker" ]] || die "now_sdk/install returned no tracker."
    poll "$tracker" "Install"
    [[ -n "$rollback" ]] && log "Rollback (undo installation): ${INSTANCE_URL}/sys_rollback_context.do?sys_id=${rollback}"
    log "Installation completed. Access the application at: ${INSTANCE_URL}/sys_app.do?sys_id=$(app_sys_id_default)"
}

cmd_auth() {
    if [[ $# -gt 0 ]]; then sdk auth "$@"; return; fi
    token
    log "Token scope: ${TOKEN_SCOPE:-<none>}"
    api POST "${API_PATH}/auth" -H "Content-Type: application/json" -d '{}'
    expect_ok "now_sdk/auth"
    log "Authenticated to ${INSTANCE_URL} as $(echo "$BODY" | json "d['result']['user']['user_name']")"
}

cmd_testsuite_run() {
    parse_opts "$@"
    local q
    if [[ -n "${OPT_test_suite_sys_id:-}" ]]; then q="test_suite_sys_id=$(urlencode "$OPT_test_suite_sys_id")"
    elif [[ -n "${OPT_test_suite_name:-}" ]]; then q="test_suite_name=$(urlencode "$OPT_test_suite_name")"
    else die "Provide either --test-suite-sys-id or --test-suite-name"; fi
    log "Running test suite ${OPT_test_suite_name:-${OPT_test_suite_sys_id}}..."
    run_job "Test suite" "api/sn_cicd/testsuite/run?${q}"
    local result_id status passed failed
    result_id=$(echo "$PROGRESS_BODY" | json "d['result']['links']['results']['id']")
    [[ -n "$result_id" ]] || die "The test suite finished but reported no result id."
    api GET "api/sn_cicd/testsuite/results/${result_id}"
    expect_ok "Test suite result"
    status=$(echo "$BODY" | json "d['result'].get('test_suite_status','')")
    passed=$(echo "$BODY" | json "d['result'].get('rolledup_test_success_count','')")
    failed=$(echo "$BODY" | json "int(d['result'].get('rolledup_test_failure_count') or 0) + int(d['result'].get('rolledup_test_error_count') or 0)")
    log "Test suite ${status:-unknown}: ${passed:-0} passed, ${failed:-0} failed. Details: ${INSTANCE_URL}/sys_atf_test_suite_result.do?sys_id=${result_id}"
    [[ "$status" == "success" ]] || exit 1
}

app_repo() {
    local route="$1" what="$2"; shift 2
    parse_opts "$@"
    local sys_id="${OPT_app_sys_id:-$(app_sys_id_default)}" version="${OPT_app_version:-$(app_version_default)}" q
    [[ -n "$sys_id" ]] || die "Provide --app-sys-id, or run from a Fluent project directory."
    [[ "$route" != rollback || -n "${OPT_app_version:-}" ]] || die "Provide --app-version, the version expected after the rollback"
    q="sys_id=${sys_id}${version:+&version=$(urlencode "$version")}${OPT_dev_notes:+&dev_notes=$(urlencode "$OPT_dev_notes")}"
    log "${what} version ${version} of ${sys_id}..."
    run_job "$what" "api/sn_cicd/app_repo/${route}?${q}"
    log "${what} completed."
}

main() {
    [[ $# -gt 0 ]] || { sed -n 2,26p "$0"; exit 0; }
    local cmd="$1"; shift
    case "$cmd" in
        build) cmd_build "$@" ;;
        install) cmd_install "$@" ;;
        auth) cmd_auth "$@" ;;
        cicd)
            local sub="${1:-}"; shift || true
            case "$sub" in
                testsuite) [[ "${1:-}" == run ]] && { shift; cmd_testsuite_run "$@"; } || sdk cicd testsuite "$@" ;;
                publish) app_repo publish "Publish to the App Repo" "$@" ;;
                install) app_repo install "Install from the App Repo" "$@" ;;
                rollback) app_repo rollback "Roll back" "$@" ;;
                *) sdk cicd "$sub" "$@" ;;
            esac ;;
        -h|--help|help) sed -n 2,26p "$0" ;;
        *) sdk "$cmd" "$@" ;;
    esac
}

main "$@"
