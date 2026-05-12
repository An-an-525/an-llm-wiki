---
title: "differentiation-schemes 技能"
aliases: ["differentiation-schemes"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "a76cf15a7ac3"
summary: "📐 differentiation-schemes 技能"
---

# differentiation-schemes 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📐 differentiation-schemes 技能

> Select and apply numerical differentiation schemes for PDE and ODE discretization. Generates finite-difference stencils at arbitrary order.

---

## 🛠️ 方案选择指南

- **平滑且周期性**: 使用中心差分 (Central) 或谱方法 (Spectral)。
- **平滑但有边界**: 中心差分（内部）+ 单侧差分（边界）。
- **包含激波/不连续**: 使用 Upwind, TVD 或 WENO。
- **高精度需求**: 使用紧致差分 (Padé)。

---

## 📖 常用指令

```bash
# 生成 4 阶精度的一阶导数中心差分算子
python3 scripts/stencil_generator.py --order 1 --accuracy 4 --scheme central --json

# 估算截断误差
python3 scripts/truncation_error.py --dx 0.01 --order 2 --accuracy 2 --scale 1.0 --json
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[numerical-stability]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
