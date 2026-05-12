---
title: "mcaf-skill-curation 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "5c3c20fbaa7e"
summary: "🛠️ mcaf-skill-curation 技能"
---

# mcaf-skill-curation 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🛠️ mcaf-skill-curation 技能

> Create, update, and validate repository skills to match the real codebase and `AGENTS.md` rules.

---

## 🛠️ 核心工作流

1. **读取事实源**: 检查 `AGENTS.md` 及架构文档。
2. **清理冗余**: 识别并移除技能文件夹内的模板废料（README/INSTALL 等）。
3. **同步现实**: 确保技能引用的命令在 `AGENTS.md` 中真实存在。
4. **自动化校验**:
   ```bash
   python3 scripts/validate_skills.py <skills-dir>
   ```
5. **元数据生成**: 生成 `<available_skills>` 块用于 Agent 系统提示词。

---

## ⚠️ 关键准则

- **拒绝维基化**: `SKILL.md` 必须保持程序化和简洁，不作为知识百科。
- **触发器优化**: 优先更新 YAML `description` 触发词而非正文。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[Agent使用黑曜石准则]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
