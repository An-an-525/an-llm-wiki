---
title: "Agent 平台内化: Dify vs n8n"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: topic
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "64adc8b10932"
summary: "🚀 Agent 平台内化: Dify vs n8n"
---

# Agent 平台内化: Dify vs n8n

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🚀 Agent 平台内化: Dify vs n8n

> **核心理念**: **“让 AI 应用开发平台化 (Platform-as-a-Service)”**。通过低代码或工作流界面，将模型、数据和工具快速集成。

---

## 1. 🔍 Dify (137k★) - AI 应用原生
- **核心定位**: 为非技术或半技术人员构建 LLM 应用（Chatbot, Workflow, Agent）。
- **优势**:
    - **RAG 原生**: 内置了极其简单且功能强大的知识库上传、切分和检索。
    - **应用商店**: 丰富的模板。
    - **API 服务**: 每一个 Dify 应用都可以直接导出为标准的 OpenAI 兼容 API。

## 2. 🔗 n8n (183k★) - 业务自动化原生
- **核心定位**: 传统的业务流程自动化 (iPaaS)，现深度整合 AI。
- **优势**:
    - **节点极其丰富 (400+)**: 支持与几乎所有外部 SaaS (Google Sheets, Slack, Jira, Discord) 对接。
    - **复杂逻辑支持**: 支持 JavaScript 脚本节点，适合极其复杂的企业流程。
    - **AI 节点**: 集成了 LangChain 思想，可以轻松在流程中插入 AI 环节。

---

## 📊 差异对比

| 特性 | Dify | n8n |
| :--- | :--- | :--- |
| **主要目标** | 构建 AI 智能体应用 | 业务流程自动化 |
| **RAG 支持** | **极强 (核心功能)** | 较弱 (需外部集成) |
| **集成能力** | 适中 (主要通过 HTTP) | **极强 (原生 400+ 节点)** |
| **学习曲线** | 极低 | 中等 |

---

## 🚀 accio 演进启示
- **作为 `accio` 的上游**: 可以将 `accio` 的核心技能导出为 Webhook，被 Dify 或 n8n 调用。
- **界面灵感**: 学习 Dify 的知识库管理界面，改进 `accio` 在 Obsidian 之外的展示形式。

---
log:: [[06 - 周期回顾/2026-04-10-详细行动存证]]
