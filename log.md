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
