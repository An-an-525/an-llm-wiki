---
title: 卡帕西 LLM Wiki 官方模式
aliases: ["Karpathy LLM Wiki", "llm-wiki.md", "Karpathy LLM Wiki Pattern"]
tags: [llm-wiki, source, obsidian]
category: source
type: source
status: active
created: 2026-05-12
updated: 2026-05-13
sources:
  - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
provenance:
  extracted: 0.8
  inferred: 0.2
  ambiguous: 0.0
summary: "Karpathy 官方 gist 的公开来源笔记：说明 raw sources、compiled wiki、schema 三层结构，以及 index、log、provenance、project layout 等核心约束。"
---

# 卡帕西 LLM Wiki 官方模式

这页记录 Andrej Karpathy 的 `llm-wiki.md` gist 里，对本仓最重要的官方约束。它不是二级参考项目，也不是某个前端模板，而是当前知识库架构的上游模式来源。

- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

## 官方核心

- raw sources 保持原样，不被系统改写；
- wiki 是 LLM 持续维护的 Markdown 编译产物，而不是临时聊天缓存；
- schema 负责告诉未来 agent 如何维护这个知识库；
- `index.md` 和 `log.md` 不是装饰，而是导航和时间线骨架；
- project knowledge 和 global knowledge 应该区分放置；
- 页面需要 frontmatter、wikilinks、source provenance；
- 推断性内容要显式标注，而不是混在事实表述里。

## 对本仓的直接含义

- `wiki/` 是公开编译层，不是导入暂存区；
- `_raw/` 和本地恢复材料是证据层，不是展示层；
- `private-wiki/` 是本地私有编译层，只为复核、整理和晋升服务；
- 公开问题的高质量答案应该回写 wiki 图谱，而不是只停留在会话里；
- 每次重要吸收、改写、发布前检查，都应该更新索引和 `log.md`。

## 本仓的本地扩展

Karpathy gist 定义的是最小骨架。本仓在不破坏骨架的前提下，额外加入了几层工程化约束：

- `private-wiki/`：把本地成长、项目、密钥线索、时间线等整理成私有知识库；
- `site-data/`：为未来展示前端生成只读公开数据包；
- `privacy_scan` / `check_public_content_quality` / `check_private_pipeline`：把公开安全、中文小白可读性和本地归档健康做成闸门；
- 中文优先公开层：对外展示不是给 agent 看，而是给人看，尤其是未来的小白读者。

## 当前仍需持续收敛的点

- 官方推荐的 provenance 标记在公开层还没有广泛使用；
- project 目录仍保留一批历史迁移页，尚未全部重构为更纯粹的官方形状；
- 本仓为了展示站点加入了 `site-data/` 层，这属于有意扩展，不是官方 gist 本身的一部分。

Related:

- [[wiki/synthesis/karpathy-official-wiki-layer]]
- [[wiki/topics/llm-wiki-moc]]
