---
title: An LLM Wiki
aliases: [an-llm-wiki, Karpathy-style LLM Wiki]
tags: [llm-wiki, obsidian, public]
category: synthesis
type: moc
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
summary: "A public, privacy-filtered Obsidian LLM Wiki rebuilt around Karpathy's llm-wiki pattern."
---

# An LLM Wiki

This is a public-safe personal Obsidian knowledge base rebuilt around Andrej Karpathy's LLM Wiki pattern.

## Start Here

- [[wiki/index]] - curated wiki workbench
- [[wiki/topics/llm-wiki-moc]] - architecture and operation map
- [[wiki/topics/publication-maintenance-moc]] - publication and validation map
- [[wiki/sources/karpathy-llm-wiki-pattern]] - official architecture source
- [[wiki/sources/github-reference-projects]] - secondary implementation references
- [Kimi frontend reference](docs/kimi-frontend-reference.md) - public-safe product brief, data model, prompt patterns, and frontend acceptance criteria
- [Archive platform project constraints](docs/archive-platform-project-constraints.md) - frontend, backend, privacy, data, and agent operating constraints
- [Archive content style and ingest workflow](docs/archive-content-style-and-ingest-workflow.md) - content depth, writing standard, formal data workflow, and validation gates
- [[AGENTS]] - agent maintenance rules
- [[CLAUDE]] - wiki schema
- [[log]] - append-only rebuild and maintenance log

## Operating Model

Raw material stays local. Public pages are compiled, linked, and source-aware Markdown notes. Sensitive local paths, credentials, private memory, raw conversations, and unreviewed imports are excluded from the public repository.

## Current Rebuild

- Archive ID: `pre-karpathy-rebuild-20260512-143127`
- Migrated public-safe notes: 192
- Reviewed source files: 11147
