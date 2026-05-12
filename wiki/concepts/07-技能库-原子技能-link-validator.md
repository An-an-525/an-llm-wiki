---
title: "link-validator 技能"
aliases: ["link-validator"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "f14c08996485"
summary: "🔗 link-validator 技能"
---

# link-validator 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🔗 link-validator 技能

> Validate markdown link portability in skills. Prevents absolute repository paths from breaking cross-installation.

---

## 🛠️ 核心校验规则

| 路径类型 | 示例 | 结果 |
| :--- | :--- | :--- |
| **绝对路径** | `/skills/foo/SKILL.md` | 🚩 **违规** (安装后失效) |
| **相对路径** | `./references/guide.md` | ✅ **通过** |
| **外部 URL** | `https://example.com` | ✅ **通过** |
| **锚点** | `#section` | ✅ **通过** |

---

## 📖 快速上手

```bash
# 校验单个技能
uv run scripts/validate_links.py ~/.claude/skills/my-skill/

# 校验整个插件 (含多个技能)
uv run scripts/validate_links.py ~/.claude/plugins/my-plugin/
```

---

## 🚦 退出码参考

- `0`: 所有链接有效。
- `1`: 发现违规绝对路径。
- `2`: 路径无效或无 Markdown 文件。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[markdown-tools]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
