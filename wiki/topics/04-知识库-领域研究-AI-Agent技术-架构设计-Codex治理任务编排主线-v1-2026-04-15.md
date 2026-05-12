---
title: "Codex 治理任务编排主线 v1"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: topic
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "f040da69f2ec"
summary: "**当前定位**：`高级能力 / 按需启用`。这页保留为治理任务的重流程参考，不再是 `Codex` 默认规则基线。"
---

# Codex 治理任务编排主线 v1

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Codex 治理任务编排主线 v1

> **当前定位**：`高级能力 / 按需启用`。这页保留为治理任务的重流程参考，不再是 `Codex` 默认规则基线。
>
> 默认基线请先看 [[99 - Agent指南与规范/Codex-轻量通用规则-2026-04-24|Codex 轻量通用规则]]。

> 这是一条 **控制面 / 治理任务** 的主线镜像，不是学校项目交付主线，也不是后台代跑自治主线。

## 当前判断

- 对 `control-plane / governance` 任务，只在任务明显受益时再启用这条多 Agent 编排路径
- `Codex` 仍是唯一主控
- 这页描述的是较强的 delegation / topology 约束，不再自动施加到普通任务
- 推荐拓扑仍是 `research -> blue-team planning -> red-team challenge -> execution -> acceptance`
- `school-project` 业务交付保持独立，不并入这条主线
- 这条主线现在是 **runtime-enforced candidate mainline for governance tasks**
- controller 完成 delegated output 集成后，runtime run record / checkpoint / promotion gate 也必须同步收口

## 必要约束

- 非主控进程必须有 `delegation_record_ref`
- controller 才能做最终 `adopted / adapted / rejected`
- 没有 required topology 的治理任务不能收口成完成
- 控制面账本不能先写“已收口”而 runtime 仍停在 `pending_controller_integration`
- 如果 runtime 回写失败，必须自动进入验证反馈回环
- 不允许治理任务把学校项目业务代码自动改写当作默认行为

## 运行边界

### 允许

- capability review
- control-plane mirror refresh
- process registry / runtime graph upkeep
- local problem intake follow-up
- policy refresh and acceptance closure

### 不允许

- school-project business code automation
- broad repo mutation
- sidecar 自行决定架构或验收

## 关联

- [[00 - 协作缓冲区/02 - Action_Items/Codex 自主能力演进待办-当前]]
- [[06 - 周期回顾/每周/2026-W16-Codex-自主能力综合判断]]
- [[99 - Agent指南与规范/当前状态总览]]
- [[99 - Agent指南与规范/Codex-Agent-进程登记册-当前]]
- [[08 - 智能实体库/Codex-Agent-运行时关系图-当前]]
- `[local path redacted]`
