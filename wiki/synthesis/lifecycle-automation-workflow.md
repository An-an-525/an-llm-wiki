---
title: Lifecycle Automation Workflow
aliases: ["知识库生命周期自动化", "LLM Wiki Automation Workflow"]
tags: [automation, lifecycle, validation, llm-wiki, curated, featured]
category: synthesis
type: learning-path
status: featured
publish: curated
created: 2026-05-13
updated: 2026-05-14
sources:
  - "[[wiki/sources/github-actions-scheduled-workflows]]"
  - "[[wiki/synthesis/lifecycle-replication-package-workflow]]"
  - "[[wiki/concepts/tool-codex-validation-workflow]]"
publicSafety: public-safe
sourceLabels: [automation, validation, public wiki]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "It turns the archive into a maintained system instead of a one-time cleanup."
actionText: "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。"
operationStory:
  - "Split recurring work into intake, research, package building, acceptance, and retrospective."
  - "Keep each automation narrow enough to review."
  - "Use acceptance automation to judge the whole chain."
replicationSteps:
  - "Run local source intake."
  - "Run GitHub best-practice learning."
  - "Build or improve one lifecycle package."
  - "Run acceptance gates."
  - "Review repeated failures and improve the workflow."
failureModes: [one giant automation, automated public leakage, no acceptance owner, repeated failures without workflow repair]
lessons: [automation needs role boundaries, acceptance is a separate job, workflow improvement should also be scheduled]
summary: "资料库生命周期自动化链路：按两小时节奏分别收集、调研、写学习包、跑验收，并把重复问题写回流程。"
---

# Lifecycle Automation Workflow

The automation stack is split into five jobs. This makes it easier to understand and safer to run.

## The Five Automations

| Automation | Objective output | Primary artifact path | Secondary artifact path | Push summary |
|---|---|---|---|---|
| LLM Wiki Local Source Intake | Refresh private discovery surfaces from local evidence | `private-wiki/automation/recent-activity.md` | `private-wiki/automation/local-source-incremental-watch.md`, `private-wiki/automation/pipeline-health.md`, `private-wiki/automation/intake-run-log.md` | `Intake {pass/fail}; {new}/{modified}; next page: ...` |
| LLM Wiki GitHub Best Practice Watch | Convert one external reference into one local improvement | `wiki/sources/*.md` | backlog or workflow note updates | `Watched {topic}; learned {pattern}; updated {page}` |
| LLM Wiki Lifecycle Package Builder | Create or materially improve one exact beginner learning page | `wiki/projects/lifecycle-*.md` or `wiki/synthesis/*.md` | `site-data/*` only after gates pass | `Built/improved {page}; reader can now {outcome}` |
| LLM Wiki Acceptance Gate | Decide pass/block and record blockers | `wiki/synthesis/lifecycle-automation-acceptance-YYYY-MM-DD.md` | `manifests/*` validation artifacts | `Gate {passed/blocked}; blockers {n}; publish {yes/no}` |
| LLM Wiki Workflow Retrospective | Change one rule/template/checklist or record a justified no-change decision | `private-wiki/automation/lifecycle-loop-operating-procedure.md` | `private-wiki/todos/lifecycle-workflow-todo.md` or related workflow pages | `Retrospective changed {thing}; next run verifies {thing}` |

They run asynchronously on the same two-hour cycle, with different offsets. Intake runs first, then research, then package writing, then acceptance, then workflow retrospective. This keeps the system moving without making one automation responsible for everything.

Every automation should also leave a Chinese human-readable log in the local desktop automation log hub and a push-friendly summary line for the owner.

## How The Chain Works

1. Intake finds material.
2. Private wiki makes it searchable and safer to inspect.
3. GitHub research adds outside standards.
4. Package builder creates a public-safe lesson.
5. Acceptance gate verifies structure, privacy, tests, site-data, and frontend build.
6. Retrospective improves the process when the same problem repeats.

## What Each Automation Must Not Do

- Intake must not publish raw private content.
- GitHub research must not copy uncredited work.
- Package builder must not hide private omissions.
- Acceptance must not weaken rules to pass.
- Retrospective must not turn every suggestion into a hard rule.

## Acceptance Standard

A full lifecycle run is healthy when:

- private source maps are updated;
- recent local app activity is visible in the private automation workbench;
- public pages have frontmatter and sources;
- `site-data` contains only curated public records;
- privacy scan has no high-risk findings;
- tests and frontend build pass;
- the backlog has a clear next item;
- each automation can point to one exact artifact path;
- each automation has a Chinese push summary that can be sent to the owner.

## Related

- [[wiki/synthesis/github-best-practice-learning-loop]]
- [[wiki/synthesis/lifecycle-automation-output-map]]
- [[wiki/synthesis/lifecycle-replication-package-workflow]]
- [[wiki/topics/publication-maintenance-moc]]
