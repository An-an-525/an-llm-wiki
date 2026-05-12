---
title: "hooks-development 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "ff4c8013ddcb"
summary: "⚓ hooks-development 技能"
---

# hooks-development 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# ⚓ hooks-development 技能

> Guide for developing Claude Code hooks (PreToolUse, PostToolUse) with proper output visibility patterns.

---

## 🛠️ 核心可见性模式

**关键点**: PostToolUse 钩子的标准输出仅在 JSON 包含 `"decision": "block"` 时才对 Claude 可见。

| 输出格式 | 可见性 |
| :--- | :--- |
| **纯文本** | 不可见 |
| **JSON (无 block)** | 不可见 |
| **JSON (含 block)** | **可见** |

---

## 📖 最小工作模式 (Bash)

```bash
#!/usr/bin/env bash
PAYLOAD=$(cat)
# ... 逻辑判断 ...
if [[ condition ]]; then
    jq -n --arg r "[HOOK] Message" '{decision: "block", reason: $r}'
fi
```

---

## 🐞 调试排障

1. **验证执行**: 向 `/tmp` 写入调试日志。
2. **校验格式**: 管道连接 `jq .` 确保 JSON 合法。
3. **检查匹配**: 核对 `hooks.json` 中的 `matcher` 正则表达式。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[ADR-架构决策日志]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
