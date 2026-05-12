---
title: "composewebview-documentation 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "bf2c095fddd3"
summary: "📚 composewebview-documentation 技能"
---

# composewebview-documentation 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📚 composewebview-documentation 技能

> Performs code quality checks and reviews for ComposeWebView. Validates expect/actual implementations, KDoc coverage, Spotless formatting, and multiplatform patterns.

---

## 🛠️ 审计分类

1. **格式规范 (Spotless)**: 执行 `gradlew spotlessCheck` 强制代码整洁。
2. **多端对齐**: 检查所有 `expect` 声明是否在 Android, iOS, Desktop, JS, WASM 中均有 `actual` 实现。
3. **KDoc 覆盖**: 确保所有 `public` API 具备完整的 KDoc 文档。
4. **测试覆盖**: 验证 `commonTest` 及平台特定测试的完整性。

---

## 📖 自动化审核命令

```bash
# 执行完整审核工作流
bash .agents/skills/code-review/scripts/review_checklist.sh
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[composewebview-development]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
