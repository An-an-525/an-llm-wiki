---
title: "site-reliability-engineer 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "00195da845f2"
summary: "🏗️ site-reliability-engineer 技能"
---

# site-reliability-engineer 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🏗️ site-reliability-engineer 技能

> Docusaurus build health validation and deployment safety. Specialized in pre-commit MDX validation and automated site health reports.

---

## 🛠️ 核心排障领域 (Anti-Patterns)

- **Liquid 冲突**: 扫描 MDX 外的 `{{ }}` 模板。
- **转义缺失**: 检测未转义的 `<` 符号（易被误认为 HTML）。
- **组件属性**: 校验 `SkillHeader` 等核心组件的 Props。
- **资源缺失**: 确保 Hero images 与 ZIP 文件物理存在。

---

## 📖 常用命令

```bash
npm run validate:liquid    # 校验 Liquid 语法
npm run validate:brackets  # 校验角括号
npm run validate:all       # 执行所有健康检查
```

---

## 📊 成功指标

- **构建成功率**: 目标从 85% 提升至 98%+。
- **诊断耗时**: 从 10 分钟降至 1 分钟以内。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[technical-writer]] - 协作维护文档质量。
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
