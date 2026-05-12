---
title: "SWE-agent ACI 概念内化: 针对 LLM 的计算机接口"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: topic
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "39397b9c1649"
summary: "🖱️ SWE-agent ACI 概念内化: 针对 LLM 的计算机接口"
---

# SWE-agent ACI 概念内化: 针对 LLM 的计算机接口

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🖱️ SWE-agent ACI 概念内化: 针对 LLM 的计算机接口

> **核心理念**: **“Agent-Computer Interface (ACI)”**。认为目前的操作系统界面（CLI/GUI）是为人类设计的，并不适合 LLM。需要为 Agent 量身定制“计算机接口”。

---

## 1. 🔍 核心技术亮点

### 1.1 ACI 设计原则
- **简化反馈**: 去掉不必要的进度条、颜色代码和冗余提示。
- **精准控制**: 提供 `list_files`, `search_string`, `edit_line` 等原子化工具，而非简单的 `cat` 或 `nano`。
- **上下文可见**: 确保 Agent 在修改文件时，始终能看到相关的行号和上下文。

### 1.2 成功案例 (SWE-bench)
- 通过极简的 ACI，仅用 100 行 Python 代码就实现了极高的 GitHub 问题修复率。

---

## 🚀 accio 演进启示
- **工具原子化**: 我们的 `edit` 工具已体现了 ACI 思想。未来应进一步精简工具的输出（Output），只给 Agent 喂“最高信噪比”的数据。
- **环境感知**: 为 Agent 提供更清晰的“当前路径”和“状态快照”。

---
log:: [[06 - 周期回顾/2026-04-10-详细行动存证]]
