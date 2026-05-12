---
title: "beautiful-mermaid-ascii 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "92e8873052af"
summary: "🔠 beautiful-mermaid-ascii 技能"
---

# beautiful-mermaid-ascii 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🔠 beautiful-mermaid-ascii 技能

> Render Mermaid diagrams as readable ASCII/Unicode art in the terminal from .mmd files or Markdown code blocks.

---

## 📖 快速上手

### 1. 渲染 Mermaid 文件
```bash
mermaid-ascii path/to/diagram.mmd
```

### 2. 渲染 Markdown 中的代码块 (1-based)
```bash
# 渲染 README.md 中的第 2 个 Mermaid 块
mermaid-ascii --md README.md --block 2
```

### 3. 从标准输入 (stdin) 渲染
```bash
cat diagram.mmd | mermaid-ascii
```

---

## 🛠️ 安装方法

使用 symlink 安装到 PATH：
```bash
./scripts/install-mermaid-ascii
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[mermaid-tools]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
