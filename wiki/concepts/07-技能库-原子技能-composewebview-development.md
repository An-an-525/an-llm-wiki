---
title: "composewebview-development 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "94aaf11035e0"
summary: "🛠️ composewebview-development 技能"
---

# composewebview-development 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🛠️ composewebview-development 技能

> Development and validation toolset for ComposeWebView multiplatform library. Focuses on implementation across Android, iOS, Desktop, JS, and WASM.

---

## 🛠️ 核心功能

- **多端实现校验**: 验证 `expect/actual` 声明在各平台（Android, iOS, WASM 等）是否对齐。
- **状态管理**: 强制执行基于 `WebViewState` 的统一状态流。
- **架构审计**: 确保 UI 与逻辑层（WebViewController）的解耦。

---

## 📖 关键准则

- **Kotlin 原生**: 优先使用 `Kotlinx Serialization` 处理 JSON。
- **不可变性**: 优先使用 `val` 而非 `var`。
- **空安全**: 严禁使用 `!!` 操作符，强制使用安全调用 `?.`。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[composewebview-documentation]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
