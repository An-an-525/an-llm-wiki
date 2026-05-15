# Kimi Frontend Reference Package

This document is the public-safe product brief for the personal archive frontend.
It is written for Kimi or any frontend engineer who needs to rebuild the site
without reading private local folders.

Current ownership note: Kimi's latest package has been adopted as the visual
baseline. Local Codex now owns the frontend, backend contract, Obsidian data
compilation, validation gates, and GitHub publication.

## 1. Product Positioning

The site is a public personal archive and learning showcase. It should help a
beginner visitor understand:

- what the owner has built with AI tools and agent systems;
- how the projects, tools, prompts, failures, and rebuilds connect over time;
- which operation paths can be copied and improved by another learner;
- which content is still only a candidate and needs cleanup before publishing.

The site is not a raw Obsidian browser. It must feel like a curated exhibition:
small enough to navigate, concrete enough to learn from, and honest about gaps.

The main user promise:

> "Show my AI operation journey, project evolution, tool stack, prompt patterns,
> and reproducible learning paths so others can inspect, learn, copy, and improve
> the workflow."

## 1.1 Content Depth Standard

The frontend is not only a project grid. It is a public learning archive with
literary, psychological, sociological, and philosophical depth. Kimi should read
`docs/archive-platform-project-constraints.md` and
`docs/archive-content-style-and-ingest-workflow.md` before changing the content
model, backend contract, or adding new records.

Each important item should show:

- concrete evidence: what happened, what was built, what tools were used;
- operation path: how the work was done and how a beginner can repeat it;
- literary expression: precise, memorable language without empty decoration;
- psychological layer: motivation, friction, attention, confidence, or learning pattern;
- sociological layer: platform, school, workflow, community, market, or collaboration context;
- philosophical layer: a restrained idea about agency, systems, craft, limits, failure, or time.

Depth must not become vague inspiration. Every reflective claim should attach to
a concrete project, event, tool, decision, or failure.

## 2. Source Of Truth

Frontend code must read only the public data contract:

- `site-data/index.json`
- optional public sample file: `docs/kimi-frontend-sample-data.json`
- project constraints: `docs/archive-platform-project-constraints.md`
- content workflow: `docs/archive-content-style-and-ingest-workflow.md`

Do not read:

- raw vault folders;
- private compiled folders;
- chat archives;
- local desktop or project roots;
- browser, account, payment, token, cookie, or session material.

The current production data contract is described in:

- `site/README.md`
- `site/src/types/index.ts`
- `site/src/data/siteData.generated.ts`
- `site/scripts/sync-site-data.mjs`

Current public payload status:

| Area | Current Count | Meaning |
|---|---:|---|
| `content` | 50 | Public curated markdown records currently shown by the frontend |
| `library` | 36 | Resource/source/tool entries already displayable |
| `paths` | 8 | Learning and replication routes already displayable |
| `timeline` | 50 | Public timeline generated from visible records |
| `works` | 4 | Curated project records now include the archive platform, frontend, Coze-style builder research, and Xiaoan learning loop |
| `feed` | 1 | Public update/news card started with the archive data update |
| `journal` | 1 | Public devlog/reflection card started with the rebuild journal |
| `reviewQueue` | 195 | Public-safe candidates that still need rewriting before display |

## 3. Public And Private Boundary

The frontend package should include detailed context, but not sensitive values.
The correct display strategy is:

- show project names, purpose, status, stack, lessons, and reproducible steps;
- show sanitized source labels instead of full local machine paths;
- show security status such as "sensitive value removed" or "needs review";
- never show raw account identifiers, access material, cookies, sessions, local
  absolute paths, or unreviewed chat text;
- never present imported upstream repositories as the owner's original work
  unless there is clear local adaptation evidence.

Recommended badge labels:

- `public-safe`
- `needs-redaction`
- `source-backed`
- `archive-derived`
- `beginner-friendly`
- `replicable`
- `local-only-source`
- `not-yet-published`

## 4. Information Architecture

Keep these routes. The current Vite/React app already uses hash routing with the
same pages.

