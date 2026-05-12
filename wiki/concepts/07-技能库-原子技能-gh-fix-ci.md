---
title: "gh-fix-ci 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "d30d2088d67b"
summary: "用于调试和修复 GitHub Actions 失败检查。适合定位 PR checks、抓取日志片段、提炼失败上下文，并在审批后实施修复。"
---

# gh-fix-ci 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧪 gh-fix-ci 技能

> 用于调试和修复 GitHub Actions 失败检查。适合定位 PR checks、抓取日志片段、提炼失败上下文，并在审批后实施修复。

---

## 🛠️ 核心能力

- **定位失败检查**: 基于当前 PR 或指定 PR 拉取失败 checks。
- **抓取 Actions 日志**: 优先用内置脚本读取更稳的失败上下文。
- **提炼修复计划**: 先给出失败摘要和修复思路，再等批准执行。
- **仅覆盖 GitHub Actions**: 外部 CI（如 Buildkite）默认不做深度处理。

---

## 📖 使用场景

- **PR checks 红灯**: 当前最典型触发场景。
- **需要复核失败原因**: 不只是看结论，还要看 job log 里的 actionable snippet。
- **适合和本地 shell 联动**: 拉完失败上下文后，回到本机 repo 做修复和复验。

---

## ⚠️ 注意事项

- **先验证 `gh` 登录与 scope**: 一般至少需要 `repo + workflow`。
- **默认先给计划再改**: 技能设计是“先证据、后修复”，不是直接盲改。
- **不要把外部 CI 当 GitHub Actions 处理**: 非 GitHub 的 provider 只返回详情链接即可。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[GitHub]]
- [[gh-address-comments]]
- [[yeet]]

---

*最后更新：2026-04-11*
