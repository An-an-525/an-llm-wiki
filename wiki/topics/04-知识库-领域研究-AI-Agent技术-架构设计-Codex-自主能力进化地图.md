---
title: "Codex 自主能力进化地图"
aliases: ["Codex-自主能力进化地图"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "76969b8e1712"
summary: "本页是 `Codex` 自主能力主线的 Obsidian 镜像入口，不是 canonical 规则源。"
---

# Codex 自主能力进化地图

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Codex 自主能力进化地图

> 本页是 `Codex` 自主能力主线的 Obsidian 镜像入口，不是 canonical 规则源。
>
> **阅读顺序已调整**：先用轻量通用规则启动；这里列出的编排、验证反馈、后台代跑主要属于高级能力或候选增强，默认按需启用。

## 当前判断

- 当前主线仍是 `Codex + AGENTS.md + skills + MCP + AOS + Obsidian`
- `LangChain / LangGraph / LangSmith` 目前只在候选增强层，不进入默认主线
- `后台代跑` 的 stage-1 已以 `bounded sidecar pilot` 落地，但当前真实状态是 `candidate pending live unknown-risk verification`，不是 `validated candidate` 或 `mainline`
- `治理 / 控制面` 的多 Agent 编排、`验证反馈回环`、`后台代跑 sidecar` 现在都按“有收益时启用”的高级能力处理
- `transport_attention` 现在是正式 Codex 能力缺口，不再只当背景噪声处理
- 当前固定推进顺序是：`runtime/control-plane 一致性 -> verification feedback 下沉 -> transport stability -> stale state cleanup -> 更长程 autonomy`
- 这条主线默认按 `能力 > 风险 > 复杂度 > 保守不变` 排序
- 用户只描述目标、体验和痛点，不承担技术选型或分层判断
- 默认姿态是 `主动进步`，不是“够用就收手”
- 如果更强方案能带来明显能力跃迁且能被验证，就不应因为习惯当前栈而默认退回保守路线

## 三层演进

### 主线能力层

- `AGENTS.md`：硬约束
- `skills`：流程纪律
- `AOS`：控制面自动化
- `Obsidian`：导航、待办、证据、当前状态
- `AI_Commander_Docs`：canonical 规则与研究结论
- [[Codex治理任务编排主线-v1-2026-04-15]]
- [[Codex验证反馈回环主线-v1-2026-04-15]]

### 候选增强层

- `LangChain / LangGraph / LangSmith`
- `supervisor-style long task orchestration`
- `checkpoint/state graph`
- `trace observability`
- `后台代跑 sidecar` 当前处于 `candidate`
- `transport stability` 与 `runtime/controller convergence` 现在都按主线能力处理
- [[Codex后台代跑侧车试点-v1-2026-04-15]]

### 观察层

- `Hashline`
- `oh-my-pi`
- 其他社区 harness 信号

## 阅读顺序

1. Codex-轻量通用规则-2026-04-24
2. 当前状态总览
3. `[local path redacted]`
4. Codex能力边界与向外学习框架-2026-04-15
5. Codex生态扩展与Harness编排研究-2026-04-15
6. [[Codex后台代跑侧车试点-v1-2026-04-15]]（按需）
7. [[Codex治理任务编排主线-v1-2026-04-15]]（按需）
8. [[Codex验证反馈回环主线-v1-2026-04-15]]（按需）
9. Codex 自主能力演进待办-当前
10. 2026-W16-Codex-自主能力综合判断

## 操作节奏

- 每日：只登记 delta
- 每周：关闭或推进 capability review
- 每月：更新 baseline，淘汰噪声源

## 行为基线

- 所有后续 `Codex` agent 默认追求真实能力进步，不以“能跑”作为默认终点
- 风险需要被工程化控制，不作为保守不变的自动理由
- 重复人工劳动、重复绕过、重复解释都应被视为待升级能力，而不是常态

## 关联

- Codex 自主能力演进待办-当前
- Codex能力边界与向外学习框架-2026-04-15
- Codex生态扩展与Harness编排研究-2026-04-15
- [[Codex后台代跑侧车试点-v1-2026-04-15]]
- [[Codex治理任务编排主线-v1-2026-04-15]]
- [[Codex验证反馈回环主线-v1-2026-04-15]]
- 当前状态总览
- 周期回顾总览
