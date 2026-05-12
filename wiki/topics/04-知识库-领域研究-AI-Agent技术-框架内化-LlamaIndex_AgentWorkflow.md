---
title: "LlamaIndex AgentWorkflow 内化: RAG 原生与数据驱动"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: topic
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "b2148384133a"
summary: "📊 LlamaIndex AgentWorkflow 内化: RAG 原生与数据驱动"
---

# LlamaIndex AgentWorkflow 内化: RAG 原生与数据驱动

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📊 LlamaIndex AgentWorkflow 内化: RAG 原生与数据驱动

> **核心理念**: **“以数据为中心的智能体 (Data-Centric Agents)”**。利用强大的检索与索引能力，构建专门处理复杂文档的工作流。

---

## 1. 🏗️ 核心组件

### 1.1 AgentWorkflow
- **定义**: 专注于“文档 -> 洞察”的特定工作流。
- **优势**: 相比通用 Agent，在长文本内化、结构化数据提取上具有更高的鲁棒性。

### 1.2 数据智能体 (Data Agents)
- **逻辑**: Agent 可以自主决定何时查询向量库、何时调用 API、何时生成总结。

---

## 2. 🧩 核心模式

- **Router Query Engine**: 自动选择最合适的知识库进行查询。
- **Sub-Question Query Engine**: 将复杂查询拆解为多个子查询。

---

## 🚀 accio 演进启示
- **RAG 深度整合**: 优化 `05 - 外部信息` 的内化流程，利用 LlamaIndex 的思想建立“自动熟化流水线”。
- **文档专家角色**: 强化 `technical-writer-pro` 在大规模文档处理时的“多子查询”能力。

---
log:: [[06 - 周期回顾/2026-04-10-详细行动存证]]
