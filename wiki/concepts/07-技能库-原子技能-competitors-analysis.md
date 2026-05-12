---
title: "competitors-analysis 技能"
aliases: ["competitors-analysis"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "14cab4d064b8"
summary: "🕵️ competitors-analysis 技能"
---

# competitors-analysis 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🕵️ competitors-analysis 技能

> Analyze competitor repositories with an evidence-based approach. All analysis must be based on actual cloned code, never assumptions.

---

## 🛠️ 核心准则：证据驱动

**禁止推测**。所有关于架构、技术栈、版本的描述必须标注来源文件与行号。

### 必须遵循的模式
- **正确**: "使用 better-sqlite3 (来源: package.json:88)"
- **错误**: "可能使用了 SQLite..."

---

## 📖 分析工作流 (Workflow)

1. **Clone**: 将竞品仓库克隆至 `~/Workspace/competitors/{product}/`。
2. **Fact Gathering**:
   - 读取 `package.json` / `requirements.txt` 获取依赖。
   - 扫描 `src/` 目录理解物理结构。
   - 提取 `README.md` 与 `CHANGELOG.md` 获取官方定位。
3. **Deep Dive**: 针对核心算法或 ASR 实现进行源码级穿透。
4. **Draft Profile**: 使用标准化模板产出分析报告。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- 知识资产审计报告
- 研究策略师 MOC
- [[sec-filing-watcher]] - 获取公开财务与披露信息。
- [[git-changes-reporter]] - 分析竞品代码库变更趋势。

---

*最后更新：2026-04-10*
