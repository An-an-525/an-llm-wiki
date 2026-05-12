---
title: "searxng-web-search 技能"
aliases: ["searxng-web-search"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "a3b9b57a70c5"
summary: "🔍 searxng-web-search 技能"
---

# searxng-web-search 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🔍 searxng-web-search 技能

> Search the web using a self-hosted SearXNG instance. Access web results through the SearXNG JSON API with built-in rate limiting and error handling.

---

## 🛠️ 核心功能

- **隐私搜索**: 利用自建 SearXNG 实例进行匿名搜索。
- **分类过滤**: 支持按通用、新闻、图片、视频、IT、科学等类别进行过滤。
- **时间范围**: 支持按天、周、月、年进行搜索结果筛选。

---

## 📖 使用方法

```bash
export SEARXNG_URL="http://localhost:8888"

# 基础搜索
bb scripts/search.clj "NixOS configuration"

# 带参数搜索 (JSON 格式)
bb scripts/search.clj "AI news" '{"category": "news", "time_range": "week", "num_results": 10}'
```

---

## 🚦 频率限制 (Rate Limiting)

- 脚本内部强制执行至少 1 秒的请求间隔。
- 使用 `.searxng-last-request` 文件记录状态，防止意外高频请求。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
