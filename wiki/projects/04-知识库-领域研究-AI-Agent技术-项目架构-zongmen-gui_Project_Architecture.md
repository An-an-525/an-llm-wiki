---
title: "zongmen-gui (宗门管理 GUI) 项目架构图"
aliases: []
tags: [llm-wiki, migrated]
category: project
type: project
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "97d8a73863f6"
summary: "🏗️ zongmen-gui (宗门管理 GUI) 项目架构图"
---

# zongmen-gui (宗门管理 GUI) 项目架构图

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🏗️ zongmen-gui (宗门管理 GUI) 项目架构图

> **目标**: 复原 `zongmen-gui` 项目的物理与逻辑架构，它是系统的下一代跨平台桌面客户端。

---

## 1. 🏗️ 技术栈 (Tech Stack)

- **桌面框架**: **Tauri 2** (基于 Rust, 极致轻量)。
- **前端库**: **React 19** (最新版, Concurrent 模式)。
- **样式框架**: **Tailwind CSS 4** (极速构建, 现代样式)。
- **构建工具**: **Vite 7** (高性能构建)。
- **状态管理**: **Zustand**。
- **实时通信**: **Socket.IO Client**。
- **代码形态**: **JS / JSX 为主，局部面板使用 TSX**。

---

## 2. 📂 目录拓扑与职责 (Topology)

- **`zongmen-gui/` (Root)**: 配置文件、构建产物与依赖目录。
- **`src/`**: 前端源码。
    - `src/main.jsx`: React 入口。
    - `src/App.jsx`: 主布局、面板切换与移动端适配。
    - `src/api/gateway.js`: Gateway HTTP 调用层。
    - `src/api/sect-socket.js`: 宗门实时 Socket 连接层。
    - `src/store/index.js`: Zustand 状态中心。
    - `src/components/`: Dashboard / Sidebar / Chat 与各类 panels。
- **`src-tauri/`**: Rust 后端（Tauri 原生逻辑）。
    - `src/main.rs`: Tauri 主进程入口。
    - `src/lib.rs`: 当前仍为最小 builder，仅注册 opener plugin 与 `greet` command。
- **`public/`**: 静态资源（图标、字体）。
- **`dist/`**: 现成构建输出，说明项目曾经实际 build 过。

---

## 3. 🧩 核心功能与交互 (Interaction)

`zongmen-gui` 当前负责：
1. **可视化仪表盘**: 展示 Agent 健康度、任务、进化趋势与日志。
2. **Gateway 联调控制**: 通过 `/gw` 调用工具与聊天接口。
3. **Sect 实时监控**: 通过 Socket.IO 接收宗门任务、消息、积分、进化等事件。
4. **桌面壳准备**: 具备 Tauri 外壳，但 Rust 侧业务逻辑仍较轻。

### 当前成熟度判断

- 前端控制台骨架已经明显成型，不是空项目。
- 但 README 与 Rust 侧实现仍接近模板，说明项目还处于“前端原型领先、桌面壳待深化”的阶段。
- 认证参数仍有硬编码痕迹，后续应优先收敛到环境变量或安全配置层。

---

## 🚀 后续演进路线
- **状态同步优化**: 深度集成 `mcc` 的 WebSocket，实现任务状态的毫秒级同步。
- **UI 风格统一**: 基于 `AIRI` 设计语言，完善更多专业化的 Agent 监控看板。

---
log:: [[06 - 周期回顾/2026-04-10-详细行动存证]]
