---
title: "swissweather 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "d071b99a2526"
summary: "🇨🇭 swissweather 技能"
---

# swissweather 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🇨🇭 swissweather 技能

> Get real-time weather measurements and forecasts for Switzerland using official MeteoSwiss data.

---

## 🛠️ 核心功能

- **实时观测**: 获取 100+ 自动监测站的温湿度、风速、气压及光照数据。
- **精准预报**: 基于邮政编码 (Postal Code) 的多日天气预报。
- **JSON 支持**: 所有输出均支持 `--json` 格式，方便 Agent 调用。

---

## 📖 使用方法

### 1. 获取当前实况
```bash
scripts/current_weather.py --station RAG  # 获取 Rapperswil 站数据
```

### 2. 获取预报 (邮编驱动)
```bash
scripts/forecast.py 8001 --days 7  # 获取苏黎世 7 日预报
```

---

## 🌡️ 可用数据维度

- **Temperature** (°C)
- **Wind Speed** (km/h) & **Direction** (°)
- **Precipitation** (mm)
- **Sunshine Duration** (min)

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
