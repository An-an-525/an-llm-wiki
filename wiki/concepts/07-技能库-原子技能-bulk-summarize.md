---
title: "bulk-summarize 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "9a44a42bfb90"
summary: "📹 bulk-summarize 技能"
---

# bulk-summarize 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📹 bulk-summarize 技能

> 批量媒体摘要工具，支持 YouTube 频道、播客 RSS、SoundCloud 等源的扫描与智能摘要。

---

## 🛠️ 核心功能

- **多平台扫描**: 自动识别并采集 YouTube 播放列表、RSS 订阅源及 SoundCloud 链接。
- **智能摘要**: 基于 LLM 对长视频/音频进行结构化摘要。
- **格式汇总**: 支持将多个摘要合并为一份完整的调研文档。

---

## 📖 快速工作流

1. **初始化配置**: `bun run bulk-summarize.ts init my-research.json`。
2. **内容扫描**: `bun run bulk-summarize.ts -c config.json scan`。
3. **执行摘要**: `bun run bulk-summarize.ts -c config.json summarize`。
4. **合并结果**: `bun run bulk-summarize.ts -c config.json combine --output report.md`

---

## 📋 支持平台

- **YouTube**: 支持 `@channel` 和 `playlist` 链接（处理速度最快，因自带字幕）。
- **播客 RSS**: 直接支持标准 RSS 订阅源。
- **SoundCloud**: 自动转录音频并生成摘要。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[文档处理]]
- [[MuleRun_Skills_Hub]]
- [[youtube-collector]] - 核心数据源采集工具。
- [[transcript-fixer]] - 针对转录文本进行精细化处理。

---

*最后更新：2026-04-10*
