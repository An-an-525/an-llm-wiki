---
title: "ios-simulator 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "76de00de7bde"
summary: "📱 ios-simulator 技能"
---

# ios-simulator 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📱 ios-simulator 技能

> Automate iOS Simulator workflows (simctl + idb): create/boot/erase devices, install/launch apps, push notifications, privacy grants, screenshots, and accessibility-based UI navigation.

---

## 🛠️ 核心功能

- **设备生命周期**: 创建、启动、关闭、擦除、删除模拟器。
- **应用管理**: 安装、卸载、启动、终止、查看容器路径。
- **UI 自动化**: 基于可访问性树 (Accessibility Tree) 的元素查找、点击、输入。
- **多媒体捕获**: 截图与视频录制。
- **系统通知**: 推送本地通知模拟。

---

## 📖 使用方法

### 基础操作
```bash
# 启动并选择默认设备
node ios-sim.mjs select --name "iPhone" --boot

# 安装并启动 App
node ios-sim.mjs app install --app path/to/MyApp.app
node ios-sim.mjs app launch --bundle-id com.example.MyApp

# UI 交互
node ios-sim.mjs ui tap --query "Log in"
node ios-sim.mjs ui type --text "hello world"
```

---

## ⚠️ 注意事项与红线

- **操作系统**: 仅支持 **macOS** 且安装有 Xcode。
- **依赖工具**: `idb` 虽可选，但 UI 树分析和语义点击必须依赖它。
- **安全等级**: `erase` 和 `delete` 命令具有危险性，必须配合 `--yes` 使用。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- [[playwright]]

---

*最后更新：2026-04-10*
