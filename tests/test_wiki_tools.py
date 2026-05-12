from __future__ import annotations

import importlib.util
import contextlib
import io
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


wiki_check = load_module("wiki_check", ROOT / "scripts" / "wiki_check.py")
privacy_scan = load_module("privacy_scan", ROOT / "scripts" / "privacy_scan.py")
build_public_inventory = load_module("build_public_inventory", ROOT / "scripts" / "build_public_inventory.py")
check_private_wiki = load_module("check_private_wiki", ROOT / "scripts" / "check_private_wiki.py")
build_local_source_inventory = load_module("build_local_source_inventory", ROOT / "scripts" / "build_local_source_inventory.py")
build_site_data = load_module("build_site_data", ROOT / "scripts" / "build_site_data.py")


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
            (root / "wiki").mkdir()
            (root / "wiki" / "note.md").write_text("public\n", encoding="utf-8")

            build_public_inventory.main.__globals__["sys"].argv = ["build_public_inventory.py", str(root)]
            with contextlib.redirect_stdout(io.StringIO()):
                self.assertEqual(0, build_public_inventory.main())
            inventory = (root / "manifests" / "public_inventory.csv").read_text(encoding="utf-8")
            self.assertIn("wiki/note.md", inventory)
            self.assertNotIn("inbox/private", inventory)
            self.assertNotIn("_raw", inventory)

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


class LocalSourceInventoryTests(unittest.TestCase):
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


class SiteDataBuilderTests(unittest.TestCase):
    def test_site_data_compiles_public_wiki_only(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            public = root / "wiki" / "topics" / "llm-wiki-moc.md"
            public.parent.mkdir(parents=True)
            public.write_text(
                "---\n"
                "title: LLM Wiki MOC\n"
                "tags: [llm-wiki, moc]\n"
                "category: synthesis\n"
                "type: moc\n"
                "status: active\n"
                "created: 2026-05-12\n"
                "updated: 2026-05-12\n"
                "sources: []\n"
                "summary: A public map.\n"
                "---\n\n"
                "# LLM Wiki MOC\n\n"
                "## Step One\n\n"
                "See [[wiki/sources/source-note]].\n",
                encoding="utf-8",
            )
            private = root / "private-wiki" / "secret.md"
            private.parent.mkdir()
            private.write_text("token=abcd1234abcd1234\n", encoding="utf-8")

            payload = build_site_data.build(root, run_gates=False)
            self.assertEqual(1, payload["counts"]["content"])
            self.assertEqual(1, payload["counts"]["paths"])
            self.assertEqual("LLM Wiki MOC", payload["paths"][0]["title"])
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


if __name__ == "__main__":
    unittest.main()
