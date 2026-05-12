---
title: "openclaw-version-monitor 技能"
aliases: ["flyio-cli-public"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "6ff91b6c0f57"
summary: "🤖 openclaw-version-monitor (flyio-cli-public)"
---

# openclaw-version-monitor 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🤖 openclaw-version-monitor (flyio-cli-public)

> 监控 OpenClaw GitHub 版本更新，获取最新版本发布说明，翻译成中文，并推送到 Telegram 和 Feishu。

---

## 🛠️ 核心功能

- **版本监控**: 自动轮询 GitHub API 获取最新发布版本。
- **差异对比**: 智能对比当前本地版本与远端版本。
- **内容翻译**: 自动将英文 Changelog 翻译为中文。
- **多端通知**: 支持一键推送至 Telegram 和飞书。

---

## 📖 使用方法

### 1. 检查远端版本
```bash
curl -s https://api.github.com/repos/openclaw/openclaw/releases/latest | jq -r '.tag_name'
```

### 2. 获取更新日志
```bash
curl -s https://api.github.com/repos/openclaw/openclaw/releases/latest | jq -r '.body'
```

---

## ⏰ 定时任务配置 (Cron)

| 时段 | 表达式 | 行为 |
| :--- | :--- | :--- |
| **工作时段** | `0,30 9-18 * * *` | 检测到更新立即推送 |
| **非工作时段** | `0 9 * * *` | 每日上午 9 点汇总推送 |

---

## 🔗 相关链接

- [[技能库 MOC]]
- GitHub 技能
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
