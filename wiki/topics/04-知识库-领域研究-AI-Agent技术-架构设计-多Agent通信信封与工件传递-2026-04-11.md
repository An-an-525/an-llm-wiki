---
title: "多Agent通信信封与工件传递"
aliases: ["多Agent通信信封与工件传递-2026-04-11"]
tags: [llm-wiki, migrated]
category: concept
type: topic
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "055e2af7c464"
summary: "目标：给本地多 Agent 协作补一套轻量但可审计的通信模型，重点不是“聊天更自由”，而是“传递更可追踪”。"
---

# 多Agent通信信封与工件传递

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 多Agent通信信封与工件传递

> 目标：给本地多 Agent 协作补一套轻量但可审计的通信模型，重点不是“聊天更自由”，而是“传递更可追踪”。

---

## 1. 当前推荐原则

- 先传工件，后传消息
- 先解决 `traceability`，后扩 `chat semantics`
- 先走主控转发，后评估 agent-to-agent 直连
- 当前本地主线优先 `execution manifest + artifact handoff`

---

## 2. 最小通信信封

建议每次跨 Agent 交接至少携带下列字段：

```text
trace_id
task_id
parent_run_id
sender
receiver_role
intent
status
artifact_refs
acceptance_hint
timestamp
```

解释：

- `trace_id`：把一次端到端执行串起来
- `task_id`：绑定到当前任务实体
- `parent_run_id`：说明这条交接来自哪次主控或上游执行
- `artifact_refs`：指向真实产物，而不是只留自然语言
- `acceptance_hint`：告诉接收方按什么标准接手或复核

---

## 3. 当前最值得传递的工件

| 工件类型 | 用途 | 当前适用性 |
| :--- | :--- | :--- |
| `research_brief.md` | 调研结论与证据摘要 | 高 |
| `execution_manifest.json` | 执行上下文与约束 | 高 |
| `diff_summary.md` | 代码/文档变更摘要 | 高 |
| `validation_result.json` | 验证结果、失败点、日志引用 | 高 |
| `note_path` | 黑曜石知识回写入口 | 高 |
| `free_form_message` | 解释性补充 | 中，不能替代工件 |

---

## 4. 为什么现在不先上通用消息总线

原因不在“消息总线不好”，而在当前本地主线更缺这些能力：

- `attempt lease`
- `runtime capability metadata`
- `execution manifest` 厚化
- `trace_id` 贯通
- Windows 补偿控制

在这些没补齐前，过早上消息总线只会让协作更热闹，但不会让系统更稳定。

---

## 5. 当前落地建议

1. 主控创建任务上下文和 `execution manifest`
2. 委派时只发送最小信封 + 工件引用
3. 子代理回传 `status + artifact_refs + acceptance_hint`
4. 主控统一写入 `Obsidian` 或代码仓

---

## 6. 失败模式

- 只有自然语言，没有产物引用
- 多个代理各自生成不同版本的“结论”
- 没有 `trace_id`，后续无法回放
- 把聊天记录误当系统状态

---

## 相关链接

- [[多Agent协调与受控委派-2026-04-11]]
- Agent 平台最佳实践与反模式-2026-04-11
- [[MCP_Protocol_Standard]]
- Multica 运行时目标
- 多Agent协作冲突处理协议
- 2026-04-11-详细行动存证
