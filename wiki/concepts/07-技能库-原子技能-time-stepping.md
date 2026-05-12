---
title: "time-stepping 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "6ba4fe586012"
summary: "🕒 time-stepping 技能"
---

# time-stepping 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🕒 time-stepping 技能

> Plan and control time-step policies. Couples physics stability limits with adaptive stepping and checkpoint schedules.

---

## 🛠️ 核心策略

### 1. 步长选择
- 遵循显式限制：`min(dt_target, dt_limit × safety)`。
- 无已知限制时：保守起步，逐步增加。

### 2. 启动平滑 (Ramping)
- **尖锐梯度**: 5-10 步，初始 `0.1 × dt`。
- **相变**: 10-20 步，初始 `0.01 × dt`。

---

## 📖 常用脚本

- `timestep_planner.py`: 生成步长计划表。
- `output_schedule.py`: 规划输出时间点。
- `checkpoint_planner.py`: 计算最优检查点频率以最小化算力浪费。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[numerical-stability]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
