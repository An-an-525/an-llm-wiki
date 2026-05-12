---
title: "Karpathy LLM Wiki Pattern"
aliases: ["wiki-sources-karpathy-llm-wiki-pattern"]
tags: [llm-wiki, migrated]
category: source
type: source
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "46d75c08efec"
summary: "Karpathy LLM Wiki Pattern"
---

# Karpathy LLM Wiki Pattern

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Karpathy LLM Wiki Pattern

## Source

- Official gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Created: 2026-04-04
- Author: Andrej Karpathy
- Source type: GitHub Gist / idea file

## Local Interpretation

Karpathy's document is a pattern, not a fixed repository template. The durable core for this vault is:

- raw material is separate from compiled wiki pages
- the LLM maintains a persistent markdown artifact instead of re-deriving from raw sources on every query
- Obsidian is the browsing and graph surface
- rules/schema files tell future agents how to maintain consistency
- Git is useful for version history once privacy exclusions are in place

## Practical Reference

- Ar9av/obsidian-wiki: https://github.com/Ar9av/obsidian-wiki

This repository is not Karpathy's official source. It is useful as a current implementation reference because it packages the same pattern as agent-readable skills, scripts, and setup docs.

## Local Decisions

- Keep the existing Chinese/English hybrid vault structure.
- Use `wiki/` as the curated LLM Wiki workbench.
- Keep existing canonical folders such as `04 - 知识库/` and cross-link them instead of moving them in bulk.
- Add `manifests/` for source tracking.
- Add `.gitignore` before any GitHub publication.
- Treat `09 - 本地导入/` as an uncurated source-heavy area until pages are promoted intentionally.

## Related Pages

- current-status
- [[wiki/sources-and-data]]
- karpathy-llm-wiki-alignment-2026-05-12
