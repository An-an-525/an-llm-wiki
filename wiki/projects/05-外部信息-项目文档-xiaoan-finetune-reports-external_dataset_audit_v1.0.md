---
title: "External SFT Dataset Audit"
aliases: ["项目文档-xiaoan-finetune-reports-external_dataset_audit_v1.0"]
tags: [llm-wiki, migrated]
category: project
type: project
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "86b87e419b27"
summary: "External SFT Dataset Audit"
---

# External SFT Dataset Audit

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# External SFT Dataset Audit

- root: `[local path redacted]`
- recommendation: **do_not_directly_train**

## Train
- lines: 4
- strict_json_ok: 0
- python_literal_ok: 4
- failed_parse: 0
- candidate_rows: 4
- risk_markers: {'SECURITY NOTICE': 1, '[PATH]': 3, 'untrusted metadata': 3, 'thinking': 3, 'thinkingSignature': 1, '<final>': 1}

## Validation
- lines: 1
- strict_json_ok: 0
- python_literal_ok: 1
- failed_parse: 0
- candidate_rows: 1
- risk_markers: {'thinking': 1, 'untrusted metadata': 1}

## Note
- This audit only checks parseability and risk markers.
- Human review is required before mixing into production training.
