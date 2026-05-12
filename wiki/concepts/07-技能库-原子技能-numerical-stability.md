---
title: "numerical-stability 技能"
aliases: ["numerical-stability"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "d40f296e40ec"
summary: "⚖️ numerical-stability 技能"
---

# numerical-stability 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# ⚖️ numerical-stability 技能

> Analyze numerical stability for PDE simulations. Checks CFL, Fourier criteria, and von Neumann stability.

---

## 🛠️ 稳定性限制速查

| 物理过程 | 指标 | 显式限制 (1D) | 公式 |
| :--- | :--- | :--- | :--- |
| **平流 (Advection)** | CFL | C ≤ 1 | `C = v·dt/dx` |
| **扩散 (Diffusion)** | Fourier | Fo ≤ 0.5 | `Fo = D·dt/dx²` |
| **反应 (Reaction)** | Reaction | R ≤ 1 | `R = k·dt` |

---

## 📖 常用操作

```bash
# 检查 2D 扩散-平流的 CFL/Fourier
python3 scripts/cfl_checker.py --dx 0.1 --dt 0.01 --velocity 1.0 --diffusivity 0.1 --dimensions 2 --json

# 检测刚性 (Stiffness)
python3 scripts/stiffness_detector.py --eigs=-1,-1000 --json
```

---

## 💡 决策建议

- **刚性问题**: 如果刚性比 > 1000，强制使用隐式 (Implicit) 求解器。
- **不满足限制**: 缩小 `dt` 或增大 `dx`。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[time-stepping]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
