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

- `_raw/` - local-only immutable raw evidence, excluded from Git.
- `inbox/` - local staging area.
- `inbox/private/` - local-only recovery manifests, review queues, and private staging.
- `private-wiki/` - local-only compiled wiki for private context, credentials triage, personal information triage, local path maps, and timeline synthesis.
- `wiki/` - public curated compiled pages.
- `wiki/sources/` - source notes and provenance records.
- `manifests/` - source and publication inventories.
- `scripts/` - validation and inventory tools.

## Three-Layer Boundary

1. Raw layer: `_raw/` keeps original recovered evidence unchanged.
2. Private compiled layer: `private-wiki/` rewrites local-only material into searchable review pages without publishing it.
3. Public compiled layer: `wiki/` contains only sanitized, source-aware pages that pass privacy and structure gates.

## Ingest Rules

1. Identify the source first.
2. Create or update a source note when a claim should remain traceable.
3. Write compact Markdown pages with frontmatter and wikilinks.
4. Record contradictions instead of overwriting them.
5. Update [[wiki/index]], [[index]], and [[log]].

## Publication Boundary

Never publish credentials, raw private conversations, local environment maps, personal memory dumps, browser/session data, or true local filesystem paths. If uncertain, keep it in `private-wiki/` or `inbox/private/` and record the decision in [publication_review.csv](manifests/publication_review.csv).

## Private Wiki Rules

- `private-wiki/` is compiled knowledge, not raw dump storage.
- Security pages must show only path, rule, line, count, status, and excerpt hash; never secret values.
- Personal and timeline pages must keep `visibility/internal` or `visibility/private` tags.
- Promotion from `private-wiki/` to `wiki/` requires redaction, source-aware rewriting, `python scripts/privacy_scan.py .`, and `python scripts/wiki_check.py .`.
