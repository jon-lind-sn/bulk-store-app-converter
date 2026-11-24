#!/usr/bin/env python3
# Vendored copy of update-set-gen (commit bf20b7e, 2026-11-18). Python 3 standard library only.
# Used by tools/now-sdk2.sh to turn now-sdk build output (dist/app) into the update-set XML that now_sdk/install accepts.
"""
Reconstructs a "Retrieved Update Set" XML (the format produced by
Local Update Set > Retrieve/Export) from a source-controlled app folder
(the format produced by `now-sdk`/Source Control app export).

Output filename is derived from the app's own name + version (matching the
naming convention ServiceNow uses for a manually retrieved update set, e.g.
"Bulk Store App Converter" v1.0.4 -> "Bulk-Store-App-Converter-1.0.4.xml").

Usage:
    python3 gen_update_set.py [app_folder] [output_dir]

    app_folder defaults to "." and is searched (non-recursively, at its
    root) for a sys_app_<sys_id>.xml file to identify the app.
    output_dir defaults to "."
"""
import os
import re
import sys
import xml.etree.ElementTree as ET

def type_label_for_table(table):
    """sys_update_xml.type as Title Case of the table name, e.g.
    sys_app_module -> "Sys App Module", sys_ui_page -> "Sys UI Page".
    Two-letter words are fully uppercased (AI, UI, etc.) rather than
    title-cased. This is a guess that the exact display label isn't
    load-bearing for import (the payload's own table="..." attribute is
    what actually targets the record) and the update's name prefix
    already encodes the table. Untested against a real import until
    proven otherwise."""
    return " ".join(word.upper() if len(word) == 2 else word.capitalize()
                     for word in table.split("_"))



def strip_namespaced_junk(record_update_el):
    """Remove elements that are source-control-only bookkeeping and were
    never part of the real record update payload (e.g. sys_claim, which
    tracks which app in a family "claims" a shared metadata record)."""
    for child in list(record_update_el):
        if child.tag == "sys_claim":
            record_update_el.remove(child)


def load_record_update(path):
    tree = ET.parse(path)
    root = tree.getroot()
    assert root.tag == "record_update", f"{path}: unexpected root {root.tag}"
    strip_namespaced_junk(root)
    table = root.attrib.get("table")
    record_el = root.find(f"./{table}") if table else None
    if record_el is None:
        # table attribute missing (seen in some now-sdk exports, e.g. an SBOM
        # sys_module record) or a delete_multiple entry — fall back to the
        # record_update's actual child element, whose tag is the real table.
        record_el = next(iter(root), None)
        if table is None and record_el is not None:
            table = record_el.tag
    return root, table, record_el


def field_text(record_el, field):
    if record_el is None:
        return None
    el = record_el.find(field)
    if el is None or el.text is None:
        return None
    return el.text


def derive_target_name(record_el, table, sys_id):
    """Best available human-readable label for a record: its own <name>,
    else <display_name>, else <path> (the SBOM sys_module record has this
    and nothing else name-like), else <title>, else <sys_update_name>,
    else a synthesized <table>_<sys_id> (matches the filename convention)
    as the last resort for records with no name-like field at all (e.g.
    DELETE stubs). Deliberately just an ordered list of generic field
    names, not a per-table or per-action special case."""
    return (field_text(record_el, "name")
            or field_text(record_el, "display_name")
            or field_text(record_el, "path")
            or field_text(record_el, "title")
            or field_text(record_el, "sys_update_name")
            or f"{table}_{sys_id}")


def build_sys_update_xml(name, table, action, category, target_name, type_label,
                          payload_xml, app_sys_id, app_name, remote_update_set_id,
                          created_by, created_on, sys_id, recorded_at):
    sys_update_xml = ET.Element("sys_update_xml", {"action": "INSERT_OR_UPDATE"})

    def add(tag, text=None, **attrs):
        el = ET.SubElement(sys_update_xml, tag, attrs)
        if text is not None:
            el.text = text
        return el

    add("action", action)
    add("application", app_sys_id, display_value=app_name)
    add("category", category)
    add("comments")
    add("name", name)
    add("payload")  # filled in via CDATA post-serialization, see main()
    add("payload_hash")  # UNVERIFIED — see README note; left blank on purpose
    add("remote_update_set", remote_update_set_id, display_value=app_name)
    add("replace_on_upgrade", "false")
    add("sys_created_by", created_by)
    add("sys_created_on", created_on)
    add("sys_id", sys_id)
    add("sys_mod_count", "0")
    add("sys_recorded_at", recorded_at)
    add("sys_updated_by", created_by)
    add("sys_updated_on", created_on)
    add("table")
    add("target_name", target_name or "")
    add("type", type_label or table)
    add("update_domain", "global")
    add("update_guid")
    add("update_guid_history")
    add("update_set", display_value="")
    add("view")

    return sys_update_xml, payload_xml


def guid():
    # Not a real GUID generator (no random allowed in some environments) —
    # deterministic-looking placeholder. Caller should replace with uuid4
    # in interactive use; here we just need *a* unique 32-hex-char value.
    import hashlib
    import time
    seed = f"{time.time()}-{os.getpid()}-{id(object())}"
    return hashlib.md5(seed.encode()).hexdigest()


