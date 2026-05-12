---
title: "debug-tauri 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "fd2b7b68b99a"
summary: "Automates Tauri WebView debugging using official plugins (tauri-plugin-log + screenshots)."
---

# debug-tauri 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🦀 debug-tauri 技能

> Automates Tauri WebView debugging using official plugins (tauri-plugin-log + screenshots).

---

## 🛠️ 核心功能

- **日志采集**: 实时监听 Rust 后端与 JS 前端的合并日志流。
- **视觉排障**: 自动截取 WebView 当前渲染状态并标注渲染层级。
- **状态分析**: 检查 Tauri 应用的进程状态及 IPC 通信耗时。

---

## 📖 使用方法

### 启动调试监听
```bash
node scripts/tauri_debugger.js --app "zongmen-gui" --log-level debug
```

### 获取当前 WebView 截图
```bash
node scripts/tauri_debugger.js --screenshot --output ./debug/
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- [[zongmen-gui_Project_Architecture]]
- [[playwright]]

---

*最后更新：2026-04-10*
