---
title: "scrape-webpage 技能"
aliases: ["scrape-webpage"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "2e1c3bfc851d"
summary: "🌐 scrape-webpage 技能"
---

# scrape-webpage 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🌐 scrape-webpage 技能

> Scrape webpage content, extract metadata, download images, and prepare for migration. Returns analysis JSON with cleaned HTML and local images.

---

## 🛠️ 核心功能

- **网络拦截**: 捕获页面中加载的所有图片资源。
- **全页滚动**: 自动触发懒加载 (Lazy-load) 内容。
- **图像本地化**: 下载并转换（WebP/AVIF -> PNG）所有图片至本地。
- **DOM 清理**: 移除脚本和样式，仅保留核心 HTML 结构。

---

## 📖 使用方法

```bash
node .claude/skills/scrape-webpage/scripts/analyze-webpage.js \
  "https://example.com/page" --output ./import-work
```

---

## 📋 产出物清单

- `metadata.json`: 包含原始 URL、路径映射及图片统计。
- `screenshot.png`: 页面视觉参考。
- `cleaned.html`: 引用本地图片的纯净 HTML。
- `images/`: 存放下载的所有图片资源。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- playwright
- browser-control

---

*最后更新：2026-04-10*
