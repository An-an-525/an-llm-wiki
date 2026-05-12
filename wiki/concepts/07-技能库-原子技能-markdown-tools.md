---
title: "markdown-tools 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "279c972c255c"
summary: "🖋️ markdown-tools 技能"
---

# markdown-tools 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🖋️ markdown-tools 技能

> Comprehensive toolset for processing, optimizing, and transforming Markdown files.

---

## 🛠️ 核心功能

- **断链检测**: 自动扫描并修复文档中的失效链接。
- **格式美化 (Linting)**: 强制执行统一的标题级别、缩进及元数据规范。
- **表格处理**: 自动对齐散乱的 Markdown 表格。
- **内容拆分**: 基于标题或大小自动对长文档进行原子化拆分。

---

## 📖 使用方法

### 1. 修复断链
```bash
./scripts/fix_links.sh "/path/to/docs/"
```

### 2. 原子化拆分
```bash
python3 scripts/split_markdown.py large_doc.md --output ./output/
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- [[Obsidian]]
- [[笔记写入规范]]

---

*最后更新：2026-04-10*
