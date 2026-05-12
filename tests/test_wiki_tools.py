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


class LocalOnlyExclusionTests(unittest.TestCase):
    def test_privacy_scan_skips_local_only_dirs(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            private = root / "inbox" / "private" / "note.md"
            private.parent.mkdir(parents=True)
            private.write_text("token=abcd1234abcd1234\n", encoding="utf-8")

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


if __name__ == "__main__":
    unittest.main()
