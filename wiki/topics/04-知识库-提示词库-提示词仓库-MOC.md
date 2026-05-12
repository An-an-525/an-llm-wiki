---
title: "提示词仓库 MOC"
aliases: ["提示词仓库-MOC"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "b203fd67336d"
summary: "建立'最佳 agent **提示词内容仓库**'，支持多 Agent 可复用、可版本化、可审计。"
---

# 提示词仓库 MOC

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

> [!abstract] 目标
> 建立"最佳 agent **提示词内容仓库**"，支持多 Agent 可复用、可版本化、可审计。

> [!warning] 原则
> 提示词**不是散落文本**，而是"可调用资产"（带元数据、适用范围、失败模式、示例输入输出）。

---

## 快速入口

- [[提示词-总控-系统主控执行引擎]] — Controller 角色：拆解/派发/验证/交付
- 提示词-写入-黑曜石AOS写入协议 — No Link No File、KB/AM 隔离、DoD

---

## 分类导航

| 分类 | 路径 | 说明 |
|------|------|------|
| 总控 (Controller) | `controller/*` | 系统主控执行引擎 |
| 研发 (Engineering) | `eng/*` | 代码生成/重构/测试/运维 |
| 研究 (Research) | `research/*` | 调研、对比、选型、证据链 |
| QA/审计 (Audit) | `qa/*` | 破坏性审计、DoD 评估、回归 |

---

> [!danger] 约定（给 agent 的硬规则）
> 每份提示词**必须**包含：
> - **适用场景**
> - **输入/输出格式**
> - **禁止事项**
> - **验收标准**
> - **关联链接**（至少 2 个）

---

> [!cite] 相关链接
> · [[提示词-总控-系统主控执行引擎]] · 提示词-写入-黑曜石AOS写入协议 · OpenClaw 主控核心执行协议 · Codex 主控行为规范与执行逻辑优化
