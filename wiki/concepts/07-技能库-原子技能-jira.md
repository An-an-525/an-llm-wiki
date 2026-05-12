---
title: "jira 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "79281520c61d"
summary: "🟦 jira 技能 (SAFe Methodology)"
---

# jira 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🟦 jira 技能 (SAFe Methodology)

> Implement SAFe methodology in Jira. Use when creating Epics, Features, Stories with proper hierarchy, acceptance criteria, and parent-child linking.

---

## 🏗️ SAFe 层级结构

```
Portfolio Level:
└── Epic (Strategic Initiative)
    └── Feature (Benefit Hypothesis)
        └── Story (User Value)
            └── Subtask (Technical Work)
```

---

## 📖 核心操作

### 1. 识别项目类型
Next-Gen 与 Classic 项目在字段引用上存在重大差异：
- **Next-Gen**: 使用 `parent: { key: 'KEY' }` 进行关联。
- **Classic**: 使用 `customfield_10014` (Epic Link)。

### 2. 标准 Story 模板 (Next-Gen)
```javascript
const story = {
  fields: {
    project: { key: 'PROJ' },
    issuetype: { name: 'Story' },
    summary: 'As a [persona], I want [goal], so that [benefit]',
    parent: { key: 'EPIC_KEY' }
  }
};
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
