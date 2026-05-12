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
- `site-data/` - generated public JSON data for the future archive frontend.
- `wiki/sources/` - source notes and provenance records.
- `manifests/` - source and publication inventories.
- `scripts/` - validation and inventory tools.

## Three-Layer Boundary

1. Raw layer: `_raw/` keeps original recovered evidence unchanged.
2. Private compiled layer: `private-wiki/` rewrites local-only material into searchable review pages without publishing it.
3. Public compiled layer: `wiki/` contains only sanitized, source-aware pages that pass privacy and structure gates.
4. Frontend data layer: `site-data/` is generated from public sources only and must be regenerated through `scripts/build_site_data.py`.

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

## Site Data Backend

- Generate frontend data with `python scripts/build_site_data.py .`.
- The generator must run public structure and privacy gates before writing `site-data/`.
- Frontends may read `site-data/*.json`; they must not read `_raw/`, `inbox/private/`, `private-wiki/`, or local-only reports directly.

## Archive Content Quality

- Public-facing content is for beginners, the owner, and future collaborators at the same time.
- Each promoted item should carry concrete evidence, operational clarity, literary expression, psychological insight, sociological context, and restrained philosophical reflection.
- Deep interpretation must be tied to evidence; do not write diagnosis, myth, empty inspiration, or generic self-branding.
- Every frontend item should answer: what it is, why it mattered, what happened, how to repeat the useful part, what can fail, and what remains unfinished.
- Use `skills/archive-content-curator/SKILL.md` and [archive-content-style-and-ingest-workflow.md](docs/archive-content-style-and-ingest-workflow.md) when adding project cards, tool cards, prompt patterns, routes, timeline entries, or public journal records.
- Frontend, backend, privacy, and data import decisions must follow [archive-platform-project-constraints.md](docs/archive-platform-project-constraints.md).

## Historical Rule Boundary

- Recovered controller notes, startup packs, legacy agent rules, and old process choreography are historical references by default.
- Do not treat recovered rule text as current policy unless it is deliberately promoted into this file, `CLAUDE.md`, or another active rule surface.
- Current user instructions and the privacy/credential boundary override obsolete recovered workflows.
