---
title: "issue-create 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "c73e4bb41a49"
summary: "Create well-formatted GitHub issues with AI-powered label suggestions and content type detection."
---

# issue-create 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🎫 issue-create 技能

> Create well-formatted GitHub issues with AI-powered label suggestions and content type detection.

---

## 🛠️ 核心特性

- **自动检测**: 识别当前 Git 仓库权限与名称。
- **智能打标**: 基于仓库现有体系推荐标签。
- **标题优化**: 自动提取内容摘要并添加类型前缀（Bug:, Feature:）。
- **内容最大化**: 优化 Issue Body 以利用 GitHub 65,536 字符限制。

---

## 📖 调用方式

### 1. 斜杠命令
`/gh-tools:issue-create`

### 2. 自然语言触发
- "Create an issue about..."
- "File a bug for..."

---

## ⚠️ 编写准则

- **拒绝碎片化**: 一个完整的 Issue 胜过多个碎片化评论。
- **包含上下文**: 必须包含备选方案、权衡、证据及决策因果。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[GitHub 技能]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
