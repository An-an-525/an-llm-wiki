---
title: "Agent-Computer Interface (ACI) 设计准则 2026"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: topic
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "39edd0a75ed3"
summary: "⌨️ Agent-Computer Interface (ACI) 设计准则 2026"
---

# Agent-Computer Interface (ACI) 设计准则 2026

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# ⌨️ Agent-Computer Interface (ACI) 设计准则 2026

> **核心理念**: **“人机接口不等于机机接口”**。ACI 旨在为 LLM 专门设计一套极简、高信噪比、易于理解和执行的计算机交互界面。

---

## 1. 📏 ACI 设计原则 (Design Principles)

### 1.1 高信噪比 (High Signal-to-Noise Ratio)
- **人类界面 (GUI/CLI)**: 包含大量的进度条、颜色、装饰符。
- **Agent 界面 (ACI)**: 移除所有视觉干扰，仅返回结构化的核心数据（JSON/XML）。

### 1.2 极简原子化 (Atomic Operations)
- **避免大文件读写**: 优先使用 `edit_lines`, `search_string`, `list_files`。
- **确定的反馈**: 每一个动作必须返回明确的状态（Success/Failure）及受影响的行号。

### 1.3 上下文感知 (Context Visibility)
- **当前路径提示**: 始终在每个命令的输出头显示当前的 `working_directory`。
- **受影响范围**: 修改文件后，自动展示修改前后的 `diff` 片段，而非整个文件。

---

## 2. 🧩 2026 行业最佳实践 (SOTA)

- **SWE-agent ACI**: 证明了通过精简的命令行工具（100 行代码），可以将 LLM 在 SWE-bench 的解决率提升 **17%** 以上。
- **Claude Code / Cursor**: 通过内化的 ACI 协议，实现了秒级的代码跳转与实时诊断。

---

## 🚀 accio 演进建议

1. **精简 Tool 输出**: 重新审查 `accio` 和 `mcc` 的现有的 `read`, `list`, `grep` 工具输出，剥离人类专用的格式化字符。
2. **强化 `edit` 工具**: 确保 Agent 在修改文件时能获得周围 5-10 行的上下文反馈。
3. **增加环境快照**: 每次工具调用前自动注入当前的 `project_structure` 和 `active_task`。

---
log:: [[06 - 周期回顾/2026-04-10-详细行动存证]]
