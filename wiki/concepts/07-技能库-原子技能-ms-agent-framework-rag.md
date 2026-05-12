---
title: "ms-agent-framework-rag 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "1f3e36d7b493"
summary: "🧠 ms-agent-framework-rag 技能"
---

# ms-agent-framework-rag 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧠 ms-agent-framework-rag 技能

> Microsoft Agent Framework Plugin for specialized RAG (Retrieval-Augmented Generation) operations.

---

## 🛠️ 核心功能

- **文档摄取**: 支持多种格式文档的语义分块。
- **向量检索**: 基于向量空间搜索提供高相关性上下文。
- **意图分析**: 智能识别查询意图以选择最佳检索路径。

---

## 📖 使用方法

### 初始化检索器
```python
from ms_agent_rag import RagPlugin
rag = RagPlugin(config_path="config.json")
```

### 执行查询
```python
context = rag.retrieve("How to configure ACP protocol?")
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- [[LlamaIndex]] - 行业标杆 RAG 框架。
- [[sqlite-vectordb]] - 本地向量存储后端。
- [[记忆生命周期管理]]

---

*最后更新：2026-04-10*
