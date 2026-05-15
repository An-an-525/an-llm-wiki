---
title: Vault Log
aliases: [vault-log]
tags: [llm-wiki, log]
category: synthesis
type: log
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
summary: "Append-only maintenance log for the rebuilt public-safe vault."
---

# Vault Log

## [2026-05-13] update | Local visualization stack

- Added native Obsidian Bases dashboards for the private wiki overview, context radar, and automation monitor under `_meta/`.
- Added private visualization notes for the plugin stack, the project-skill-agent graph, and the automation metrics workbench.
- Extended the local control center, private index, context index, and automation index so the new visual and query layers are reachable from the main private entry pages.

## [2026-05-13] update | Single raw warehouse planning layer

- Added a local-only raw warehouse configuration and migration ledger so scattered source roots can converge into one mirrored raw store without moving live runtime or credential roots blindly.
- Added `scripts/build_raw_warehouse_plan.py` and `scripts/check_raw_warehouse.py` to classify local roots as mirror, index-only, backup-dedupe, or skip-empty before any physical migration.
- Created the first warehouse root skeleton and generated a 32-root migration plan covering downloads, chat attachments, projects, backups, and live agent/runtime roots.

## [2026-05-13] update | Official alignment audit and contract refinement

- Added `scripts/check_karpathy_alignment.py` to measure whether the vault still expresses Karpathy's raw -> wiki -> schema model while documenting local extensions instead of silently drifting.
- Rewrote [[wiki/sources/karpathy-llm-wiki-pattern]] into a Chinese-first official source note that distinguishes the gist itself from this vault's private-wiki and site-data extensions.
- Refined [[wiki/synthesis/karpathy-official-wiki-layer]] and [[wiki/topics/llm-wiki-moc]] so future agents can see which deviations are intentional, which are historical legacy, and which still need gradual cleanup.

## [2026-05-13] update | Site data and publication safety

- Fixed the public site-data display pipeline so all curated showcase pages are eligible for frontend data when they have a public-safe Chinese-facing summary.
- Added beginner-facing publication safety pages for access material, local identity redaction, chat rewrite, dataset samples, screenshot attribution, agent traces, and the publish decision tree.
- Re-linked the root index, wiki workbench, publication maintenance map, and sensitive-context rewrite standard to the new safety pages.
- Tightened public frontend data to Chinese-first display: curated entries now need Chinese titles and Chinese summaries, while English source names stay as traceable source titles or aliases.

## [2026-05-12] rebuild | Karpathy-style public LLM Wiki

- Rebuilt this vault as `an-llm-wiki`.
- Official source: [[wiki/sources/karpathy-llm-wiki-pattern]].
- Archive ID: `pre-karpathy-rebuild-20260512-143127`.
- Migrated public-safe notes: 192.
- Reviewed source files: 11147.
- Private raw material, local memory, true local paths, credentials, and unreviewed imports were excluded.

## [2026-05-12] update | Root maintenance backlog

- Added [[wiki/projects/root-maintenance-backlog]] so follow-up issues from the rebuild are durable.
- Captured broken link cleanup, privacy hardening, migration quality, source coverage, publish reliability, restore drill, and index splitting as root issues.

## [2026-05-12] maintenance | Validation hardening and restore drill

- Hardened the validation scripts for privacy scanning and wiki structure checks.
- Repaired public wikilinks by adding aliases for migrated pages and converting unresolved legacy/private links to plain text or normal Markdown file links.
- Ran a temporary restore drill for archive ID `pre-karpathy-rebuild-20260512-143127`; restored key files were present and the live vault was not overwritten.
- Recorded the safe restore result in [restore_drill.csv](manifests/restore_drill.csv).

## [2026-05-13] wiki-layer | Karpathy official layer contract

- Added [[wiki/synthesis/karpathy-official-wiki-layer]] as the public `wiki/` layer contract.
- Linked the contract from [[index]], [[wiki/index]], and [[wiki/topics/llm-wiki-moc]].
- Updated [[wiki/sources/karpathy-llm-wiki-pattern]] so future agents treat `wiki/` as the compiled artifact, not a raw staging area.

## [2026-05-13] ingest | First public archive platform batch

- Added [[wiki/sources/local-private-compile-2026-05-13]] as a public-safe source record for the local compile pass.
- Added [[wiki/topics/personal-archive-moc]], [[wiki/projects/personal-archive-platform]], [[wiki/concepts/private-to-public-promotion-pipeline]], [[wiki/concepts/public-site-data-boundary]], [[wiki/concepts/agent-skill-governance]], and [[wiki/synthesis/personal-archive-public-roadmap]].
- Regenerated `site-data/` after promotion and reran public validation gates.

