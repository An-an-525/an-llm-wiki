---
title: "document-converter-suite 技能"
aliases: ["document-converter-suite"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "87fd48b35d1c"
summary: "📄 document-converter-suite 技能"
---

# document-converter-suite 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📄 document-converter-suite 技能

> Convert PDFs, Office docs, markdown, HTML, and tables between editable formats. Focuses on structure preservation.

---

## 🛠️ 支持格式

`pdf`, `docx`, `pptx`, `xlsx`, `txt`, `csv`, `md`, `html`。

---

## 📖 核心工作流

1. **确认格式**: 明确源格式与目标格式。
2. **选择脚本**: 
    - 单个文档: `scripts/convert.py`。
    - 文件夹: `scripts/batch_convert.py`。
3. **特定任务**: 
    - PDF 合并/拆分: `scripts/pdf_toolkit.py`。
    - 表格提取: `scripts/table_extractor.py`。
    - 表单填充: `scripts/form_filler.py`。

---

## ⚠️ 限制提示

- **视觉保真度**: 转换结果为“最佳努力”，可能丢失复杂布局。
- **扫描件**: 必须作为 OCR 问题处理，而非普通转换。

---

## 🔗 相关链接

- [[技能库 MOC]]
- 文档处理
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
