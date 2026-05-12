---
title: "castella-a2a 技能"
aliases: ["castella-a2a"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "6c39d2b0f189"
summary: "Connect to A2A (Agent-to-Agent) protocol agents from Castella. Communicate with agents, display agent cards, and handle message streams."
---

# castella-a2a 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🤝 castella-a2a 技能

> Connect to A2A (Agent-to-Agent) protocol agents from Castella. Communicate with agents, display agent cards, and handle message streams.

---

## 🛠️ 核心特性

- **协议对齐**: 实现标准的 A2A 通信协议，支持代理发现与能力协商。
- **异步支持**: 全面支持 `async/await` 异步消息发送与流式响应 (Streaming)。
- **元数据同步**: 自动解析 Agent Card，提取 `capabilities`, `version`, `supportedEventTypes` 等关键信息。

---

## 📖 快速上手 (Python)

```python
from castella.a2a import A2AClient

# 连接远程 A2A 代理
client = A2AClient("http://agent.example.com")

# 发送询问
response = client.ask("Tell me about your available skills")
print(response)
```

---

## 📋 核心类与方法

- `A2AClient`: 主通信类。
- `ask_stream()`: 异步获取流式回复。
- `agent_card`: 访问完整的代理元数据。

---

## 🔗 相关链接

- [[技能库 MOC]]
- ACP 协议白皮书
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
