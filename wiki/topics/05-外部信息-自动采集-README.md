---
title: "自动采集目录说明"
aliases: ["自动采集-README"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "82bc39e124ba"
summary: "此目录由 n8n + Dify 工作流自动写入，请勿手动修改子目录结构。"
---

# 自动采集目录说明

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 自动采集目录

> 此目录由 n8n + Dify 工作流自动写入，请勿手动修改子目录结构。

---

## 目录结构

| 子目录 | 分类 | 说明 |
|--------|------|------|
| `AI工具/` | AI工具 | AI 相关工具和产品 |
| `开发技术/` | 开发技术 | 编程、框架、工程实践 |
| `架构设计/` | 架构设计 | 系统架构、设计模式 |
| `运维部署/` | 运维部署 | DevOps、部署、监控 |
| `Agent生态/` | Agent生态 | AI Agent 框架和生态 |
| `模型训练/` | 模型训练 | LLM 训练、微调 |
| `其他/` | 其他 | 未分类内容 |

---

## 工作流

1. n8n 定时从 RSS/网页抓取内容
2. 调用 Dify API 进行 LLM 处理（摘要+标签+分类）
3. 自动生成符合笔记写入规范的 Markdown 文件
4. 写入对应分类子目录

## 注意事项

- 文件名格式：`YYYY-MM-DD-标题.md`
- 每个笔记包含 YAML frontmatter
- 分类由 LLM 自动判断，可能需要人工校正
- 采集后可在 Obsidian 中补充「我的笔记」部分

---

*此目录由知识采集工作流自动维护*
