# LLM Wiki Schema

You are maintaining a public-safe Obsidian LLM Wiki.

## Architecture

```text
_raw/          -> local raw sources, excluded from Git
inbox/         -> local staging
wiki/          -> public compiled wiki pages
manifests/     -> source and publication registries
scripts/       -> validation helpers
AGENTS.md      -> agent operating rules
CLAUDE.md      -> this schema
```

## Operations

### Ingest

Read a source, create/update a source note, distill durable facts into the smallest relevant wiki page, add wikilinks, update indexes, and append to the log.

### Query

Start at `index.md` or `wiki/index.md`, follow wikilinks, answer with source-aware references, and preserve valuable answers as pages when appropriate.

### Lint

Check required files, frontmatter, source coverage, broken wikilinks, privacy leaks, stale pages, and index consistency.

## Page Format

```yaml
---
title: Page Title
aliases: []
tags: [llm-wiki]
category: concept
type: concept
status: active
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: []
summary: "Short retrieval summary."
---
```

## Categories

- `concept` - concepts, methods, patterns, tools
- `entity` - people, organizations, named agents
- `event` - dated events
- `source` - provenance records
- `synthesis` - comparisons, indexes, maps of content
