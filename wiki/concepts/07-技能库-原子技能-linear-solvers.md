---
title: "linear-solvers 技能"
aliases: ["linear-solvers"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "e15c72148c44"
summary: "🧮 linear-solvers 技能"
---

# linear-solvers 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧮 linear-solvers 技能

> Select and configure linear solvers for Ax=b systems. Handles direct (LU, Cholesky) and iterative (CG, GMRES) methods.

---

## 🛠️ 选择流程

### 1. 矩阵规模
- **小且稠密 (n < 5000)**: 优先使用直接法（LU, Cholesky）。
- **大且稀疏**: 进入迭代法选择。

### 2. 迭代法选择
- **SPD (对称正定)**: 使用 CG + AMG/IC 预处理。
- **对称不定**: 使用 MINRES。
- **非对称**: 使用 GMRES 或 BiCGSTAB。

---

## 📖 常用脚本

- `solver_selector.py`: 根据矩阵属性推荐求解器。
- `convergence_diagnostics.py`: 诊断收敛停滞原因。
- `preconditioner_advisor.py`: 推荐预处理子。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[differentiation-schemes]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
