---
title: "yeet 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "13f2b93f8a01"
summary: "当用户明确要求“一次性完成 stage / commit / push / 开 PR”时使用。它是 GitHub 发布流的快速收口器，而不是通用 Git 技能。"
---

# yeet 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🚀 yeet 技能

> 当用户明确要求“一次性完成 stage / commit / push / 开 PR”时使用。它是 GitHub 发布流的快速收口器，而不是通用 Git 技能。

---

## 🛠️ 核心流程

- **鉴权预检**: 检查 `gh --version` 与 `gh auth status`。
- **分支策略**: 若当前在默认分支上，则新建描述型分支。
- **提交与推送**: `git add -A`、简短提交、推送带 tracking。
- **创建 Draft PR**: 用 `gh pr create --draft --fill` 起草 PR。

---

## 📖 适用场景

- **本轮改动已收口**: 用户要你直接把变更送上 GitHub。
- **需要统一发布流程**: 避免每次手写推送与 PR 命令。
- **适合作为最后一步**: 通常在修复、审阅、CI 验证之后触发。

---

## ⚠️ 注意事项

- **只在用户明确要求时触发**: 本技能不会默认代替正常开发流。
- **PR 描述要写实**: 不是占位模板，要交代问题、根因、修复和验证。
- **推送失败别硬怼**: 认证或远端冲突先处理，再继续发布流。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[GitHub]]
- [[gh-fix-ci]]
- [[gh-address-comments]]
- [[commit]]

---

*最后更新：2026-04-11*
