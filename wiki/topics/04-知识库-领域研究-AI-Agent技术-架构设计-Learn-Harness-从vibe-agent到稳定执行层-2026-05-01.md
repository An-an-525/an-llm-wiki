---
title: "Learn Harness：从 vibe agent 到 Harness Engineering"
aliases: ["Learn-Harness-从vibe-agent到稳定执行层-2026-05-01"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "0c1b563864d0"
summary: "Learn Harness：从 vibe agent 到 Harness Engineering"
---

# Learn Harness：从 vibe agent 到 Harness Engineering

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Learn Harness：从 vibe agent 到 Harness Engineering

Learn Harness 是把“有手感的 agent 人格与提示词配置”转化为“可分工执行、可交接、可复盘、可迁移的 agent 工作系统”的学习与落地路径。

## 概念校准

`Learn Harness` 应对齐到 2026 年快速升温的 `Harness Engineering / Agent Harness` 语境，而不是只当成本会话自造术语。

外部语境中的核心公式是：

```text
Agent = Model + Harness
```

其中 `model` 负责推理，`harness` 负责模型之外的环境、状态、工具、权限、反馈、验证和控制。`Learn Harness` 则是把这套思想变成个人可学习、可复用、可迁移的工作法：先理解 harness，再把自己的 agent prompt、工作流和执行地基做成可版本化资产。

## Harness 具体是什么

在 AI agent 语境里，`harness` 不是单个工具、单条 prompt、单个 UI，也不是模型本身。它是包在模型外面、让模型能够持续行动并被约束和纠偏的完整运行系统。

典型组成包括：

- **system prompt / rules / AGENTS.md**：告诉 agent 怎么工作、遵守什么边界。
- **workspace / filesystem / git**：给 agent 可读写、可恢复、可版本化的工作面。
- **tools / skills / MCP / browser / shell**：让 agent 能查资料、改文件、跑命令、操作网页。
- **sandbox / permissions / guardrails**：限制 agent 能访问和能破坏的范围。
- **state / memory / artifacts**：保存跨会话上下文、任务状态、设计决策、交接工件。
- **orchestration loop**：决定什么时候计划、执行、调用工具、委派子 agent、停止或继续。
- **context management**：压缩、分层加载、工具输出外置、按需加载技能，防止上下文腐烂。
- **feedback sensors**：测试、lint、类型检查、日志、截图、运行时指标、审查 agent。
- **handoff protocol**：用文件、trace、任务合同和验收结果，而不是只用聊天文本交接。

一句话：**模型负责想，harness 负责让它看见正确的东西、做允许的事、留下状态、接受反馈，并在失败时能继续纠偏。**

## 核心判断

`LobeHub` 适合继续作为 vibe coding 的前台驾驶舱，但不应单独承担长期稳定执行层。它应被纳入个人 `Harness Engineering` 体系，而不是替代体系本身。

- `LobeHub` 的价值在于多 agent 协作手感、提示词配置、角色人格化、低摩擦进入状态。
- 长期执行层的价值在于任务落地、状态继承、过程复盘、失败恢复、资产迁移。
- 因此正确分层不是“云端 vs 本地”，而是“前台思维场域 + 底层执行地基”。

## Learn Harness 要解决什么

多 agent 不能只停留在“人设聊天”。如果希望它们真的分工执行，每个 agent 都需要从 persona 升级为岗位实体：

| 维度 | 问题 | Harness 约束 |
| --- | --- | --- |
| 角色 | 它是谁 | mission / role / scope |
| 权限 | 它能做什么 | tools / writable surface / stop conditions |
| 输入 | 它需要什么才能开始 | context packet / task brief / artifact refs |
| 输出 | 它必须交付什么 | output contract / artifact format |
| 验收 | 怎么知道做完了 | done criteria / validation |
| 交接 | 下游如何继续 | handoff format / trace id |

## 推荐分层

### 1. 创作驾驶舱

由 `LobeHub` 承担。

职责：

- 多 agent 人格配置
- 提示词实验
- 角色化思考
- 灵感碰撞
- vibe coding 的启动界面

风险：

- 产品、云端、同步、登录、模型路由和复杂功能会引入心流债务。
- 不应把关键记忆、唯一知识库、唯一任务系统锁死在 UI 内。

### 2. 稳定执行层

由 `Codex / Claude Code / Git / Obsidian / scripts / tests / logs` 共同承担。

职责：

- 改文件、跑命令、验证结果
- 保留任务上下文与过程记录
- 管理 prompt、agent、workflow 的版本化资产
- 支撑跨天、跨工具、跨项目恢复

### 3. Harness 资产层

关键 agent 不能只存在于 LobeHub UI 中，应抽成独立文件资产。

建议结构：

```text
agents/
  strategist.md
  architect.md
  executor.md
  reviewer.md
  archivist.md

workflows/
  vibe-coding-loop.md
  bugfix-loop.md
  feature-build-loop.md
  review-loop.md
```

每个 agent 文件至少包含：

```text
Mission
Scope
Inputs
Outputs
Tools / Permissions
Done Criteria
Handoff
```

## 角色拓扑

当前适合先采用“主脑调度专家工种”的形态，而不是让一组 agent 完全自治推进项目。

| 角色 | 职责 | 边界 |
| --- | --- | --- |
| 战略参谋 | 拆局、追问、识别假问题、保持方向感 | 不直接写代码 |
| 架构师 | 定系统边界、模块关系、技术取舍 | 不独占最终决策 |
| 执行工程师 | 改文件、跑命令、修 bug、落地实现 | 必须有明确写入范围 |
| 审查者 | 找 bug、回归、遗漏测试、安全与维护性风险 | 不与执行者共享同一心智 |
| 档案官 | 把决策、规则、prompt、项目状态沉淀到 Obsidian / AGENTS / README | 不替代执行验收 |

## 与既有本地体系的关系

Learn Harness 应继承现有“单主控 + 多执行面”的本地原则：

- 主控负责目标、边界、最终整合和验收。
- 子 agent 通过任务合同、工件、验证结果交接。
- 多 agent 协作应优先走 artifact handoff，而不是自由聊天。
- prompt、workflow、执行记录必须可迁移，不绑定单一前端。

这与外部 `Harness Engineering` 讨论中的 `guides / sensors` 思路一致：

- `guides`：在 agent 行动前提供方向和约束，例如 `AGENTS.md`、技能、架构文档、提示词、任务合同。
- `sensors`：在 agent 行动后提供反馈和纠偏，例如测试、lint、类型检查、日志、审查 agent、运行时指标。
- `state / memory / artifacts`：跨会话保存上下文、决策、工件和进度，避免长任务在换窗口或换工具后断裂。

## 最小落地原则

1. 先抽出最关键的 3-5 个 LobeHub agent prompt。
2. 每个 agent prompt 补齐 `Mission / Scope / Inputs / Outputs / Done Criteria / Handoff`。
3. 将 prompt 资产放到版本化目录，而不是只留在 LobeHub UI。
4. LobeHub 继续负责点火与角色手感。
5. Codex/本地仓库/Obsidian 负责执行、验证、记录和恢复。

## 相关链接

- [[多Agent协调与受控委派-2026-04-11]]
- [[多Agent通信信封与工件传递-2026-04-11]]
- Codex生态扩展与Harness编排研究-2026-04-15
- 08-多Agent协调模式
- 2026-04-28-LobeHub早间简报
