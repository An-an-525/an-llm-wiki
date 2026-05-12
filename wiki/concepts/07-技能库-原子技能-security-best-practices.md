---
title: "security-best-practices 技能"
aliases: ["security-best-practices"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "78b256b028eb"
summary: "🛡️ security-best-practices 技能"
---

# security-best-practices 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🛡️ security-best-practices 技能

> 用于按语言/框架做安全最佳实践审阅，或在写代码时保持 secure-by-default。当前重点支持 `python / javascript-typescript / go`。

---

## 🛠️ 核心能力

- **识别语言与框架**: 先判断当前仓库真实技术栈。
- **装载对应安全参考**: 从技能 `references/` 中选对应栈的安全文档。
- **被动发现高风险问题**: 在正常开发时顺手识别重大安全弱点。
- **输出安全报告**: 当用户明确要求安全审计时，按严重度分层产出问题单。

---

## 📖 适用场景

- **需要安全评审**: 尤其是 Web、API、鉴权、敏感配置路径。
- **新代码要默认安全**: 不是事后补救，而是写的时候就按安全默认值。
- **适合当前本地主线**: 你的 Agent 平台 / Runtime / Policy Guard 设计天然需要这类约束。

---

## ⚠️ 注意事项

- **不是通用 code review 替代品**: 只在安全问题是核心目标时触发。
- **先识别完整技术栈**: 前后端都在时要两边一起看。
- **没有对应参考时要显式说明**: 不要装作已有框架级 guidance。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[security-threat-model]]
- [[technical-writer]]

---

*最后更新：2026-04-11*
