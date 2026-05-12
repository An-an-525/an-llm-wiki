---
title: "browser-use 技能"
aliases: ["browser-use"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "d8515183fdbf"
summary: "Make websites accessible for AI agents via visual interaction and long-flow automation."
---

# browser-use 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 👁️ browser-use 技能

> Make websites accessible for AI agents via visual interaction and long-flow automation.

---

## 🛠️ 核心功能

- **视觉决策**: 结合截图与 DOM 树，由 LLM 自主决定点击、滚动或输入。
- **端到端流程**: 处理多步登录、复杂表单及动态内容加载。
- **多后端支持**: 适配 LangChain, AutoGen 等 Agent 框架作为大脑。

---

## 📖 使用方法

### 基础交互
```python
from browser_use import Agent
agent = Agent(task="Search for deepseek on Google and summarize the top result")
await agent.run()
```

---

## ⚠️ 注意事项

- **算力开销**: 视觉模型推理较为耗时，建议在需要高精度交互时使用。
- **反爬规避**: 尽量模拟人类操作间隔，避免被目标网站封禁。

---

## 🔗 相关链接
- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- browser-control - 基础浏览器控制接口。
- playwright - 底层浏览器驱动引擎。
- collaborating-with-claude - 结合 Claude 进行复杂交互开发。

---
## 🧬 【Neuro-Link】
- **Upward (向上关联)**: 为 **mcc 后端中控** 提供网页 Agent 交互能力。
- **Downward (向下关联)**: 依赖底层驱动 **playwright** 及视觉模型推理能力。
- **Lateral (横向协作)**: 与 **browser-control** 形成“视觉+协议”的双重控制链路。
- **全局拓扑**: 位于 **技术栈关联矩阵** 的 L3 编排与框架层。

---
log:: 2026-04-10-详细行动存证
