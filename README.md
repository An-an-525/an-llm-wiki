---
title: 安的个人书房
aliases: [an-llm-wiki, Karpathy-style LLM Wiki]
tags: [llm-wiki, obsidian, public]
category: synthesis
type: moc
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
summary: "安的公开个人书房：用 Karpathy 风格 LLM Wiki 方法，把项目、工具、路线和成长复盘整理成中文读者能进入的资料库。"
---

# 安的个人书房

这是安的公开个人书房，也是一个经过隐私过滤的 Obsidian LLM Wiki。它以 Andrej Karpathy 的 LLM Wiki 思路为架构来源：原始材料留在本地，公开页面是经过筛选、改写、链接和复核后的编译成果。

## 从这里开始

- [[wiki/index]] - 公开 wiki 工作台
- [[wiki/synthesis/an-public-study-room-portrait]] - 安的个人书房公开画像
- [[wiki/topics/personal-archive-moc]] - 个人资料库地图
- [[wiki/projects/personal-archive-frontend]] - 资料库展示前端
- [[wiki/concepts/prompt-engineering-operating-patterns-for-beginners]] - 面向小白的提示词工程模式
- [[wiki/topics/llm-wiki-moc]] - 架构和运行方式
- [[wiki/topics/publication-maintenance-moc]] - 发布、隐私和验收
- [[wiki/sources/karpathy-llm-wiki-pattern]] - 官方架构来源
- [Kimi 前端参考](docs/kimi-frontend-reference.md) - 公开安全的产品简报、数据模型和前端验收
- [资料库平台约束](docs/archive-platform-project-constraints.md) - 展示层、数据层、隐私和后续开发边界
- [内容写作与导入流程](docs/archive-content-style-and-ingest-workflow.md) - 内容深度、写作标准和验证流程
- [知识内容来源与审查标准](docs/knowledge-content-source-and-review-standard.md) - 来源、挑刺、中文小白可读性和公开质量闸门
- [Agent 技能栈](docs/agent-skill-stack.md) - 前端、后端、App、质量、安全和发布任务的技能链
- [[AGENTS]] - 维护规则
- [[CLAUDE]] - wiki schema
- [[log]] - 追加式维护日志

## 运行方式

原始材料留在本地。公开页面是经过编译的 Markdown 书页，带来源、链接、状态和边界说明。高风险访问材料、私人原文、本机细节和未复核导入不会进入公开仓库。

## 当前状态

- Archive ID: `pre-karpathy-rebuild-20260512-143127`
- 已迁移公开安全笔记：192
- 已复核源文件：11147
- 当前展示层：React + Vite 前端读取 `site-data/` 公开数据包
- 当前内容闸门：`scripts/check_public_content_quality.py` 检查精选页、生命周期学习包和前端晋升内容
