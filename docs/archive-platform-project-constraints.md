# Archive Platform Project Constraints

This document is the operating contract for the frontend, backend, content
pipeline, and future agent work around `an-llm-wiki`.

## 1. Product Definition

`an-llm-wiki` is a public personal archive and learning showcase. It should help
beginners understand the owner's AI operation journey, tools, agent workflows,
project history, prompt patterns, replication paths, and public-safe lessons.
Kimi's latest frontend is now the adopted visual baseline, but local Codex owns
the implementation, backend data contract, validation, and publication process.

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

- The product IA has seven public modules:
  - `首页`：第一屏和总入口，说明这是安的个人书房，给出新读者入口、核心项目、最新动态和时间线预览。
  - `藏馆`：资料和工具卡片库，回答“这是什么、适合谁、怎么用、风险是什么”，不承载完整项目复盘。藏馆面向小白使用行动型中文大类，不直接把工程内部标签作为主分类；默认大类为 `做前端`、`做后端`、`用工具`、`搭智能体`、`问小安`、`写提示词`、`整理资料`、`走学习路线`、`保护隐私`、`看参考资料`。
  - `谱系`：学习路线和复刻路径，回答“从零到一个可运行小版本应该按什么顺序走”。
  - `风信`：信息、趋势和安的认知觉醒，回答“外部发生了什么、安因此改变了什么判断、读者下一步应该点哪里做什么”。它包含三类流：外部信息与趋势、安的认知觉醒、资料库新增行动。
  - `工坊`：项目展柜和案例学习包，回答“安做过什么、怎么做、怎么复刻、哪里会失败”。
  - `手记`：复盘和思想记录，回答“这次经历留下了什么判断、心理变化和方法修正”。
  - `年谱`：真实时间线，回答“2026 年 3 月之后，安的 AI 学习和项目怎样一步步展开”。
- The first screen must expose the archive itself: search, modules, selected
  routes, selected works, timeline, and boundary note.
- Do not fill empty modules with fake content. Use designed empty states that
  explain what data is missing and which pipeline will provide it.
- Cards must show status, source confidence, public safety, and next action.
- Reader-facing category names must be broad Chinese labels. Precise English tags
  such as framework names, internal workflow names, or repository labels may
  remain as backend keywords, but they should not be the primary library filter.
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

Knowledge content must also follow
`docs/knowledge-content-source-and-review-standard.md`. This means no module may
publish a general lesson, technical recommendation, trend interpretation,
prompt rule, or learning path from one isolated memory. A public item must show
what came from An's evidence, what came from official or public references, what
was adapted for Chinese beginners, and what was challenged before publication.

Module-specific gates:

| Module | Required Standard |
|---|---|
| 首页 | Must feel like a Chinese personal study room, with clear reader entry points and no technical pile-up in the first screen. |
| 藏馆 | Must use action-oriented Chinese categories and explain use case, audience, risk, and next action. |
| 谱系 | Must provide ordered stages, prerequisites, deliverables, checks, and failure handling. |
| 风信 | Must combine information or trend, An's changed judgment, and a suggested reader action. |
| 工坊 | Must link to a full detail page and include operation story, replication steps, failure modes, and An's reminders. |
| 手记 | Must be grounded in a concrete event and include reflective layers without private raw text. |
| 年谱 | Must use real dates and connect events to source pages or public-safe summaries. |
| 小安 | Must answer in Chinese, remain bounded by public/private separation, and never expose access material. |

## 6. Data Addition Workflow

After the frontend and backend contracts are ready, add data only through this
workflow:

```text
source candidate
  -> archive-content-curator skill
  -> public/private safety classification
  -> source and best-practice evidence check
  -> challenge review for bias, gaps, beginner clarity, and privacy
  -> public-safe rewrite or private-only queue
  -> structured record matching site/src/types/index.ts
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
6. `site/src/types/index.ts`
7. `AGENTS.md`
8. `CLAUDE.md`
