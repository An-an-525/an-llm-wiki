---
title: "多仓接入样例-仓库主控与LLM Wiki闭环"
aliases: ["articles-2026-04-14-多仓接入-样例"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "63678da6e3ef"
summary: "归档说明：当前 canonical 样例页见 2026-04-14-多仓接入样例。本页保留为历史叙述与对比样本。"
---

# 多仓接入样例-仓库主控与LLM Wiki闭环

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

> 归档说明：当前 canonical 样例页见 2026-04-14-多仓接入样例。本页保留为历史叙述与对比样本。

# 多仓接入样例-仓库主控与LLM Wiki闭环

> 这个样例说明：外部仓库先通过 `local-path-index` 形成可复现入口，再通过 `knowledge-pipeline-compile` 进入 `LLM Wiki` 压缩层，最后回链到项目任务看板和验收记录。

## 来源与动作

- 仓库真相源：`[local path redacted]`
- 外围路径索引：`local-path-index` 先行产出
- LLM Wiki 动作：`knowledge-pipeline-compile` 产出可复用条目
- 复核动作：`validate-note` 和 `knowledge-pipeline-status`

## 可复用结论

- 外部仓库必须先 index 再 compile，才会有可验证回溯链
- D 盘优先策略必须成为流水线标准字段的一部分，而不是可选说明
- `source_root`、`source_locator` 和 `evidence_archive_path` 要在条目里保持稳定

## 关联

- [[04 - 知识库/LLM Wiki/index]]
- [[04 - 知识库/LLM Wiki/log]]
- Obsidian-知识编译流水线-2026-04-11
- 本地物理资产全景索引
