---
title: "Apple SSD 集成说明"
aliases: []
tags: [llm-wiki, migrated]
category: project
type: project
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "47f81c1c8d80"
summary: "Embarrassingly Simple Self-Distillation Improves Code Generation (arXiv:2604.01193)"
---

# Apple SSD 集成说明

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Apple SSD 集成说明

## 参考论文

- Embarrassingly Simple Self-Distillation Improves Code Generation (arXiv:2604.01193)

## 本地落地映射

论文核心三步：

1. 用基础模型按特定解码参数采样（N=1）。
2. 不做验证器筛选，直接用原始输出构造蒸馏数据。
3. 用标准 SFT 在蒸馏数据上继续训练。

本项目对应脚本：

- 采样：`scripts/ssd_generate_self_distill.py`
- 合并：`scripts/ssd_merge_dataset.py`
- 训练：`train_adaptive.py` / `scripts/run_train.ps1`

## 默认参数（可改）

- `N=1`（固定）
- `Ttrain=1.2`（当前硬件与任务的保守默认）
- `top-k=20`
- `top-p=0.95`
- `max-prompts=20`（循环内小批量持续蒸馏）

> 说明：论文对 Qwen3-30B-Instruct 的一组设置是 `Ttrain=1.6, top-k=20, top-p=0.8`。本地当前以稳定性优先，默认值略保守，可在采样脚本参数中上调。

## 审计项

`scripts/audit_and_record.py` 会验证：

- `ssd:raw_file_exists`
- `ssd:merged_file_exists`
- `ssd:raw_rows>=5`
- `ssd:n_per_prompt_is_1`

## 迭代建议

1. 固定 `max-prompts=20` 连续跑 3-5 轮，观察任务成功率变化。
2. 若收益变小，增加难题占比而不是盲目增量。
3. 每轮保留审计和复盘记录，确保可回滚。
