---
title: "security-threat-model 技能"
aliases: ["security-threat-model"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "588382a4c280"
summary: "🧠 security-threat-model 技能"
---

# security-threat-model 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧠 security-threat-model 技能

> 面向代码仓和项目路径的仓库落地型威胁建模。重点不是泛化 checklist，而是从 repo 证据中提取信任边界、资产、攻击路径和缓解措施。

---

## 🛠️ 核心能力

- **抽取系统模型**: 识别组件、运行方式、入口点与外部集成。
- **枚举信任边界与资产**: 例如凭证、配置、审计日志、可用性关键组件。
- **建模攻击者能力**: 基于实际暴露面，而不是空想最强对手。
- **输出滥用路径与缓解项**: 把风险写成可执行 Markdown threat model。

---

## 📖 适用场景

- **架构阶段的安全设计**: 当前 Agent 平台、Policy Guard、Tool Gateway 都很适合先做威胁建模。
- **仓库落地式 AppSec**: 适合已有代码/文档仓，而不是纯概念讨论。
- **适合和安全最佳实践配套**: 先建模，再做 [[security-best-practices]] 审查。

---

## ⚠️ 注意事项

- **每个架构判断都要能追到 repo 证据**: 不能脑补组件。
- **要分清运行时和开发工具链**: CI/build/dev tooling 不应和生产面混写。
- **严重度要贴合真实攻击面**: 避免为了显得“专业”而夸大威胁。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[security-best-practices]]
- 技术栈关联矩阵

---

*最后更新：2026-04-11*