| Route | Chinese Label | Purpose |
|---|---|---|
| `/` | 首页 | Explain the archive, show the best starting points, recent timeline, and featured paths |
| `/library` | 藏馆 | Curated tools, sources, frameworks, prompt patterns, and reference notes |
| `/library/:id` | 藏馆详情 | Deep view for one tool/source/resource with why it matters and how to use it |
| `/paths` | 谱系 | Reproducible learning/build routes with steps and pitfalls |
| `/paths/:id` | 谱系详情 | Step-by-step route map, required inputs, output, checkpoints, and related works |
| `/works` | 工坊 | Project and prototype showcase |
| `/feed` | 风信 | Short public updates, collected notes, release notes, or learning signals |
| `/journal` | 手记 | Public devlogs, retrospectives, and operation summaries |
| `/journal/:id` | 手记详情 | One readable article-style record |
| `/timeline` | 年谱 | Growth, project, and system evolution timeline |
| `/about` | 自序 | What the archive is, what is excluded, and how to read it |
| `/content/:slug` | 内容详情 | Generic markdown-derived public content page |

## 5. Homepage Requirements

The homepage must quickly answer four questions:

1. What is this archive?
2. What can a beginner learn here?
3. Which projects and routes should I start with?
4. How is private material kept out of the public site?

Required sections:

- Hero: "AI 操作历程资料馆" or a similarly direct title.
- Start cards: `藏馆`, `谱系`, `工坊`, `年谱`.
- Featured routes: three beginner-friendly replication paths.
- Featured works: three project cards once `works` has real content.
- Operation timeline preview: latest 4-6 public-safe milestones.
- Public boundary note: concise explanation that the frontend renders curated
  public JSON, not the raw vault.

Do not create a marketing landing page detached from the archive. The first
screen should expose the actual archive navigation and search.

## 6. Content Pillars

### 6.1 Operation Journey

Show the workflow evolution rather than only final outputs.

Recommended event structure:

| Field | Meaning |
|---|---|
| `id` | stable string |
| `date` | ISO date |
| `phase` | learning, project, agent-system, knowledge-base, release, reflection |
| `title` | short event title |
| `summary` | what happened |
| `operation` | concrete actions taken |
| `tools` | tools involved |
| `result` | outcome or artifact |
| `lesson` | what changed afterward |
| `publicSafety` | public-safe, needs-redaction, local-only-source |

Example events to show:

- moved from scattered AI usage to structured Obsidian compilation;
- rebuilt the vault into public/private layers;
- created `site-data/index.json` as the frontend data contract;
- separated raw sources, private compiled notes, and public display data;
- introduced validation gates for structure and privacy before GitHub publishing;
- found that project cards, feed, and journal need curated data before the
  frontend can look complete.

### 6.2 Project And Work Showcase

Every project card should answer:

- what it is;
- why it was built;
- current status;
- stack and tools;
- what is public-safe to show;
- how someone could replicate a similar version;
- what should be improved next.

Initial project lines for public reference:

| Project | Display Status | Frontend Angle |
|---|---|---|
| Personal Archive / Obsidian Backend | building | Public/private wiki split, site-data contract, validation gates |
| Personal Archive Frontend | building | Data-driven display site for library, routes, works, timeline |
| Agent Operating System Line | needs-redaction | Controller rules, agent delegation, skills, runtime boundaries |
| Knowledge Capture Workflow | needs-redaction | Capture, triage, rewrite, publish loop |
| Campus AI Q&A / Competition System | needs-redaction | School-facing AI assistant and competition information workflows |
| 3D Printing Miniapp / Device Ops | needs-redaction | WeChat miniapp/device operations and API research path |
| AI Materials Paid Platform | needs-redaction | Content packaging, delivery, payment, and protection concepts |
| Coze / Dify-style Workflow Replication | public-safe-candidate | Beginner-friendly route for rebuilding an agent workflow platform |
| API Relay And Model Gateway | needs-redaction | Model routing, relay, gateway, and operations notes |
| Hanako / OpenHanako | needs-redaction | Desktop/agent interface exploration and creator station direction |
| dYm Desktop Media Analysis | needs-redaction | Media analysis app idea; must review rights and platform boundaries |
| GitNexus Multi-repo Workspace | needs-redaction | Multi-repo context, code review, and agent-assisted maintenance |
| Accio / AiPy / Hermes Agent | needs-redaction | Agent runtime, skill, and automation exploration lines |

