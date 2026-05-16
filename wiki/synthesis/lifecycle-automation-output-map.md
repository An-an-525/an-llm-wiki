---
title: Lifecycle Automation Output Map
aliases: ["自动化产出地图", "异步自动化产出地"]
tags: [automation, lifecycle, obsidian, validation, curated, featured]
category: synthesis
type: map
status: featured
publish: curated
created: 2026-05-13
updated: 2026-05-14
sources:
  - "[[wiki/synthesis/lifecycle-automation-workflow]]"
  - "[[wiki/synthesis/lifecycle-replication-package-workflow]]"
  - "[[wiki/sources/github-actions-scheduled-workflows]]"
publicSafety: public-safe
sourceLabels: [automation, workflow, public wiki]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "It makes the asynchronous automation chain visible and reviewable inside Obsidian."
actionText: "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。"
operationStory:
  - "Each automation runs as a narrow worker on the same two-hour rhythm."
  - "Workers are staggered so intake happens before research, package building, acceptance, and retrospective."
  - "Outputs land in Obsidian pages or manifests instead of disappearing into chat."
replicationSteps:
  - "Create a private intake output page."
  - "Create public-safe workflow and package pages."
  - "Create acceptance records and quality manifests."
  - "Review repeated failures and update the workflow."
failureModes: [hidden automation output, one giant everything-job, asynchronous work without acceptance, public pages not linked from Obsidian]
lessons: [async work needs a visible ledger, output pages are part of the workflow, validation should run after writers]
summary: "说明两小时异步资料库自动化各自把产出写到哪里：私有证据进私有层，公开学习包进 wiki，验收报告进 manifests。"
---

# Lifecycle Automation Output Map

Yes: the automations should be asynchronous. They should not all do the same job, and they should not wait for one giant manual run.

The simple design is a relay:

1. collect new signals;
2. compare with GitHub and official best practices;
3. write or improve one learning package;
4. run the acceptance gate;
5. improve the workflow if the same problem repeats.

## Two-Hour Relay

| Time in cycle | Worker | Main output |
|---|---|---|
| +05 min | Local source intake | `private-wiki/automation/recent-activity.md`, local source maps, safety queues |
| +25 min | GitHub best-practice watch | source notes, backlog updates, workflow changes |
| +40 min | Lifecycle package builder | beginner-readable public learning pages |
| +55 min | Acceptance gate | validation report, blockers, inventory refresh |
| +58 min | Workflow retrospective | improved process pages, templates, and automation prompts |

## Exact Artifact Map

| Worker | Objective output | Exact artifact path(s) | Push summary sink |
|---|---|---|---|
| Local source intake | Refresh private discovery surfaces | `private-wiki/automation/recent-activity.md`, `private-wiki/automation/local-source-incremental-watch.md`, `private-wiki/automation/pipeline-health.md`, `private-wiki/automation/intake-run-log.md` | desktop automation log hub / intake report |
| GitHub best-practice watch | Turn one reference into one local improvement | `wiki/sources/*.md`, workflow/backlog updates | desktop automation log hub / best-practice report |
| Lifecycle package builder | Produce one exact beginner-readable page | `wiki/projects/lifecycle-*.md` or `wiki/synthesis/*.md` | desktop automation log hub / package report |
| Acceptance gate | Record pass/fail and blockers | `wiki/synthesis/lifecycle-automation-acceptance-YYYY-MM-DD.md`, `manifests/*` | desktop automation log hub / gate report |
| Workflow retrospective | Change one workflow rule or record no-change | `private-wiki/automation/lifecycle-loop-operating-procedure.md`, `private-wiki/todos/lifecycle-workflow-todo.md` | desktop automation log hub / retrospective report |
| Delivery push | Summarize the whole cycle to the owner | local desktop automation log hub summary files | current thread |

## Output Rule

Every automation must leave an Obsidian-visible result:

- private local evidence goes to `private-wiki/`;
- public-safe lessons go to `wiki/`;
- generated website backend data goes to `site-data/`;
- machine reports go to `manifests/`;
- failures go to a backlog or acceptance record.

Every automation should also leave one human-readable Chinese log in the desktop log hub, so the owner does not have to inspect manifests to know what changed.

## Recent App Activity

Local activity from tools such as Hanako, Trae, Downloads, WeChat file attachments, project folders, and unexpected learning apps is treated as private evidence first. The automation records metadata and candidate lessons, not raw private contents.

## Review Rule

The acceptance worker is separate from the writer workers. A package is not considered ready just because it was written; it is ready only after checks pass and the output is linked from the wiki.

## Acceptance Records

- [[wiki/synthesis/lifecycle-automation-acceptance-2026-05-13]] - first manual run and validation record.

## Related

- [[wiki/synthesis/lifecycle-automation-workflow]]
- [[wiki/synthesis/lifecycle-package-backlog]]
- [[wiki/topics/publication-maintenance-moc]]
