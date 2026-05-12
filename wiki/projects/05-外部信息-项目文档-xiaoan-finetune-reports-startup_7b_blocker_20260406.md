---
title: "7B Startup Blocker (2026-04-06)"
aliases: []
tags: [llm-wiki, migrated]
category: project
type: project
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "2a5c75bcf920"
summary: "7B Startup Blocker (2026-04-06)"
---

# 7B Startup Blocker (2026-04-06)

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 7B Startup Blocker (2026-04-06)

## 已执行动作
- 新增 `scripts/run_7b_qlora.ps1`，用于 7B QLoRA 的启动前检查与训练执行。
- 已执行启动命令：
  - `powershell -ExecutionPolicy Bypass -File .\scripts\run_7b_qlora.ps1 -DataPath .\data\mixed\train_data_policy_openclaw_refined_v1.json -OutputRoot .\output_7b_qlora -MaxSteps 40 -LearningRate 0.0002`

## 检查结果
- `torch` 版本：`2.5.1+cu121`
- `torch.version.cuda`：`12.1`
- `torch.cuda.is_available()`：`False`
- Windows 检测到显卡：`Intel(R) Arc(TM) Graphics`
- 未检测到 `NVIDIA` 显卡驱动链路（`nvidia-smi` 不可用）

## 结论
- 当前环境无法启动 7B QLoRA 训练，阻断点为 **NVIDIA CUDA 设备不可用**。

## 下一步（解锁 7B 必做）
1. 在系统层确保 NVIDIA 独显可见（设备管理器可见 NVIDIA GPU）。
2. 安装/修复 NVIDIA 驱动（并使 `nvidia-smi` 可执行）。
3. 重启后验证：
   - `nvidia-smi`
   - `python -c "import torch; print(torch.cuda.is_available(), torch.cuda.device_count())"`
4. 通过后重新执行：
   - `powershell -ExecutionPolicy Bypass -File .\scripts\run_7b_qlora.ps1`
