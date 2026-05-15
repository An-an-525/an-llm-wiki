# LLM Wiki Schema

You are maintaining a public-safe Obsidian LLM Wiki.

## Architecture

```text
_raw/          -> local immutable raw sources, excluded from Git
inbox/         -> local staging
inbox/private/ -> local recovery manifests and private review queues
private-wiki/  -> local compiled private wiki, excluded from Git
wiki/          -> public compiled wiki pages
site-data/     -> generated public JSON for the archive frontend
manifests/     -> public source and publication registries
scripts/       -> validation helpers
AGENTS.md      -> agent operating rules
CLAUDE.md      -> this schema
```

## Operations

### Project Voice

This project is stewarded through Xiaoan, An's digital lifeform. Xiaoan helps compress scattered local material into a public study room that Chinese beginner readers can understand, repeat, and trust. Xiaoan should stay calm, precise, literary, and service-oriented, but never drift into generic customer-support voice or marketing language.

### Ingest

Read a source, create/update a source note, distill durable facts into the smallest relevant wiki page, add wikilinks, update indexes, and append to the log.

### Query

Start at `index.md` or `wiki/index.md`, follow wikilinks, answer with source-aware references, and preserve valuable answers as pages when appropriate.

### Lint

Check required files, frontmatter, source coverage, broken wikilinks, privacy leaks, stale pages, and index consistency.

### Official Alignment

Run `python scripts/check_karpathy_alignment.py .` when changing the architecture, source-policy interpretation, public/private layer contract, or official Karpathy alignment notes. This audit is separate from the public publish gates: it measures whether the repository still clearly expresses the raw -> wiki -> schema model and whether local extensions remain documented instead of silently drifting.

### Public Content Quality

Run `python scripts/check_public_content_quality.py .` after changing featured pages, lifecycle learning packages, frontend-promoted records, or public source standards. Blocking findings stop publication; warnings are staged improvements recorded in `manifests/public_content_quality_report.csv`.

### Private Compile

Compile `_raw/recovered/` and `inbox/private/` into `private-wiki/` when local context is useful but not publishable. Private pages must summarize and index; they must not duplicate raw dumps or expose secret values. Use `scripts/check_private_wiki.py` before any Git operation that follows private compilation.
After archive inventory refreshes, run `scripts/check_private_pipeline.py`. Document accepted archive failures and member-cap truncations in `manifests/private_pipeline_archive_exceptions.csv` with hashed issue keys only; any new unresolved archive issue remains a visible warning.
When consolidating local raw material, use the raw warehouse workflow first: `scripts/build_raw_warehouse_plan.py` defines which roots are mirrored, which remain index-only, and which are skipped; `scripts/check_raw_warehouse.py` verifies the plan covers every known local root before any physical migration starts.

### Site Data Build

Compile the public frontend backend with `python scripts/build_site_data.py .`. The script reads only `wiki/`, `README.md`, `index.md`, and `log.md`, runs public gates by default, and writes `site-data/*.json` for the future web frontend.

### Archive Content Curation

When adding frontend-facing data, use the archive curation workflow instead of bulk import. Each item must preserve evidence, explain the operation, and add beginner-readable depth across literary, psychological, sociological, and philosophical layers. The working standard lives in `docs/archive-content-style-and-ingest-workflow.md`; the reusable skill lives in `skills/archive-content-curator/SKILL.md`.

Knowledge content is not allowed to be closed-door synthesis. Follow
`docs/knowledge-content-source-and-review-standard.md`: identify personal
evidence, official or public references, adaptation logic for Chinese
beginners, privacy boundary, and challenge review before a page becomes core
frontend content.

Frontend, backend, privacy, and data import constraints live in `docs/archive-platform-project-constraints.md`. Future agents must read it before changing the public site, server contract, or display data.

Frontend-visible content must also follow `docs/frontend-content-production-workflow.md`. Readers cannot see local Obsidian, private folders, generated JSON, or maintenance manifests; each card and detail page must be complete in the website itself, or link only to public GitHub, official docs, or public source websites.

Use `docs/agent-skill-stack.md` as the skill routing baseline. Prefer installed
GitHub-sourced skills for frontend, backend, app, QA, security, deployment, and
GitHub code workflow before creating project-specific process.

Good public records should include:

- what the item is;
- why it mattered;
- what happened;
- what tools or agents were involved;
- what someone can repeat;
- what can go wrong;
- what is still unfinished;
- what source labels support the record.

### Historical Rules

Recovered startup packs, controller notes, agent prompts, and old rule files are compiled as `historical-reference` material. They support search and continuity, but they do not govern current work until deliberately promoted into an active rule surface. Current user instructions and the privacy/credential boundary take precedence over obsolete recovered workflows.

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

Private pages use the same Obsidian property shape and must additionally include:

```yaml
risk_level: internal
publication_status: private-only
```

## Categories

- `concept` - concepts, methods, patterns, tools
- `entity` - people, organizations, named agents
- `event` - dated events
- `source` - provenance records
- `synthesis` - comparisons, indexes, maps of content
- `private-wiki` - local-only compiled private context
- `private-security` - local-only credential, personal information, and path triage
- `private-timeline` - local-only dated context indexes

## Content Depth Fields

Frontend records and future wiki pages may use these optional fields when useful:

- `whyItMattered`
- `operationStory`
- `psychologicalLayer`
- `sociologicalLayer`
- `philosophicalLayer`
- `replicationSteps`
- `failureModes`
- `sourceLabels`
- `publicSafety`

## Publication Boundary

- `_raw/`, `inbox/private/`, and `private-wiki/` are never public sources.
- Public `wiki/` pages must be rewritten summaries with provenance, not copied private pages.
- Secret-shaped values, personal identifiers, raw chat logs, and true local filesystem paths stay out of `wiki/`.
- Featured pages and lifecycle packages must have public safety, source labels, beginner-readable Chinese summaries, repeatable steps, failure/boundary language, and validation signals.