Frontend must not imply all projects are finished. Use status badges.

### 6.3 Tool And Agent Inventory

This should be a major part of the site because visitors can learn from the tool
stack.

Group tools by role:

| Group | Items |
|---|---|
| Coding agents | Codex, Claude Code, Cursor, Gemini, Qwen, Kimi, OpenClaw |
| Knowledge base | Obsidian, Karpathy-style LLM Wiki pattern, markdown frontmatter, wikilinks |
| Browser and UI testing | Browser Use, Playwright, in-app browser, screenshots |
| Agent protocols and skills | MCP, ACP, local skills, superpowers-style process skills |
| Workflow platforms | Dify, n8n, Coze-style workflow ideas |
| Local model tooling | Ollama, Open WebUI, AnythingLLM, LLMHub-style routing |
| Gateway and relay | One Hub, New-API-style relay, model routing dashboards |
| Product/dev workflow | GitHub, Git worktrees, validation scripts, public inventory |
| Miniapp workflow | WeChat DevTools, miniprogram CI and delivery checks |
| Document tooling | PDF, documents, spreadsheets, presentations |
| Account hygiene | 1Password and local review queues; never expose actual values |

Each tool card should use these fields:

- `name`
- `role`
- `usedFor`
- `learningValue`
- `replicationUse`
- `riskLevel`
- `relatedProjects`
- `status`

### 6.4 Growth And Learning Narrative

This should be public-safe and non-invasive. Show growth through work patterns,
not private biography.

Suggested phase model:

| Phase | Public Narrative |
|---|---|
| Scattered exploration | Many tools and projects were tried, but context was fragmented |
| Project accumulation | Campus systems, miniapps, AI workflow ideas, gateway tools, and agent experiments accumulated |
| Agent workflow phase | Work moved from single prompts to controller rules, skills, validation, and delegation |
| Knowledge compilation phase | Raw notes were archived; public/private wiki layers were created |
| Frontend showcase phase | The archive needs a readable public site for beginners and collaborators |

The site should make the reader feel the evolution:

- from "using tools" to "building repeatable workflows";
- from "raw notes" to "compiled knowledge";
- from "private operations" to "public-safe teaching material";
- from "many unfinished projects" to "clear routes, status, and next steps".

### 6.5 Prompt Engineering And Operation Templates

Prompt engineering should be displayed as reusable patterns, not raw private
prompts. Each prompt card should include:

- intent;
- when to use it;
- input slots;
- output format;
- quality checks;
- common failure modes.

Core prompt patterns to include:

#### A. Frontend Product Brief Prompt

Use when asking an AI frontend builder to improve the site.

```text
You are rebuilding a public personal archive frontend.
Read the product reference and data contract first.
Use only public JSON data. Do not invent fake finished projects.
If a module has no real records, render a useful empty state with what is needed next.

Required routes:
home, library, paths, path detail, works, feed, journal, timeline, about, content detail.

Audience:
beginners who want to understand the owner's AI operation journey and replicate useful workflows.

Quality bar:
clear navigation, strong search/filter, status badges, readable project cards,
beginner explanations, responsive mobile layout, loading/error/offline states.

Output:
frontend changes, data assumptions, screenshots or browser verification notes,
and any missing data fields that block a better UI.
```

#### B. Public Data Import Prompt

Use when turning private compiled notes into public site data.

```text
Convert the source into a public-safe archive item.
Keep project purpose, tools, operation steps, lessons, and replication route.
Remove sensitive values, account identifiers, raw chat text, and local absolute paths.
Mark uncertain content as needs-redaction or local-only-source.
Write for a beginner reader.

Return:
title, summary, module, tags, status, sources, publicSafety,
whyItMattered, replicationSteps, failureModes, nextPlan.
```

