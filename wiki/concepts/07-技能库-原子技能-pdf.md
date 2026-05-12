---
title: "pdf 技能"
aliases: ["pdf"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "df7fc5f92fa8"
summary: "用于阅读、生成和复核 PDF，重点在于渲染后的视觉效果，而不是只抽取文本。创建时倾向 `reportlab`，检查时优先转图查看。"
---

# pdf 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧾 pdf 技能

> 用于阅读、生成和复核 PDF，重点在于渲染后的视觉效果，而不是只抽取文本。创建时倾向 `reportlab`，检查时优先转图查看。

---

## 🛠️ 核心能力

- **PDF 生成**: 通过 `reportlab` 生成版式更稳定的 PDF。
- **文本抽取**: 用 `pdfplumber` 或 `pypdf` 做快速检查。
- **视觉验收**: 用 Poppler 等工具把 PDF 页面渲染成图片后再确认。
- **中间产物规范化**: 临时文件放 `tmp/pdfs/`，最终产物放 `output/pdf/`。

---

## 📖 适用场景

- **正式输出件**: 发票、报告、导出文档、交付件。
- **需要检查渲染一致性**: 对齐、分页、字体和可读性都重要。
- **适合和 [[doc]] 互补**: DOCX 偏编辑，PDF 偏交付与最终验收。

---

## ⚠️ 注意事项

- **别把文本抽取当视觉验收**: 文本对不代表版式对。
- **系统依赖可能需要补装**: 视觉渲染通常需要 Poppler。
- **更适合“最终格式”阶段**: 如果还在重度编辑，先用 [[doc]] 更顺手。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[doc]]
- [[invoice-generator]]

---

*最后更新：2026-04-11*
