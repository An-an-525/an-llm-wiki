# Archive Content Style And Ingest Workflow

This is the project constraint for adding future frontend/backend archive data.
It defines the writing standard, data workflow, and skill-driven acceptance
process for the public personal archive. Kimi's latest frontend is now a visual
baseline; local Codex owns the frontend, backend data contract, Obsidian
compilation, validation, and publishing workflow.

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

No knowledge item may be written from private intuition alone. Use
`docs/knowledge-content-source-and-review-standard.md` as the binding source and
review gate: every serious concept, tutorial, trend, tool card, project card,
prompt pattern, Xiaoan rule, or replication path needs explicit evidence,
external or public references where appropriate, privacy review, and a challenge
step before it can become frontend core content.

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

Do not add raw source material directly to `site-data/`, and do not hand-edit
`site/src/data/siteData.generated.ts`. The frontend adapter is generated from
`site-data/index.json`.

## 6. Skill Chain

Use these skills or skill-like rules in this order:

1. `llm-wiki` - keep the raw/private/public compilation model intact.
2. `data-extractor` or `doc-parser` - extract concrete facts from source material without copying raw private text.
3. `deep-research` and, when concepts touch psychology, sociology, philosophy, cognition, education, or research claims, `academic-search` - build source context and challenge weak claims.
4. `archive-content-curator` - rewrite one candidate into a public-safe record.
5. `content-writer` - shape it into a readable Chinese tutorial, article, project story, route, feed note, or card.
6. `brand-guidelines` - align it with “安的个人书房”: literary, calm, precise, reflective, not performative.
7. `ux-writing-skill` - make frontend-visible copy purposeful, concise, conversational, and clear.
8. `seo-optimizer` - check title, summary, page structure, internal links, and public discoverability.
9. The matching module skill - 首页、藏馆、谱系、风信、工坊、手记、年谱、小安 each has its own gate.
10. `wiki-lint` - check frontmatter, links, provenance, and index health.
11. frontend data contract checks - confirm the record matches `site/src/types/index.ts`.
12. privacy and publication gates - confirm no secret values, account material, local absolute paths, or raw chats leak.
13. frontend verification - confirm the page, card, filter, search, and detail view render correctly.
14. GitHub publication - commit only after the public inventory and privacy report remain clean.

Hard frontend rule: readers only see the website or future App. Never write a public item that says or implies “open the local Obsidian vault”, “look at `wiki/...`”, or “check the local file path”. If a source matters, rewrite it into the page body or link to a public GitHub/official/source website.

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
`tags`, `status`, `createdAt`, `updatedAt`, and module-specific fields. The
current TypeScript contract lives in `site/src/types/index.ts`.

For `藏馆` records, the reader-facing category must be an action-oriented
Chinese label before any precise technical keyword. The reader is usually asking
"what can I do with AI here?", not "what framework category is this?" Use these
primary labels:

| Label | Use For |
|---|---|
| 做前端 | 页面、交互、移动端、可安装网页、视觉与浏览器体验 |
| 做后端 | API、数据生成、服务、部署边界 |
| 用工具 | 软件、平台、调试器、浏览器验收、开发工作台 |
| 搭智能体 | Agent、工作流、多步协作、技能治理 |
| 问小安 | 数字生命体、人格、对话和模型边界 |
| 写提示词 | 提示词模板、输入槽、输出格式、质量检查 |
| 整理资料 | Obsidian、公开层、私有层、来源和知识整理 |
| 走学习路线 | 复刻路线、教程阶段、交付物和验收 |
| 保护隐私 | 隐私、访问材料、发布前扫描和公开改写 |
| 看参考资料 | 官方文档、上游项目、框架来源 |

Precise technical tags may remain in source pages for search and provenance, but
the frontend should translate or hide them when they would confuse a beginner.

## 8. Project Constraints

- No filler content. If a page has no real value yet, show a designed empty state.
- No fake "finished" status. Unfinished work should be visibly unfinished.
- No raw dump promotion. Every display item must be rewritten.
- No closed-door knowledge claims. Personal experience, official documents,
  GitHub references, field best practices, and critique notes must be separated
  so readers can see what is evidence, what is adaptation, and what is An's
  judgment.
- No ungrounded depth. Psychological, sociological, and philosophical layers must attach to evidence.
- No invisible source. Every meaningful claim should have a source label or a clear "archive-derived" status.
- No single giant page. Use cards, timelines, routes, detail pages, and search.
- No frontend-only truth. The backend data contract must carry the meaning, not only the UI copy.
- No backend-only truth. If a reader needs it, it must appear in the frontend detail page, not only in Obsidian, a manifest, or an internal markdown file.
- No unsafe public material. Omit secret values, account material, raw chats, and local absolute paths.

## 9. Acceptance Gates

### Content Gate

- A beginner can explain the item after reading it.
- The owner can recover the original decision or lesson.
- The item contains at least one concrete operation and one replication step.
- The item identifies source types and has passed a challenge review, or is kept
  out of the frontend core display until that review exists.
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
python scripts/check_public_content_quality.py .
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
- A reader can understand the item without opening local Obsidian, local files, private folders, or generated JSON.

## 10. Recommended Addition Sequence

For each new batch:

1. Add 3-5 high-quality work cards.
2. Add 2-3 replication paths connected to those works.
3. Add 5-10 tool/agent cards connected to the works.
4. Add timeline events that explain the evolution.
5. Add one public journal/devlog explaining the lesson.
6. Regenerate data and verify the frontend.

Small, polished batches are better than a huge weak import.
