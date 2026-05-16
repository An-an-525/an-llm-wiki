#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

try:
    from raw_warehouse import (
        RAW_WAREHOUSE_CONFIG,
        load_local_root_rows,
        load_raw_warehouse_config,
        raw_warehouse_plan_path,
        raw_warehouse_summary_path,
        read_csv_rows,
    )
except ModuleNotFoundError:
    import sys

    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from raw_warehouse import (
        RAW_WAREHOUSE_CONFIG,
        load_local_root_rows,
        load_raw_warehouse_config,
        raw_warehouse_plan_path,
        raw_warehouse_summary_path,
        read_csv_rows,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Check the single raw warehouse configuration and migration plan.")
    parser.add_argument("root", nargs="?", default=".", help="Obsidian vault root")
    args = parser.parse_args()

    vault_root = Path(args.root).resolve()
    errors: list[str] = []
    warnings: list[str] = []

    config = load_raw_warehouse_config(vault_root)
    if not config:
        errors.append(f"missing config: {RAW_WAREHOUSE_CONFIG.as_posix()}")
    warehouse_root = Path(str(config.get("warehouse_root", "")).strip()).expanduser() if config else Path()
    if not warehouse_root:
        errors.append("warehouse root is not configured")
    elif not warehouse_root.exists():
        errors.append("configured warehouse root does not exist")

    plan_path = raw_warehouse_plan_path(vault_root)
    summary_path = raw_warehouse_summary_path(vault_root)
    if not plan_path.exists():
        errors.append("raw warehouse plan is missing")
    if not summary_path.exists():
        errors.append("raw warehouse summary is missing")

    root_rows = load_local_root_rows(vault_root)
    plan_rows = read_csv_rows(plan_path) if plan_path.exists() else []
    root_ids = {row.get("root_id", "") for row in root_rows}
    planned_ids = {row.get("root_id", "") for row in plan_rows}

    missing = sorted(root_ids - planned_ids)
    if missing:
        errors.append(f"unplanned roots remain: {len(missing)}")

    for row in plan_rows:
        policy = row.get("warehouse_policy", "")
        target = row.get("target_relative_dir", "")
        if policy.startswith("mirror-") or policy.startswith("dedupe-"):
            if not target:
                errors.append(f"missing target dir for mirror policy: {row.get('root_id', '')}")
        if policy.startswith("index-only") and target:
            warnings.append(f"index-only root has target dir recorded: {row.get('root_id', '')}")
        if not row.get("justification", "").strip():
            errors.append(f"missing justification: {row.get('root_id', '')}")

    print(f"raw_warehouse_configured: {1 if config else 0}")
    print(f"raw_warehouse_plan_rows: {len(plan_rows)}")
    print(f"raw_warehouse_known_roots: {len(root_rows)}")
    print(f"raw_warehouse_errors: {len(errors)}")
    print(f"raw_warehouse_warnings: {len(warnings)}")
    for error in errors:
        print(f"ERROR {error}")
    for warning in warnings[:80]:
        print(f"WARNING {warning}")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
