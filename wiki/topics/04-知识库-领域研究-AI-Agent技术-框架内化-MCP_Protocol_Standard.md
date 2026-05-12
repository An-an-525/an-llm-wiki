---
title: "MCP (Model Context Protocol) 标准内化"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: topic
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "8ec14dcf707f"
summary: "🛰️ MCP (Model Context Protocol) 标准内化"
---

# MCP (Model Context Protocol) 标准内化

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🛰️ MCP (Model Context Protocol) 标准内化

> **核心理念**: **“连接 AI 与数据的开放标准”**。由 Anthropic 主导并捐赠给 Linux 基金会，旨在解决每个 AI 工具都要重复对接各种数据源的问题。

---

## 1. 🏗️ 核心架构

### 1.1 MCP Client (客户端)
- 如: Claude Desktop, IDE (Cursor, VSCode), 自定义 Agent 框架 (`mcc`, `accio`)。
- 负责：发起请求、合并上下文、展示工具。

### 1.2 MCP Server (服务端)
- 负责：连接具体的资源（如 GitHub, Google Drive, Local File System, Postgres）。
- 提供：
    - **Resources**: 静态数据（如文件内容、DB 查询结果）。
    - **Tools**: 执行动作（如运行脚本、发送邮件）。
    - **Prompts**: 预定义的对话模板。

### 1.3 Transport Layer (传输层)
- **Stdio**: 本地进程通信（如 `mcc` 启动 Python 脚本）。
- **SSE (Server-Sent Events)**: 远程 HTTP 通信。

---

## 2. 🧩 生态优势 (Ecosystem)

- **互操作性 (Interoperability)**: 一个 MCP Server 可以被任何支持 MCP 的 Client 调用。
- **安全性**: Server 控制具体的资源访问权限，Client 只需调用接口。

---

## 🚀 accio 演进启示
- **全面接入 MCP**: `mcc` 已经开始了 MCP 协议的尝试 (`acp.ts` 与 `mcp[cli]`)。
- **复用社区资源**: 直接利用 `awesome-mcp-servers` 中的 2000+ 个现成 Server，无需再为 `accio` 编写重复的本地工具逻辑。

---
log:: [[06 - 周期回顾/2026-04-10-详细行动存证]]
