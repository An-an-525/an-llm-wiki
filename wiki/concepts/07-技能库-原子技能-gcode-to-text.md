---
title: "gcode-to-text 技能 (Letta)"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "64542a77d3cd"
summary: "🧠 gcode-to-text 技能 (Letta Development)"
---

# gcode-to-text 技能 (Letta)

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧠 gcode-to-text 技能 (Letta Development)

> Comprehensive guide for developing Letta agents, including architecture selection, memory design, model selection, and tool configuration.

---

## 🏗️ 架构选型 (Architecture Selection)

- **letta_v1_agent (推荐)**: 适用于新项目，支持 GPT-4o、Claude 3.5 等推理模型，系统提示词更简单。
- **memgpt_v2_agent**: 适用于维护旧版 Agent 或需要特定 V2 工具模式的场景。

---

## 💾 记忆架构设计 (Memory Architecture)

Letta 提供三类记忆，需在 context window 80% 以内平衡：
1. **Core Memory**: 始终在上下文中（Persona, Human context）。
2. **Archival Memory**: 向量数据库语义搜索（大知识库、历史记录）。
3. **Conversation History**: 当前对话流搜索。

---

## 🛠️ 工具配置原则

- **极简开始**: 仅挂载 Agent 主动使用的工具。
- **常用工具**: `memory_insert`, `memory_replace`, `file_system` 是多数 Agent 的标配。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[记忆生命周期管理]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
