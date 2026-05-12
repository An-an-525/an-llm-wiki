---
title: ">-"
aliases: ["Coze复刻计划-Coze复刻计划"]
tags: [llm-wiki, migrated]
category: project
type: project
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "8ccadca0dff5"
summary: "以最小化方式复刻扣子（Coze）平台的核心功能。"
---

# >-

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Coze 复刻计划

## 目标

以最小化方式复刻扣子（Coze）平台的核心功能。

## 需要复刻的功能模块

1. **可视化 Bot 构建器** — 拖拽式界面搭建 AI Bot
2. **工作流编排** — 可视化编排多步骤 AI 工作流
3. **插件系统** — 可扩展的插件架构
4. **知识库 RAG** — 基于检索增强生成的知识库问答
5. **多 Agent 协作** — 多个 AI Agent 的协同工作
6. **对话管理** — 对话记录、上下文管理
7. **发布部署** — 一键发布到多渠道

## 技术策略

- 方案调研：使用 Kimi agent 集群调研 GitHub 上的成熟开源项目 ^[extracted]
- 实现策略：最小化全功能复刻路径（不是逐步构建单一功能，而是一开始就覆盖所有模块的最小版本）^[inferred]
- 复刻对象：字节跳动扣子（Coze）平台

## 关联

- Codex-工具生态总览-2026-04 — AI 工具基础设施
- Codex-Agent-自主性演进-2026-04 — Agent 自主体系统计
- Codex-开发项目索引-2026-04 — 相关项目索引
- [[04 - 知识库/项目索引]] — 全局项目优先级与关联图
- ACP 协议白皮书 — Agent 通用通讯协议基础
