---
title: "LLM Wiki Index"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: topic
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "99db30341776"
summary: "[!abstract] LLM Wiki 定位"
---

# LLM Wiki Index

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

> [!abstract] LLM Wiki 定位
> LLM Wiki 是**可复用结论压缩层**，只放可核验的抽象，不放仓库原始事实。
> 更多上下文见 [[04 - 知识库/知识库架构设计#索引层 — 知识复用引擎与自动化|索引层 - 知识复用引擎]]。

## 目录结构

| 目录 | 用途 |
|------|------|
| `articles/` | 网页、博客、长文和流程样例 |
| `papers/` | 论文与实验结论 |
| `concepts/` | 概念与方法拆解 |
| `comparisons/` | 方案对比与冲突点 |
| `sources/` | 来源登记与证据映射 |

## 当前样例

- [[04 - 知识库/LLM Wiki/articles/2026-04-11-Agentic-Wiki-编译样本|Agentic Wiki 编译样本]]
- [[04 - 知识库/LLM Wiki/articles/2026-04-14-多仓接入样例|多仓接入样例]]
- [[04 - 知识库/LLM Wiki/articles/2026-05-01-Codex-会话历史导入与上下文沉淀|Codex 会话历史导入与上下文沉淀]]

> [!warning] 告警规则
> - 出现 C 盘异常持久化或无 `storage_tier` 的条目 → 先挂**待修复**
> - 缺失仓库真相链接或验收字段的条目 → **不纳入主导航**
> - `llm_reuse_scope` 未声明的条目 → 默认**不当作已批准复用**

## 推荐入口

- [[99 - Agent指南与规范/00-开始 here|全系统指挥中心]]
- [[99 - Agent指南与规范/Obsidian-知识编译流水线-2026-04-11|知识编译流水线]]
- [[99 - 模板/LLM Wiki 条目模板|Wiki 条目模板]]
- [[04 - 知识库/本地物理资产全景索引|物理资产全景索引]]
- [[04 - 知识库/LLM Wiki/log|Wiki 导入日志]]
- [[04 - 知识库/LLM Wiki/sources/2026-05-01-Codex-历史导入源登记|Codex 历史导入源登记]]
