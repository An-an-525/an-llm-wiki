---
title: "mesh-generation 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "1fef1e244e13"
summary: "🕸️ mesh-generation 技能"
---

# mesh-generation 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🕸️ mesh-generation 技能

> Plan and evaluate mesh resolution. Estimates grid sizing from physics scales and checks quality metrics.

---

## 🏗️ 分辨率选择准则

- **相场界面 (Interface)**: `dx ≤ width / 5`。
- **边界层 (Boundary Layer)**: `dx ≤ thickness / 10`。
- **波动 (Wave)**: `dx ≤ lambda / 20`。

---

## 🛠️ 质量评估指标

| 指标 | 范围 | 评价 |
| :--- | :--- | :--- |
| **长宽比 (Aspect Ratio)** | 1:1 - 3:1 | 优秀/良好 |
| **偏斜度 (Skewness)** | 0 - 0.5 | 优秀/良好 |
| **偏斜度** | > 0.8 | 极差 (可能导致求解失败) |

---

## 📖 使用示例

```bash
# 计算 1D 域的网格大小
python3 scripts/grid_sizing.py --length 1.0 --resolution 200 --json

# 检查网格质量
python3 scripts/mesh_quality.py --dx 1.0 --dy 0.1 --json
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[numerical-stability]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
