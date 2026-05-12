---
title: "ccsinfo 技能"
aliases: ["ccsinfo"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "3cb6a3bddd7a"
summary: "System and environment information collector for Claude Code environments. Use when diagnosing environment issues or identifying hardware capabilities."
---

# ccsinfo 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🖥️ ccsinfo 技能

> System and environment information collector for Claude Code environments. Use when diagnosing environment issues or identifying hardware capabilities.

---

## 🛠️ 核心功能

- **环境采集**: 获取 OS, Node.js, Python, Docker 等版本信息。
- **硬件识别**: 识别 CPU 核心数、可用显存、显卡型号（CUDA/Metal）。
- **路径审计**: 输出当前工作区及关键配置文件路径。

---

## 📖 使用方法

### 全量信息导出
```bash
node scripts/collect_info.js --output system_report.json
```

### 仅导出 AI 兼容性报告
```bash
node scripts/collect_info.js --ai-check
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- 基础设施运维底座

---

*最后更新：2026-04-10*
