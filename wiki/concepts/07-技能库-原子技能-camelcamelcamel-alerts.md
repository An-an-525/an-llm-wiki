---
title: "camelcamelcamel-alerts 技能"
aliases: ["camelcamelcamel-alerts"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "8ae113598d95"
summary: "🐫 camelcamelcamel-alerts 技能"
---

# camelcamelcamel-alerts 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🐫 camelcamelcamel-alerts 技能

> Automatically monitor your CamelCamelCamel RSS feed for Amazon price drops and get notified on Telegram.

---

## 🛠️ 核心功能

- **RSS 轮询**: 定时获取个人 CamelCamelCamel 价格提醒订阅源。
- **价格追踪**: 实时检测商品降价事件。
- **去重通知**: 维护本地缓存以避免重复推送。

---

## 📖 快速上手

1. **获取 RSS 订阅源**:
   前往 [CamelCamelCamel](https://camelcamelcamel.com/) 设置价格提醒，并获取个人 RSS 链接。
   格式: `https://camelcamelcamel.com/alerts/YOUR_UNIQUE_ID.xml`

2. **配置监控任务**:
```bash
cron add --job '{
  "name": "amazon-price-monitor",
  "schedule": "0 */4 * * *",
  "command": "python3 scripts/fetch_rss.py YOUR_RSS_URL"
}'
```

---

## ⚠️ 注意事项

- **私有 ID**: 确保使用 `YOUR_UNIQUE_ID`，不要混用他人的订阅源。
- **依赖项目**: 核心逻辑位于 `scripts/fetch_rss.py`。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
