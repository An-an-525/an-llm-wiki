---
title: 个人资料库公开路线图
aliases: ["Archive Public Roadmap", "Public Content Roadmap"]
tags: [archive, roadmap, synthesis, publication, curated]
category: synthesis
type: roadmap
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
  - "[[wiki/projects/personal-archive-platform]]"
publicSafety: public-safe
sourceLabels: [public wiki, roadmap, publication]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "It turns a large local archive into a staged public writing plan instead of a risky bulk release."
actionText: "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。"
operationStory:
  - "Start with architecture and process pages."
  - "Then promote project pages with evidence."
  - "Then add capability pages tied to projects."
replicationSteps:
  - "Promote one batch at a time."
  - "Run gates after every batch."
  - "Keep unresolved items in review queues."
failureModes: [trying to publish everything, writing generic self-branding, separating skills from project evidence, ignoring unfinished status]
lessons: [roadmaps reduce publication risk, capability claims need evidence, unfinished status is useful when explicit]
summary: "个人资料库公开路线图：从本地整理、公开 wiki、站点数据到前端与未来 App 的分阶段推进路径。"
---

# 个人资料库公开路线图

This roadmap defines the next public wiki batches. It keeps growth deliberate: the archive should become useful without exposing local-only material or publishing thin pages.

## Batch 1: Architecture And Boundary

Status: started.

- [[wiki/projects/personal-archive-platform]]
- [[wiki/concepts/private-to-public-promotion-pipeline]]
- [[wiki/concepts/public-site-data-boundary]]
- [[wiki/concepts/agent-skill-governance]]

This batch explains how the archive works and how it stays safe.

## Batch 2: Project Evidence

Status: started.

Published starters:

- [[wiki/projects/personal-archive-frontend]]
- [[wiki/projects/coze-agent-builder-research]]
- [[wiki/projects/xiaoan-local-model-learning-loop]]

Next candidates should continue as rewritten project pages. A good project page needs:

- public goal;
- role and tools;
- what changed;
- what can be repeated;
- what is unfinished;
- links to concept or source pages.

Do not promote projects that still depend on unrevised personal context or local setup details.

## Batch 3: Capability Pages

Capability pages should not be generic skill lists. Each capability should connect to at least one project and one repeatable workflow.

Likely themes:

- knowledge-base compilation;
- agent workflow design;
- frontend archive implementation;
- validation and publication gates;
- local-first data processing.

## Batch 4: Website Display

Only after pages are curated should `site-data/` expose them to the website. Display data should remain smaller than the wiki, because not every useful page is ready to be a showcase item.

The next website batch should prioritize:

- richer work cards using [[wiki/concepts/public-work-card-standard]];
- a read-only backend shape using [[wiki/concepts/public-api-contract]];
- public updates such as [[wiki/synthesis/archive-feed-public-data-update-2026-05-13]];
- public journal entries such as [[wiki/synthesis/archive-rebuild-public-journal]];
- a small tool and agent inventory such as [[wiki/synthesis/public-tool-and-agent-inventory]] connected to real project pages.

## Batch 5: Tool, Agent, And Attribution Standards

Status: expanded.

- [[wiki/synthesis/public-tool-and-agent-inventory]]
- [[wiki/concepts/sensitive-context-rewrite-rules]]
- [[wiki/concepts/upstream-reference-and-adaptation-policy]]
- [[wiki/concepts/tool-obsidian-karpathy-wiki-compilation]]
- [[wiki/concepts/tool-codex-validation-workflow]]
- [[wiki/concepts/tool-browser-ui-testing-workflow]]
- [[wiki/concepts/tool-github-publication-workflow]]
- [[wiki/concepts/tool-privacy-scan-publication-gate]]
- [[wiki/concepts/tool-local-private-wiki-compiler]]
- [[wiki/concepts/tool-agent-skill-stack-routing]]
- [[wiki/concepts/tool-coze-workflow-platform-study]]
- [[wiki/concepts/tool-local-model-experiment-toolchain]]
- [[wiki/concepts/tool-site-data-generation-backend]]

This batch makes later data refill safer: every tool, agent, and upstream reference should have a role, source label, risk boundary, and honest status.

## Batch 6: Growth Timeline Events

Status: started.

- [[wiki/synthesis/growth-timeline-scattered-exploration-to-compiled-archive]]
- [[wiki/synthesis/growth-timeline-agent-workflow-phase]]
- [[wiki/synthesis/growth-timeline-public-private-split]]
- [[wiki/synthesis/growth-timeline-frontend-showcase-phase]]
- [[wiki/synthesis/growth-timeline-tool-governance-phase]]

Next timeline work should add project-specific milestones only after they can be tied to public project evidence.

## Batch 7: Lifecycle Learning Packages

Status: started.

- [[wiki/synthesis/lifecycle-replication-package-workflow]]
- [[wiki/concepts/lifecycle-replication-package-template]]
- [[wiki/synthesis/lifecycle-package-backlog]]
- [[wiki/synthesis/github-best-practice-learning-loop]]
- [[wiki/synthesis/lifecycle-automation-workflow]]
- [[wiki/synthesis/lifecycle-automation-output-map]]
- [[wiki/projects/lifecycle-personal-archive-platform]]
- [[wiki/projects/lifecycle-frontend-archive-site]]
- [[wiki/projects/lifecycle-coze-agent-builder]]
- [[wiki/projects/lifecycle-xiaoan-local-model-loop]]
- [[wiki/projects/lifecycle-agent-skill-governance]]

This batch makes the archive useful for beginners: each package should teach a full lifecycle, not just describe that a project exists.

## Related

- [[wiki/topics/personal-archive-moc]]
- [[wiki/concepts/public-site-data-boundary]]
- [[wiki/concepts/public-api-contract]]
- [[wiki/synthesis/public-tool-and-agent-inventory]]
- [[wiki/topics/publication-maintenance-moc]]
