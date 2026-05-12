---
title: "commit 技能"
aliases: ["commit"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "3d4cc153e9ff"
summary: "📝 commit 技能 (Smart Commit)"
---

# commit 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📝 commit 技能 (Smart Commit)

> Creates commits with conventional format and validation. Use when committing changes or generating commit messages.

---

## 🛠️ 核心工作流

### Phase 1: 安全性检查
- **禁止直推**: 严禁在 `main`, `master`, `dev` 分支直接提交。
- **分支规范**: 必须切换到 `feat/`, `fix/`, `issue/` 分支。

### Phase 2: 本地验证
- **代码扫描**: 必须运行 CI 级别的检查（Ruff, MyPy, ESLint, TypeCheck）。
- **测试通过**: 确保所有测试用例已通过。

### Phase 3: 自动归因 (Agent Attribution)
- 自动读取 `.claude/agents/activity/{branch}.jsonl`。
- 将参与协作的 Agent 名称及耗时写入 `Co-Authored-By` 脚注。

---

## 📖 常用类型 (Commit Types)

| 类型 | 用途 |
| :--- | :--- |
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `refactor` | 重构优化 |
| `docs` | 文档更新 |
| `chore` | 构建/依赖变更 |

---

## 🔗 相关链接

- [[技能库 MOC]]
- GitHub 技能
- [[MuleRun_Skills_Hub]]
- [[git-changes-reporter]] - 为提交信息提供内容参考。
- git-worktree-setup - 在不同工作树中应用提交。

---

*最后更新：2026-04-10*
