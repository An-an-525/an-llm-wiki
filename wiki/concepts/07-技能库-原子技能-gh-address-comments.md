---
title: "gh-address-comments 技能"
aliases: ["gh-address-comments"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "f20b92b85d82"
summary: "💬 gh-address-comments 技能"
---

# gh-address-comments 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 💬 gh-address-comments 技能

> 处理当前分支对应 GitHub PR 上的 review comments / review threads。适合“拉评论、编号、解释影响、按用户选择逐条修复”的工作流。

---

## 🛠️ 核心能力

- **定位当前分支 PR**: 依赖 `gh` CLI 查询当前分支对应的开放 PR。
- **拉取评论与线程**: 借助脚本获取待处理 review threads。
- **编号和摘要化**: 把评论整理成可选择的修复清单。
- **按选择修复**: 在用户确认后，仅处理指定评论项。

---

## 📖 使用条件

- **先确认 `gh` 已登录**: 必须先通过 `gh auth status`。
- **适用于 PR 评审收口**: 当问题已经不是“写功能”，而是“消 review comments”时触发。
- **仍需主控验收**: 技能负责检索和修补，最终是否合并仍由主控判断。

---

## ⚠️ 注意事项

- **不要越权扩改**: 只修复用户点名的评论，不顺手改 unrelated 范围。
- **网络依赖强**: `gh` 认证或速率出错时，需要先恢复认证链。
- **和 CI 修复分工不同**: 评论处理用本技能，流水线报错排查用 [[gh-fix-ci]]。

---

## 🔗 相关链接

- [[技能库 MOC]]
- GitHub
- [[gh-fix-ci]]
- [[yeet]]

---

*最后更新：2026-04-11*
