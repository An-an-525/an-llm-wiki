---
name: archive-content-curator
description: Curate public-safe archive content and frontend data. Use when adding, rewriting, or promoting personal archive items into wiki pages, site-data records, project cards, tool cards, prompt patterns, routes, timeline entries, or public frontend content.
---

# Archive Content Curator

## Purpose

Turn one source candidate into a high-quality, public-safe archive item that can
be shown in the frontend and understood by beginners. This is the required
skill for future data refill after the frontend and backend contracts are in
place.

## Required Context

Before writing content, read:

1. `docs/archive-content-style-and-ingest-workflow.md`
2. `docs/archive-platform-project-constraints.md`
3. `docs/kimi-frontend-reference.md`
4. `site/README.md`
5. `site/src/types/index.ts`
6. `site/scripts/sync-site-data.mjs`
7. `scripts/build_site_data.py`
8. `site-data/index.json`
9. `AGENTS.md`
10. `CLAUDE.md`

Kimi's latest frontend is now a visual baseline only. Local Codex owns the
frontend, backend contract, Obsidian compilation, validation, and publication
workflow.

## Workflow

### Step 1: Classify The Source

Decide:

- content type: work, path, tool, agent, prompt pattern, journal, event, source;
- value: showcase, starter, candidate, hidden;
- public safety: public-safe, needs-redaction, local-only-source;
- source state: source-backed, archive-derived, needs-source-review.
- target module: `library`, `paths`, `works`, `timeline`, `journal`, `feed`, or
  `content`.

Stop if the source requires private material that cannot be summarized safely.
Do not use secrets, raw chat logs, raw local paths, or unverifiable memories as
public text.

### Step 2: Extract Concrete Evidence

Capture only durable facts:

- what was built or attempted;
- tools used;
- agents or models involved;
- prompts, prompt patterns, or operating rules used;
- actions taken;
- outputs produced;
- problems found;
- decisions made;
- current status.

Do not copy raw chats or raw local notes.

### Step 3: Add Interpretive Layers

Write the deeper layers carefully:

- literary layer: precise language with rhythm and image, never empty ornament;
- psychological layer: motivation, attention, friction, learning pattern;
- sociological layer: platform, school, market, team, community, workflow context;
- philosophical layer: one restrained idea about systems, agency, craft, limits, or time.

Interpretation must be connected to evidence. Do not write diagnosis, myth, or
grand claims.

### Step 4: Write For Beginners

The item must explain:

- what this is;
- why it matters;
- how it works;
- how to repeat the useful part;
- what can go wrong;
- what the next step is.

Prefer short sections, clear headings, and concrete verbs.
Assume the reader is smart but new: explain specialized tools, agent roles,
prompt engineering moves, repository steps, and deployment words in plain
Chinese before using abbreviations.

### Step 5: Build The Frontend Record

Use the backend data contract first. Do not hand-edit generated frontend
adapters. The durable source is public wiki markdown plus `scripts/build_site_data.py`.
The frontend reads the generated `site-data/index.json` through
`site/scripts/sync-site-data.mjs` and `site/src/data/siteData.generated.ts`.

Add optional fields only when they are supported by `site/src/types/index.ts`,
rendered by the current Kimi-derived frontend, or documented in
`docs/archive-content-style-and-ingest-workflow.md`.

Minimum record shape:

- `id`
- `title`
- `slug`
- `summary`
- `tags`
- `status`
- `sources` or `sourceLabels`
- `publicSafety`
- module-specific fields

For project/work records also include:

- `projectStatus`
- `techStack`
- `operationStory`
- `replicationSteps`
- `failureModes`
- `lessons`
- `nextPlan`

For prompt engineering records also include:

- original problem in public-safe form;
- prompt pattern name;
- role/context/input/output structure;
- what changed after using the prompt;
- replication notes and failure cases.

### Step 6: Connect The Archive

Update the relevant public or private index:

- public wiki page if ready for publication;
- private review queue if not ready;
- route/path if the item is replicable;
- timeline if it marks a stage change;
- frontend sample/data only after public safety review.

Do not add filler just to populate an empty module. Empty states are acceptable
until there is a strong public-safe item.

### Step 7: Validate

Run from the vault root:

```powershell
python scripts/wiki_check.py .
python scripts/privacy_scan.py .
python scripts/build_site_data.py .
python scripts/build_public_inventory.py .
python -m unittest discover -s tests
git diff --check
```

Run from `site/` when frontend behavior may change:

```powershell
npm run lint
npm run build
```

## Quality Bar

An item is not ready unless:

- a beginner can understand it;
- the owner can remember the decision or lesson;
- the frontend can render it without guessing;
- the status is honest;
- the interpretation has evidence;
- the replication path has observable steps;
- no unsafe public material is exposed.
- it was added through the source -> public rewrite -> site-data -> frontend QA
  path, not by directly editing a mock file.

## Rejection Rules

Reject or keep local-only when:

- the item is just a raw dump;
- the project status is unclear and would mislead readers;
- it depends on private source text;
- it has no concrete operation or lesson;
- it has only generic inspirational writing;
- it cannot pass validation gates.
