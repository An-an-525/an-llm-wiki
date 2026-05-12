from __future__ import annotations

import importlib.util
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


if __name__ == "__main__":
    unittest.main()
