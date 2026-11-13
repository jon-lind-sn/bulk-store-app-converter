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
                    'bulk-app-console': {
                        table: 'sys_script_include'
                        id: 'a0b9328e4d2b48e890224089b908d683'
                    }
                    'bulk-convert-store-app-publish-log': {
                        table: 'sys_properties'
                        id: 'feac1a896aa94524b6f9264722e899f9'
                    }
                    'bulk-publish-my-company-apps': {
                        table: 'sys_script_include'
                        id: 'a596bcf5023642be80f89bfd1870e524'
                    }
                    'fix-find-multi-scope-history': {
                        table: 'sys_script_fix'
                        id: '1746b088dcd347dda51cd9908165afd8'
                    }
                    'multi-scope-history-finder': {
                        table: 'sys_script_include'
                        id: '3afd507950174686b652a44272b94f6a'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '743e285e6acf46a48d0d74349d2132c2'
                    }
                }
                composite: [
                    {
                        table: 'sys_dictionary'
                        id: '0187d180a39f4c41907a215a641922b6'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'cursor'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '01b69a89d84841f48adfdfbacb2c2249'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'state'
                            value: 'complete'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '01e694c9157f45f2939484261a0c0455'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_xml_scopes'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0276e7cc797b4984986f29915d6e6c71'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '02a12ba3668348e6a6d5a8b87941b0b8'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newest_scope'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '036b7a6dc2ca4b6c986bcb49e8d34b02'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_finished'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '03994feeadc245129c5ac403d3172541'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'scope_path'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '056741ff0e5b4e699b7ee838e345ff57'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_pattern'
                            value: 'no_current'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '05bb520428ca4b0da0b23577a2243a43'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_started'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '0626e95f97104d0680161b813840e72a'
                        deleted: true
                        key: {
                            sys_ui_form: {
                                id: '0b6c941b9a8c41d091e71e029784a4c4'
                                key: {
                                    name: 'u_msh_run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '074b284787fc447790ae99e44ae8d041'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_filter'
                            position: '12'
                        }
                    },
                    {
                        table: 'sys_es_latest_script'
                        id: '09190f5493924b50244af07e2803d66d'
                        key: {
                            id: '0dd88b5493924b50244af07e2803d6e7'
                            table: 'sys_script_include'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '0b3a1e60d4524ae087d9fa9a94193cef'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'files_found'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0b557a4a18134f97836b5386240111f5'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_cursor'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '0b6c941b9a8c41d091e71e029784a4c4'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0ecda9a524af42a9b95a41b6f09e1cad'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newer_than_current'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '0f00ad41fe1347ff831fa8c810bddd4e'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_scope_path'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '0f1c2fe6d96a4125b3fcfa413b5f0368'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_xml_count'
                            position: '19'
                        }
                    },
                    {
                        table: 'sys_ui_form'
                        id: '0f43528785ca48dabe4b48a8ee427b2d'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '0f6138f754e4454a869ab2a499bbcfef'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_run'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '11d895aab04347d49f5d12639f2ced96'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '12e9cec10bea4d8bbe52916a693245b6'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'flags'
                            position: '6'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '1393e7ff538f41718228c2239504b291'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '149ca6a3c5c24e46996db70bffb831e6'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_xml_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '14c99e8049ed47dbbae4bda05db046ab'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_summary'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '14fd5e8c3edf450681709afd1baf05fe'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'state'
                            value: 'running'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '16927ebb10e34427abf6737671c27a92'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_status'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1702cf04f8624e349f4cafa80ea373ab'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '17b83a365d404164a830641d19724382'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_pattern'
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
                        table: 'sys_documentation'
                        id: '17c5460b56b5483580b49f45b23ea12e'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_prefix'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '199d3b00f18341c1b73ab6b4b94d27da'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_files_found'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '1a0a32833ad34aa6b6c0d6dc11ea82bb'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_current_version'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1c07bd53fa414b60bba63992fc277da6'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newest_state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1d52260270f94e32a26ecf0ae4769c79'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newer_than_current'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '20b8310cfcad44148cdc5ec746f89141'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'status'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '20bb4887304345fd997bb332e2550c2f'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'prefix'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '21467558d37f480d93b73121b3ec503b'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_message'
                            position: '15'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '214cfb97c090421d92ed5b112124e608'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'pattern'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '21f8a9e0db554ddd91a7607a2540cc55'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'status'
                            value: 'fixed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2630dc720e144ab0bb5f1140e68aa34e'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_flags'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '27192f4a32f94486ad7e191d2c6a79e8'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_files_found'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '27a087db7b5948d092338b76b6e69f92'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '27dce25d652049138b850fcc3d0e4f48'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_xml_count'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2b0771a274b04aaba7ec55cdb12a6f58'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_summary'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '2e33df854ff2491e98f082c59ee36757'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newest_state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2e679419e8a54092990ce181c1ff06b1'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'candidates_checked'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '32a579bca3914f3d8bab3fe52f24960b'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '33dd44ee6aaa4d8c8757e713b5150ad9'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '33f54ae9bcc54d5fa536a21cf9da27a5'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '34dee2b4fd0c4857b21fc6deb6d2f511'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '35881671d836405988ba623bce1927e8'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'cursor'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '37a1642aa8f3423ab82b07ee41e842ef'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            caption: 'Run'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '38c53b36f76d419bae7abf8561ec3688'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '14'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '396b0b25e55b41998e5d5d09bbd9cb17'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'current_scope'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3a3e46f4a1a2409699234f6fc2376b04'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '21'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '3b22b85d85e3419a82655bc9419d0ba1'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_current_scope'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3cb8c34830544075bc4c545c30747e79'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_current_version'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3dc25214b3f14f1cac9f8c667d93b63a'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'cursor'
                            position: '10'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '3e5020386f684d7eaabf8e63478dac81'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_state'
                            value: 'complete'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '3eed82b0ff4f4208b6e9a7cd29afc659'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_name'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '3f4496d0894d4e1798d90c48dd9eac3e'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'state'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '41416839d8ec41a785a84045399348ea'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_filter'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '419ba5a4218840d29851ab993b558662'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_filter'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '41b85bb89a2e47728090bae5d11c34cc'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'newest_source'
                            position: '13'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '41bbe7359528463a928b2e362971aee3'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newest_version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '42a376aa3918404e896fe81aaca4cf02'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newest_source'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '4305d602cad448dbbcb0409cfa3905c1'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_name'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '4421f20ec4b440838aeeb9a5be1888ed'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            caption: 'File'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '479432d41ead4c0d887daf5f2ebbbe50'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '7'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '4a84ef7bd88d4553b6a5e6d80da4e41b'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'current_version'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '4c6a33dff49b49ffa6e3fca89874c01c'
                        deleted: true
                        key: {
                            sys_ui_form: {
                                id: '0f43528785ca48dabe4b48a8ee427b2d'
                                key: {
                                    name: 'u_msh_file'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '4c95d7ec90c94a1d9506ba608070811e'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'flags'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '4d5da3716e0f42b1a495eafb7e0109aa'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_current_scope'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '4dc8d22cff4046c6a548cccdee500cb5'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'options'
                            position: '13'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '5091c2949ae04be38b78ba4a2891368c'
                        deleted: true
                        key: {
                            logical_table_name: 'u_msh_file'
                            col_name_string: 'name'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '5137ae0f53b5424abc369a33693f833b'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'state'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '52881058fd7d4c0e851b28c7faa365b3'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'pattern'
                            value: 'no_current'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '533fda9bd5eb4507bca1ab3c25f3e250'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'current_scope'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '5360360ec8ed45429dbfdaa49545c68a'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'pattern'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '55be2e1e3ba849239a9d943e68362056'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_name'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '55f11758aa0347b88b43ebd63c964493'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newest_scope'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '56a5a9c0802448508355662713b330c0'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'filter'
                            position: '12'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '56e1ad3b5f1a4bdeb6340100e54b4145'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_pattern'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '576a860bc10040648b44f0fe6aed7b2e'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'files_found'
                            position: '9'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '576befdf1d72403dba246ba1785e0068'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'newest_scope'
                            position: '10'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5b4deb0cc63b488da9d8392f17441a29'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'action'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5bfa89a1daff4c64952722be3119efd0'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'started'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5cd61bad8587405d8b2a5465ae3411d2'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_pattern'
                            value: 'newer_history_same_scope'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '5d8a57c686eb419a87823a5ca30067d3'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'prefix'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5f3c28808d3e4b6799d7e2d301f84009'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newest_scope'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '5f400dfc09794ce6ae4d6d2bc66f0dac'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_status'
                            value: 'identified'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '60bba3c912d344ee9203d26213b99517'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_newest_source'
                            position: '13'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '614e9dbb8e9d4203b90216572b327f22'
                        deleted: true
                        key: {
                            logical_table_name: 'u_msh_file'
                            col_name_string: 'u_run,u_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '636b0955596049caa20956d1c28f57c1'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_options'
                            language: 'en'
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
                        table: 'sys_documentation'
                        id: '6525adc0e421447fbb122a53c341aff2'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'finished'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6539386f6a894db08ef9eeb9e07d4c93'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'filter'
                        }
                    },
                    {
                        table: 'sys_ui_section'
                        id: '67b9c0cd93bc47c98c48105c92609f80'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            caption: 'Files'
                            view: {
                                id: 'Default view'
                                key: {
                                    name: 'NULL'
                                }
                            }
                            sys_domain: 'global'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '6828d3fa97af4f3e93f695849b0ac0a6'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_message'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '68522e6fb0e8447d8bb26befc3710372'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_pattern'
                            value: 'newer_history_other_scope'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '685d4a22e2d34718842e4592aa2efc7d'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'action'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6968f4204149466d93f62355d90bf2d1'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'started'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '699e3feac834464da5a9cfc3ebff056f'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newest_source'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '69f4949d49f846afa6ab6da20dde4dcb'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '6b68221831c1453fa7aac61abf2d5ed3'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '67b9c0cd93bc47c98c48105c92609f80'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Files'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '12M.u_msh_run.u_msh_file.u_run'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '6c8e8fded438408589bb03ea6ec7bc1e'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_version_count'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '6ef590b2650843d4a98ec4e51f10173d'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'run'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7063799515bc4e5abfdb6208abc11587'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'pattern'
                            value: 'newer_history_same_scope'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '70ca00c060f34123afdb34f01d525a76'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'newest_state'
                            position: '12'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '71ea79269854475eafcc4323608738d7'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '18'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '72127867254a463380fc107f9e0edf3d'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'finished'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7246348b73b245e9afbc5efa04d52e8f'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_version_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: '726cf3ba7c9440718de7892f73bdf759'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7283a9787105489d8880e95c220b7243'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'action'
                            value: 'identify'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '73d19380a4f847a6971c10cf9b7710e7'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'current_scope'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '75bd7fb6c38142bc951d65eb187a9d58'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'versions'
                            position: '22'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '7716136541184fed89493f1a3627175c'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'state'
                            value: 'partial'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '777aed043b794ed6b5d0cb51259d080c'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_cursor'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '77d41084b6d743438bcef35eaebbb6e4'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'name'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '7b5f3be2d1014812930e208bfcfff09a'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_prefix'
                            position: '4'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '7bfee2e2a28445ecaba0996c17f23d60'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_pattern'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7c684131a99041199242db3f418a667c'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7caa0a68b6334c4eb2b57f9888d22daa'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '7d40970679224e63814a49b71cb505bc'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_message'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '7de9cfade31a433cbe9dadac69fe32b4'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '67b9c0cd93bc47c98c48105c92609f80'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Files'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '12M.u_msh_run.u_msh_file.run'
                            position: '0'
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
                        table: 'sys_ui_element'
                        id: '7f803d682db84d7585e271b09bfe7d46'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'xml_count'
                            position: '19'
                        }
                    },
                    {
                        table: 'sys_ui_form_section'
                        id: '82b04d5cef584921adc5c90900e5db18'
                        deleted: true
                        key: {
                            sys_ui_form: {
                                id: '0b6c941b9a8c41d091e71e029784a4c4'
                                key: {
                                    name: 'u_msh_run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            sys_ui_section: {
                                id: '67b9c0cd93bc47c98c48105c92609f80'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Files'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '858454e42b954442b82540ed4ba1571f'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '863cf3773bff43ff912092c2cf07f4f4'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'files_found'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8662d2da465a4a66bef06407b2573fdc'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_action'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '868082e858a944a39028cb63c40dcf9e'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'started'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '8722703d778841eca62609c563fb040f'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_version_count'
                            position: '17'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8852455376214acc857e456288049705'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'versions'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '8856751b82934e098a2aba99cb636de6'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_state'
                            position: '3'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '88afa06a34bc4b8a97c97ad081012797'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_state'
                            value: 'running'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '88eddbe91d1b4d43b03c13ce4ef93532'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_xml_scopes'
                            position: '20'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8907758b654d473fa8a265c168d0678e'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_current_version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: '8952590fc64341078566f5a338e5d880'
                        deleted: true
                        key: {
                            logical_table_name: 'u_msh_file'
                            col_name_string: 'u_name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8a0dc782e3624caabb0fcfe50e53f06e'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'summary'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_es_latest_script'
                        id: '8a4d1af703c64ca8948050054825e9a1'
                        key: {
                            id: 'a596bcf5023642be80f89bfd1870e524'
                            table: 'sys_script_include'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '8aabbe7cb47c41d79c63ad21efdd7a5a'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.split'
                            position: '7'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8c701c512e1d48abbc39a59ae1ce8b85'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'filter'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '8c9304204c1f4794a9bc5e03054b7447'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_status'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8d3e73de3a084aa7abbf5fae72267e04'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_options'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '8fb13360999f421c89d7be278855a656'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newest_version'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8fc96e7d376a4eeeb622e5e2bda05f93'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'xml_scopes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '90af128fbc57465cb04f1bd3a1932f05'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'pattern'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: '93e5e4f5d5f64a37a5b93ecb8cd7ffb2'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_action'
                            value: 'identify'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: '960dd14cd90b45f0a2395f2eeaf882ab'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_state'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9640e690c8b9489991cf4f0f7572c487'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_prefix'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '96a8e3c765e740bda4d01b996f75d594'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_run'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '96bb2399a83d4cca939a9d281cb6a18b'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newest_state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9ae4b25fa54646f6ba87f1609ffc5d22'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newest_source'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9c456194db244119a4a865fe90d70de0'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newer_than_current'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9cb8457d09494f558178e0f751e5e215'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'current_version'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9d6da9be6c5043cfb512625a41b13c44'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '15'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9e9330ab0c8c4f54b12dd2a39f32a6b2'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_action'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9f25b1bce1b045b19b6bd73a398be867'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_state'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9f35c4a3d3644d1e90103daf50ad398f'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_finished'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '9f663ebb4f454e86929ea4d5b7123e92'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'options'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: '9f6ba8ca0eed4b79ab07c2b73c92f65e'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_run'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9fee616b173648b7a5107540c6f7290a'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_name'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a15c1a9f326741408d916d97d8cbe2c9'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newest_version'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a2b9c10ea75c4dd99c403e8da8cd0d39'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newest_version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'a47b7f88545347a9b044bf7ff57c3d45'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_current_scope'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a87dc7fcde294b8c9ba03163d38875cb'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'summary'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'a93765d775eb4cbaa47b35331112d1a1'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_newer_than_current'
                            position: '16'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'aa92d1655d1d4823af97ab4e91f24091'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_pattern'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'ac895c0c4ba64b7980a8522a31a2c49b'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'newer_than_current'
                            position: '16'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'b0e4a30b7ef1470db522c8ec61bdee75'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_newest_version'
                            position: '11'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b50d148e639948fe9a3d081a7f8fdbf4'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_started'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b5254f18ba2448de8717d1fd012d4c34'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'xml_count'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: 'b63f7d51bc1841f3a58dbc967da868d0'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'b7720996d1cd4498b3da201c19da0fc5'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'status'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b7be9e681d774d518f2413f5277f7d1a'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'status'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'b82b9e8232f34a1eb35d65c34be58c2f'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_cursor'
                            position: '10'
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
                        table: 'sys_choice'
                        id: 'b91ada5f4a4a43e3b24f5802ce1a0ef0'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'status'
                            value: 'identified'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b98aaa9f19d34b8dba2d035e45b21046'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_flags'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ba0305a2d28c4cc286e7933390515dc7'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'scope_path'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'bb64cb9935624d32aba9e8662518dbaa'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'summary'
                            position: '14'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bb6b41fd43f94641907cc304f2578f8b'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bbe3d60b099f479db2b48bb3f64aab74'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'options'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'bd98483d4e124be1aa105750415b03b6'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_status'
                            value: 'skipped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_es_latest_script'
                        id: 'bdbc75d241ee45998e086369ba67c3d0'
                        key: {
                            id: 'a0b9328e4d2b48e890224089b908d683'
                            table: 'sys_script_include'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bf7769942ab249cd97b97c1bfd4ac376'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'version_count'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'bfe3a874bb4149889bf401e328f09e34'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_candidates_checked'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c01f9f843cde4da6aadb33469867cf4f'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'pattern'
                            value: 'newer_history_other_scope'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'c0541d14cb5940e3af0f810315058c12'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'name'
                            position: '1'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'c3a7b298b12f4044b21cd5e611267ec6'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'c5c298f0c9454c31a4294f4fc88be9c7'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_status'
                            value: 'failed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c6d0e8bde9574347953b36933edde0a1'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_xml_scopes'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'c82aae1138eb4b058743ccaa6a4dd8a8'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_started'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c845248cc808428e9c52b56b8b8902ab'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newest_scope'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'c8b7796ac4da414e94fba20887233089'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_versions'
                            position: '22'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c9b6aa088d1a44afaf0211143b5c4cd4'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'version_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cab44faa152542b3aa6ce6aef98b0e01'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_action'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cae43a397817444a9c20822834018562'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_scope_path'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'cb2c50d19b184a40b2b612e217e88405'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'pattern'
                            value: 'current_is_newest'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'cc725569ac214e4cbbedc6abc1ed162f'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_pattern'
                            value: 'current_is_newest'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'cd02e749b0a64ac6a3c2b3ed0763a222'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'candidates_checked'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'cea4273549c645a5bb6586e18ace8d22'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'prefix'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd0fec41d1a3c474b8fd27bd6392f4663'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'message'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd13de46c17ba4db991988df6fb62d478'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'current_version'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'd232eaccb20f4968991483a64e501a22'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'action'
                            position: '2'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'd2747459c9a94c95b7aa018441062591'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.end_split'
                            position: '11'
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
                        table: 'sys_dictionary'
                        id: 'd4f2b1c202f943f2a946e2b78b748b08'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'xml_scopes'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd521e9712b824142914984e027c7c507'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_status'
                            value: 'fixed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'd53435e7eb5343339dd2f13bf03e76eb'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_newest_state'
                            position: '12'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd5eee059a29748c79080e875016d6755'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'state'
                            value: 'failed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd5f2346128fd478ea788a90e35ab5bca'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'message'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd621eb95417f4f428680d196ee9d56e2'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'xml_count'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'd708600b9bee417dac000a8729facd74'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_action'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'd7377b68dd384885a8a0df16252155bf'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'scope_path'
                            position: '5'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'd9da210df26445b1b488fcb53fa2b7bb'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_state'
                            value: 'partial'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'da408bbb476c4e17a66a3272958289c3'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_versions'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'db29aaafe563484bafbfab9b5932152d'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'name'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'dcc4b02007624f08a25961c04ae69bb9'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dd3304f49971455e9a1f970386cdc9e9'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'pattern'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'ddb8c562f5a7463ca9f1ac30f4433326'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'status'
                            value: 'failed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'dded6f94d4684164bab4d03a57d06503'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'flags'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'de76f7a98539474a87b669033d5e4ca2'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'finished'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e2405718b3a54a99af792293a8b86af5'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_candidates_checked'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e316c274b1c447bc8c13324adbd0e19f'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_page'
                        id: 'e50a5b297999422a982ce43dd4e39791'
                        key: {
                            name: 'bulk_convert_store_app_confirm'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'e5232e9de0064b8581c28a4432b56068'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_state'
                            value: 'failed'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e58680a644a3481fb54e80021586720b'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'message'
                            position: '15'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e5aff39dd6c44a66b19e18752d749bb0'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'newest_version'
                            position: '11'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e5c6e565e41248beb7ffdf7f874fc7f3'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'candidates_checked'
                            position: '8'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e5fce2253a6f4344863cbca6735a3adf'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_newest_scope'
                            position: '10'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'e836fb3a31b64b40a2735b518982ac98'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_options'
                            position: '13'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'e88c4ec7bb824f11ac4956e53e2a1963'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_versions'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_index'
                        id: 'e983a3a3e2a045a6a87b9c64d00b2906'
                        deleted: true
                        key: {
                            logical_table_name: 'u_msh_file'
                            col_name_string: 'run,name'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'ebde0d642f98439fac2e482dcaf077e1'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'version_count'
                            position: '17'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ec1b452628ed4c7d9cd9d1469d8f4002'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'versions'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'ed5d2c9534fb4f12be933ef14185dfe1'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_files_found'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'eecd19d98c1a431fb0f2a8547d28fd1a'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newer_than_current'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'eedea5682100423fb10c1413fd146dda'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'run'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f4796d04aa344eaa9dfb76acb8645bac'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'newest_source'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f5c7833fb9f94689bb01cefd0def9fe1'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'run'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'f635855e7dea42279039ae7e3b86a413'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_summary'
                            position: '14'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f78fc0f395854ac3aee6c6433e6f466d'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_candidates_checked'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'f7e923af7e7e4bbab7341bfa59dd6318'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_state'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'f8e1bd6e4312405e893f5dbcf7317a2f'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_newest_state'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'f8fe0dabbda44bafa3f45e40e6768623'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'u_flags'
                            position: '6'
                        }
                    },
                    {
                        table: 'sys_choice_set'
                        id: 'faa555c5ca7b4fd0b29c63b248fa97f5'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'action'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'faa8027c1eb74486ad77e812c1dd6cfb'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '37a1642aa8f3423ab82b07ee41e842ef'
                                key: {
                                    name: 'u_msh_run'
                                    caption: 'Run'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: '.begin_split'
                            position: '0'
                        }
                    },
                    {
                        table: 'sys_ui_element'
                        id: 'fbfe9c4718cf47e0b71c22d589f00b16'
                        deleted: true
                        key: {
                            sys_ui_section: {
                                id: '4421f20ec4b440838aeeb9a5be1888ed'
                                key: {
                                    name: 'u_msh_file'
                                    caption: 'File'
                                    view: {
                                        id: 'Default view'
                                        key: {
                                            name: 'NULL'
                                        }
                                    }
                                    sys_domain: 'global'
                                }
                            }
                            element: 'xml_scopes'
                            position: '20'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'fd39404013c2408c8a492320d9fd3330'
                        deleted: true
                        key: {
                            name: 'u_msh_run'
                            element: 'u_finished'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_choice'
                        id: 'fde1a447cfdb4a799c2b160b6d8cc29b'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'status'
                            value: 'skipped'
                            language: 'en'
                            dependent_value: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ff4e342ec9934557ae373fa938e17770'
                        deleted: true
                        key: {
                            name: 'u_msh_file'
                            element: 'u_scope_path'
                        }
                    },
                ]
            }
        }
    }
}
