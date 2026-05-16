---
title: 卡帕西官方 Wiki 层契约
aliases: ["Official Wiki Layer", "Wiki Layer Contract", "Karpathy Wiki Layer", "Karpathy Official Wiki Layer"]
tags: [llm-wiki, synthesis, architecture]
category: synthesis
type: operating-model
status: active
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
summary: "公开 wiki 层的运行契约：哪些地方严格沿用 Karpathy 官方模式，哪些地方是为私有复核和展示前端增加的本地扩展。"
---

# 卡帕西官方 Wiki 层契约

这页定义公开 `wiki/` 层在本仓中的含义。核心原则不变：source 是证据，wiki 是编译产物，schema 决定未来 agent 如何维护一致性。

## 核心对齐

- `wiki/sources/` 记录来源和解释边界；
- `wiki/topics/` 负责地图和 MOC，不承接原始导入碎片；
- `wiki/concepts/` 放可复用的方法、模式、工具和概念；
- `wiki/projects/` 放公开安全的项目证据和学习包；
- `wiki/synthesis/` 负责跨页整合；
- 根层 `index.md`、`wiki/index.md`、`log.md` 维持导航和时间线。

## 本地扩展

以下是本仓基于官方模式做的工程化扩展，属于有意增加，不是偏离后失控：

- `private-wiki/`：本地私有编译层，用来整理成长资料、项目上下文、密钥线索、时间线和复核队列；
- `site-data/`：从公开 wiki 生成前端展示数据，只读消费，不反向作为知识源；
- 中文优先内容门槛：公开层默认面向中文读者和小白，而不是只为 agent 检索优化；
- 发布闸门：隐私扫描、内容质量检查、私有归档管线检查共同约束可发布内容。

## 吸收标准

新的公开安全来源被吸收时，最小标准是：

1. Create or update one source note.
2. Update the smallest existing pages that should absorb the new knowledge.
3. Create a new page only when the idea is durable enough to link again.
4. Add wikilinks from both the new page and the relevant MOC.
5. Append a short log entry with date, source, and pages changed.

一个来源不是只能变成一页摘要。它可以更新多个页面；一个页面也可以整合多个来源。

## 晋升标准

本地层材料只有在被改写成公开知识后，才允许进入 `wiki/`：

- no raw conversation text;
- no live account, token, or environment details;
- no true local filesystem maps;
- no unreviewed personal records;
- claims point back to a source note or review ledger;
- page frontmatter includes `title`, `tags`, `category`, `type`, `status`, `created`, `updated`, `sources`, and `summary`.

Uncertain items stay in `private-wiki/` or the publication review ledger until reviewed.

## 查询标准

未来 agent 应该先从编译后的 wiki 回答。如果 wiki 过时或缺页，应先定位 source note，更新相关页面，再从更新后的图谱回答。

## 验收标准

公开 wiki 只有在下面几项同时成立时才算可接受：

- structure validation has no errors;
- unresolved wikilinks are either fixed or documented as explicit exceptions;
- public privacy scanning reports zero blocking findings;
- `site-data/` is generated only from public pages;
- private/local directories do not appear in `manifests/public_inventory.csv`.

## 仍然存在但已被记录的偏差

- 一批历史迁移页仍采用旧文件命名和旧项目布局，它们不代表当前标准；
- 官方推荐的 provenance 标记还没有在全部公开页普及；
- `wiki/projects/` 当前仍保留扁平化公开项目页，未来可以逐步重构为更接近官方的项目目录结构，但这不是当前发布阻塞项。

## Related

- [[wiki/sources/karpathy-llm-wiki-pattern]]
- [[wiki/topics/llm-wiki-moc]]
- [[wiki/sources-and-data-policy]]
- [[CLAUDE]]
- [[AGENTS]]
