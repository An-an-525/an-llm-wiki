---
title: 教程与资料搜索最佳实践
aliases: ["GitHub 教程与资料搜索标准", "学习内容来源标准"]
tags: [source, documentation, github, learning, search, standards, curated]
category: source
type: source
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - https://skills.github.com/quickstart
  - https://skills.github.com/content-model
  - https://docs.github.com/en/pages/quickstart
  - https://docs.github.com/en/get-started/writing-on-github
  - https://diataxis.fr/
  - https://www.thegooddocsproject.dev/template
  - https://developers.google.com/search/docs/fundamentals/creating-helpful-content
publicSafety: public-safe
sourceLabels: [official-docs, github-skills, documentation-framework, content-quality]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
summary: "汇总用于安的书房内容建设的教程、资料搜索和来源评估标准：从 GitHub Skills 的任务式课程、Diátaxis 的文档类型分离、Good Docs 的模板体系，到 Google 对有用内容和来源可信度的要求。"
---

# 教程与资料搜索最佳实践

这页不是给读者看的长篇论文，而是给安的书房做内容时使用的来源标准。它规定：教程要让人完成一个小作品，资料搜索要能说明来源可信度，前端内容要让小白知道下一步。

## 采用的原则

### 1. GitHub Skills：教程要有目标、步骤和成品

GitHub Skills 的课程模型强调三件事：告诉学习者适合谁、会学到什么、会做出什么；把任务拆成少量步骤；每一步都应该服务最终技能目标。

安的书房采用这条规则：每条谱系路线和工坊学习包都必须有“最终小作品”。如果读者读完后只知道概念，却不知道做什么，这条内容不合格。

## 2. GitHub Pages 与 GitHub 写作：公开内容要能发布、能协作

GitHub Pages 的入门路径从建仓库、写 README、配置发布源到看到网站，形成一个完整闭环。GitHub 写作文档强调 Markdown、表格、任务列表、代码块、图表和永久链接，这些都是公开知识可维护的基础。

安的书房采用这条规则：公开内容不只写给自己看，还要让后续协作者、Kimi、Codex 和读者都能定位、引用、修改和复刻。

## 3. Diátaxis：教程、操作指南、参考、解释不能混成一团

Diátaxis 把文档分成教程、操作指南、参考和解释四类。它的核心价值是让内容按照用户需要组织，而不是按照作者脑内目录堆放。

安的书房采用这条规则：

- 谱系偏教程，带读者从零到一个结果；
- 工坊偏案例学习包，解释真实项目怎样做；
- 藏馆偏参考与入口，帮助读者选择资料和工具；
- 手记偏解释和复盘，说明判断怎样形成；
- 风信偏判断更新，把信息变成下一步行动。

## 4. Good Docs：模板不是填空，而是降低遗漏

The Good Docs Project 的模板体系把 README、How-to、Reference、Troubleshooting、Tutorial 等文档类型拆开。模板的价值不是让内容变得机械，而是提醒作者不要漏掉读者需要的信息。

安的书房采用这条规则：每个模块有自己的技能和必填字段，但最终文本必须来自真实项目、真实来源和真实判断，不能把模板句子当内容。

## 5. Google 有用内容标准：写给人，不写给流量

Google 的内容质量建议强调：内容要有原创信息、完整描述、明确来源、第一手经验、读者目标和可信解释。它也提醒不要只是改写别人、不要为了追热点而写、不要让读者读完还得重新搜索。

安的书房采用这条规则：任何知识条目都要回答四个问题：

1. 谁会用它；
2. 它解决什么具体问题；
3. 安自己的证据或实践在哪里；
4. 读者读完能少走哪一步弯路。

## 内容提取流程

1. 先写读者任务：一个小白想靠 AI 做成什么。
2. 再找来源：优先官方文档、GitHub 项目、成熟教程和公开标准。
3. 提取证据：只保留能支持操作、判断、风险和复刻的内容。
4. 横向核查：重要判断至少看两个不同来源。
5. 结合安的上下文：说明它为什么适合安的书房。
6. 写公开内容：中文、清楚、可执行，有边界。
7. 挑刺：检查是否闭门造车、是否过度概括、是否对小白不友好。
8. 验收：能进入前端卡片和详情页，不靠私有上下文才能读懂。

## 安的提醒

- 教程不是“知识很多”，教程是“读者做成一件小事”。
- 搜索不是收集链接，搜索是判断哪些来源能支撑行动。
- 模板不是内容。模板只是提醒你应该回答哪些问题。
- 外部最佳实践不能替代安自己的证据。它只能帮助安把证据整理得更可靠。

## Related

- [[wiki/sources/diataxis-framework]]
- [[wiki/sources/github-reference-projects]]
- [[wiki/concepts/upstream-reference-and-adaptation-policy]]
- [[wiki/synthesis/lifecycle-replication-package-workflow]]
