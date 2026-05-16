---
title: 生命周期复刻学习包流程
aliases: ["复刻学习包流程", "Copyable Learning Package Workflow"]
tags: [learning-path, lifecycle, documentation, llm-wiki, curated, featured, beginner-friendly]
category: synthesis
type: learning-path
status: featured
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
  - "[[wiki/sources/obsidian-properties]]"
  - "[[wiki/sources/diataxis-framework]]"
  - "[[wiki/sources/tutorial-and-source-research-best-practices]]"
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
publicSafety: public-safe
sourceLabels: [official pattern, local compile, learning design, github-skills]
referenceTypes: [official-docs, documentation-framework, github-skills, personal-evidence, review]
reviewStatus: challenged
reviewNotes: "按谱系教程技能重写：明确小白成果、阶段、交付物、检查点和失败处理。"
whyItMattered: "它把安的项目经历从零散记录变成小白可照做的学习包，让读者不只看成果，还能走一遍更小的路径。"
psychologicalLayer: "新手读项目最容易被成品压倒。复刻学习包把大项目切成小交付物，让读者先完成一个可见结果。"
sociologicalLayer: "GitHub、开源教程和文档社区都强调可协作、可维护、可反馈。安的书房也要把个人经验写成别人能接手的格式。"
philosophicalLayer: "知识的公共性，不在于它被公开，而在于别人能沿着它行动。"
actionText: "选择一个工坊项目，按 5 个阶段写出最小复刻路线：目标、材料、步骤、验收、下一步。"
operationStory:
  - "先把本地材料索引成私有证据，不直接公开原文。"
  - "再搜索官方文档、GitHub 示例和教程框架，确认外部最佳实践。"
  - "然后把项目经历改写成教程、操作指南、参考表和解释。"
  - "最后用前端详情页检查读者是否能按步骤复刻。"
replicationSteps:
  - "选一个真实项目，不要选抽象主题。"
  - "写下读者完成后的最小作品。"
  - "拆成 3 到 5 个阶段，每个阶段只有一个主要动作。"
  - "给每个阶段写交付物和检查点。"
  - "写失败信号和修复动作。"
  - "补来源、隐私边界和下一步阅读。"
failureModes:
  - "把学习包写成目录，读者看完不知道做什么。"
  - "步骤太多，第一阶段就劝退小白。"
  - "只有安的经历，没有外部来源和公开参考。"
  - "只写成功路径，不写失败时怎样停下来。"
  - "用私有上下文支撑公开步骤，读者无法复刻。"
lessons:
  - "一个学习包只服务一个具体目标。"
  - "教程要先让读者成功一次，再补解释和参考。"
  - "复刻路径要有检查点，否则步骤只是愿望。"
  - "公开边界和学习设计同样重要。"
summary: "把安的项目经历整理成小白可复刻学习包的标准流程：先找证据和外部标准，再拆成目标、阶段、交付物、检查点和失败处理。"
---

# 生命周期复刻学习包流程

这条谱系路线说明：怎样把安做过的一个项目，改写成别人能照着做的小型学习包。

它参考了三个外部标准：Karpathy LLM Wiki 的原始层和编译层分离，Diátaxis 的教程、操作、参考、解释分离，以及 GitHub Skills 的任务式课程结构。三者合在一起，得到一个适合安的书房的规则：先有证据，再写教程；先让读者完成一个小作品，再讲复杂道理。

## 最终小作品

读者完成这条路线后，应该得到一份学习包页面。它至少包含：

- 一个真实项目；
- 一个小白能完成的最小目标；
- 3 到 5 个阶段；
- 每阶段的交付物；
- 每阶段的检查点；
- 失败信号和修复动作；
- 来源和公开边界。

## 阶段一：确定一个真实项目

不要从“我要做一个 AI 教程”开始。太大。

从一个真实项目开始，例如：

- 个人资料库平台；
- 资料库展示前端；
- Coze 风格 Agent 搭建器研究；
- 小安本地模型学习闭环。

交付物：写一句话说明这个项目是什么。

检查点：这句话不依赖私有上下文，陌生读者也能听懂。

失败信号：你只能用工具名解释项目，说明还没抓住真实问题。

## 阶段二：写最终小作品

问自己：读者读完后能做出什么？

不要写“掌握资料库架构”。这太虚。要写：

- 做出三张项目卡；
- 画出一个只读 Agent 工作流；
- 写出一页公开安全项目说明；
- 建一个最小 site-data JSON。

交付物：一句“读者会做出什么”。

检查点：这个结果能被看见、打开、运行或检查。

## 阶段三：拆成 3 到 5 步

GitHub Skills 的课程设计建议小步推进，不要让学习者一开始就被复杂度压倒。安的书房采用同样原则。

每一步只做一件事：

| 阶段 | 动作 | 交付物 |
|---|---|---|
| 1 | 选项目 | 项目一句话 |
| 2 | 提取证据 | 事实清单 |
| 3 | 写公开页 | wiki 页面 |
| 4 | 生成数据 | 前端卡片 |
| 5 | 验收 | 检查结果 |

检查点：每个阶段都能单独完成。

失败信号：一个阶段里塞了三件不同的事。

## 阶段四：补失败处理

学习包必须告诉读者哪里会错。

常见失败：

- 找不到来源；
- 写成自嗨复盘；
- 步骤太抽象；
- 公开内容依赖私有细节；
- 前端卡片没有下一步。

每个失败都要有修复动作，例如：

- 找不到来源：先标记为 `needs-source-review`；
- 步骤太抽象：改成一个可见交付物；
- 前端无下一步：补 `actionText`。

## 阶段五：发布前验收

验收不是走形式。它决定这条内容能不能进入前端核心展示。

必须检查：

- 隐私扫描无高风险；
- wiki 结构无断链；
- 前端数据能生成；
- 工坊详情页能打开；
- 小白能看懂下一步；
- 内容不是只改写别人的资料，而是结合安自己的证据。

再用 [[wiki/concepts/content-critique-and-review-rubric]] 做一次反向挑刺：来源、小白、复刻、隐私、前端和自动化六项都能解释，才算可以进入核心展示。

## 三层理解

**心理层**：复刻路线给新手一个低压入口。人只要先完成一个小东西，后面就不再只是旁观。

**社会层**：学习包把个人项目翻译成公共协作语言。未来 Kimi、Codex、读者和安自己，都能沿着同一套结构继续补内容。

**哲学层**：经验只有被别人拿来行动时，才真正离开了个人记忆，成为知识。

## 下一步练习

选择 [[wiki/projects/lifecycle-frontend-archive-site]]，把它压缩成一条 5 步路线。每一步只写一个交付物和一个检查点。

## Related

- [[wiki/concepts/lifecycle-replication-package-template]]
- [[wiki/concepts/content-critique-and-review-rubric]]
- [[wiki/synthesis/lifecycle-package-backlog]]
- [[wiki/sources/tutorial-and-source-research-best-practices]]
- [[wiki/synthesis/github-best-practice-learning-loop]]
