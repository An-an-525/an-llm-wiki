---
title: "MemPalace 长上下文记忆系统"
aliases: ["MemPalace-长上下文记忆系统-2026-04-11"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "ab8bc70a3d99"
summary: "MemPalace 长上下文记忆系统"
---

# MemPalace 长上下文记忆系统

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# MemPalace 长上下文记忆系统

> `MemPalace` 的核心价值不是“再做一层摘要”，而是先保留原始上下文，再用结构和检索把它变成 AI 可用的长期记忆。

## 核心判断

对当前这套 `Obsidian AOS` 来说，`MemPalace` 最值得借用的不是宣传词，而是这 3 个原则：

- **Raw first**
  - 不先让 LLM 决定“哪些内容值得记住”
  - 先保留原始对话、原始推理、原始决策过程
- **Structure before summarization**
  - 先按 `wing / hall / room / closet / drawer` 建结构，再做检索
- **Memory plane, not truth replacement**
  - 它更适合做第二层 memory plane，不适合直接替代当前正式存证层

## 官方公开能力

根据仓库 README，当前公开能力主要包括：

- `pip install mempalace`
- `mempalace init`
- `mempalace mine`
- `mempalace search`
- `mempalace status`
- `mempalace wake-up`
- `python -m mempalace.mcp_server`

支持的使用方式包括：

- CLI 搜索
- MCP 接入
- 本地模型 `wake-up`
- Python API

## 最重要的方法论

### 1. Raw mode 是当前主路线

仓库当前公开说明里，最高分来自：

- `raw mode`
- `96.6% LongMemEval R@5`

这意味着：

- 当前最强路线不是压缩，不是抽取，不是 AAAK
- 而是“完整保留 + 语义检索”

### 2. AAAK 目前是实验层

仓库维护者在 `2026-04-07` 的说明里明确承认：

- 早期 README 对 AAAK 的描述有夸大
- `AAAK` 当前分数低于 `raw mode`
- 它应被视为实验压缩层，而不是默认路线

因此对我们当前系统：

- 不应先追 `AAAK`
- 应先追 `raw mode + 结构化检索 + 可回链`

### 3. 结构比摘要更重要

`MemPalace` 的分层模型：

- `wing`
- `hall`
- `room`
- `closet`
- `drawer`

本质上是在做两件事：

- 让 AI 先知道“去哪里找”
- 再决定“在局部看什么”

这和我们当前已有的：

- `Codex 当前上下文包`
- `Codex 连续接手摘要`
- `Action_Items`
- `详细行动存证`

高度契合。

## 对本地架构的直接启发

### 适合直接映射

- `wing`
  - 项目 / 人 / 工具链
- `hall`
  - 决策 / 故障 / 偏好 / 技术栈 / 过程
- `room`
  - 单个专题或单个问题域
- `drawer`
  - Obsidian 原文、工单、行动存证、原始会话分片

### 当前推荐落地方式

- `Obsidian` 继续做真相层
- `MemPalace` 只做 second memory plane
- 检索结果必须能回链到 Obsidian 原文

## 当前接入边界

截至 `2026-04-11`，本机仍存在这些阻塞：

- Windows socket/provider 层异常
- `git` / `pip` / `uv` 访问在线源会报 `WinError 10106`
- `WSL` 与 `Docker` 当前也不能作为稳定后路

因此当前阶段只能先完成：

- 方案理解
- 结构映射
- 接入设计

还不能完成：

- 在线安装
- MCP 实测
- 本机 sidecar 闭环

## 适合未来落地的最小范围

第一阶段只建议导入：

- 当前上下文包
- 当前连续接手摘要
- 活跃工单
- 最近行动存证

不建议第一阶段直接导入：

- 全量环境变量
- 原始敏感配置
- 所有历史原始对话

## 关联

- MemPalace接入试点-2026-04-11
- 全局问题收敛路线-2026-04-11
- Codex-当前上下文包-当前
- Codex-连续接手摘要-当前
- AI-Agent技术