def main():
    if len(sys.argv) not in (1, 2, 3):
        print(__doc__)
        sys.exit(1)
    app_folder = sys.argv[1] if len(sys.argv) >= 2 else "."
    output_dir = sys.argv[2] if len(sys.argv) >= 3 else "."

    # A now-sdk build/sync puts sys_app_<sys_id>.xml at the app folder root
    # for a scoped app, but under a "scope" subdirectory for a globally
    # scoped app (verified 2026-09-25 against atf-adder, a global app).
    app_xml_rel = None
    for search_dir in (app_folder, os.path.join(app_folder, "scope")):
        if not os.path.isdir(search_dir):
            continue
        candidates = [f for f in os.listdir(search_dir) if f.startswith("sys_app_") and f.endswith(".xml")
                      and os.path.isfile(os.path.join(search_dir, f))]
        if len(candidates) > 1:
            sys.exit(f"Multiple sys_app_*.xml found in {search_dir}: {candidates}")
        if candidates:
            app_xml_rel = os.path.join(search_dir, candidates[0])
            break
    if app_xml_rel is None:
        sys.exit("No sys_app_<sys_id>.xml found at folder root or in a scope/ subdirectory")
    app_xml = [os.path.basename(app_xml_rel)]
    app_root, app_table, app_record = load_record_update(app_xml_rel)
    assert app_table == "sys_app"
    app_sys_id = field_text(app_record, "sys_id")
    app_name = field_text(app_record, "name")
    app_version = field_text(app_record, "version")
    app_description = field_text(app_record, "short_description") or ""
    app_scope = field_text(app_record, "scope")

    if not app_version:
        sys.exit(f"{app_xml[0]} has no <version> field")
    out_filename = f"{app_name.replace(' ', '-')}-{app_version}.xml"
    out_path = os.path.join(output_dir, out_filename)

    record_files = []
    for sub in ("update", "author_elective_update"):
        d = os.path.join(app_folder, sub)
        if os.path.isdir(d):
            for f in sorted(os.listdir(d)):
                if f.endswith(".xml"):
                    record_files.append(os.path.join(d, f))
    # The app record itself is also part of the update set.
    record_files.append(app_xml_rel)

    remote_update_set_id = guid()
    remote_sys_id = guid()

    entries = []
    for i, path in enumerate(record_files):
        root, table, record_el = load_record_update(path)
        action = root.find("*").attrib.get("action", "INSERT_OR_UPDATE")
        name = os.path.splitext(os.path.basename(path))[0]
        sys_id = field_text(record_el, "sys_id") or name.split("_")[-1]
        created_by = field_text(record_el, "sys_updated_by") or "admin"
        created_on = field_text(record_el, "sys_updated_on") or ""

        type_label = type_label_for_table(table)

        target_name = derive_target_name(record_el, table, sys_id)

        payload_xml = ET.tostring(root, encoding="unicode")
        payload_xml = '<?xml version="1.0" encoding="UTF-8"?>' + payload_xml

        # Fake but monotonically increasing recorded_at, since we don't have
        # the true capture order. Good enough unless records are
        # order-dependent on import, which isn't the case for this app.
        recorded_at = f"19fdd2b{i:03x}0000001"

        sys_update_xml, payload = build_sys_update_xml(
            name=name, table=table, action=action, category="customer",
            target_name=target_name, type_label=type_label,
            payload_xml=payload_xml, app_sys_id=app_sys_id, app_name=app_name,
            remote_update_set_id=remote_update_set_id, created_by=created_by,
            created_on=created_on, sys_id=guid(), recorded_at=recorded_at,
        )
        entries.append((sys_update_xml, payload))

    unload = ET.Element("unload", {"unload_date": entries[0][0].find("sys_created_on").text or ""})

    rus = ET.SubElement(unload, "sys_remote_update_set", {"action": "INSERT_OR_UPDATE"})

    def add_rus(tag, text=None, **attrs):
        el = ET.SubElement(rus, tag, attrs)
        if text is not None:
            el.text = text
        return el

    # The platform compares this root value to each child's <application> as ids, so a
    # scoped app needs the scope sys_id here (same value the children carry), not the
    # scope name. A global app keeps the literal "global".
    add_rus("application", "global" if app_scope == "global" else app_sys_id,
            display_value="Global" if app_scope == "global" else app_name)
    add_rus("application_name", app_name if app_scope != "global" else "Global")
    add_rus("application_scope", app_scope)
    add_rus("collisions")
    add_rus("commit_date")
    add_rus("deleted")
    add_rus("description", app_description)
    add_rus("inserted")
    add_rus("name", f"{app_name} v{app_version}")
    add_rus("origin_sys_id")
    add_rus("parent", display_value="")
    add_rus("release_date")
    add_rus("remote_base_update_set", display_value="")
    add_rus("remote_parent_id")
    add_rus("remote_sys_id", remote_sys_id)
    add_rus("state", "loaded")
    add_rus("summary")
    add_rus("sys_class_name", "sys_remote_update_set")
    add_rus("sys_created_by", "admin")
    add_rus("sys_created_on", "")
    add_rus("sys_id", remote_update_set_id)
    add_rus("sys_mod_count", "0")
    add_rus("sys_updated_by", "admin")
    add_rus("sys_updated_on", "")
    add_rus("update_set", display_value="")
    add_rus("update_source", display_value="")
    add_rus("updated")

    for sys_update_xml, _ in entries:
        unload.append(sys_update_xml)

    # Serialize with hand-inserted CDATA payloads (ElementTree can't emit
    # CDATA natively).
    xml_str = ET.tostring(unload, encoding="unicode")
    for sys_update_xml, payload in entries:
        placeholder_open = "<payload />"
        placeholder_close = "<payload></payload>"
        cdata = f"<payload><![CDATA[{payload}]]></payload>"
        if placeholder_open in xml_str:
            xml_str = xml_str.replace(placeholder_open, cdata, 1)
        else:
            xml_str = xml_str.replace(placeholder_close, cdata, 1)

    out = '<?xml version="1.0" encoding="UTF-8"?>' + xml_str
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)
    print(f"Wrote {out_path} ({len(entries)} records)")


if __name__ == "__main__":
    main()
