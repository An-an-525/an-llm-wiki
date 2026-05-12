---
title: "mcc (Master Control Console) 项目架构图"
aliases: []
tags: [llm-wiki, migrated]
category: project
type: project
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "acec6cdcab7c"
summary: "🏗️ mcc (Master Control Console) 项目架构图"
---

# mcc (Master Control Console) 项目架构图

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🏗️ mcc (Master Control Console) 项目架构图

> **目标**: 复原 `mcc` (Master Control Console) 项目的物理与逻辑架构，它是系统当前的后端中控核心。

---

## 1. 🏗️ 技术栈 (Tech Stack)

- **包管理 (Monorepo)**: `pnpm` (Workspace)。
- **后端框架**: `Hono` (高性能 ESM/TS)。
- **数据库 ORM**: `Drizzle` (基于 TypeScript)。
- **网络通信**: `WebSocket`, `Hono-based API`。
- **构建工具**: `pnpm`, `tsc`, `tsx watch`。

---

## 2. 📂 目录拓扑与职责 (Topology)

- **`mcc/` (Root)**: 配置文件 (pnpm, tsconfig, package.json)。
- **`packages/core/`**: 核心逻辑、类型定义 (`acp/types.ts`)、共通工具。
- **`packages/server/`**: **后端主进程**。
    - `src/index.ts`: 启动入口。
    - `src/acp.ts`: **ACP (Agent Communication Protocol)** 协议实现。
    - `src/routes/`: 路由定义。
- **`packages/gui-web/`**: 基于 Web 的管理前端。
- **`docker-compose.yml`**: 服务容器化定义（连接 PostgreSQL/Redis）。

---

## 3. 🧩 核心协议逻辑 (ACP)

`mcc` 核心承载了 **ACP (Agent Communication Protocol)** 协议，负责：
1. **Agent 发现与注册**: 自动识别本地启动的各专业 Agent 进程。
2. **消息路由 (Message Bus)**: 协调 `task-architect`、`research-strategist` 等 Agent 间的异步通讯。
3. **Trae 桥接**: 处理来自 Trae (IDE) 的请求，并将其委派给合适的 Agent。

---

## 🚀 后续演进路线
- **全量异步化**: 优化 `acp.ts` 中的事件流处理。
- **持久化增强**: 强化 `drizzle/` 中的数据库模式，支持更复杂的 Agent 状态存储。

---
log:: 2026-04-10-详细行动存证
