---
title: 公开工具与 Agent 清单
aliases: ["公开工具与 Agent 清单", "Tool Agent Inventory"]
tags: [tools, agent, skills, inventory, curated]
category: tools
type: inventory
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/topics/skills-and-tools-moc]]"
  - "[[wiki/concepts/agent-skill-governance]]"
  - "[[wiki/projects/personal-archive-platform]]"
publicSafety: public-safe
sourceLabels: [public wiki, tool inventory, agent workflow]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "工具清单如果只列名字，对小白几乎没有帮助。真正有用的是说明每类工具解决什么问题、连接哪个项目、风险在哪里、怎样复刻一个最小用法。"
actionText: "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。"
operationStory:
  - "先按产出分组：写代码、整理资料、测试前端、管理 Agent、生成数据、发布 GitHub。"
  - "再把每组工具连接到一个项目或流程，避免变成工具名收藏。"
  - "把账号状态、私有提示词和本地运行细节排除在公开清单之外。"
replicationSteps:
  - "先写工具任务，而不是先写工具名字。"
  - "把工具绑定到一个真实项目和一个真实流程。"
  - "记录公开风险：账号状态、访问材料、路径、私有提示词、运行日志哪些不能展示。"
  - "只有当项目证据清楚时，才把工具升级成详细卡片。"
failureModes: [只收藏工具名, 没有项目证据就宣称能力, 暴露私有提示词, 把工具当成成果]
lessons: [工具需要角色, Agent 需要边界, 能力声明必须绑定项目证据]
summary: "安的公开工具与 Agent 清单：按任务角色整理代码、知识库、浏览器验收、Agent 技能、工作流平台、本地模型和发布闸门。"
---

# 公开工具与 Agent 清单

这张清单不是为了证明“我用过很多工具”。工具名字本身没有价值，真正有价值的是：它解决了什么问题，在哪个项目里用过，新手怎样安全地复刻一个最小用法。

公开清单不列账号、私有提示词、本地运行状态或未复核配置。它只列读者能理解、能复用、能避坑的角色。

## 工具分组

| 分组 | 公开角色 | 连接页面 |
|---|---|---|
| 代码 Agent | 帮助实现、检查、测试和维护代码与公开资料页 | [[wiki/concepts/agent-skill-governance]] |
| 知识库工具 | 保存 Markdown、双链、来源标签和导航地图 | [[wiki/projects/personal-archive-platform]] |
| 浏览器与前端验收 | 检查公开前端的路由、截图、移动端和构建结果 | [[wiki/projects/personal-archive-frontend]] |
| Agent 协议与技能 | 把可重复流程写成明确规则和操作技能 | [[wiki/topics/skills-and-tools-moc]] |
| 工作流平台 | 学习可视化工作流、工具节点和自动化边界 | [[wiki/projects/coze-agent-builder-research]] |
| 本地模型工具 | 支持小样本实验、数据审核和训练复盘闭环 | [[wiki/projects/xiaoan-local-model-learning-loop]] |
| 发布闸门 | 检查结构、隐私、清单、测试、前端构建和内容质量 | [[wiki/topics/publication-maintenance-moc]] |

## 读者怎么用这张清单

读者不要按名字追工具。更好的方法是先问自己要做什么：

1. 想做网页展示，看“前端验收”和“知识库工具”。
2. 想复刻 Agent，看“工作流平台”和“Agent 协议与技能”。
3. 想整理自己的资料，看“知识库工具”和“发布闸门”。
4. 想做小安这类数字生命体，看“小安人格与边界”和“本地模型工具”。
5. 想把内容推到 GitHub，看“发布闸门”。

每一类工具后续都应该写成卡片。卡片必须包含：名称、角色、用于什么任务、学习价值、关联项目、风险等级、公开状态和一个最小复刻动作。

## Agent 边界

Agent 有价值的前提是输入、输出和责任清楚。公开页面应该描述：

- 任务范围；
- 交付物；
- 验收闸门；
- Agent 不允许发布的内容。

它们不应该公开原始提示词、私有记忆、隐藏规则或账号绑定状态。

## 下一批工具卡

已经可以作为起点的卡片：

- [[wiki/concepts/tool-obsidian-karpathy-wiki-compilation]] - Obsidian 与 Karpathy 风格 wiki 编译。
- [[wiki/concepts/tool-codex-validation-workflow]] - Codex 辅助验收流程。
- [[wiki/concepts/tool-browser-ui-testing-workflow]] - 浏览器和前端 QA 流程。
- [[wiki/concepts/tool-github-publication-workflow]] - 公开仓库发布流程。
- [[wiki/concepts/tool-privacy-scan-publication-gate]] - 隐私扫描发布闸门。
- [[wiki/concepts/tool-local-private-wiki-compiler]] - 本地私有编译层。
- [[wiki/concepts/tool-agent-skill-stack-routing]] - Agent 工作的技能路由。
- [[wiki/concepts/tool-coze-workflow-platform-study]] - Coze 风格工作流平台研究。
- [[wiki/concepts/tool-local-model-experiment-toolchain]] - 本地模型实验治理。
- [[wiki/concepts/tool-site-data-generation-backend]] - 生成式 `site-data` 后端。

## 安的提醒

- 工具不是身份标签。工具只有进入项目，才有证据。
- 不要用“我会很多工具”替代“我做成了什么”。
- 公开讲工具时，永远先讲任务，再讲工具名。
- 任何涉及账号状态、访问材料、路径、私有提示词的内容，都只写边界，不写明文。

## 相关

- [[wiki/topics/skills-and-tools-moc]]
- [[wiki/concepts/agent-skill-governance]]
- [[wiki/synthesis/capability-evidence-matrix]]
