---
title: "PROGRESS SNAPSHOT openclaw v2 100"
aliases: ["项目文档-xiaoan-finetune-PROGRESS_SNAPSHOT_openclaw_v2_100"]
tags: [llm-wiki, migrated]
category: project
type: project
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "64b66e129ecf"
summary: "PROGRESS SNAPSHOT openclaw v2 100"
---

# PROGRESS SNAPSHOT openclaw v2 100

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# PROGRESS SNAPSHOT openclaw v2 100

## 当前成果总结
- 完成 OpenClaw 重提取数据全流程验证：导入 -> 清洗 -> 二次筛选 -> 三点训练对比。
- 形成最终结论报告：`reports/training_comparison_openclaw_v2.0.md`。

## 结论
- 能力优先默认仍为 `policy-s80`（`output_round2_policy/final`）。
- refined OpenClaw 在 `s60` 有显著增益，可作为快速迭代档。

## 后续建议
- 下一轮做学习率微调（v1.2）以尝试让 refined mix 在高步数段不退化。
