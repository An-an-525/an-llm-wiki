---
title: "AutoGen 对话模式内化: 动态路由与多 Agent 协作"
aliases: ["AutoGen_Conversation_Patterns"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "8272cf5fde95"
summary: "💬 AutoGen 对话模式内化: 动态路由与多 Agent 协作"
---

# AutoGen 对话模式内化: 动态路由与多 Agent 协作

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 💬 AutoGen 对话模式内化: 动态路由与多 Agent 协作

> **核心理念**: **“对话即协作 (Conversation-driven Control)”**。通过 Agent 之间的自然语言交互，驱动代码生成与任务解决。

---

## 1. 🔄 核心对话模式

### 1.1 自动回复机制 (Auto-reply)
- **原理**: Agent 接收到消息后，根据内部逻辑自动生成回复，无需显式编程每个转场。
- **钩子机制**: 允许在回复前后插入自定义函数。

### 1.2 动态路由 (Dynamic Routing)
- **Group Chat Manager**: 作为一个“主持人”，根据上下文实时决定下一个发言的 Agent。
- **有限状态机 (FSM)**: 限制 Agent 之间的转换路径（如 A 只能跟 B 说话）。

---

## 2. 🧩 关键特性

- **代码执行环境**: 原生支持在沙盒中运行 Agent 生成的代码（Code Executor）。
- **多模态对话**: 支持视觉、语音等多模态 Agent 参与同一对话流。

---

## 🚀 accio 演进启示
- **增强内评机制**: 在生成最终文档前，允许不同专家 Agent 进行“多轮审议”。
- **对话驱动控制**: 减少繁琐的 API 封装，更多利用“自然语言驱动”的模式来编排工具调用。

---
log:: 2026-04-10-详细行动存证
