---
title: 信息复核队列
aliases: ["信息复核队列", "Review Queue"]
tags: [review, publication, information-architecture, curated]
category: synthesis
type: queue
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
publicSafety: public-safe
sourceLabels: [public wiki, review queue, local compile]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "它把缺失、拿不准、需要复核的信息显性化，避免用漂亮页面掩盖不确定性。"
actionText: "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。"
operationStory:
  - "把非公开层里的后续问题改写成公开安全的复核类别。"
  - "只记录复核方向和决策状态，不记录敏感值、身份细节或访问材料。"
  - "明确下一批内容公开前必须先决定什么。"
replicationSteps:
  - "把不确定信息写成复核项，而不是直接写成事实。"
  - "标记它属于安全、身份、项目、能力还是时间线风险。"
  - "只有复核状态改变后，才允许进入公开展示。"
failureModes: ["把不确定信息当成事实发布", "把安全问题藏在心里不记录", "把非公开队列和公开队列混在一起"]
lessons: ["复核队列也是知识库的一部分", "被标记的不确定性比假确定更有价值", "公开范围必须有明确闸门"]
summary: "公开安全的信息复核队列，用来记录下一批内容发布前仍需判断的安全、身份、项目、能力和时间线问题。"
---

# 信息复核队列

这张队列的作用，是让信息质量看得见。它只记录公开安全的类别、风险和决策状态，不记录私有细节。

一个资料库越想做得完整，越容易把“我大概知道”误写成“事实就是这样”。复核队列就是用来阻止这种滑坡：不确定的地方先排队，不能为了页面好看就强行公开。

## P0 安全复核

- 判断类似密钥的线索是仍在使用、已经失效，还是误报。
- 轮换和处理动作留在非公开层。
- 不公开密钥值、账号状态、本地环境地图或服务器细节。

## P1 身份与个人范围

- 判断哪些个人信息适合公开，哪些只适合留在本地。
- 私人记忆和未经改写的个人记录留在非公开层。
- 成长经历优先改写成项目节点、学习节点和复盘节点，而不是裸露的私人传记。

## P2 项目选择

- 从第一批项目之外继续选择公开候选。
- 每个项目必须有目标、证据路径、可复刻经验和当前状态。
- 学校、账号、部署、私有协作等信息，只有经过明确改写后才能进入公开层。

已公开的起点：

- [[wiki/projects/personal-archive-frontend]]
- [[wiki/projects/coze-agent-builder-research]]
- [[wiki/projects/xiaoan-local-model-learning-loop]]

## P3 能力声明

- 每一项公开能力都要能指向项目证据。
- 避免“我会很多工具”这类无法追踪的泛泛声明。
- 先把工作流写成页面，再抽象成技能或能力清单。

新的公开标准：

- [[wiki/synthesis/public-tool-and-agent-inventory]]
- [[wiki/concepts/sensitive-context-rewrite-rules]]
- [[wiki/concepts/upstream-reference-and-adaptation-policy]]

## P4 Agent 上下文

- 区分当前有效规则和历史恢复规则。
- 公开操作模型，不公开原始提示词或本地运行状态。
- 只为可复用工作创建技能，不为一次性动作制造复杂流程。

## 安的提醒

好的公开资料库不怕写“待复核”。它怕的是把不确定的东西写得太确定。读者不需要一个永远正确的神话，他需要一个诚实、可追踪、能继续修正的系统。

## 相关

- [[wiki/synthesis/archive-information-architecture]]
- [[wiki/synthesis/project-evidence-matrix]]
- [[wiki/synthesis/public-growth-timeline-framework]]
- [[wiki/concepts/public-work-card-standard]]
- [[wiki/concepts/sensitive-context-rewrite-rules]]