#### C. Project Card Rewrite Prompt

```text
Rewrite this project note as a public work card.
Do not overstate completion.
Separate original work, upstream reference, local adaptation, and future plan.
Add a replication path for a beginner.
Use status labels: idea, building, online, maintaining, paused, archived.
```

#### D. Route Map Prompt

```text
Create a step-by-step learning route from this project or tool cluster.
Each step needs a goal, action, resource, pitfall, and completion check.
Make the route useful even when the reader has never used these tools.
```

#### E. Frontend QA Prompt

```text
Review the archive frontend as a visitor and as a frontend engineer.
Check routing, search, filters, empty states, loading state, error state, mobile navigation,
card density, beginner readability, and whether any fake content looks like real work.
Return blocking issues first, then improvements.
```

#### F. Source Review Prompt

```text
For each candidate item, decide if it is public-safe, needs redaction, or should stay local-only.
Do not publish raw dumps.
Check for sensitive values, account material, local absolute paths, contact data, and private chat text.
If safe, propose a rewritten public summary and source labels.
```

## 7. Data Contract Extensions For Kimi

The existing `site-data/index.json` is enough for the current React app, but the
next frontend needs richer optional fields. Do not break existing fields; add
optional fields only.

### 7.1 Work Item

```ts
type WorkItem = {
  id: string
  title: string
  slug: string
  summary: string
  tags: string[]
  status: string[]
  type: "website" | "tool" | "mini-app" | "prototype" | "experiment" | "open-source"
  projectStatus: "idea" | "building" | "online" | "maintaining" | "paused" | "archived"
  publicSafety: "public-safe" | "needs-redaction" | "local-only-source"
  role: "owner-built" | "adapted" | "reference-study" | "mixed"
  techStack: string[]
  whyItMattered: string
  operationStory: string[]
  psychologicalLayer?: string
  sociologicalLayer?: string
  philosophicalLayer?: string
  replicationSteps: string[]
  failureModes: string[]
  lessons: string[]
  nextPlan: string
  sourceLabels: string[]
}
```

### 7.2 Tool / Agent Item

```ts
type ToolAgentItem = {
  id: string
  name: string
  group: string
  role: string
  usedFor: string[]
  learningValue: string
  replicationUse: string
  riskLevel: "low" | "medium" | "high"
  relatedProjects: string[]
  status: "active" | "historical" | "candidate" | "reference"
}
```

### 7.3 Prompt Pattern Item

```ts
type PromptPattern = {
  id: string
  title: string
  intent: string
  whenToUse: string
  inputSlots: string[]
  outputFormat: string[]
  qualityChecks: string[]
  samplePrompt: string
}
```

### 7.4 Operation Event

```ts
type OperationEvent = {
  id: string
  date: string
  phase: string
  title: string
  summary: string
  operation: string[]
  tools: string[]
  result: string
  lesson: string
  publicSafety: string
}
```

## 8. Component Requirements

Required components:

- `ArchiveShell`: header, desktop nav, mobile bottom nav, footer.
- `GlobalSearch`: searches title, summary, tags, tools, projects, and prompt cards.
- `ModuleHero`: compact title and explanation for each module.
- `WorkCard`: project status, role, stack, safety badge, next step.
- `ToolAgentCard`: role, used-for chips, replication use, related projects.
- `PathRouteMap`: steps, resources, pitfalls, completion checks.
- `PromptPatternCard`: intent, input slots, output format, copyable prompt.
- `OperationTimeline`: date, phase, result, lesson, related tools.
- `SourceBadge`: source-backed, archive-derived, local-only-source, needs-redaction.
- `PrivacyReviewBadge`: public-safe, needs-redaction, local-only-source.
- `EmptyState`: explains what data is missing and what file/schema should provide it.
- `PageSkeleton`: per-page loading skeleton.
- `ErrorState`: data load failure with retry guidance.
- `OfflineState`: network unavailable state.
- `ImagePlaceholder`: stable aspect ratio and no layout shift.

