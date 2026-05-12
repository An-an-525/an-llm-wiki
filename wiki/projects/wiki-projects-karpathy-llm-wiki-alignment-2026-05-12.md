---
title: "Karpathy LLM Wiki Alignment 2026-05-12"
aliases: ["wiki-projects-karpathy-llm-wiki-alignment-2026-05-12"]
tags: [llm-wiki, migrated]
category: synthesis
type: project
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "40e40aef0fc2"
summary: "Karpathy LLM Wiki Alignment 2026-05-12"
---

# Karpathy LLM Wiki Alignment 2026-05-12

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Karpathy LLM Wiki Alignment 2026-05-12

## Goal

Bring `[local path redacted]` closer to the Karpathy LLM Wiki pattern while preserving existing notes, local conventions, privacy boundaries, and agent startup rules.

## Completed In This Pass

- Added an official source note for the Karpathy gist.
- Added current-status as the active alignment and startup status page.
- Added [[wiki/sources-and-data]] for raw-source, manifest, privacy, and GitHub publication policy.
- Added `manifests/raw_sources.csv` as the first source registry.
- Added `.gitignore` so private raw material and volatile Obsidian state are excluded before GitHub work.
- Added `scripts/wiki_check.py` for lightweight structural validation.
- Connected the new pages from [[wiki/index]], [[index]], and [[README]].

## Not Done Yet

- No Git repository was initialized.
- No GitHub remote was created.
- No raw material was moved, deleted, or published.
- No full vault rebuild was run.
- No broad rewrite of the 10,000+ existing markdown files was attempted.

## Validation

- Command: `python scripts/wiki_check.py [local path redacted]`
- Result: 0 structural errors across 11,147 checked markdown files.
- Existing warnings: 1,120 possible broken wikilinks, mostly from legacy project pages, old action notes, relative links, and examples embedded in older notes.
- Interpretation: the new Karpathy alignment layer is structurally usable; legacy link cleanup remains a separate wiki-lint task.

## Migration Path

1. Confirm whether the target GitHub repository should be private or public.
2. Run `python scripts/wiki_check.py [local path redacted]`.
3. Review `.gitignore` against the actual files that would be staged.
4. Initialize Git only after the privacy boundary is accepted.
5. Promote high-value pages from existing folders into the curated wiki layer incrementally.

## Open Questions

- Should `09 - 本地导入/` remain entirely local, or should a curated subset be compiled into `wiki/sources/` and `wiki/topics/`?
- Should the public-facing repository expose only `wiki/`, `README.md`, `AGENTS.md`, `CLAUDE.md`, and scripts?
- Should private local memory pages receive explicit `visibility/internal` tags before Git is initialized?
