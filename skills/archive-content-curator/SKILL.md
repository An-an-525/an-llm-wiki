---
name: archive-content-curator
description: Curate public-safe archive content and frontend data. Use when adding, rewriting, or promoting personal archive items into wiki pages, site-data records, project cards, tool cards, prompt patterns, routes, timeline entries, or public frontend content.
---

# Archive Content Curator

## Purpose

Turn one source candidate into a high-quality, public-safe archive item that can
be shown in the frontend and understood by beginners.

## Required Context

Before writing content, read:

1. `docs/archive-content-style-and-ingest-workflow.md`
2. `docs/archive-platform-project-constraints.md`
3. `docs/kimi-frontend-reference.md`
4. `site/README.md`
5. `site/src/lib/types.ts`
6. `AGENTS.md`
7. `CLAUDE.md`

## Workflow

### Step 1: Classify The Source

Decide:

- content type: work, path, tool, agent, prompt pattern, journal, event, source;
- value: showcase, starter, candidate, hidden;
- public safety: public-safe, needs-redaction, local-only-source;
- source state: source-backed, archive-derived, needs-source-review.

Stop if the source requires private material that cannot be summarized safely.

### Step 2: Extract Concrete Evidence

Capture only durable facts:

- what was built or attempted;
- tools used;
- actions taken;
- outputs produced;
- problems found;
- decisions made;
- current status.

Do not copy raw chats or raw local notes.

### Step 3: Add Interpretive Layers

Write the deeper layers carefully:

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

### Step 5: Build The Frontend Record

Use the existing data contract first. Add optional fields only when they are
supported by the frontend or documented in
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
- `lessons`
- `nextPlan`

### Step 6: Connect The Archive

Update the relevant public or private index:

- public wiki page if ready for publication;
- private review queue if not ready;
- route/path if the item is replicable;
- timeline if it marks a stage change;
- frontend sample/data only after public safety review.

### Step 7: Validate

Run from the vault root:

```powershell
python scripts/wiki_check.py .
python scripts/privacy_scan.py .
python scripts/build_site_data.py .
python scripts/build_public_inventory.py .
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

## Rejection Rules

Reject or keep local-only when:

- the item is just a raw dump;
- the project status is unclear and would mislead readers;
- it depends on private source text;
- it has no concrete operation or lesson;
- it has only generic inspirational writing;
- it cannot pass validation gates.
