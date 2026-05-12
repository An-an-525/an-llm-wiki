---
title: "omnifocus-2 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "99f22ace2b54"
summary: "Manage OmniFocus tasks via JavaScript for Automation (JXA) scripts on macOS. Supports inbox entry, task listing, searching, and property updates."
---

# omnifocus-2 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# ✅ omnifocus-2 技能

> Manage OmniFocus tasks via JavaScript for Automation (JXA) scripts on macOS. Supports inbox entry, task listing, searching, and property updates.

---

## 🛠️ 核心操作 (JXA Scripts)

- `add_task.js`: 添加新任务到收集箱。
- `list_tasks.js`: 按过滤器（inbox, available, flagged, overdue）列出任务。
- `complete_task.js`: 标记任务为完成。
- `update_task.js`: 修改任务备注、截止日期或旗标状态。

---

## 📖 使用指南

```bash
# 列出所有过期的任务
osascript -l JavaScript scripts/list_tasks.js overdue

# 添加一个新任务
osascript -l JavaScript scripts/add_task.js "Submit Q1 Report" "Due by end of month" "2026-03-31"

# 搜索并完成任务
osascript -l JavaScript scripts/complete_task.js "Buy groceries"
```

---

## ⚠️ 运行要求

- **操作系统**: 仅支持 **macOS**。
- **环境**: 必须安装并运行 OmniFocus。
- **脚本权限**: 需具备执行权限 (`chmod +x`)。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
