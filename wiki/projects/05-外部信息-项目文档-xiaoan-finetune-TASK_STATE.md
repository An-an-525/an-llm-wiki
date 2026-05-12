---
title: "TASK_STATE"
aliases: ["项目文档-xiaoan-finetune-TASK_STATE"]
tags: [llm-wiki, migrated]
category: project
type: project
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "d64790fb3c1b"
summary: "在可复现与可审计前提下，完成小安第2轮策略数据微调并产出可验证的训练结果与阶段性报告。"
---

# TASK_STATE

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# TASK_STATE

## 任务总目标
在可复现与可审计前提下，完成小安第2轮策略数据微调并产出可验证的训练结果与阶段性报告。

## 阶段划分（检查点）
- 阶段 1 (0-25%): 建立任务治理与状态持久化（状态文件、目标卡、决策日志）
- 阶段 2 (25-50%): 准备并验证训练输入（策略数据集、格式、dry-run、依赖）
- 阶段 3 (50-75%): 执行第2轮训练并监控关键日志（步进、loss、eval）
- 阶段 4 (75-100%): 验收与交付（审计、完成性报告、对比结论、遗留项）

## 当前阶段
- 当前阶段：v1.2 全量落地阶段（LR grid）(100%)
- 进度：100%
- 状态：completed

## 已完成事项清单
- [x] 项目根目录固定到 `[local path redacted]`
- [x] 4来源策略构建脚本与配置落地（`build_sft_dataset_by_policy.py`、`sft_data_policy.yaml`）
- [x] 自主验证链路通过（策略集构建 + dry-run + audit/completion PASS）
- [x] 创建本任务状态文件 `TASK_STATE.md`
- [x] 创建目标卡 `TARGET_CARD.md`
- [x] 创建决策日志 `DECISION_LOG.md`
- [x] 生成 25% 快照 `PROGRESS_SNAPSHOT_025.md`
- [x] 第2轮训练前预检完成（policy 数据 dry-run 通过）
- [x] 生成 50% 快照 `PROGRESS_SNAPSHOT_050.md`
- [x] 生成 75% 快照 `PROGRESS_SNAPSHOT_075.md`
- [x] 执行第2轮正式训练（policy_v1 数据，max_steps=80）
- [x] 训练后审计与完成性报告
- [x] 对比第1轮与第2轮核心指标并形成结论
- [x] 生成 100% 快照与最终验收清单

## 待办事项清单
- [x] 执行网格实验 A：policy_v1 + `max_steps=40`
- [x] 执行网格实验 B：policy_v1 + `max_steps=60`
- [x] 汇总并生成 `reports/training_comparison_v1.1.md`
- [x] 生成 v1.1 的 25%/50%/75%/100% 快照
- [x] 新增 OpenClaw 数据导入清洗脚本 `import_openclaw_sft_dataset.py`
- [x] 生成清洗后数据 `data/imported/openclaw_clean/messages_v1.json`
- [x] 完成导入数据 dry-run 验证（train=4, eval=1）
- [x] 接入重提取数据（309 -> 清洗后184）
- [x] 10%并入 pilot 训练（s40）完成
- [x] 完成二次语义筛选（184 -> 33）
- [x] 完成 refined mix 的 s40/s60/s80 三点验证
- [x] 产出对比结论 `reports/training_comparison_openclaw_v2.0.md`
- [x] 新增训练脚本可配置超参（LR/WD/warmup/LoRA/eval-save）
- [x] 新增指标抽取脚本 `extract_training_metrics.py`
- [x] 新增 v1.2 网格执行脚本 `run_v12_lr_grid.ps1`
- [x] 产出最佳实践对齐审核 `docs/optimization_audit_best_practices_v1.0.md`
- [x] 完成断电恢复修复（`run_v12_lr_grid.ps1` 增加断点续跑）
- [x] 修复重启后 HF 连接失败（`train_adaptive.py` 强制禁用系统代理）
- [x] 执行 `run_v12_lr_grid.ps1` 完整网格（s80）
- [x] 输出 `output_v12_lr_grid/summary.json` 与 `summary.csv`
- [x] 生成 `reports/training_comparison_v2.1.md`
- [x] 更新决策与快照并完成 100% 验收
- [x] 完成 v1.2 最优参数正式复验训练（`output_formal/round_v12_best_20260406_054426`）

## 关键决策记录（摘要）
- 决策 A：采用“状态文件 + 决策日志 + 进度快照”治理长任务，降低上下文丢失风险。
- 决策 B：第2轮训练继续使用策略集 `train_data_policy_v1.json`，保证输入可复现。
- 决策 C：每个子任务完成后立即验证并更新状态，不跨阶段跳步。
- 决策 D：v1.2 网格最终采用 `lr=1.2e-4` 作为新的默认 CPU 学习率（80 steps）。
