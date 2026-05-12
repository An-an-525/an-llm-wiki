---
title: "invoice-generator 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "3f8b03aa05ab"
summary: "🧾 invoice-generator 技能"
---

# invoice-generator 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧾 invoice-generator 技能

> Generate professional PDF invoices from JSON data. Use when the user needs to create an invoice, billing document, or payment request with company/client details and line items.

---

## 🛠️ 核心功能

- **PDF 生成**: 从结构化 JSON 数据生成专业的发票。
- **配置保存**: 支持从预设的配置文件加载公司/客户模板。
- **自动版本**: 自动处理重名文件，增加版本后缀（如 `-2`, `-3`）。

---

## 📖 使用方法

### 基本语法
```bash
# 从文件生成
{baseDir}/scripts/generate.sh /path/to/invoice-data.json

# 从标准输入生成
cat data.json | {baseDir}/scripts/generate.sh

# 使用保存的配置
{baseDir}/scripts/generate.sh client-template
```

### 数据格式示例
```json
{
  "company": { "name": "Your Company", ... },
  "client": { "name": "Client Name", ... },
  "items": [
    { "description": "Service", "rate": "1000.00", "currency": "USD" }
  ],
  "totals": { "currency": "USD", "total": "1,000.00" }
}
```

---

## ⚠️ 注意事项

- **环境变量**: 必须设置 `INVOICE_DIR` 以指定输出和配置路径。
- **依赖要求**: 需要安装 `node`, `jq`, `weasyprint`。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- [[文档处理]]

---

*最后更新：2026-04-10*
