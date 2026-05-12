---
title: Publication Maintenance MOC
aliases: ["Publication MOC", "Maintenance MOC"]
tags: [publication, maintenance, privacy, moc]
category: synthesis
type: moc
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
summary: "Map for publication gates, privacy scans, manifests, restore evidence, and root maintenance work."
---

# Publication Maintenance MOC

Use this page before publishing or importing more content.

## Policy

- [[wiki/sources-and-data-policy]] - public/private boundary
- [[AGENTS]] - operating rules
- [[CLAUDE]] - schema and page format

## Validation

- `python scripts/wiki_check.py .` - structure and wikilink gate
- `python scripts/privacy_scan.py .` - high-risk privacy gate
- `python scripts/build_public_inventory.py .` - public inventory refresh

## Manifests

- [raw_sources.csv](../../manifests/raw_sources.csv) - source registry
- [publication_review.csv](../../manifests/publication_review.csv) - migration/privacy decisions
- [privacy_scan_report.csv](../../manifests/privacy_scan_report.csv) - privacy scan output
- [wiki_check_report.json](../../manifests/wiki_check_report.json) - structure check output
- [restore_drill.csv](../../manifests/restore_drill.csv) - restore rehearsal evidence

## Maintenance

- [[wiki/projects/root-maintenance-backlog]] - current root issues
- [[log]] - append-only operation log
