---
title: "多Agent协调与受控委派"
aliases: ["多Agent协调与受控委派-2026-04-11"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "44cc736e338a"
summary: "目标：明确当前本地多 Agent 应该怎样协作，才不会退化成多主控、多写口和不可审计的混乱系统。"
---

# 多Agent协调与受控委派

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 多Agent协调与受控委派

> 目标：明确当前本地多 Agent 应该怎样协作，才不会退化成多主控、多写口和不可审计的混乱系统。

---

## 1. 当前默认拓扑

- `Codex`：唯一主控，负责目标澄清、研究、路线选择、验收和知识回写
- `Multica`：任务编排、runtime 注册、claim/execute 回传的运行时承载层
- `delegated agents`：被约束的研究面、执行面或验收面，不独立定义全局目标
- `Obsidian`：操作记忆、知识导航、过程存证层

这意味着当前应坚持“**单主控 + 多执行面**”，而不是“多个平级主脑互相对话”。

---

## 2. 什么情况值得委派

适合委派：

- 独立的只读调研
- 边界清晰的单模块实现
- 与主线并行的验证、审计、对账
- 可通过明确工件回传的子任务

不适合委派：

- 主控下一步就被结果卡住的关键判断
- 需要不断改口径的模糊问题
- 写口重叠、容易冲突的同文件并改
- 还没把目标、约束和验收说清的任务

---

## 3. 委派最小契约

每次有效委派，至少应写清这些字段：

| 字段 | 含义 |
| :--- | :--- |
| `objective` | 子任务真正要达成的结果 |
| `scope` | 允许读写的范围 |
| `authority` | 可用工具和可做动作 |
| `deliverable` | 必须回传的工件 |
| `verification` | 如何证明做成了 |
| `stop_conditions` | 何时停止并上报 |

如果这些字段写不出来，通常说明还不该派。

---

## 4. 当前本地推荐流程

1. 主控先做一次本地证据核对
2. 把委派目标压成一个可验收结果
3. 指定工具权限、写入目标、停止条件
4. 子代理只在边界内执行
5. 回传 `research brief / diff summary / validation result / note path`
6. 主控做最终整合、验收和写回

对中大任务，还应显性化三张工件：

- `Research Brief`
- `Delegation Record`
- `Acceptance Record`

---

## 5. 当前本地主线下的协调原则

- `Multica` 先补执行契约，不先做泛化聊天总线
- `execution manifest` 是当前最自然的委派骨架
- `artifact handoff` 比 `free-form chat` 更适合现在的验收要求
- 任何跨仓、跨系统、跨权限边界的动作都应由主控最终确认

---

## 6. 常见偏差

- 把“多 Agent”理解成多个代理自由讨论
- 把“研究子代理”升级成另一个决策中心
- 让多个代理同时写同一入口页
- 没有回传工件，只回一句“我做完了”

---

## 相关链接

- [[多Agent通信信封与工件传递-2026-04-11]]
- 本地工具权限地图与审批边界-2026-04-11
- 多Agent协作冲突处理协议
- Multica-转接协议-2026-04-11
- Multica 运行时目标
- 2026-04-11-详细行动存证