States must be first-class. Empty `works`, `feed`, or `journal` pages are not
bugs if they clearly explain what content is pending and show the expected shape.

## 9. Frontend UX Rules

- Beginner first: every card needs a plain-language summary.
- Do not make one giant index page. Use modules and filters.
- Search must work across title, summary, tags, tools, project names, and prompt names.
- Filters should include module, tag, status, safety, difficulty, and project status.
- Use status badges heavily; unfinished work must look intentionally staged.
- Do not use fake metrics or fake project completion.
- If using sample data, label it as sample or reference.
- Avoid dense raw markdown dumps; convert content into sections and cards.
- Keep mobile navigation simple: Home, Library, Paths, Works, Timeline or Search.
- Detail pages should show "how to replicate" above raw source notes.
- Every project detail page should include: what, why, how, result, lesson, replicate, next.

## 10. Backend / Server Preparation

The future server should keep the same public contract and expose read-only
endpoints:

- `GET /api/site-data`
- `GET /api/content`
- `GET /api/content/:slug`
- `GET /api/search?q=...`
- `GET /api/modules`
- optional: `GET /api/works`, `GET /api/paths`, `GET /api/tools`, `GET /api/prompts`

Server-side rules:

- build public JSON from curated markdown only;
- run structure and privacy checks before deploy;
- never expose raw local files through public routes;
- never put sensitive values in browser bundles;
- keep private editing/import workflows behind a separate authenticated origin if added later.

## 11. Data Refill Workflow

Use this workflow when adding high-quality content later:

1. Select one candidate from the private publication queue.
2. Use `skills/archive-content-curator/SKILL.md` to classify, rewrite, and structure it.
3. Rewrite it into a public-safe wiki note or a structured site-data record.
4. Add beginner explanation, sources, project status, safety status, and next step.
5. Add literary, psychological, sociological, and philosophical layers only where they are evidence-backed.
6. Add replication steps if the item is a project or method.
7. Run validation.
8. Regenerate `site-data/index.json`.
9. Verify the frontend route that consumes the new data.

Commands from the vault root:

```powershell
python scripts/wiki_check.py .
python scripts/privacy_scan.py .
python scripts/build_site_data.py .
python scripts/build_public_inventory.py .
```

Frontend commands from `site/`:

```powershell
npm run lint
npm run build
```

## 12. Acceptance Criteria For Kimi

A Kimi-generated frontend is acceptable only if:

- it renders `site-data/index.json` without needing raw vault access;
- all listed routes work;
- search and filters work with real public data;
- empty modules have designed empty states;
- project cards show status and do not pretend unfinished work is complete;
- prompt engineering content is displayed as reusable patterns;
- operation timeline shows actions, tools, results, and lessons;
- mobile navigation is usable;
- loading, error, and offline states exist;
- no sensitive values, raw chat dumps, or local absolute paths appear in the UI;
- build and lint pass.

## 13. Recommended Kimi Task Prompt

```text
Use this repository as a public personal archive frontend.
Read docs/kimi-frontend-reference.md, docs/archive-platform-project-constraints.md,
docs/archive-content-style-and-ingest-workflow.md, docs/kimi-frontend-sample-data.json,
site/README.md, and site/src/types/index.ts first.

Goal:
make the frontend clearly show the owner's AI operation journey, tools/agents,
projects, prompt engineering patterns, learning routes, and timeline so beginners
can learn and replicate the workflows.

Data rule:
render site-data/index.json as the production source. You may use
docs/kimi-frontend-sample-data.json only as reference for missing sections.
Do not make fake projects look real.

Must improve:
home, library, paths, works, timeline, global search, empty states, loading/error/offline states,
project detail shape, prompt pattern display, tool/agent inventory display, and mobile navigation.

Do not expose:
sensitive values, accounts, cookies, sessions, local absolute paths, raw chat logs, or raw vault folders.

Deliver:
code changes, data assumptions, screenshots or browser verification notes,
and a list of missing data fields that should be filled later.
```
