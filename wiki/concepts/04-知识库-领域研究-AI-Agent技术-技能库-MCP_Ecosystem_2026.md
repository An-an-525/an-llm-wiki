---
title: "MCP 生态全景 (MCP Ecosystem 2026)"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "ad81a0091ed3"
summary: "🛰️ MCP 生态全景 (MCP Ecosystem 2026)"
---

# MCP 生态全景 (MCP Ecosystem 2026)

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🛰️ MCP 生态全景 (MCP Ecosystem 2026)

> **目标**: 本笔记旨在复原 2026 年 MCP 协议的全球生态版图，为 `mcc` 的工具接入提供全球资源池。

---

## 1. 🏢 官方与巨头参与 (Official Participation)

2026 年初，MCP 协议已正式成为 AI 通信的事实标准：
- **巨头入场**: **Salesforce, Asana, Box, Clay, Hex** 均已在 2026 年 1 月 26 日前推出了官方 MCP Remote Servers。
- **协议升级**: 已捐赠给 **Linux 基金会**，由主流 AI 厂商（OpenAI, Google, Microsoft, Anthropic, AWS, Salesforce）共同维护。
- **SDK 普及**: 月下载量突破 **9700 万** 次。

---

## 2. 🌍 社区生态 (Community Registry)

### 2.1 官方注册表 (Official Registry)
- **规模**: 2026 年 4 月已收录 **~2,000** 个 Server。
- **代表分类**: 
    - **DevOps**: GitHub, GitLab, Azure DevOps (2026 增长最快)。
    - **Scraping**: Firecrawl, Crawl4AI (最高频调用)。
    - **Design**: Figma, Canva 插件。

### 2.2 Awesome MCP Servers (精选列表)
- **规模**: 150+ 个经过社区验证的生产级 Server。
- **价值**: 为开发者提供了从“简单文件访问”到“复杂 DB 联调”的全套参考实现。

---

## 3. 🧩 accio 接入建议

- **统一工具注册**: `mcc` 应建立一个全局工具池，自动同步 `registry.modelcontextprotocol.io` 中的元数据。
- **本地 MCP 优先**: 鼓励将本地的 `python-scripts` 封装为标准的 **Stdio MCP Server**，实现与 `mcc` 的解耦。

---
log:: [[06 - 周期回顾/2026-04-10-详细行动存证]]
