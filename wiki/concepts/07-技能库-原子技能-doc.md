---
title: "doc 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "8edd01b9bf92"
summary: "用于读取、创建、编辑 `.docx` 文档，尤其在版式、表格、分页和视觉保真度重要时触发。底层优先 `python-docx`，并配合渲染检查。"
---

# doc 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📄 doc 技能

> 用于读取、创建、编辑 `.docx` 文档，尤其在版式、表格、分页和视觉保真度重要时触发。底层优先 `python-docx`，并配合渲染检查。

---

## 🛠️ 核心能力

- **结构化编辑 DOCX**: 标题、表格、列表、样式等。
- **视觉复核**: 通过 DOCX -> PDF -> PNG 的方式检查真实版式。
- **布局保真优先**: 当“看起来对不对”比“文本有没有”更重要时优先使用。
- **支持中间件工作流**: 约定中间文件放 `tmp/docs/`，最终产物放 `output/doc/`。

---

## 📖 适用场景

- **正式文档交付**: 报告、说明书、方案文档。
- **需要格式稳定**: 光抽文本不够，必须检查分页和表格布局。
- **适合和 [[pdf]] 配套**: DOCX 做编辑，PDF 做最终视觉验收。

---

## ⚠️ 注意事项

- **没法视觉复核时要提示风险**: 不能只改文本然后假定版式没坏。
- **依赖项可能缺失**: 需要 `python-docx`，做渲染时还需要额外系统工具。
- **临时文件要收敛**: 避免把文档中间态散落在工作区。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[pdf]]
- [[technical-writer]]

---

*最后更新：2026-04-11*
