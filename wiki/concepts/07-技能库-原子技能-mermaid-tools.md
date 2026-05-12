---
title: "mermaid-tools 技能"
aliases: ["mermaid-tools"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "f0c8122b7a29"
summary: "📊 mermaid-tools 技能"
---

# mermaid-tools 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📊 mermaid-tools 技能

> Extracts Mermaid diagrams from markdown files and generates high-quality PNG images using bundled scripts.

---

## 🛠️ 核心功能

- **自动化提取**: 自动扫描 Markdown 文件中的所有 Mermaid 代码块。
- **高质量生成**: 基于 `mermaid-cli` 生成高分辨率 PNG 图片。
- **智能适配**: 根据图表类型（时序图、架构图、流程图）自动调整输出尺寸。

---

## 📖 使用方法

### 基础生成命令
```bash
cd ~/.claude/skills/mermaid-tools/scripts
./extract-and-generate.sh "<markdown_file>" "<output_directory>"
```

### 环境变量调优
- `MERMAID_SCALE=3`: 提升渲染精度。
- `MERMAID_WIDTH=2400`: 强制设置输出宽度。

---

## ⚠️ 注意事项

- **目录限制**: 必须在 `scripts/` 目录下运行，以确保依赖定位正确。
- **环境要求**: 需要安装有 `google-chrome-stable` 和 `mmdc`。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- 文档处理

---

*最后更新：2026-04-10*
