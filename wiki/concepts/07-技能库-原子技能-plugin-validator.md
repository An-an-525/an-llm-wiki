---
title: "plugin-validator 技能"
aliases: ["plugin-validator"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "4a33deef6d11"
summary: "🔌 plugin-validator 技能"
---

# plugin-validator 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🔌 plugin-validator 技能

> Comprehensive validation for Claude Code marketplace plugins. Audits structure, manifest syntax, and silent failures.

---

## 🛠️ 验证阶段 (Phases)

### 1. 结构验证
检查 `plugin.json` 是否存在，校验 JSON 语法及其必填字段（name, version, description）。

### 2. 静默失败审计 (Silent Failure Audit)
**核心规则**: 所有 Hook 入口点在失败时 **必须** 输出至 `stderr`。
- **Bash**: 严禁静默执行 `mkdir|cp|mv|rm|jq`，必须包裹在 `if !` 中。
- **Python**: 严禁 `except.*: pass`，必须打印错误信息。

---

## 📖 常用命令

```bash
# 验证插件并获取修复建议
uv run scripts/audit_silent_failures.py plugins/my-plugin/ --fix
```

---

## ⚠️ 关键模式对齐

- **错误示范**: `mkdir -p "$DIR"`
- **标准实践**: `if ! mkdir -p "$DIR" 2>&1; then echo "Fail" >&2; fi`

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[link-validator]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
