---
title: 公开层与私有层分开
aliases: ["公开私有分层阶段", "Public Private Split Timeline"]
tags: [timeline, growth, privacy, publication, curated]
category: event
type: event
status: verified
publish: curated
eventDate: 2026-05-12
phase: 公开边界建立
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/concepts/private-to-public-promotion-pipeline]]"
  - "[[wiki/concepts/sensitive-context-rewrite-rules]]"
  - "[[wiki/sources-and-data-policy]]"
publicSafety: public-safe
sourceLabels: [public wiki, growth timeline, privacy boundary]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "这让资料库可以面向别人展示，同时不把本地原始资料、个人上下文和访问材料误当成网页内容。"
actionText: "先从这页挑一个相关页面继续读，再把下一步行动压缩成今天能完成的最小任务。"
operationStory:
  - "把原始资料、私有编译层、公开 wiki 和前端数据分成不同层。"
  - "给敏感上下文建立改写规则：只写路径、状态、哈希和处理建议，不写原文。"
  - "把隐私扫描和结构检查放到生成前端数据之前。"
replicationSteps:
  - "建立原始层、私有整理层、公开层和展示层。"
  - "把本地上下文改写成公开经验，而不是复制原文。"
  - "每次展示前运行隐私和结构检查。"
failureModes: [把原始资料直接上架, 私有复核记录泄漏, 改写标准太弱, 公开页依赖隐藏上下文]
lessons: [边界让分享成为可能, 私有复核不是发布, 改写规则保护意义]
summary: "2026 年 5 月 12 日，安把资料库拆成原始层、私有编译层、公开 wiki 和前端数据层，让展示变得安全而可维护。"
---

# 公开层与私有层分开

这个阶段是整座书房真正能对外打开的前提。

## 发生了什么

安不再把“有用”直接等同于“可以公开”。本地证据、私有复核、公开 wiki 和网站数据各有边界：前者保存完整性，后者承担表达和展示。

## 公开经验

公开资料库之所以能变丰富，不是因为它暴露一切，而是因为私有材料有了安全的停放处。该留下的留在本地，该公开的经过改写，该展示的再编译成前端数据。

心理层：人很容易把“我想被理解”和“我必须说出全部”混在一起。分层结构让表达变得更稳。

社会层：个人资料一旦上线，就进入公共空间。读者、朋友、协作者和搜索引擎都会成为观看者，边界必须先于热情。

哲学层：透明不是没有门，透明是知道哪些门可以打开，哪些门必须有锁。

## Related

- [[wiki/concepts/private-to-public-promotion-pipeline]]
- [[wiki/concepts/sensitive-context-rewrite-rules]]
- [[wiki/topics/publication-maintenance-moc]]
