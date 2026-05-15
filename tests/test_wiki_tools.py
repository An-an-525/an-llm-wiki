from __future__ import annotations

import importlib.util
import contextlib
import csv
import io
import json
import os
import sys
import tempfile
import unittest
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


local_index_cache = load_module("local_index_cache", ROOT / "scripts" / "local_index_cache.py")
wiki_check = load_module("wiki_check", ROOT / "scripts" / "wiki_check.py")
privacy_scan = load_module("privacy_scan", ROOT / "scripts" / "privacy_scan.py")
build_public_inventory = load_module("build_public_inventory", ROOT / "scripts" / "build_public_inventory.py")
check_private_wiki = load_module("check_private_wiki", ROOT / "scripts" / "check_private_wiki.py")
build_local_source_inventory = load_module("build_local_source_inventory", ROOT / "scripts" / "build_local_source_inventory.py")
build_local_archive_inventory = load_module("build_local_archive_inventory", ROOT / "scripts" / "build_local_archive_inventory.py")
build_private_wiki = load_module("build_private_wiki", ROOT / "scripts" / "build_private_wiki.py")
run_private_intake = load_module("run_private_intake", ROOT / "scripts" / "run_private_intake.py")
check_private_pipeline = load_module("check_private_pipeline", ROOT / "scripts" / "check_private_pipeline.py")
build_site_data = load_module("build_site_data", ROOT / "scripts" / "build_site_data.py")
check_public_content_quality = load_module("check_public_content_quality", ROOT / "scripts" / "check_public_content_quality.py")
check_karpathy_alignment = load_module("check_karpathy_alignment", ROOT / "scripts" / "check_karpathy_alignment.py")
raw_warehouse = load_module("raw_warehouse", ROOT / "scripts" / "raw_warehouse.py")
build_raw_warehouse_plan = load_module("build_raw_warehouse_plan", ROOT / "scripts" / "build_raw_warehouse_plan.py")
check_raw_warehouse = load_module("check_raw_warehouse", ROOT / "scripts" / "check_raw_warehouse.py")


@contextlib.contextmanager
def temporary_local_index_cache(path: Path):
    old_value = os.environ.get(local_index_cache.ENV_LOCAL_INDEX_CACHE)
    os.environ[local_index_cache.ENV_LOCAL_INDEX_CACHE] = str(path)
    try:
        yield path
    finally:
        if old_value is None:
            os.environ.pop(local_index_cache.ENV_LOCAL_INDEX_CACHE, None)
        else:
            os.environ[local_index_cache.ENV_LOCAL_INDEX_CACHE] = old_value


