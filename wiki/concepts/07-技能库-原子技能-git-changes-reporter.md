---
title: "git-changes-reporter 技能"
aliases: ["git-changes-reporter"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "b7a7129a413d"
summary: "📝 git-changes-reporter 技能"
---

# git-changes-reporter 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📝 git-changes-reporter 技能

> Generate structured reports of Git changes between branches, tags, or commits. Use when creating release notes or auditing project progress.

---

## 🛠️ 核心功能

- **差异摘要**: 提取提交信息并归类为“新增”、“修复”和“破坏性变更”。
- **文件审计**: 列出受影响的核心文件及其变更类型。
- **格式化输出**: 支持导出为 Markdown, JSON 或 PDF 报告。

---

## 📖 使用方法

### 1. 生成两个版本间的报告
```bash
./scripts/generate_report.sh v1.0.0 v1.1.0 --output CHANGELOG.md
```

### 2. 生成最近 24 小时的变更
```bash
python3 scripts/daily_summary.py --repo "."
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- GitHub 技能
- 最近更新
- [[commit]] - 基于变更生成提交。
- github - 拉取远端变更数据。

---

*最后更新：2026-04-10*
