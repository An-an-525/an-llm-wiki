---
title: Root Maintenance Backlog
aliases: ["- 根问题清单"]
  - 根问题清单
  - Rebuild Follow-up Issues
tags: [llm-wiki, project, maintenance]
category: synthesis
type: project
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
summary: "Durable follow-up list for root issues found during the Karpathy-style public rebuild."
---

# Root Maintenance Backlog

These are root issues to solve after the public-safe rebuild, kept here so they are not lost in chat history.

## Open Root Issues

| Priority | Issue | Current Signal | Done When |
|---|---|---|---|
| P0 | Broken wikilink cleanup | `scripts/wiki_check.py` reports hundreds of possible broken links after migration | Warnings are reduced to intentional examples or valid links |
| P0 | Publication privacy hardening | Privacy scan passed, but the scanner needs regular rule updates as new content is migrated | `scripts/privacy_scan.py` remains at 0 high-risk findings before every push |
| P1 | Migration quality pass | Some migrated pages preserve old headings, examples, or generated-report structure | High-value pages are rewritten into compact source-aware wiki notes |
| P1 | Source coverage | Migrated pages currently cite the pre-rebuild archive as a bulk source | Important claims have specific public source notes under `wiki/sources/` |
| P1 | Git publish reliability | First push needed an explicit working proxy override | Push workflow is documented or made independent of transient local network settings |
| P2 | Restore drill | Temporary restore drill completed for archive ID `pre-karpathy-rebuild-20260512-143127` | Recorded in [restore_drill.csv](../../manifests/restore_drill.csv) without exposing local absolute paths |
| P2 | Index shape | `wiki/index` is large and mostly mechanical | Index is split into topic MOCs with short summaries |

## Working Rules

- Do privacy scan before every commit that might be pushed.
- Do not weaken the privacy scanner just to make a publish pass.
- Prefer fixing migrated page quality over bulk deleting links.
- Keep local-only recovery details out of the public repository.

## Next Batch

1. Convert CSV links in navigation pages into plain file references or add Markdown wrapper notes.
2. Fix the top 50 broken wikilinks by incoming importance.
3. Split migrated skill pages into a dedicated skills MOC.
4. Add public source notes for the GitHub reference projects and AI agent framework pages.
5. Document the reliable push command without exposing local network details.

## Completed This Batch

- Broken wikilinks reduced to zero untriaged findings in the validator.
- Privacy scan rules were hardened while preserving a zero high-risk publication gate.
- Restore drill was rehearsed to a temporary copy and recorded in [restore_drill.csv](../../manifests/restore_drill.csv).
