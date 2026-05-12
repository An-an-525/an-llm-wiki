---
title: "figlet-text-converter 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "db4408421b9d"
summary: "🎨 figlet-text-converter 技能"
---

# figlet-text-converter 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🎨 figlet-text-converter 技能

> Processes files containing `<figlet>` tags and replaces them with ASCII art representations. Supports 400+ fonts and intelligently preserves comment styles.

---

## 🛠️ 标签语法

在文件中任何位置插入标签：
```html
// <figlet font="3-D">Text</figlet>
```

### 支持的注释风格
- `//` (JavaScript, PHP)
- `#` (Python, Bash)
- `--` (SQL)
- `/* ... */` (Java, CSS)

---

## 📖 核心工作流

1. **读取文件**: 扫描所有 `<figlet>` 标签。
2. **生成艺术字**: 基于 `figlet` 库生成内容。
3. **环境检测**: 自动识别环绕的注释风格。
4. **回写文件**: 替换标签并保持缩进。

---

## 💡 常用命令

- **处理文件**: `node scripts/process-file.js <file-path>`
- **列出字体**: `node scripts/list-fonts.js`

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[beautiful-mermaid-ascii]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
