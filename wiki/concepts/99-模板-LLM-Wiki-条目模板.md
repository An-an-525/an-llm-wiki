---
title: "LLM Wiki 条目模板"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "860cd88990e2"
summary: "用于把 `raw` 原料压缩为可复用、可审核、可追溯的知识条目。Obsidian 层只承接压缩和导航，不承接仓库事实真相。"
---

# LLM Wiki 条目模板

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# LLM Wiki 条目模板

> 用于把 `raw` 原料压缩为可复用、可审核、可追溯的知识条目。Obsidian 层只承接压缩和导航，不承接仓库事实真相。

## 建议模板

```md
---
title: <条目标题>
date: YYYY-MM-DD
updated: YYYY-MM-DD HH:mm
tags: [llm-wiki, <topic>, <type>, <project-key>]
status: active
uid: <stable-id>
source: Obsidian-知识编译流水线-2026-04-11
storage_tier: compiled
source_locator: [[00 - 协作缓冲区/01 - Inbox/raw/...]]
source_root: [local path redacted]<repo>\...
evidence_archive_path: [local path redacted]<repo>\<yyyy-mm-dd>-...
raw_size_mb: 0.0
codex_next_action: <required|none|defer>
review_status: pending
last_validated: YYYY-MM-DD
owner: Codex
llm_reuse_scope: project
---

# <条目标题>

> 一句话说明为什么这条内容值得编译进知识库，而不是保留为仓库原文。

## 来源

- 原始来源：`<URL or internal note>`
- 获取方式：Web Clipper / 对话摘要 / 本地脚本
- 原料位置：`<raw note path>`
- 仓库真相源：`<repo canonical path>`

## 核心摘要

- 

## 关键概念

- 

## 可复用结论

- 

## 外部接入验证

- storage_tier:
- evidence_archive_path:
- codex_next_action:
- review_status:
- last_validated:

## 影响与风险

- 未决问题：
- 需要补充证据：

## 关联

- [[04 - 知识库/LLM Wiki/index]]
- [[04 - 知识库/LLM Wiki/log]]
- <仓库 task board 或 acceptance 链接>
```

## 使用约束

- 条目必须有 YAML frontmatter，并包含 `storage_tier`、`source_locator`、`source_root`
- 条目必须至少保留 2 个 `wiki link`
- 条目必须在 `04 - 知识库/LLM Wiki/index.md` 或专题 MOC 中登记
- 每条新增或改写都应回写 `log.md` 的对应字段
- 验收前必须执行 `obsidian-aos --json validate-note <path>`

## 关联

- Obsidian-知识编译流水线-2026-04-11
- [[04 - 知识库/LLM Wiki/index]]
- [[04 - 知识库/LLM Wiki/log]]
