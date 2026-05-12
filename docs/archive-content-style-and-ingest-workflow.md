# Archive Content Style And Ingest Workflow

This is the project constraint for adding future frontend/backend archive data.
It defines the writing standard, data workflow, and skill-driven acceptance
process for the public personal archive.

Use it together with `docs/archive-platform-project-constraints.md`, which
defines the frontend, backend, privacy, and agent boundaries for the whole
archive platform.

## 1. Core Standard

Every public-facing item should combine six layers:

1. **Concrete evidence** - what actually happened, what was built, what was used.
2. **Operational clarity** - what steps were taken and how someone can repeat them.
3. **Literary expression** - readable, precise, memorable language without empty decoration.
4. **Psychological insight** - what motivation, friction, fear, attention, or learning pattern appears.
5. **Sociological context** - how tools, platforms, schools, communities, markets, and collaboration shaped the work.
6. **Philosophical restraint** - what the case says about agency, learning, systems, failure, time, and craft.

The goal is not to sound grand. The goal is to make a beginner understand why
the work mattered, how it was done, what it reveals, and how to copy the useful
part without copying the chaos.

## 2. Reader Model

Write for four readers at once:

- **A beginner** who has never used these tools and needs plain explanations.
- **The owner later** who needs to remember why a decision was made.
- **A frontend builder** who needs structured fields and display hierarchy.
- **A collaborator** who wants to replicate one path without accessing local material.

If the writing only impresses experts, it fails. If it only simplifies and loses
the deeper pattern, it also fails.

## 3. Voice Rules

Use this tone:

- clear enough for a beginner;
- reflective enough to show growth and tradeoffs;
- concrete enough to support replication;
- calm enough not to oversell unfinished work;
- textured enough to carry literary, psychological, sociological, and philosophical depth.

Avoid:

- fake completion;
- generic self-branding;
- empty inspirational prose;
- raw imported notes;
- long AI-generated paragraphs with no evidence;
- philosophical claims that are not tied to a concrete event;
- psychological claims stated as diagnosis instead of interpretation.

Good sentence shape:

> This project began as a tool problem but became a memory problem: the hard
> part was not collecting more material, but deciding what deserved to become
> public knowledge.

Bad sentence shape:

> This is a revolutionary archive that changes everything and fully transforms
> productivity.

## 4. Page Anatomy

Every high-quality archive item should have these sections or equivalent fields:

| Section | Purpose |
|---|---|
| What It Is | A plain explanation of the project, tool, path, or event |
| Why It Mattered | The human, learning, or system reason it mattered |
| What Happened | Concrete actions and artifacts |
| Tool Stack | Tools, agents, models, platforms, libraries, or workflows |
| Psychological Layer | Motivation, confusion, attention, resistance, confidence, or learning pattern |
| Sociological Layer | School, platform, team, market, community, or workflow context |
| Philosophical Layer | One restrained idea about agency, systems, craft, limits, or time |
| Replication Path | Steps someone else can follow |
| Failure Modes | What can go wrong and how to detect it |
| Current Status | idea, building, paused, maintaining, archived, or public-safe candidate |
| Sources | Public source labels or sanitized internal source labels |
| Boundary | What was omitted and why |

## 5. Data Lifecycle

Use this formal path for adding frontend data:

```text
local source or candidate
  -> triage value and risk
  -> private compiled note if needed
  -> public-safe rewrite
  -> structured frontend record
  -> validation gates
  -> regenerate site-data
  -> frontend route QA
  -> commit and publish
```

Do not add raw source material directly to `site-data/`.

## 6. Skill Chain

Use these skills or skill-like rules in this order:

1. `llm-wiki` - keep the raw/private/public compilation model intact.
2. `archive-content-curator` - rewrite one candidate into a high-quality public record.
3. `wiki-lint` - check frontmatter, links, provenance, and index health.
4. frontend data contract checks - confirm the record matches `site/src/lib/types.ts`.
5. privacy and publication gates - confirm no secret values, account material, local absolute paths, or raw chats leak.
6. frontend verification - confirm the page, card, filter, search, and detail view render correctly.

## 7. Structured Record Contract

Future records may extend the existing `site-data/index.json` shape with these
optional fields:

```json
{
  "whyItMattered": "Human and system reason this item matters.",
  "operationStory": ["Concrete action 1", "Concrete action 2"],
  "psychologicalLayer": "A careful interpretation, not a diagnosis.",
  "sociologicalLayer": "Platform, school, market, collaboration, or community context.",
  "philosophicalLayer": "A restrained idea tied to the concrete event.",
  "replicationSteps": ["Step with observable completion"],
  "failureModes": ["What can go wrong"],
  "sourceLabels": ["public wiki", "archive-derived"],
  "publicSafety": "public-safe | needs-redaction | local-only-source"
}
```

Existing frontend fields remain mandatory: `id`, `title`, `slug`, `summary`,
`tags`, `status`, `createdAt`, `updatedAt`, and module-specific fields.

## 8. Project Constraints

- No filler content. If a page has no real value yet, show a designed empty state.
- No fake "finished" status. Unfinished work should be visibly unfinished.
- No raw dump promotion. Every display item must be rewritten.
- No ungrounded depth. Psychological, sociological, and philosophical layers must attach to evidence.
- No invisible source. Every meaningful claim should have a source label or a clear "archive-derived" status.
- No single giant page. Use cards, timelines, routes, detail pages, and search.
- No frontend-only truth. The backend data contract must carry the meaning, not only the UI copy.
- No unsafe public material. Omit secret values, account material, raw chats, and local absolute paths.

## 9. Acceptance Gates

### Content Gate

- A beginner can explain the item after reading it.
- The owner can recover the original decision or lesson.
- The item contains at least one concrete operation and one replication step.
- The deeper interpretation is tied to evidence.
- The status is honest.

### Data Gate

- Required fields exist.
- Tags are useful and not noisy.
- Source labels exist.
- Public safety status exists.
- Detail page can render without guessing.

### Build Gate

Run from the vault root:

```powershell
python scripts/wiki_check.py .
python scripts/privacy_scan.py .
python scripts/build_site_data.py .
python scripts/build_public_inventory.py .
```

Run from `site/`:

```powershell
npm run lint
npm run build
```

### Frontend Gate

- Card view, detail view, search, filters, timeline, and mobile navigation work.
- Empty modules explain exactly what data is missing.
- Sample data is never presented as confirmed production content.
- Every page makes the archive easier to learn from, not just larger.

## 10. Recommended Addition Sequence

For each new batch:

1. Add 3-5 high-quality work cards.
2. Add 2-3 replication paths connected to those works.
3. Add 5-10 tool/agent cards connected to the works.
4. Add timeline events that explain the evolution.
5. Add one public journal/devlog explaining the lesson.
6. Regenerate data and verify the frontend.

Small, polished batches are better than a huge weak import.
