#!/usr/bin/env python3
from __future__ import annotations

import argparse
from collections import Counter
from pathlib import Path

try:
    from raw_warehouse import (
        RAW_WAREHOUSE_PLAN,
        RAW_WAREHOUSE_SUMMARY,
        classify_root,
        ensure_warehouse_root,
        load_local_root_rows,
        load_raw_warehouse_config,
        raw_warehouse_plan_path,
        raw_warehouse_summary_path,
        target_relative_dir,
        write_csv_rows,
        write_json,
    )
except ModuleNotFoundError:
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from raw_warehouse import (
        RAW_WAREHOUSE_PLAN,
        RAW_WAREHOUSE_SUMMARY,
        classify_root,
        ensure_warehouse_root,
        load_local_root_rows,
        load_raw_warehouse_config,
        raw_warehouse_plan_path,
        raw_warehouse_summary_path,
        target_relative_dir,
        write_csv_rows,
        write_json,
    )


def build(vault_root: Path, ensure_root: bool = False) -> int:
    config = load_raw_warehouse_config(vault_root)
    warehouse_root_text = str(config.get("warehouse_root", "")).strip()
    if not warehouse_root_text:
        raise SystemExit("Missing raw warehouse root. Set inbox/private/.../raw-warehouse/config.json or AN_LLM_WIKI_RAW_WAREHOUSE_ROOT.")

    warehouse_root = Path(warehouse_root_text).expanduser()
    subdirs = list(config.get("subdirs") or ["incoming", "mirrors", "indexes", "manifests", "exceptions"])
    if ensure_root:
        ensure_warehouse_root(warehouse_root, subdirs, vault_root.name)

    rows = []
    policies = Counter()
    priorities = Counter()
    for row in load_local_root_rows(vault_root):
        rule = classify_root(row)
        policy = rule["warehouse_policy"]
        target_rel = target_relative_dir(policy, row.get("root_id", ""))
        plan_row = {
            "root_id": row.get("root_id", ""),
            "current_path": row.get("path", ""),
            "files": row.get("files", ""),
            "bytes": row.get("bytes", ""),
            "latest_modified_at": row.get("latest_modified_at", ""),
            "category_counts": row.get("category_counts", ""),
            "warehouse_policy": policy,
            "migration_priority": rule["migration_priority"],
            "target_relative_dir": target_rel,
            "target_state": "index-only" if policy.startswith("index-only") or policy.startswith("skip-") else "planned-mirror",
            "justification": rule["justification"],
        }
        rows.append(plan_row)
        policies[policy] += 1
        priorities[rule["migration_priority"]] += 1

    write_csv_rows(
        raw_warehouse_plan_path(vault_root),
        [
            "root_id",
            "current_path",
            "files",
            "bytes",
            "latest_modified_at",
            "category_counts",
            "warehouse_policy",
            "migration_priority",
            "target_relative_dir",
            "target_state",
            "justification",
        ],
        rows,
    )

    summary = {
        "warehouse_root_configured": bool(warehouse_root_text),
        "warehouse_root_ready": warehouse_root.exists(),
        "warehouse_subdirs": subdirs,
        "roots_planned": len(rows),
        "policy_counts": dict(policies),
        "priority_counts": dict(priorities),
        "plan_csv": RAW_WAREHOUSE_PLAN.as_posix(),
        "summary_json": RAW_WAREHOUSE_SUMMARY.as_posix(),
    }
    write_json(raw_warehouse_summary_path(vault_root), summary)

    print(f"raw_warehouse_roots_planned: {len(rows)}")
    print(f"raw_warehouse_root_ready: {1 if warehouse_root.exists() else 0}")
    print(f"raw_warehouse_plan: {raw_warehouse_plan_path(vault_root)}")
    print(f"raw_warehouse_summary: {raw_warehouse_summary_path(vault_root)}")
    for policy, count in sorted(policies.items()):
        print(f"policy {policy}={count}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a local-only single raw warehouse migration plan.")
    parser.add_argument("root", nargs="?", default=".", help="Obsidian vault root")
    parser.add_argument("--ensure-root", action="store_true", help="Create the configured warehouse root and standard subdirectories.")
    args = parser.parse_args()
    return build(Path(args.root).resolve(), ensure_root=args.ensure_root)


if __name__ == "__main__":
    raise SystemExit(main())
