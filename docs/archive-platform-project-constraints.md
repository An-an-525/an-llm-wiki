# Archive Platform Project Constraints

This document is the operating contract for the frontend, backend, content
pipeline, and future agent work around `an-llm-wiki`.

## 1. Product Definition

`an-llm-wiki` is a public personal archive and learning showcase. It should help
beginners understand the owner's AI operation journey, tools, agent workflows,
project history, prompt patterns, replication paths, and public-safe lessons.

It is not a raw vault browser, a private memory dump, or a marketing landing
page. The public site shows curated records compiled from the Obsidian public
wiki and structured data.

## 2. Architecture Boundary

The system keeps three layers separate:

| Layer | Purpose | Public |
|---|---|---|
| `_raw/`, `inbox/private/` | original sources, recovered material, private staging | never |
| `private-wiki/` | local compiled private context, safety review, personal maps | never |
| `wiki/`, `site-data/` | public-safe compiled knowledge and frontend data | yes, after gates |

Frontend and server code must read `site-data/index.json` or public API
responses derived from it. They must not read private folders directly.

## 3. Frontend Constraints

- The first screen must expose the archive itself: search, modules, selected
  routes, selected works, timeline, and boundary note.
- Do not fill empty modules with fake content. Use designed empty states that
  explain what data is missing and which pipeline will provide it.
- Cards must show status, source confidence, public safety, and next action.
- Detail views should support beginner explanations, operation stories,
  replication steps, failure modes, tool stacks, and reflective layers.
- Mobile navigation must keep the core modules reachable without hiding search.
- Sample data must be visually marked or structurally separated from production
  data.

## 4. Backend Constraints

The current backend artifact is `site-data/index.json`. A future server should
preserve the same public contract and expose read-only endpoints first:

- `GET /api/site-data`
- `GET /api/content`
- `GET /api/content/:slug`
- `GET /api/search?q=...`
- `GET /api/modules`

Future private operations, editing, import, authentication, or review workflows
must live on a separate authenticated server-side surface. Do not ship secrets,
private paths, or local review reports to the browser.

## 5. Content Quality Constraints

Public content must be strong enough for beginners and useful enough for the
owner's later review. Every promoted item should combine:

- concrete evidence;
- operational clarity;
- literary expression;
- psychological insight;
- sociological context;
- philosophical restraint;
- replication value;
- honest current status.

Depth is not decoration. A psychological, sociological, or philosophical line is
accepted only when it is tied to a concrete project, event, tool, failure, or
decision.

## 6. Data Addition Workflow

After the frontend and backend contracts are ready, add data only through this
workflow:

```text
source candidate
  -> archive-content-curator skill
  -> public/private safety classification
  -> public-safe rewrite or private-only queue
  -> structured record matching site/src/lib/types.ts
  -> python scripts/build_site_data.py .
  -> frontend route QA
  -> privacy, wiki, inventory, lint, build gates
  -> commit and publish
```

Do not write records directly into the frontend just because a page looks empty.
Empty states are better than low-quality or unsafe content.

## 7. Required Record Fields

Every public display record needs the base fields already used by the frontend:

- `id`, `title`, `slug`, `summary`, `tags`, `status`, `createdAt`, `updatedAt`
- `sources` or `sourceLabels`
- `publicSafety`
- module-specific fields such as `projectStatus`, `techStack`, `steps`, or
  `date`

High-value records should also include:

- `whyItMattered`
- `operationStory`
- `psychologicalLayer`
- `sociologicalLayer`
- `philosophicalLayer`
- `replicationSteps`
- `failureModes`
- `lessons`
- `nextPlan`

## 8. Privacy Constraints

Never publish:

- secret values, API keys, tokens, cookies, sessions, SSH keys;
- private account identifiers, phone numbers, emails, school/private records
  unless explicitly rewritten as public-safe summaries;
- raw chats, raw memories, raw agent histories, private prompts;
- true local absolute paths or local environment maps;
- `_raw/`, `private-wiki/`, `inbox/private/`, `.obsidian/`, `.claude/`,
  `.claudian/`, `.trash/`, or local archive folders.

If content is valuable but unsafe, compile it into a private review page and
write only a public-safe summary later.

## 9. Acceptance Gates

Before publishing a data, frontend, or backend change:

```powershell
python scripts/wiki_check.py .
python scripts/privacy_scan.py .
python scripts/build_site_data.py .
python scripts/build_public_inventory.py .
python -m unittest discover -s tests
git diff --check
```

If frontend code changed:

```powershell
cd site
npm run lint
npm run build
```

The change is not publishable if high-risk privacy findings remain, the public
inventory includes private folders, the frontend cannot render from
`site-data/index.json`, or the content quality gate is not met.

## 10. Agent Rule

Any future agent, including Kimi, should read these files before changing the
frontend, backend, or archive data:

1. `docs/kimi-frontend-reference.md`
2. `docs/archive-platform-project-constraints.md`
3. `docs/archive-content-style-and-ingest-workflow.md`
4. `docs/agent-skill-stack.md`
5. `site/README.md`
6. `site/src/lib/types.ts`
7. `AGENTS.md`
8. `CLAUDE.md`