class WikiCheckTests(unittest.TestCase):
    def test_strip_code_fences_ignores_example_links(self) -> None:
        text = "before [[Real]]\n```md\n[[Example Only]]\n```\nafter [[Real]]\n"
        stripped = wiki_check.strip_code_fences(text)
        self.assertIn("[[Real]]", stripped)
        self.assertNotIn("[[Example Only]]", stripped)

    def test_alias_and_title_resolve_wikilinks(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            page = root / "wiki" / "concepts" / "target.md"
            page.parent.mkdir(parents=True)
            page.write_text(
                "---\n"
                "title: Canonical Title\n"
                "aliases: [Alias One]\n"
                "tags: [test]\n"
                "category: concept\n"
                "type: concept\n"
                "status: active\n"
                "created: 2026-05-12\n"
                "updated: 2026-05-12\n"
                "sources: []\n"
                "summary: test\n"
                "---\n\n"
                "# Canonical Title\n",
                encoding="utf-8",
            )
            source = root / "wiki" / "index.md"
            source.write_text("---\ntitle: Index\n---\n\n[[Alias One]] [[Canonical Title]]\n", encoding="utf-8")
            files = sorted(wiki_check.iter_markdown(root))
            targets = wiki_check.build_target_index(root, files)
            findings = wiki_check.iter_wikilink_findings(root, files, targets)
            self.assertEqual([], findings)

    def test_unresolved_link_is_reported(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            page = root / "note.md"
            page.write_text("[[Missing Page]]\n", encoding="utf-8")
            files = sorted(wiki_check.iter_markdown(root))
            targets = wiki_check.build_target_index(root, files)
            findings = wiki_check.iter_wikilink_findings(root, files, targets)
            self.assertEqual("Missing Page", findings[0].target)


class PrivacyScanTests(unittest.TestCase):
    def test_detects_secret_assignment_without_storing_secret_literal(self) -> None:
        token = "token" + "=" + "abcd1234abcd1234"
        rows = privacy_scan.scan_text("note.md", token)
        self.assertEqual("secret_assignment", rows[0]["rule"])

    def test_detects_local_path_without_storing_user_path(self) -> None:
        path = "C:" + "\\\\" + "private" + "\\\\" + "file.txt"
        rows = privacy_scan.scan_text("note.md", path)
        self.assertEqual("local_path", rows[0]["rule"])

    def test_allows_policy_marker_files(self) -> None:
        rows = privacy_scan.scan_text("README.md", "Never publish 凭据 or raw private content.")
        self.assertEqual([], rows)

    def test_site_data_allows_boundary_markers_but_not_secret_values(self) -> None:
        marker_rows = privacy_scan.scan_text("site-data/index.json", "private-wiki and 凭据 are excluded by policy.")
        self.assertEqual([], marker_rows)
        secret_rows = privacy_scan.scan_text("site-data/index.json", "token=abcd1234abcd1234")
        self.assertEqual("secret_assignment", secret_rows[0]["rule"])

    def test_scans_frontend_backend_and_env_example_files(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            files = [
                root / "site" / "src" / "components" / "Chat.tsx",
                root / "site" / "server" / "proxy.mjs",
                root / ".env.example",
                root / "site" / ".env.local",
            ]
            for path in files:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text("safe\n", encoding="utf-8")

            scanned = sorted(path.relative_to(root).as_posix() for path in privacy_scan.iter_files(root))

            self.assertIn("site/src/components/Chat.tsx", scanned)
            self.assertIn("site/server/proxy.mjs", scanned)
            self.assertIn(".env.example", scanned)
            self.assertNotIn("site/.env.local", scanned)


class LocalOnlyExclusionTests(unittest.TestCase):
    def test_privacy_scan_skips_local_only_dirs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            private = root / "inbox" / "private" / "note.md"
            private.parent.mkdir(parents=True)
            private.write_text("token=abcd1234abcd1234\n", encoding="utf-8")

            private_wiki = root / "private-wiki" / "note.md"
            private_wiki.parent.mkdir(parents=True)
            private_wiki.write_text("token=abcd1234abcd1234\n", encoding="utf-8")

            serena = root / ".serena" / "memory.md"
            serena.parent.mkdir()
            serena.write_text("token=abcd1234abcd1234\n", encoding="utf-8")

            hot = root / "hot.md"
            hot.write_text("token=abcd1234abcd1234\n", encoding="utf-8")

            raw = root / "_raw" / "note.md"
            raw.parent.mkdir(parents=True)
            raw.write_text("C:\\\\private\\\\file.txt\n", encoding="utf-8")

            generated = root / "site" / "public" / "site-data" / "index.json"
            generated.parent.mkdir(parents=True)
            generated.write_text("token=abcd1234abcd1234\n", encoding="utf-8")

            public = root / "wiki" / "note.md"
            public.parent.mkdir(parents=True)
            public.write_text("safe\n", encoding="utf-8")

            files = sorted(p.relative_to(root).as_posix() for p in privacy_scan.iter_files(root))
            self.assertEqual(["wiki/note.md"], files)

    def test_public_inventory_skips_local_only_dirs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "inbox" / "private").mkdir(parents=True)
            (root / "inbox" / "private" / "note.md").write_text("private\n", encoding="utf-8")
            (root / "_raw").mkdir()
            (root / "_raw" / "note.md").write_text("raw\n", encoding="utf-8")
            (root / "site" / "dist").mkdir(parents=True)
            (root / "site" / "dist" / "index.html").write_text("built\n", encoding="utf-8")
            (root / "site" / "public" / "site-data").mkdir(parents=True)
            (root / "site" / "public" / "site-data" / "index.json").write_text("generated\n", encoding="utf-8")
            (root / "wiki").mkdir()
            (root / "wiki" / "note.md").write_text("public\n", encoding="utf-8")

            build_public_inventory.main.__globals__["sys"].argv = ["build_public_inventory.py", str(root)]
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(0, build_public_inventory.main())
            inventory = (root / "manifests" / "public_inventory.csv").read_text(encoding="utf-8")
            self.assertIn("wiki/note.md", inventory)
            self.assertNotIn("inbox/private", inventory)
            self.assertNotIn("_raw", inventory)
            self.assertNotIn("site/dist", inventory)
            self.assertNotIn("site/public/site-data", inventory)

    def test_public_inventory_skips_private_wiki(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "private-wiki").mkdir()
            (root / "private-wiki" / "index.md").write_text("private\n", encoding="utf-8")
            (root / ".serena").mkdir()
            (root / ".serena" / "memory.md").write_text("private\n", encoding="utf-8")
            (root / "hot.md").write_text("private\n", encoding="utf-8")
            (root / "wiki").mkdir()
            (root / "wiki" / "index.md").write_text("public\n", encoding="utf-8")

            build_public_inventory.main.__globals__["sys"].argv = ["build_public_inventory.py", str(root)]
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(0, build_public_inventory.main())
            inventory = (root / "manifests" / "public_inventory.csv").read_text(encoding="utf-8")
            self.assertIn("wiki/index.md", inventory)
            self.assertNotIn("private-wiki", inventory)
            self.assertNotIn(".serena", inventory)
            self.assertNotIn("hot.md", inventory)


class PrivateWikiCheckTests(unittest.TestCase):
    def test_private_wiki_frontmatter_validation(self) -> None:
        text = (
            "---\n"
            "title: Private Index\n"
            "aliases: [Private Index]\n"
            "tags: [local-recovery, visibility/internal]\n"
            "category: private-wiki\n"
            "type: moc\n"
            "status: active\n"
            "created: 2026-05-12\n"
            "updated: 2026-05-12\n"
            "sources: [pre-karpathy-rebuild-20260512-143127]\n"
            "summary: Private summary.\n"
            "---\n\n"
            "# Private Index\n"
        )
        block = check_private_wiki.frontmatter(text)
        self.assertEqual(set(), check_private_wiki.REQUIRED_KEYS - check_private_wiki.frontmatter_keys(block))
        self.assertTrue(check_private_wiki.has_private_visibility(block))


class PublicContentQualityTests(unittest.TestCase):
    def write_wiki_page(self, root: Path, rel: str, text: str) -> Path:
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")
        return path

    def write_adapter(self, root: Path, payload: dict) -> Path:
        path = root / "site-data" / "adapter.json"
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return path

    def test_featured_page_requires_chinese_summary(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            page = self.write_wiki_page(
                root,
                "wiki/concepts/example.md",
                "---\n"
                "title: Featured Tutorial\n"
                "tags: [curated, featured]\n"
                "category: concept\n"
                "type: tutorial\n"
                "status: featured\n"
                "publish: curated\n"
                "created: 2026-05-13\n"
                "updated: 2026-05-13\n"
                "sources: [source]\n"
                "publicSafety: public-safe\n"
                "sourceLabels: [official-docs]\n"
                "summary: English only summary for a strict page.\n"
                "---\n\n"
                "# Featured Tutorial\n\n"
                "## Who This Is For\n\n"
                "This is for someone learning.\n\n"
                "## Tutorial\n\n"
                "Follow steps and verify the result.\n\n"
                "## Failure\n\n"
                "Risk and boundary are stated.\n\n"
                "## Sources\n\n"
                "Related references.\n",
            )
            _, findings = check_public_content_quality.check_page(root, page)
            errors = [finding.rule for finding in findings if finding.severity == "error"]
            self.assertIn("summary-not-chinese-reader-ready", errors)

    def test_legacy_migration_is_warning_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            page = self.write_wiki_page(
                root,
                "wiki/projects/legacy.md",
                "---\n"
                "title: Legacy\n"
                "tags: [migrated]\n"
                "category: project\n"
                "type: project\n"
                "status: migrated-needs-source-review\n"
                "created: 2026-05-13\n"
                "updated: 2026-05-13\n"
                "summary: legacy\n"
                "---\n\n"
                "# Legacy\n",
            )
            _, findings = check_public_content_quality.check_page(root, page)
            self.assertTrue(findings)
            self.assertTrue(all(finding.severity == "legacy-warning" for finding in findings))

    def test_source_record_is_not_required_to_be_learning_package(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            page = self.write_wiki_page(
                root,
                "wiki/sources/source.md",
                "---\n"
                "title: Official Source\n"
                "tags: [source, curated]\n"
                "category: source\n"
                "type: source\n"
                "status: verified\n"
                "publish: curated\n"
                "created: 2026-05-13\n"
                "updated: 2026-05-13\n"
                "sources: [https://example.com]\n"
                "publicSafety: public-safe\n"
                "sourceLabels: [official-docs]\n"
                "summary: English source note summary is acceptable for a source record.\n"
                "---\n\n"
                "# Official Source\n\n"
                "This is a provenance note.\n",
            )
            _, findings = check_public_content_quality.check_page(root, page)
            rules = [finding.rule for finding in findings]
            self.assertNotIn("missing-beginner-learning-sections", rules)
            self.assertNotIn("summary-not-chinese-reader-ready", rules)

    def test_public_adapter_rejects_internal_reader_labels(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_adapter(
                root,
                {
                    "libraryItems": [
                        {
                            "title": "公开 API 契约",
                            "description": "说明前端和后端怎样稳定对接。",
                            "links": [{"label": "wiki/concepts/public-api-contract", "url": "/content/c_demo"}],
                        }
                    ]
                },
            )

            findings = check_public_content_quality.check_public_adapter(root)
            rules = [finding.rule for finding in findings]
            self.assertIn("internal-path-shape-in-reader-text", rules)

    def test_public_adapter_allows_hidden_routes_in_url_fields(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write_adapter(
                root,
                {
                    "libraryItems": [
                        {
                            "title": "公开 API 契约",
                            "description": "说明前端和后端怎样稳定对接。",
                            "links": [{"label": "公开 API 契约", "url": "/content/c_demo"}],
                        }
                    ]
                },
            )

            findings = check_public_content_quality.check_public_adapter(root)
            self.assertEqual([], findings)


class KarpathyAlignmentTests(unittest.TestCase):
    def write(self, root: Path, rel: str, text: str) -> None:
        path = root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding="utf-8")

    def test_alignment_audit_passes_with_documented_extensions(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write(root, "README.md", "# README\n\n- [[wiki/sources/karpathy-llm-wiki-pattern]]\n")
            self.write(root, "AGENTS.md", "# AGENTS\n")
            self.write(
                root,
                "CLAUDE.md",
                "raw `_raw/` wiki `wiki/` schema `AGENTS.md` `CLAUDE.md` `index.md` `log.md` plus `private-wiki/`.\n",
            )
            self.write(root, "index.md", "# Index\n")
            self.write(root, "log.md", "# Log\n\n## [2026-05-13] update | Audit\n")
            self.write(
                root,
                "wiki/index.md",
                "---\n"
                "title: Wiki Index\n"
                "tags: [llm-wiki]\n"
                "category: synthesis\n"
                "type: moc\n"
                "status: active\n"
                "created: 2026-05-13\n"
                "updated: 2026-05-13\n"
                "sources: [source]\n"
                "summary: index\n"
                "---\n\n"
                "# Wiki Index\n\n- [[wiki/sources/karpathy-llm-wiki-pattern]]\n",
            )
            self.write(
                root,
                "wiki/sources/karpathy-llm-wiki-pattern.md",
                "---\n"
                "title: 卡帕西 LLM Wiki 官方模式\n"
                "tags: [llm-wiki]\n"
                "category: source\n"
                "type: source\n"
                "status: active\n"
                "created: 2026-05-13\n"
                "updated: 2026-05-13\n"
                "sources: [https://example.com]\n"
                "summary: source\n"
                "---\n\n"
                "# Source\n",
            )
            self.write(
                root,
                "wiki/synthesis/karpathy-official-wiki-layer.md",
                "---\n"
                "title: 卡帕西官方 Wiki 层契约\n"
                "tags: [llm-wiki]\n"
                "category: synthesis\n"
                "type: operating-model\n"
                "status: active\n"
                "created: 2026-05-13\n"
                "updated: 2026-05-13\n"
                "sources: [source]\n"
                "summary: layer\n"
                "---\n\n"
                "# Layer\n\n"
                "This compiled artifact keeps `private-wiki/` local and `site-data/` generated.\n",
            )
            self.write(
                root,
                "wiki/concepts/example.md",
                "---\n"
                "title: Example\n"
                "tags: [llm-wiki]\n"
                "category: concept\n"
                "type: concept\n"
                "status: active\n"
                "created: 2026-05-13\n"
                "updated: 2026-05-13\n"
                "sources: [source]\n"
                "summary: example\n"
                "provenance:\n"
                "  extracted: 0.8\n"
                "---\n\n"
                "# Example\n\n"
                "- one claim ^[inferred]\n",
            )

            old_argv = check_karpathy_alignment.main.__globals__["sys"].argv
            check_karpathy_alignment.main.__globals__["sys"].argv = ["check_karpathy_alignment.py", str(root)]
            try:
                buffer = io.StringIO()
                with contextlib.redirect_stdout(buffer):
                    self.assertEqual(0, check_karpathy_alignment.main())
                output = buffer.getvalue()
            finally:
                check_karpathy_alignment.main.__globals__["sys"].argv = old_argv

            self.assertIn("official_alignment_errors: 0", output)
            self.assertIn("official_alignment_warnings: 0", output)

    def test_alignment_audit_reports_missing_official_link(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.write(root, "README.md", "# README\n")
            self.write(root, "AGENTS.md", "# AGENTS\n")
            self.write(root, "CLAUDE.md", "_raw/ wiki/ AGENTS.md CLAUDE.md index.md log.md\n")
            self.write(root, "index.md", "# Index\n")
            self.write(root, "log.md", "# Log\n\n## [2026-05-13] update | Audit\n")
            self.write(root, "wiki/index.md", "# Wiki Index\n\n- [[wiki/sources/karpathy-llm-wiki-pattern]]\n")
            self.write(root, "wiki/sources/karpathy-llm-wiki-pattern.md", "# Source\n")
            self.write(root, "wiki/synthesis/karpathy-official-wiki-layer.md", "# Layer private-wiki/ site-data/ compiled\n")

            old_argv = check_karpathy_alignment.main.__globals__["sys"].argv
            check_karpathy_alignment.main.__globals__["sys"].argv = ["check_karpathy_alignment.py", str(root)]
            try:
                self.assertEqual(1, check_karpathy_alignment.main())
            finally:
                check_karpathy_alignment.main.__globals__["sys"].argv = old_argv

            report = json.loads((root / "manifests" / "karpathy_alignment_report.json").read_text(encoding="utf-8"))
            self.assertGreaterEqual(report["errors"], 1)


class RawWarehouseTests(unittest.TestCase):
    def write_csv(self, path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

    def test_classify_root_separates_live_sensitive_and_project_roots(self) -> None:
        live = raw_warehouse.classify_root({"path": "C:/Users/fkl26/.codex", "files": "10"})
        sensitive = raw_warehouse.classify_root({"path": "C:/Users/fkl26/.ssh", "files": "2"})
        project = raw_warehouse.classify_root({"path": "D:/Projects", "files": "20"})

        self.assertEqual("index-only-live-root", live["warehouse_policy"])
        self.assertEqual("index-only-sensitive-root", sensitive["warehouse_policy"])
        self.assertEqual("mirror-project-root", project["warehouse_policy"])

    def test_build_and_check_raw_warehouse_plan(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            cache_root = root / "cache"
            warehouse_root = root / "warehouse-root"

            with temporary_local_index_cache(cache_root):
                local_dir = local_index_cache.local_index_cache_dir(root)
                self.write_csv(
                    local_dir / "local_roots.csv",
                    ["root_id", "path", "profile", "files", "bytes", "latest_modified_at", "findings", "timeline_rows", "missing_files", "kind_counts", "category_counts"],
                    [
                        {
                            "root_id": "root-project",
                            "path": "D:/Projects",
                            "profile": "default",
                            "files": "12",
                            "bytes": "100",
                            "latest_modified_at": "2026-05-13T00:00:00+00:00",
                            "findings": "0",
                            "timeline_rows": "0",
                            "missing_files": "0",
                            "kind_counts": "{}",
                            "category_counts": "{}",
                        },
                        {
                            "root_id": "root-codex",
                            "path": "C:/Users/fkl26/.codex",
                            "profile": "default",
                            "files": "5",
                            "bytes": "50",
                            "latest_modified_at": "2026-05-13T00:00:00+00:00",
                            "findings": "0",
                            "timeline_rows": "0",
                            "missing_files": "0",
                            "kind_counts": "{}",
                            "category_counts": "{}",
                        },
                    ],
                )

                config_path = root / raw_warehouse.RAW_WAREHOUSE_CONFIG
                config_path.parent.mkdir(parents=True, exist_ok=True)
                config_path.write_text(
                    json.dumps(
                        {
                            "warehouse_root": str(warehouse_root),
                            "subdirs": ["incoming", "mirrors", "indexes"],
                        }
                    ),
                    encoding="utf-8",
                )

                self.assertEqual(0, build_raw_warehouse_plan.build(root, ensure_root=True))

                with (root / raw_warehouse.RAW_WAREHOUSE_PLAN).open("r", encoding="utf-8", newline="") as f:
                    plan_rows = list(csv.DictReader(f))
                self.assertEqual(2, len(plan_rows))
                self.assertEqual("mirror-project-root", plan_rows[0]["warehouse_policy"])
                self.assertEqual("planned-mirror", plan_rows[0]["target_state"])
                self.assertEqual("index-only-live-root", plan_rows[1]["warehouse_policy"])
                self.assertEqual("index-only", plan_rows[1]["target_state"])
                self.assertTrue((warehouse_root / "incoming").exists())
                self.assertTrue((warehouse_root / raw_warehouse.RAW_WAREHOUSE_MARKER).exists())

                old_argv = sys.argv
                sys.argv = ["check_raw_warehouse.py", str(root)]
                try:
                    buffer = io.StringIO()
                    with contextlib.redirect_stdout(buffer):
                        self.assertEqual(0, check_raw_warehouse.main())
                    output = buffer.getvalue()
                finally:
                    sys.argv = old_argv

            self.assertIn("raw_warehouse_errors: 0", output)


class LocalSourceInventoryTests(unittest.TestCase):
    def test_local_index_cache_migrates_legacy_files(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            vault_root = Path(tmp) / "vault"
            cache_root = Path(tmp) / "external-cache"
            legacy = vault_root / local_index_cache.LEGACY_LOCAL_DISCOVERY_DIR
            legacy.mkdir(parents=True)
            (legacy / "local_discovery_summary.json").write_text('{"files": 1}\n', encoding="utf-8")

            with temporary_local_index_cache(cache_root):
                resolved = local_index_cache.local_index_cache_dir(vault_root)

            self.assertEqual(cache_root.resolve(), resolved)
            self.assertEqual('{"files": 1}\n', (cache_root / "local_discovery_summary.json").read_text(encoding="utf-8"))

    def test_ensure_roots_file_preserves_existing_rows_and_adds_discovered_roots(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            vault_root = Path(tmp)
            cache_root = vault_root / "cache"
            existing_root = vault_root / "existing-source"
            new_root = vault_root / "new-source"
            existing_root.mkdir()
            new_root.mkdir()

            with temporary_local_index_cache(cache_root):
                roots_path = build_local_source_inventory.roots_file(vault_root)
                roots_path.parent.mkdir(parents=True, exist_ok=True)
                old_row = {
                    "root_id": "custom-existing",
                    "path": str(existing_root),
                    "profile": "careful",
                    "enabled": "0",
                }
                with roots_path.open("w", encoding="utf-8", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=["root_id", "path", "profile", "enabled"])
                    writer.writeheader()
                    writer.writerow(old_row)

                original_discover_roots = build_local_source_inventory.discover_roots
                build_local_source_inventory.discover_roots = lambda _vault_root: [existing_root, new_root]
                try:
                    build_local_source_inventory.ensure_roots_file(vault_root)
                finally:
                    build_local_source_inventory.discover_roots = original_discover_roots

            with roots_path.open("r", encoding="utf-8", newline="") as f:
                rows = list(csv.DictReader(f))

            self.assertEqual(old_row, rows[0])
            self.assertEqual(2, len(rows))
            self.assertEqual(str(new_root), rows[1]["path"])
            self.assertEqual("default", rows[1]["profile"])
            self.assertEqual("1", rows[1]["enabled"])

    def test_local_sensitive_scan_hashes_excerpt_without_value(self) -> None:
        text = "token=abcd1234abcd1234\n"
        findings, timeline, groups = build_local_source_inventory.scan_text("root", "note.md", text)
        self.assertEqual("secret_assignment", findings[0]["rule"])
        self.assertEqual("credential", findings[0]["group"])
        self.assertNotIn("abcd1234abcd1234", findings[0].values())
        self.assertEqual([], timeline)
        self.assertEqual(1, groups["credential"])

    def test_binary_hash_defaults_to_metadata_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "image.png"
            path.write_bytes(b"not really an image")
            digest, status = build_local_source_inventory.sha256_file(path, path.stat().st_size, "image", [])
            self.assertEqual("", digest)
            self.assertEqual("metadata-only", status)

    def test_local_inventory_marks_modified_and_missing_sources(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            vault_root = Path(tmp) / "vault"
            cache_root = Path(tmp) / "external-cache"
            source_root = Path(tmp) / "source"
            vault_root.mkdir()
            source_root.mkdir()
            note = source_root / "note.md"
            note.write_text("first version\n", encoding="utf-8")

            with temporary_local_index_cache(cache_root):
                roots_path = build_local_source_inventory.roots_file(vault_root)
                roots_path.parent.mkdir(parents=True, exist_ok=True)
                with roots_path.open("w", encoding="utf-8", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=["root_id", "path", "profile", "enabled"])
                    writer.writeheader()
                    writer.writerow({"root_id": "local-root", "path": str(source_root), "profile": "default", "enabled": "1"})

                original_discover_roots = build_local_source_inventory.discover_roots
                build_local_source_inventory.discover_roots = lambda _vault_root: []
                try:
                    self.assertEqual(0, build_local_source_inventory.build(vault_root, reset=True))
                    note.write_text("token=abcd1234abcd1234\n", encoding="utf-8")
                    self.assertEqual(0, build_local_source_inventory.build(vault_root, root_ids=["local-root"]))
                    rows = build_local_source_inventory.read_csv(cache_root / "local_source_inventory.csv")
                    findings = build_local_source_inventory.read_csv(cache_root / "local_sensitive_findings.csv")
                    self.assertEqual("modified", rows[0]["scan_status"])
                    self.assertEqual("secret_assignment", findings[0]["rule"])
                    self.assertIn("first_seen_at", rows[0])
                    self.assertIn("last_seen_at", rows[0])

                    note.unlink()
                    self.assertEqual(0, build_local_source_inventory.build(vault_root, root_ids=["local-root"]))
                    rows = build_local_source_inventory.read_csv(cache_root / "local_source_inventory.csv")
                    self.assertEqual("missing", rows[0]["scan_status"])
                    self.assertIn("source-missing", rows[0]["risk_flags"])
                finally:
                    build_local_source_inventory.discover_roots = original_discover_roots


class PrivateWikiBuilderTests(unittest.TestCase):
    def test_select_local_rows_matches_terms_and_filters_categories(self) -> None:
        rows = [
            {
                "root_id": "agent-root",
                "relative_path": "notes/codex-agent-rules.md",
                "name": "codex-agent-rules.md",
                "category": "agent-context",
                "size_bytes": "40",
                "summary": "Codex agent rule notes.",
            },
            {
                "root_id": "project-root",
                "relative_path": "projects/codex-release.md",
                "name": "codex-release.md",
                "category": "project-roots",
                "size_bytes": "400",
                "summary": "Codex project planning.",
            },
            {
                "root_id": "misc-root",
                "relative_path": "notes/garden.md",
                "name": "garden.md",
                "category": "personal-and-chat-context",
                "size_bytes": "900",
                "summary": "Unrelated local note.",
            },
        ]

        selected = build_private_wiki.select_local_rows(rows, ["codex"], {"agent-context"}, limit=10)

        self.assertEqual(["notes/codex-agent-rules.md"], [row["relative_path"] for row in selected])

    def test_select_recovered_rows_sorts_term_hits_by_score_and_size(self) -> None:
        rows = [
            {
                "relative_path": "archive/small.md",
                "vault_copy_path": "_raw/recovered/small.md",
                "title": "Codex Note",
                "category": "agent-governance-and-skills",
                "size_bytes": "10",
                "summary": "",
            },
            {
                "relative_path": "archive/large.md",
                "vault_copy_path": "_raw/recovered/large.md",
                "title": "Codex Skill Note",
                "category": "agent-governance-and-skills",
                "size_bytes": "100",
                "summary": "Codex skill summary.",
            },
            {
                "relative_path": "archive/project.md",
                "vault_copy_path": "_raw/recovered/project.md",
                "title": "Codex Project",
                "category": "projects-and-action-items",
                "size_bytes": "200",
                "summary": "Codex project summary.",
            },
        ]

        selected = build_private_wiki.select_recovered_rows(
            rows,
            ["codex", "skill"],
            {"agent-governance-and-skills"},
            limit=2,
        )

        self.assertEqual(["archive/large.md", "archive/small.md"], [row["relative_path"] for row in selected])

    def test_secret_tables_use_hashes_and_metadata_not_plaintext_values(self) -> None:
        fake_secret = "FAKE_SECRET_VALUE_DO_NOT_PRINT"
        finding_rows = [
            {
                "root_id": "fake-root",
                "relative_path": "configs/example.env",
                "severity": "high",
                "group": "credential",
                "rule": "secret_assignment",
                "line": "3",
                "excerpt_hash": "hash-only",
                "excerpt": fake_secret,
                "value": fake_secret,
            }
        ]

        local_table = build_private_wiki.local_finding_table(finding_rows)
        aggregate_table = build_private_wiki.table_for_findings(
            build_private_wiki.aggregate_by_file(
                [
                    {
                        **finding_rows[0],
                        "vault_copy_path": "_raw/recovered/configs/example.env",
                        "title": "Example Env",
                    }
                ]
            ),
            current_depth=2,
        )

        self.assertIn("secret_assignment", local_table)
        self.assertIn("hash-only", local_table)
        self.assertIn("hash-only", aggregate_table)
        self.assertNotIn(fake_secret, local_table)
        self.assertNotIn(fake_secret, aggregate_table)

    def test_archive_member_table_redacts_secret_like_member_names(self) -> None:
        token = "sk-" + "a" * 24
        rows = [
            {
                "root_id": "archive-root",
                "archive_relative_path": "downloads/package.zip",
                "member_path": f"configs/{token}.env",
                "kind": "text",
                "size_bytes": "42",
                "risk_flags": "sensitive-name",
            }
        ]

        table = build_private_wiki.archive_member_table(rows)

        self.assertIn("sensitive-name", table)
        self.assertIn("[secret-redacted]", table)
        self.assertNotIn(token, table)

    def test_inventory_for_root_selects_exact_root_only(self) -> None:
        root = {"root_id": "target-root", "path": "D:/source"}
        rows = [
            {"root_id": "target-root", "relative_path": "a.md"},
            {"root_id": "other-root", "relative_path": "b.md"},
        ]

        selected = build_private_wiki.inventory_for_root(rows, root)

        self.assertEqual(["a.md"], [row["relative_path"] for row in selected])


class PrivateIntakePipelineTests(unittest.TestCase):
    def write_csv(self, path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

    def test_disposition_table_preserves_review_status_without_secret_values(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            cache_root = root / "cache"
            with temporary_local_index_cache(cache_root):
                local_dir = local_index_cache.local_index_cache_dir(root)
                finding = {
                    "root_id": "root",
                    "relative_path": "config.env",
                    "severity": "high",
                    "group": "credential",
                    "rule": "secret_assignment",
                    "line": "7",
                    "excerpt_hash": "hash-only",
                }
                key = run_private_intake.finding_key(finding)
                with (local_dir / "local_sensitive_findings.csv").open("w", encoding="utf-8", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=list(finding.keys()))
                    writer.writeheader()
                    writer.writerow(finding)
                with (local_dir / "local_finding_disposition.csv").open("w", encoding="utf-8", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=run_private_intake.DISPOSITION_FIELDS)
                    writer.writeheader()
                    writer.writerow(
                        {
                            **finding,
                            "finding_key": key,
                            "review_status": "reviewed",
                            "disposition": "rotated",
                            "last_reviewed": "2026-05-13",
                            "notes": "handled",
                        }
                    )

                summary = run_private_intake.ensure_disposition_table(root)
                rows = run_private_intake.read_csv(local_dir / "local_finding_disposition.csv")

            self.assertEqual(1, summary["disposition_rows"])
            self.assertEqual("reviewed", rows[0]["review_status"])
            self.assertEqual("rotated", rows[0]["disposition"])
            self.assertNotIn("SECRET", "".join(rows[0].values()))

    def test_pipeline_helpers_report_latest_run_and_automation_status(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            runs = root / "runs.jsonl"
            runs.write_text(
                '{"run_id":"old","status":"failed"}\n{"run_id":"new","status":"success"}\n',
                encoding="utf-8",
            )
            automation = root / "automations" / "llm-wiki-local-source-intake"
            automation.mkdir(parents=True)
            (automation / "automation.toml").write_text('status = "ACTIVE"\n', encoding="utf-8")

            self.assertEqual(("success", "new"), check_private_pipeline.latest_run_status(runs))
            self.assertEqual("active", check_private_pipeline.automation_status(root / "automations", "llm-wiki-local-source-intake"))
            self.assertEqual("missing", check_private_pipeline.automation_status(root / "automations", "missing"))

    def test_archive_inventory_writes_truncation_report(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            cache_root = root / "cache"
            archive_path = root / "archives" / "sample.zip"
            archive_path.parent.mkdir(parents=True, exist_ok=True)
            with zipfile.ZipFile(archive_path, "w") as zf:
                for idx in range(3):
                    zf.writestr(f"folder/file-{idx}.txt", f"payload-{idx}")

            with temporary_local_index_cache(cache_root):
                local_dir = local_index_cache.local_index_cache_dir(root)
                self.write_csv(
                    local_dir / "local_source_inventory.csv",
                    ["root_id", "relative_path", "absolute_path", "kind", "extension"],
                    [
                        {
                            "root_id": "root-a",
                            "relative_path": "archives/sample.zip",
                            "absolute_path": str(archive_path),
                            "kind": "archive",
                            "extension": ".zip",
                        }
                    ],
                )
                original_limit = build_local_archive_inventory.MAX_MEMBERS_PER_ARCHIVE
                build_local_archive_inventory.MAX_MEMBERS_PER_ARCHIVE = 2
                try:
                    self.assertEqual(0, build_local_archive_inventory.build(root))
                finally:
                    build_local_archive_inventory.MAX_MEMBERS_PER_ARCHIVE = original_limit

                with (local_dir / "local_archive_truncations.csv").open("r", encoding="utf-8", newline="") as f:
                    truncations = list(csv.DictReader(f))
                summary = json.loads((local_dir / "local_archive_summary.json").read_text(encoding="utf-8"))

            self.assertEqual(1, len(truncations))
            self.assertEqual("3", truncations[0]["members_total_seen"])
            self.assertEqual("2", truncations[0]["members_indexed"])
            self.assertEqual("max-members-2", truncations[0]["reason"])
            self.assertEqual(1, summary["archive_files_truncated"])
            self.assertEqual(2, summary["archive_members_indexed"])

    def test_archive_triage_matches_documented_exceptions(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            cache_root = root / "cache"
            with temporary_local_index_cache(cache_root):
                local_dir = local_index_cache.local_index_cache_dir(root)
                self.write_csv(
                    local_dir / "local_archive_failures.csv",
                    ["root_id", "archive_relative_path", "error"],
                    [{"root_id": "Root-A", "archive_relative_path": "Folder/Bad.zip", "error": "BadZipFile"}],
                )
                self.write_csv(
                    local_dir / "local_archive_truncations.csv",
                    ["root_id", "archive_relative_path", "members_total_seen", "members_indexed", "reason"],
                    [
                        {
                            "root_id": "Root-B",
                            "archive_relative_path": "Big/Pack.zip",
                            "members_total_seen": "3000",
                            "members_indexed": "2000",
                            "reason": "max-members-2000",
                        }
                    ],
                )

                self.write_csv(
                    root / "manifests" / "private_pipeline_archive_exceptions.csv",
                    ["issue_type", "issue_key_hash", "status", "reason"],
                    [
                        {
                            "issue_type": "failure",
                            "issue_key_hash": check_private_pipeline.archive_issue_hash(
                                "failure",
                                {"root_id": "Root-A", "archive_relative_path": "Folder/Bad.zip", "error": "BadZipFile"},
                            ),
                            "status": "accepted-residual",
                            "reason": "historical bad zip",
                        },
                        {
                            "issue_type": "truncation",
                            "issue_key_hash": check_private_pipeline.archive_issue_hash(
                                "truncation",
                                {
                                    "root_id": "Root-B",
                                    "archive_relative_path": "Big/Pack.zip",
                                    "reason": "max-members-2000",
                                },
                            ),
                            "status": "accepted-residual",
                            "reason": "oversized dependency bundle",
                        },
                    ],
                )

                triage = check_private_pipeline.triage_archive_issues(root, local_dir)

            self.assertEqual(1, len(triage["resolved_failures"]))
            self.assertEqual(1, len(triage["resolved_truncations"]))
            self.assertEqual([], triage["unresolved_failures"])
            self.assertEqual([], triage["unresolved_truncations"])
            self.assertEqual([], triage["unused_exceptions"])

    def test_private_pipeline_main_suppresses_documented_archive_residual_warnings(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            cache_root = root / "cache"
            automation_home = root / "automations"
            for automation_id in check_private_pipeline.REQUIRED_AUTOMATIONS:
                path = automation_home / automation_id
                path.mkdir(parents=True, exist_ok=True)
                (path / "automation.toml").write_text('status = "ACTIVE"\n', encoding="utf-8")

            with temporary_local_index_cache(cache_root):
                local_dir = local_index_cache.local_index_cache_dir(root)
                self.write_csv(local_dir / "roots.csv", ["root_id", "path"], [{"root_id": "root-a", "path": "D:/source"}])
                self.write_csv(local_dir / "local_roots.csv", ["root_id", "path"], [{"root_id": "root-a", "path": "D:/source"}])
                self.write_csv(
                    local_dir / "local_source_inventory.csv",
                    ["root_id", "relative_path", "absolute_path", "kind", "extension"],
                    [{"root_id": "root-a", "relative_path": "note.md", "absolute_path": "D:/source/note.md", "kind": "text", "extension": ".md"}],
                )
                self.write_csv(
                    local_dir / "local_sensitive_findings.csv",
                    ["root_id", "relative_path", "severity", "group", "rule", "line", "excerpt_hash"],
                    [],
                )
                self.write_csv(
                    local_dir / "local_timeline_index.csv",
                    ["root_id", "relative_path", "timestamp", "kind"],
                    [],
                )
                self.write_csv(
                    local_dir / "local_archive_inventory.csv",
                    ["root_id", "archive_relative_path", "member_path", "name", "extension", "kind", "size_bytes", "compressed_size", "modified_at", "risk_flags"],
                    [],
                )
                self.write_csv(
                    local_dir / "local_archive_failures.csv",
                    ["root_id", "archive_relative_path", "error"],
                    [{"root_id": "root-a", "archive_relative_path": "bad.zip", "error": "BadZipFile"}],
                )
                self.write_csv(
                    local_dir / "local_archive_truncations.csv",
                    ["root_id", "archive_relative_path", "members_total_seen", "members_indexed", "reason"],
                    [{"root_id": "root-a", "archive_relative_path": "big.zip", "members_total_seen": "3000", "members_indexed": "2000", "reason": "max-members-2000"}],
                )
                self.write_csv(local_dir / "local_finding_disposition.csv", ["finding_key", "review_status", "disposition", "last_reviewed", "notes"], [])
                (local_dir / "local_discovery_summary.json").write_text(json.dumps({"files": 1, "high_findings": 0}), encoding="utf-8")
                (local_dir / "local_archive_summary.json").write_text(
                    json.dumps({"archive_failures": 1, "archive_files_truncated": 1}),
                    encoding="utf-8",
                )
                (local_dir / "private_intake_runs.jsonl").write_text('{"run_id":"run-1","status":"success"}\n', encoding="utf-8")

                self.write_csv(
                    root / "manifests" / "private_pipeline_archive_exceptions.csv",
                    ["issue_type", "issue_key_hash", "status", "reason"],
                    [
                        {
                            "issue_type": "failure",
                            "issue_key_hash": check_private_pipeline.archive_issue_hash(
                                "failure",
                                {"root_id": "root-a", "archive_relative_path": "bad.zip", "error": "BadZipFile"},
                            ),
                            "status": "accepted-residual",
                            "reason": "fixture archive is intentionally invalid",
                        },
                        {
                            "issue_type": "truncation",
                            "issue_key_hash": check_private_pipeline.archive_issue_hash(
                                "truncation",
                                {"root_id": "root-a", "archive_relative_path": "big.zip", "reason": "max-members-2000"},
                            ),
                            "status": "accepted-residual",
                            "reason": "oversized archive is intentionally capped",
                        },
                    ],
                )

                old_argv = check_private_pipeline.main.__globals__["sys"].argv
                check_private_pipeline.main.__globals__["sys"].argv = [
                    "check_private_pipeline.py",
                    str(root),
                    "--automation-home",
                    str(automation_home),
                ]
                try:
                    buffer = io.StringIO()
                    with contextlib.redirect_stdout(buffer):
                        self.assertEqual(0, check_private_pipeline.main())
                    output = buffer.getvalue()
                finally:
                    check_private_pipeline.main.__globals__["sys"].argv = old_argv

            self.assertIn("private_pipeline_warnings: 0", output)
            self.assertIn("private_pipeline_archive_untriaged_failures: 0", output)
            self.assertIn("private_pipeline_archive_untriaged_truncations: 0", output)


class SiteDataBuilderTests(unittest.TestCase):
    def test_site_data_compiles_public_wiki_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            public = root / "wiki" / "topics" / "llm-wiki-moc.md"
            public.parent.mkdir(parents=True)
            public.write_text(
                "---\n"
                "title: LLM Wiki MOC\n"
                "aliases: [LLM Wiki 架构地图]\n"
                "displayTitle: 公开知识库架构路线图与维护入口\n"
                "tags: [llm-wiki, moc]\n"
                "category: synthesis\n"
                "type: moc\n"
                "status: active\n"
                "created: 2026-05-12\n"
                "updated: 2026-05-12\n"
                "sources: [public-note]\n"
                "summary: 这是一张公开知识库架构路线图，说明资料如何从私有来源整理成安全的中文页面。\n"
                "---\n\n"
                "# LLM Wiki 架构地图\n\n"
                "## 概览\n\n"
                "这页说明公开知识库如何把原始资料、私有整理层和公开展示层分开，让读者先理解整体结构，再沿着来源说明继续学习。\n\n"
                "## 第一步\n\n"
                "先阅读来源说明，再判断哪些内容适合公开展示，哪些内容只能留在本地私有复核。See [[wiki/sources/source-note]].\n",
                encoding="utf-8",
            )
            private = root / "private-wiki" / "secret.md"
            private.parent.mkdir()
            private.write_text("token=abcd1234abcd1234\n", encoding="utf-8")

            payload = build_site_data.build(root, run_gates=False)
            self.assertEqual(1, payload["counts"]["content"])
            self.assertEqual(1, payload["counts"]["paths"])
            self.assertEqual("公开知识库架构路线图与维护入口", payload["paths"][0]["title"])
            self.assertEqual("概览", payload["paths"][0]["toc"][1]["title"])
            self.assertGreaterEqual(payload["paths"][0]["readingMinutes"], 1)
            self.assertIn("facets", payload)
            self.assertIn("homepage", payload)
            self.assertIn("curation", payload)
            self.assertEqual(0, payload["counts"]["reviewQueue"])
            self.assertTrue(all("private-wiki" not in item["sourcePath"] for item in payload["content"]))

    def test_site_data_frontmatter_lists_and_links(self) -> None:
        text = (
            "---\n"
            "title: Example\n"
            "tags:\n"
            "  - alpha\n"
            "  - beta\n"
            "sources: [source-a]\n"
            "---\n\n"
            "# Example\n\n"
            "A paragraph with [[Target|Label]].\n"
        )
        frontmatter, body = build_site_data.parse_frontmatter(text)
        self.assertEqual(["alpha", "beta"], frontmatter["tags"])
        self.assertEqual(["source-a"], frontmatter["sources"])
        self.assertEqual([{"target": "Target", "label": "Label"}], build_site_data.extract_links(body))

    def test_site_data_preserves_public_content_depth_fields(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            project = root / "wiki" / "projects" / "archive-platform.md"
            project.parent.mkdir(parents=True)
            project.write_text(
                "---\n"
                "title: Archive Platform\n"
                "aliases: [资料库平台]\n"
                "displayTitle: 个人资料库公开展示平台案例\n"
                "tags: [archive, agent, beginner-friendly]\n"
                "category: project\n"
                "type: project\n"
                "status: verified\n"
                "publish: curated\n"
                "created: 2026-05-12\n"
                "updated: 2026-05-12\n"
                "sources: [public-note]\n"
                "summary: 资料库平台把分散工作整理成可以学习和展示的公开系统。\n"
                "sourceLabels: [public wiki, source-backed]\n"
                "publicSafety: public-safe\n"
                "whyItMattered: 资料库平台把分散的资料和工作经历整理成可以学习和展示的公开系统。\n"
                "operationStory:\n"
                "  - 先建立原始层、私有层复核和公开层展示的边界，避免把本地材料直接暴露给读者。\n"
                "  - 再生成结构化前端数据，让页面只读取公开安全内容。\n"
                "replicationSteps:\n"
                "  - 明确目标读者、公开边界和最小交付物，再整理来源与验收方式。\n"
                "  - 建立公开数据契约，让前端只消费脱敏后的内容。\n"
                "failureModes:\n"
                "  - 缺少来源和验收时直接发布页面，会让读者无法复刻也无法判断可信度。\n"
                "lessons:\n"
                "  - 把经历变成方法，公开资料才会从个人记录变成可复用学习材料。\n"
                "anReminders:\n"
                "  - 每次新增资料都先经过私有复核，再决定是否进入公开展示层。\n"
                "---\n\n"
                "# 资料库平台\n\n"
                "## 项目概览\n\n"
                "这页用公开安全的方式解释资料库平台：它把分散的本地工作、项目证据、学习资料和展示数据整理成可阅读、可复刻、可验收的系统。读者可以从这里理解资料收集、私有复核、公开改写和前端展示之间的边界。\n",
                encoding="utf-8",
            )

            payload = build_site_data.build(root, run_gates=False)
            self.assertEqual(1, payload["counts"]["content"])
            item = payload["content"][0]
            self.assertEqual("public-safe", item["publicSafety"])
            self.assertEqual(["public wiki", "source-backed"], item["sourceLabels"])
            self.assertIn("资料库平台", item["whyItMattered"])
            self.assertIn("私有层复核", item["operationStory"][0])
            self.assertIn("目标读者", item["replicationSteps"][0])
            self.assertIn("来源和验收", item["failureModes"][0])
            self.assertIn("经历变成方法", item["lessons"][0])

    def test_site_data_hides_migrated_archive_only_pages_by_default(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            curated = root / "wiki" / "sources" / "karpathy-llm-wiki-pattern.md"
            curated.parent.mkdir(parents=True)
            curated.write_text(
                "---\n"
                "title: Karpathy LLM Wiki Pattern\n"
                "aliases: [Karpathy LLM Wiki 模式]\n"
                "displayTitle: 卡帕西知识库编译模式说明\n"
                "tags: [llm-wiki, source]\n"
                "category: source\n"
                "type: source\n"
                "status: verified\n"
                "publish: curated\n"
                "created: 2026-05-12\n"
                "updated: 2026-05-12\n"
                "sources: [https://example.com/source]\n"
                "publicSafety: public-safe\n"
                "summary: 这是一份公开来源笔记，用来说明卡帕西知识库编译模式的架构依据和安全边界。\n"
                "---\n\n"
                "# Karpathy LLM Wiki 模式\n\n"
                "这是一页经过整理的公开来源笔记，用来说明 Karpathy 风格知识库为什么要区分原始资料、编译后的 wiki 页面和约束 agent 行为的 schema。读者可以先理解这个架构，再看本地资料库如何安全改写成公开内容。\n",
                encoding="utf-8",
            )
            migrated = root / "wiki" / "concepts" / "07-技能库-原子技能-demo.md"
            migrated.parent.mkdir(parents=True)
            migrated.write_text(
                "---\n"
                "title: demo 技能\n"
                "tags: [llm-wiki, migrated]\n"
                "category: concept\n"
                "type: article\n"
                "status: migrated-needs-source-review\n"
                "created: 2026-05-12\n"
                "updated: 2026-05-12\n"
                "sources: [\"[[wiki/sources/pre-rebuild-vault-archive]]\"]\n"
                "summary: Mechanical migrated fragment.\n"
                "---\n\n"
                "# demo 技能\n\n"
                "This is a migrated archive-only fragment that should not appear in the public frontend payload.\n",
                encoding="utf-8",
            )

            payload = build_site_data.build(root, run_gates=False)
            self.assertEqual(1, payload["counts"]["content"])
            self.assertEqual(2, payload["counts"]["publicMarkdown"])
            self.assertEqual(1, payload["counts"]["reviewQueue"])
            self.assertEqual(["卡帕西知识库编译模式说明"], [item["title"] for item in payload["content"]])

            review = (root / "manifests" / "site_data_quality_review.csv").read_text(encoding="utf-8")
            self.assertIn("wiki/concepts/07-技能库-原子技能-demo.md", review)
            self.assertIn("display_tier", review)
            self.assertIn("frontend_eligible", review)
            self.assertIn("status:migrated-needs-source-review", review)

    def test_site_data_uses_chinese_alias_and_body_summary_for_frontend_display(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            page = root / "wiki" / "concepts" / "public-api-contract.md"
            page.parent.mkdir(parents=True)
            page.write_text(
                "---\n"
                "title: Public API Contract\n"
                "aliases: [公开 API 契约]\n"
                "displayTitle: 公开接口数据契约与安全边界说明\n"
                "tags: [api, curated]\n"
                "category: concept\n"
                "type: concept\n"
                "status: verified\n"
                "publish: curated\n"
                "created: 2026-05-12\n"
                "updated: 2026-05-12\n"
                "sources: [public-note]\n"
                "publicSafety: public-safe\n"
                "summary: English-only source summary.\n"
                "---\n\n"
                "# Public API Contract\n\n"
                "只读公开接口说明前端可以读取哪些字段，也说明哪些私有材料永远不能进入公开数据。它把公开页面、站点数据、搜索索引和展示组件之间的关系写清楚，让后端黑曜石资料库可以安全服务前端，而不会暴露本地路径、密钥、会话或私人聊天内容。\n",
                encoding="utf-8",
            )

            payload = build_site_data.build(root, run_gates=False)

            self.assertEqual(1, payload["counts"]["content"])
            item = payload["content"][0]
            self.assertEqual("公开接口数据契约与安全边界说明", item["title"])
            self.assertEqual("Public API Contract", item["sourceTitle"])
            self.assertIn("只读公开接口", item["summary"])
            self.assertEqual("English-only source summary.", item["sourceSummary"])
            review = (root / "manifests" / "site_data_quality_review.csv").read_text(encoding="utf-8")
            self.assertIn("display_title", review)
            self.assertIn("frontend_eligible", review)
            self.assertIn("yes", review)

    def test_site_data_extracts_concrete_path_steps(self) -> None:
        body = (
            "# 路线\n\n"
            "## 阶段一：选一个小问题\n\n"
            "先写清楚谁在用、卡在哪里、完成后看到什么。\n\n"
            "交付物：一张问题卡。\n\n"
            "检查点：陌生人能复述这个问题。\n\n"
            "## 阶段二：做一个页面\n\n"
            "只做首页、卡片和详情页，不做复杂账号系统。\n\n"
            "验收：页面能打开，读者知道下一步。\n"
        )

        steps = build_site_data.extract_steps(body)

        self.assertEqual("阶段一：选一个小问题", steps[0]["title"])
        self.assertIn("谁在用", steps[0]["description"])
        self.assertEqual("陌生人能复述这个问题。", steps[0]["completion"])
        self.assertEqual("页面能打开，读者知道下一步。", steps[1]["completion"])


if __name__ == "__main__":
    unittest.main()
