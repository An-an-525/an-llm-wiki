---
title: "sec-filing-watcher 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "e5c4c168453b"
summary: "🏛️ sec-filing-watcher 技能"
---

# sec-filing-watcher 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🏛️ sec-filing-watcher 技能

> Monitor SEC (U.S. Securities and Exchange Commission) filings for specific companies and get real-time alerts.

---

## 🛠️ 核心功能

- **实时扫描**: 监控 SEC EDGAR 数据库的新提交文件。
- **CIK 追踪**: 基于 Central Index Key (CIK) 追踪特定上市企业。
- **文件分类**: 自动识别 10-K, 10-Q, 8-K 等核心报表。

---

## 📖 使用方法

### 基础调用
```bash
python3 scripts/sec_watcher.py --cik 0000320193 --types 8-K,10-K
```

### 计划任务示例
```bash
cron add --job '{
  "name": "apple-sec-monitor",
  "schedule": "*/15 * * * 1-5",
  "command": "python3 scripts/sec_watcher.py --cik 0000320193"
}'
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- [[文档处理]]
- [[paperless-ngx]] - 自动化归档监控文件。
- [[competitors-analysis]] - 为竞品分析提供财务数据源。

---

*最后更新：2026-04-10*
