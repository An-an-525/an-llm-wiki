---
title: "Codex后台代跑侧车试点-v1"
aliases: ["Codex后台代跑侧车试点-v1-2026-04-15"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "1f2556eb1072"
summary: "**当前定位**：`候选增强 / 按需启用`。这页是 sidecar 试点参考，不是当前默认工作入口。"
---

# Codex后台代跑侧车试点-v1

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Codex后台代跑侧车试点-v1

> **当前定位**：`候选增强 / 按需启用`。这页是 sidecar 试点参考，不是当前默认工作入口。
>
> 默认基线请先看 Codex 轻量通用规则。

> 这是 `Codex` 自主工程系统第一阶段的 Obsidian 镜像页，用来解释“后台代跑”为什么先以 sidecar 形式落地，而不是直接改造成第二主控。

## 一句话结论

- 当前已经落地一个 **bounded sidecar pilot**
- 它的目标是拿下 `后台持续代跑 + 结构化交接 + trace / checkpoint / kill switch`
- 它不是第二主控，不能替代 `Codex + AOS + Obsidian`
- 当前真实状态是：**`pilot` extra 已装好，live `langgraph_local` / kill switch / resume 已验证，但 live-vault `unknown-risk` 仍待重新验证；所以它现在仍是 candidate，不是 validated candidate 或 mainline**

## 在全局架构里的位置

### 7 层架构映射

- `宪法层`：`AGENTS.md`、canonical governance、done criteria
- `控制面`：`AI_Commander_Docs + Obsidian + AOS`
- `官方 Codex 扩展层`：`skills / MCP / plugins / subagents / automations`
- `执行层`：`Codex + Superpowers`
- `编排层`：这个 sidecar pilot
- `裁判与观测层`：tests、review、acceptance、local trace sink、未来的 `LangSmith`
- `进化层`：capability backlog、runtime problem intake、weekly review

### Harness 五个核心模块映射

- `上下文架构`：控制面、镜像、启动锚点、结构化 briefing
- `执行能力`：`Codex + Superpowers` 的 bounded execution
- `任务编排`：sidecar run loop、state transition、checkpoint、resume
- `反馈机制`：tests、kill switch、unknown-risk halt、trace
- `架构护栏`：单主控、append-only、写面限制、promotion gate

## 当前试点边界

### 允许做的事

- 扫描 capability backlog、watchlist、本地问题账本
- 生成结构化 briefing
- 写 checkpoint / trace / run record
- 返回下一步动作包和 capability review envelope

### 不允许做的事

- 不允许成为第二主控
- 不允许直接写 canonical governance
- 不允许在未验收前放开广泛 repo 写权限
- 不允许把“开源项目能做到”直接写成“本地已经稳定做到”

## 当前本地验证状态

- `autonomy-pilot-status` 已能返回：
  - sidecar 根路径
  - git 初始化状态
  - `engine_profile / trace_backend_effective / promotion_gate_status`
  - 最新 checkpoint / run-record / trace
  - runner 入口状态
  - kill switch 当前状态
  - 最近一次 live unknown-risk 摘要
- `autonomy-pilot-run` 已能执行一次真实 `langgraph_local` bounded pilot loop，并返回 `resume_ref`
- 已验证真实 `kill switch` 场景会在 AOS 层硬停
- temp workspace 的 `unknown-risk halt` 仍会留下 halt snapshot、trace 和结构化原因，但它们不再被视为 live-vault promotion 证据
- 当前 trace 默认走本地 sink；`LangSmith` 仍只是未来增强位

## 为什么现在不直接升主线

- 当前证明的是“bounded sidecar + real LangGraph 编排路径成立”，但还没有到“默认主线”
- 所以这轮正确的结论是：
  - 能力方向正确
  - 侧车当前仍是 `candidate pending live unknown-risk verification`
  - promotion 决策不应越级成 `mainline`

## 下一步

1. 先复现一次 **live-vault** 的 `unknown-risk` 或用当前真实证据重写 gate 判断
2. 再跑更长的 bounded cycles，确认 candidate 在多轮运行下仍稳定
3. 之后才讨论是否从 `candidate` 升到 `mainline`
4. 若要接 `LangSmith`，单独把 key / trace policy 做成下一阶段试点

## 关联

- [[Codex 自主能力进化地图]]
- Codex生态扩展与Harness编排研究-2026-04-15
- Codex能力边界与向外学习框架-2026-04-15
- Codex 自主能力演进待办-当前
- 2026-W16-Codex-自主能力综合判断
