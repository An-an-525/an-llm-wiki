---
title: "parameter-optimization 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "de66182faeee"
summary: "🧪 parameter-optimization 技能"
---

# parameter-optimization 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🧪 parameter-optimization 技能

> Explore and optimize simulation parameters via Design of Experiments (DOE) and sensitivity analysis.

---

## 🛠️ DOE 方法选择

- **低维 (<= 3) 全覆盖**: 使用 `factorial` (析因设计)。
- **中维 (3-20)**: 使用 `lhs` (拉丁超立方采样)。
- **灵敏度分析**: 使用 `quasi-random` (Sobol)。

---

## 📖 优化器选择建议

- **维数 <= 5 且 预算 <= 100**: 贝叶斯优化 (Bayesian Optimization)。
- **维数 <= 20**: CMA-ES。
- **高维**: 随机搜索 + 筛选。

---

## 💡 常用指令

```bash
# 生成 3 参数的 20 个 LHS 样本
python3 scripts/doe_generator.py --params 3 --budget 20 --method lhs --json

# 根据灵敏度分数排名
python3 scripts/sensitivity_summary.py --scores 0.7,0.3 --names kappa,mobility --json
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
