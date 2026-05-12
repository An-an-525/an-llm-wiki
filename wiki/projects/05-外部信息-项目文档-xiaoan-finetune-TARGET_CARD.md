---
title: "TARGET_CARD"
aliases: ["项目文档-xiaoan-finetune-TARGET_CARD"]
tags: [llm-wiki, migrated]
category: project
type: project
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "96dec1f14ad9"
summary: "完成小安第2轮微调（策略混合数据），并交付可复现、可审计、可对比的一轮训练成果。"
---

# TARGET_CARD

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

## 终极目标
完成小安第2轮微调（策略混合数据），并交付可复现、可审计、可对比的一轮训练成果。

## 成功标准
- 标准 1: 使用 `train_data_policy_v1.json` 成功完成第2轮训练（无中断，产出适配器文件）。
- 标准 2: 训练后审计与完成性报告为 PASS，且关键流程可重复执行。
- 标准 3: 形成第1轮 vs 第2轮指标对比（至少包含 train_loss、eval_loss、训练时长）。

## 绝对禁止
- 禁止事项 1: 不经验证直接宣称完成或性能提升。
- 禁止事项 2: 擅自扩展与当前目标无关的新功能。
- 禁止事项 3: 跳过状态更新、决策记录和检查点快照。
