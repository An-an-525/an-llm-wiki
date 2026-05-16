---
title: 从单次提问到 Agent 工作流
aliases: ["Agent 工作流认知变化", "从提问到工作流"]
tags: [feed, agent, workflow, cognition, curated, beginner-friendly]
category: event
type: feed
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
eventDate: 2026-04-10
sources:
  - "[[wiki/synthesis/growth-timeline-agent-workflow-phase]]"
  - "[[wiki/concepts/agent-skill-governance]]"
  - "[[wiki/projects/coze-agent-builder-research]]"
publicSafety: public-safe
sourceLabels: [public wiki, agent workflow, cognition]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "安开始从单次提问转向 Agent 工作流：不再只问模型答案，而是让任务有角色、边界、步骤、产出和验收。"
actionText: "先读 Coze 风格 Agent 搭建器研究，再照着画一个只读的最小工作流。"
operationStory:
  - "把任务从一句请求拆成角色、输入、边界、输出和验收。"
  - "开始使用技能和规则约束 Agent，而不是每次都重新解释上下文。"
  - "意识到多 Agent 并行只有在任务边界清楚时才有意义。"
replicationSteps:
  - "选一个真实任务，例如整理一页项目说明。"
  - "写清角色：谁负责内容，谁负责安全，谁负责前端验收。"
  - "写清输入：只能使用哪些公开材料。"
  - "写清输出：最后必须交付什么文件或页面。"
  - "写清验收：怎样判断这次工作不是空话。"
failureModes: [把 Agent 当万能助手, 没有边界就并行, 只看输出不看验收, 把私有上下文带进公开页]
lessons: [Agent 的价值来自流程而非神秘感, 技能是可重复的任务契约, 多子代理需要清楚的写入边界]
summary: "安从单次提问转向 Agent 工作流：把任务拆成角色、输入、边界、输出和验收，让 AI 协作从临时聊天变成可复刻流程。"
---

# 从单次提问到 Agent 工作流

这条风信记录的是安对 Agent 的一次关键理解：模型回答问题只是起点，真正能改变工作方式的是流程。

单次提问像临时请人帮忙。Agent 工作流像安排一个小团队：谁看资料，谁写内容，谁检查安全，谁验收页面。它看起来更复杂，但如果分工清楚，反而更稳定。

## 外部趋势

很多 AI 产品正在从“聊天框”走向“工作流”：工具调用、知识库、浏览器操作、代码修改、自动验收、多 Agent 协作都在进入普通人的界面。

这意味着学习重点也变了。以前只要学会提问，现在还要学会：

1. 定义任务边界；
2. 管理资料来源；
3. 记录过程；
4. 控制风险动作；
5. 验收结果。

## 安的认知变化

安开始意识到，Agent 不应该被当成一个更会说话的助手。它更像一种工作组织方式。

如果没有边界，Agent 会把混乱放大。如果边界清楚，Agent 能把复杂任务拆成几段可以检查的行动。这里的差别，不在模型多聪明，而在人有没有把工作讲清楚。

## 行动建议

想复刻这条路，可以先做一个最小 Agent 工作流：

1. 只选一个任务：把一页项目经历改写成公开案例。
2. 设置一个内容角色：负责写故事和步骤。
3. 设置一个安全角色：负责检查隐私和边界。
4. 设置一个验收角色：负责判断小白能不能复刻。
5. 每个角色只输出一份短清单。
6. 最后由人决定是否发布。

这已经是多 Agent 思维。重点不是角色多，而是责任清楚。

## 安的提醒

- 不要为了“多子代理并行”而并行。并行只适合互不抢文件、互不依赖结论的任务。
- 不要把旧规则当成永久法律。规则要服务目标，目标变了，规则也要复核。
- 不要让 Agent 替你承担判断。最终发布什么，仍然是人的责任。

## 相关

- [[wiki/projects/coze-agent-builder-research]]
- [[wiki/concepts/agent-skill-governance]]
- [[wiki/concepts/prompt-engineering-operating-patterns-for-beginners]]