## [2026-05-13] ingest | Public information backbone

- Added [[wiki/synthesis/archive-information-architecture]], [[wiki/synthesis/project-evidence-matrix]], [[wiki/synthesis/capability-evidence-matrix]], [[wiki/synthesis/public-growth-timeline-framework]], and [[wiki/synthesis/information-review-queue]].
- Prioritized information structure over visual showcase polish so future project and capability pages can be evidence-backed.

## [2026-05-13] ingest | Curated project evidence batch

- Added [[wiki/projects/personal-archive-frontend]], [[wiki/projects/coze-agent-builder-research]], and [[wiki/projects/xiaoan-local-model-learning-loop]] as public-safe project pages.
- Added [[wiki/concepts/public-api-contract]] and [[wiki/concepts/public-work-card-standard]] so the future website backend and project cards have explicit constraints.
- Updated project evidence, capability evidence, personal archive navigation, and agent systems navigation to point at the curated project pages.

## [2026-05-13] ingest | Public feed, journal, and tool standards

- Added [[wiki/synthesis/archive-feed-public-data-update-2026-05-13]] as the first public feed item.
- Added [[wiki/synthesis/archive-rebuild-public-journal]] as the first public journal entry.
- Added [[wiki/synthesis/public-tool-and-agent-inventory]], [[wiki/concepts/sensitive-context-rewrite-rules]], and [[wiki/concepts/upstream-reference-and-adaptation-policy]] to support safer future data refill.
- Updated navigation, publication policy, capability evidence, and roadmap pages to link the new content.

## [2026-05-13] ingest | Tool cards and growth timeline expansion

- Added ten public tool cards: [[wiki/concepts/tool-obsidian-karpathy-wiki-compilation]], [[wiki/concepts/tool-codex-validation-workflow]], [[wiki/concepts/tool-browser-ui-testing-workflow]], [[wiki/concepts/tool-github-publication-workflow]], [[wiki/concepts/tool-privacy-scan-publication-gate]], [[wiki/concepts/tool-local-private-wiki-compiler]], [[wiki/concepts/tool-agent-skill-stack-routing]], [[wiki/concepts/tool-coze-workflow-platform-study]], [[wiki/concepts/tool-local-model-experiment-toolchain]], and [[wiki/concepts/tool-site-data-generation-backend]].
- Added five public growth milestones: [[wiki/synthesis/growth-timeline-scattered-exploration-to-compiled-archive]], [[wiki/synthesis/growth-timeline-agent-workflow-phase]], [[wiki/synthesis/growth-timeline-public-private-split]], [[wiki/synthesis/growth-timeline-frontend-showcase-phase]], and [[wiki/synthesis/growth-timeline-tool-governance-phase]].
- Updated the tool inventory, capability matrix, roadmap, timeline framework, and indexes to make the new pages navigable.

## [2026-05-13] workflow | Lifecycle learning packages and async automation

- Added the standard lifecycle workflow, package template, GitHub best-practice loop, automation workflow, output map, and package backlog.
- Added five beginner-readable lifecycle packages for the personal archive platform, frontend archive site, Coze-style agent builder study, Xiaoan local model loop, and agent skill governance.
- Started the dedicated two-hour automation relay: local intake, GitHub best-practice watch, lifecycle package builder, acceptance gate, and workflow retrospective.
- Updated the private compiler so automation output and recent local activity signals are written into the private Obsidian layer.
- Recorded the first run in [[wiki/synthesis/lifecycle-automation-acceptance-2026-05-13]] after structure, privacy, private wiki, inventory, tests, lint, and frontend build gates passed.

## [2026-05-13] ingest | Conversation context todo and app learning packages

- Extended the private compiler with private-only conversation context analysis, learning package queue, and lifecycle workflow todo pages.
- Added [[wiki/projects/lifecycle-hanako-openhanako-creative-agent-desktop]] and [[wiki/projects/lifecycle-agent-ide-learning-workflow]] as public-safe beginner packages for local app learning signals.

## [2026-05-13] frontend | An personal study room identity

- Updated the homepage first screen to present the site as 安的个人书房, with public avatars for 安 and 小安.
- Added [[wiki/synthesis/an-public-study-room-portrait]] to ground the public identity, reader model, private boundary, and growth narrative.
- Added [[wiki/concepts/prompt-engineering-operating-patterns-for-beginners]] so future content can explain prompt workflows to Chinese beginners without exposing private material.
- Removed fake public contact placeholders from the about page and linked only the public repository.
