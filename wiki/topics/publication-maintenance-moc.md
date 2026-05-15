---
title: 发布维护地图
aliases: ["Publication Maintenance MOC", "Publication MOC", "Maintenance MOC"]
tags: [publication, maintenance, privacy, moc]
category: synthesis
type: moc
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
summary: "发布维护地图：连接公开边界、发布决策树、隐私扫描、manifest、恢复演练和根问题维护。"
---

# 发布维护地图

Use this page before publishing or importing more content.

## Policy

- [[wiki/sources-and-data-policy]] - public/private boundary
- [[wiki/concepts/private-to-public-promotion-pipeline]] - promotion workflow
- [[wiki/concepts/public-site-data-boundary]] - frontend/backend data boundary
- [[wiki/concepts/public-api-contract]] - future read-only API contract
- [[wiki/concepts/sensitive-context-rewrite-rules]] - rewrite rules for sensitive context
- [[wiki/concepts/beginner-publication-decision-tree]] - one-page beginner publish decision flow
- [[wiki/concepts/credential-and-token-publication-safety]] - access material publication safety
- [[wiki/concepts/local-path-and-device-identity-redaction]] - local environment redaction
- [[wiki/concepts/chat-log-to-public-lesson-rules]] - chat-to-lesson rewrite rules
- [[wiki/concepts/dataset-and-sft-sample-safety]] - dataset and local model sample safety
- [[wiki/concepts/screenshot-asset-and-attribution-safety]] - screenshot, asset, and attribution safety
- [[wiki/concepts/agent-tool-permission-and-trace-safety]] - agent tool trace boundary
- [[wiki/concepts/upstream-reference-and-adaptation-policy]] - upstream reference and adaptation labeling
- [[wiki/concepts/content-critique-and-review-rubric]] - critique, research, learning-material review, and optimization checklist
- [[wiki/synthesis/lifecycle-automation-workflow]] - two-hour automation lifecycle
- [[wiki/synthesis/lifecycle-automation-output-map]] - asynchronous output locations
- [[wiki/synthesis/lifecycle-automation-acceptance-2026-05-13]] - first lifecycle automation acceptance record
- [[wiki/synthesis/lifecycle-replication-package-workflow]] - learning package workflow
- [[AGENTS]] - operating rules
- [[CLAUDE]] - schema and page format

## Validation

- `python scripts/wiki_check.py .` - structure and wikilink gate
- `python scripts/privacy_scan.py .` - high-risk privacy gate
- `python scripts/check_public_content_quality.py .` - public content quality gate for featured and lifecycle pages
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
