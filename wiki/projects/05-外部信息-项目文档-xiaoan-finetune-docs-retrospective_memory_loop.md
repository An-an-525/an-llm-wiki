---
title: "小安行动复盘与记忆迭代闭环"
aliases: ["项目文档-xiaoan-finetune-docs-retrospective_memory_loop"]
tags: [llm-wiki, migrated]
category: project
type: project
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "0c3b5a697f8f"
summary: "复盘结论进入记忆库（结构化）与知识库（可读）。"
---

# 小安行动复盘与记忆迭代闭环

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 小安行动复盘与记忆迭代闭环

## 目标

- 每一次行动后都能自动复盘。
- 复盘结论进入记忆库（结构化）与知识库（可读）。
- 下一次行动前先读取复盘结果，避免重复犯错。

## 闭环流程

1. **Action**：执行任务（训练、审计、工具调用、问题修复）。
2. **Observation**：记录结果、耗时、错误、关键输出。
3. **Retro**：复盘四件事：
   - 做对了什么（Keep）
   - 出错在哪里（Problem）
   - 根因是什么（Root Cause）
   - 下次怎么改（Next Action）
4. **Memory Write**：写入 `data/memory/events.jsonl`。
5. **Knowledge Update**：归纳到 `data/knowledge/lessons.md`。
6. **Index Sync**：同步到 `data/memory/xiaoan_memory.db`（可检索）。
7. **Pre-Action Recall**：下次行动前先检索最近高相关复盘。

## 执行要求

- 复盘内容必须包含 `RootCause` 与 `NextAction`。
- 风险项必须包含边界条件与回退策略。
- 若存在失败，必须在下次执行前读取对应复盘条目。

## 输出文件

- `data/memory/events.jsonl`
- `data/memory/xiaoan_memory.db`
- `data/knowledge/lessons.md`
