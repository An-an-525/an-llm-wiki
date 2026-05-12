---
title: "Codex验证反馈回环主线 v1"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: topic
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "a6de416cbc63"
summary: "**当前定位**：`高级能力 / 按需启用`。这页保留的是强验证闭环，不是默认每个任务都必须走的重流程。"
---

# Codex验证反馈回环主线 v1

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Codex验证反馈回环主线 v1

> **当前定位**：`高级能力 / 按需启用`。这页保留的是强验证闭环，不是默认每个任务都必须走的重流程。
>
> 默认基线请先看 [[99 - Agent指南与规范/Codex-轻量通用规则-2026-04-24|Codex 轻量通用规则]]。

> 本页说明：如果某条流程已经“通过验证”，之后仍然出了问题，系统不允许只登记问题；必须把问题反推回验证流程本身。

## 当前判断

- `verification` 在需要高可靠收口时，不应被视为一次性盖章
- 任何“已验证后仍逃逸”的问题，都必须留下 `verification feedback`
- 未关闭的 verification feedback 会阻断相关 capability 再次收口
- 关闭 verification feedback 时，必须写明 `process_change_summary + evidence_ref`
- 如果 controller 已集成 delegated output，但 runtime 回写失败，也必须自动开 feedback，而不是只记 warning

## 最小闭环

1. 某条路径通过验证
2. 后续真实运行仍然出问题
3. 记录：
   - 哪条验证通过了
   - 逃逸问题是什么
   - 验证为什么漏检
   - 验证流程要怎么变
4. 在验证流程变化真正落地前，不允许把相关 capability 再次宣称收口
5. 只有留下新证据，才能把 feedback 标记为 `closed`

## 为什么这是硬约束

- 否则系统会把“通过验证”误当成永久正确
- 问题只会被记录，不会反向改进验证
- 长期看，验证流程会越来越失真，而不是越来越强

## 落点

- 账本：[[00 - 协作缓冲区/02 - Action_Items/验证反馈闭环-当前]]
- 运行命令：
  - `record-verification-feedback`
  - `close-verification-feedback`
- 阻断点：
  - `capability-review-close`

## 关联

- [[Codex治理任务编排主线-v1-2026-04-15]]
- [[Codex 自主能力进化地图]]
- [[00 - 协作缓冲区/02 - Action_Items/Codex 自主能力演进待办-当前]]
- [[06 - 周期回顾/每周/2026-W16-Codex-自主能力综合判断]]
