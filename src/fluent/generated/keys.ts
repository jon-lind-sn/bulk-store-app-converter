import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    '0733e5a91a7247b39c8d2b650f060a31': {
                        table: 'sys_app_module'
                        id: '0733e5a91a7247b39c8d2b650f060a31'
                    }
                    '0dd88b5493924b50244af07e2803d6e7': {
                        table: 'sys_script_include'
                        id: '0dd88b5493924b50244af07e2803d6e7'
                    }
                    '53bdd86258a14ab2b5f619b55f1acd56': {
                        table: 'sys_properties'
                        id: '53bdd86258a14ab2b5f619b55f1acd56'
                    }
                    '849a49979396c710244af07e2803d6df': {
                        table: 'sys_app_module'
                        id: '849a49979396c710244af07e2803d6df'
                    }
                    bd9797d093564b50244af07e2803d611: {
                        table: 'sys_app_module'
                        id: 'bd9797d093564b50244af07e2803d611'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '5d50fcfe27094e1c9d11f4bee5507bec'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '743e285e6acf46a48d0d74349d2132c2'
                    }
                }
                composite: [
                    {
                        table: 'sys_es_latest_script'
                        id: '09190f5493924b50244af07e2803d66d'
                        key: {
                            id: '0dd88b5493924b50244af07e2803d6e7'
                            table: 'sys_script_include'
                        }
                    },
                    {
                        table: 'sys_claim'
                        id: '17bb055f9396c710244af07e2803d609'
                        key: {
                            claim_owner_scope: '3b04bd443371c7d02e49a94a7e5c7bb3'
                            previous_claim_scope: '3b04bd443371c7d02e49a94a7e5c7bb3'
                            metadata_update_name: 'sys_app_module_849a49979396c710244af07e2803d6df'
                        }
                    },
                    {
                        table: 'sys_es_latest_script'
                        id: '63adb25493b58310633ff1cc0903d6d5'
                        key: {
                            id: 'e50a5b297999422a982ce43dd4e39791'
                            table: 'sys_ui_page'
                        }
                    },
                    {
                        table: 'sys_claim'
                        id: '7eb89bed93bd4f10244af07e2803d6bb'
                        key: {
                            claim_owner_scope: '3b04bd443371c7d02e49a94a7e5c7bb3'
                            previous_claim_scope: '3b04bd443371c7d02e49a94a7e5c7bb3'
                            metadata_update_name: 'sys_properties_53bdd86258a14ab2b5f619b55f1acd56'
                        }
                    },
                    {
                        table: 'sys_claim'
                        id: 'b8d89fed93bd4f10244af07e2803d660'
                        key: {
                            claim_owner_scope: '3b04bd443371c7d02e49a94a7e5c7bb3'
                            previous_claim_scope: '3b04bd443371c7d02e49a94a7e5c7bb3'
                            metadata_update_name: 'sys_app_module_0733e5a91a7247b39c8d2b650f060a31'
                        }
                    },
                    {
                        table: 'sys_claim'
                        id: 'd4a897ed93bd4f10244af07e2803d610'
                        key: {
                            claim_owner_scope: '3b04bd443371c7d02e49a94a7e5c7bb3'
                            previous_claim_scope: '3b04bd443371c7d02e49a94a7e5c7bb3'
                            metadata_update_name: 'sys_ui_page_e50a5b297999422a982ce43dd4e39791'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: 'e50a5b297999422a982ce43dd4e39791'
                        key: {
                            name: 'bulk_convert_store_app_confirm'
                        }
                    },
                ]
            }
        }
    }
}
