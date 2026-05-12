---
title: "an-clan (安氏宗门) 元逻辑架构图"
aliases: []
tags: [llm-wiki, migrated]
category: project
type: project
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "62f0d7620966"
summary: "🧬 an-clan (安氏宗门) 元逻辑架构图"
---

# an-clan (安氏宗门) 元逻辑架构图

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧬 an-clan (安氏宗门) 元逻辑架构图

> **目标**: 复原 `an-clan` (安氏宗门) 项目的物理与逻辑架构，它是整个 Agent 系统的“灵魂”与“元逻辑”来源。

---

## 1. 🏗️ 核心设计理念

- **拟人化组织**: 模仿古代宗门架构，将 Agent 职能化（安、主脑、守护、执行等）。
- **SOP 驱动**: 严格遵守 `HANDBOOK.md` 中定义的“铁律”与“职责”。
- **流水线协作**: 基于 `pipeline-design.md` 的异步黑板模式。

---

## 2. 📂 目录拓扑与 Agent 分工 (Topology)

- **`an-clan/` (Root)**: 核心规章 (`HANDBOOK.md`, `BULLETIN.md`)。
- **`planner/` (计划安)**: 负责任务拆解、路径规划与优先级排序。
- **`analyst/` (分析安)**: 负责情报扫描、根因分析与技术选型建议。
- **`executor/` (执行安)**: 负责代码编写、命令执行与工具调用。
- **`guardian/` (守护安)**: 负责安全审计、权限边界控制与红线管理。
- **`observer/` (观察安)**: 负责系统监控、日志记录与质量反馈。
- **`learner/` (学习安)**: 负责知识采集、外部信息内化与记忆同步。
- **`memory_system/`**: 宗门长期记忆的存储与检索逻辑。
- **`context-bridge/`**: 跨 Agent 的上下文传递桥梁。

---

## 3. 🧩 核心协作协议 (Legacy)

- **黑板模式**: Agent 之间不直接对话，而是将状态和任务写入“黑板” (`context-bridge`)。
- **层级汇报**: 执行结果必须由“观察安”记录并由“主脑”进行最终确认。
- **安全审计**: “守护安”在任何高危操作前拥有“一票否决权”。

---

## 🚀 对 Pro-Team 的价值
- **角色映射**: 当前的 Pro-Team 专家团队是此元逻辑的“现代专业化”身。
- **SOP 继承**: `accio` 的任务流设计应继续保留 `an-clan` 的“先审计、后执行”基因。

---
log:: [[06 - 周期回顾/2026-04-10-详细行动存证.md]]
MOC:: [[04 - 知识库/领域研究/AI-Agent技术/项目架构/Frameworks_MOC.md]]
Genealogy:: [[04 - 知识库/99 - Agent指南与规范/项目血缘关系图.md]]
