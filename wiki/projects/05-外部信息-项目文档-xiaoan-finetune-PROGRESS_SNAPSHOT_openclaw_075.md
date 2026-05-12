---
title: "PROGRESS SNAPSHOT openclaw 075"
aliases: []
tags: [llm-wiki, migrated]
category: project
type: project
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "2fa73e2f4a2c"
summary: "PROGRESS SNAPSHOT openclaw 075"
---

# PROGRESS SNAPSHOT openclaw 075

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# PROGRESS SNAPSHOT openclaw 075

## 当前成果总结
- 新重提取数据已接入：`raw_total=309`，清洗后 `imported=184`。
- 已完成 10% 并入策略集并做 pilot 训练：`output_openclaw_mix_s40`。
- pilot 指标已获取，可与原 `s40` 基线直接比较。

## 已解决的问题
- 完成新目录格式兼容（`openclaw_reextracted/openclaw_sft_triples.jsonl`）。
- 完成风险内容过滤并成功通过训练入口。

## 剩余工作计划
1. 输出本轮对比结论（是否继续并入、并入比例建议）。
2. 如继续：增加白名单筛选规则并做二次 pilot。

## 下一步具体行动
- 形成结论：当前 10% 并入在 s40 下未提升指标，先不扩比。

## 75% 自检
- 当前成果是否符合目标？是。
- 是否忽略更优方式？可进一步做语义质量过滤白名单。
- 下一步是否推进目标？是，进入结论与策略调整。
- 前置依赖是否齐全？是。
