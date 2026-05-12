---
title: "prometheus-api 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "7bda54c8fed4"
summary: "📈 prometheus-api 技能"
---

# prometheus-api 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📈 prometheus-api 技能

> 通过 Prometheus HTTP API 查询监控数据。适用于 PromQL 即时查询、区间查询、目标/规则/告警状态检查，以及 TSDB 元数据与管理操作。

---

## 🛠️ 核心能力

- **即时查询**: 使用 `/api/v1/query` 执行单点时刻的 PromQL。
- **区间查询**: 使用 `/api/v1/query_range` 获取一段时间内的矩阵结果。
- **状态与元数据**: 查看 `/targets`, `/rules`, `/alerts`, `/metadata`, `/status/*` 等端点。
- **运维管理**: 在启用 `--web.enable-admin-api` 后，可执行快照、删 series、清 tombstone 等管理动作。

---

## 📖 快速用法

```bash
# 即时查询
curl 'http://<prometheus>:9090/api/v1/query?query=up'

# 区间查询
curl 'http://<prometheus>:9090/api/v1/query_range?query=rate(http_requests_total[5m])&start=<ts>&end=<ts>&step=1m'

# 健康检查
python scripts/prom_health.py http://localhost:9090
```

### 常见 PromQL 模式

- `rate(http_requests_total[5m])`
- `sum by (job) (rate(http_requests_total[5m]))`
- `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`
- `up{job="prometheus"}`

---

## ⚠️ 注意事项

- **响应统一为 JSON**: 关注 `status / data / errorType / error / warnings` 字段。
- **错误码含义要区分**: 常见为 `400` 参数错误、`422` 表达式错误、`503` 超时。
- **管理接口有风险**: `delete_series`、`clean_tombstones` 只能在明确启用 Admin API 且确认影响范围后再用。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- [[site-reliability-engineer]]
- [[unraid]]

---

*最后更新：2026-04-11*
