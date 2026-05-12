# AGENTS - An LLM Wiki Operating Rules

> Scope: this public-safe Obsidian vault.

## Mission

- Maintain this vault as a Karpathy-style LLM Wiki, not a raw dump.
- Treat Karpathy's `llm-wiki.md` gist as the source of truth for the architecture.
- Use GitHub implementations only as secondary engineering references.
- Preserve provenance, wikilinks, frontmatter, and append-only logs.

## Startup Checklist

1. Read [[README]], [[CLAUDE]], [[wiki/index]], and [[log]].
2. Read [[wiki/sources-and-data-policy]] before ingesting or publishing.
3. Scan target pages before editing.
4. Run `python scripts/wiki_check.py .` and `python scripts/privacy_scan.py .` before Git operations.

## Directory Roles

- `_raw/` - local-only raw evidence, excluded from Git.
- `inbox/` - local staging area.
- `wiki/` - public curated pages.
- `wiki/sources/` - source notes and provenance records.
- `manifests/` - source and publication inventories.
- `scripts/` - validation and inventory tools.

## Ingest Rules

1. Identify the source first.
2. Create or update a source note when a claim should remain traceable.
3. Write compact Markdown pages with frontmatter and wikilinks.
4. Record contradictions instead of overwriting them.
5. Update [[wiki/index]], [[index]], and [[log]].

## Publication Boundary

Never publish credentials, raw private conversations, local environment maps, personal memory dumps, browser/session data, or true local filesystem paths. If uncertain, exclude and record the decision in [[manifests/publication_review.csv]].
