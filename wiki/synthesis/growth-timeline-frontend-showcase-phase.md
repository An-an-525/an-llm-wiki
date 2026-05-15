---
title: 个人书房前端展示阶段
aliases: ["前端展示阶段", "Frontend Showcase Timeline"]
tags: [timeline, growth, frontend, archive, curated]
category: event
type: event
status: verified
publish: curated
eventDate: 2026-05-13
phase: 前端展示
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/projects/personal-archive-frontend]]"
  - "[[wiki/concepts/public-site-data-boundary]]"
  - "[[wiki/concepts/public-api-contract]]"
publicSafety: public-safe
sourceLabels: [public wiki, growth timeline, frontend]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "这把本地知识库推进到可以给别人看的网页和未来 App：内容不再只为自己检索，也要让小白读者能进入。"
actionText: "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。"
operationStory:
  - "采用最新 Kimi 前端作为视觉基线，再由本地工程继续接管实现和验收。"
  - "把 `site-data` 定义为当前后端契约，让前端只读取精选公开数据。"
  - "加入安与小安的身份展示、小安对话入口、项目卡、路线、年谱和空状态。"
replicationSteps:
  - "先确定页面结构：自序、藏馆、谱系、工坊、手记、年谱和搜索。"
  - "再把公开 wiki 编译成前端数据，不手改生成文件。"
  - "最后用浏览器检查桌面和手机视图，确认中文、导航、卡片、对话和空状态都能使用。"
failureModes: [前端自己编故事, 用假项目填空, 暴露私有层, 空状态不给读者下一步]
lessons: [网站需要数据契约, 展示数据必须精选, 标清空状态比伪造内容诚实]
summary: "2026 年 5 月 13 日，安的资料库开始变成个人书房网站：前端以中文展示项目、路径、年谱，并为小安对话和未来 App 预留后端接口。"
---

# 个人书房前端展示阶段

这个阶段把“资料库”推向“书房”：它不再只是本地能搜到的文件，而是一个别人可以打开、浏览、理解和复刻的入口。

## 发生了什么

前端开始以生成数据为核心：公开 wiki 经过校验后生成 `site-data`，再进入 React 页面。这样做的好处是边界清楚：页面展示的是已经整理过的公开内容，不去读本地原始层。

## 公开经验

前端是一面镜子。它会立刻暴露内容是否空泛：项目有没有真实过程，路线能不能复刻，年谱是不是按真实阶段排列，文字是否像给中国读者看的。

心理层：页面一旦摆出来，整理者会更清楚自己到底想让别人看见什么，也会更容易发现哪些内容只是堆积。

社会层：网站和未来 App 会让个人知识进入公共学习场景。小白读者需要的不是术语密度，而是入口、顺序和安全感。

哲学层：展示不是装饰，它是一种承诺：你愿意把自己的路修到别人也能走。

## Related

- [[wiki/projects/personal-archive-frontend]]
- [[wiki/concepts/public-site-data-boundary]]
- [[wiki/synthesis/archive-feed-public-data-update-2026-05-13]]
