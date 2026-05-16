---
title: LLM Wiki MOC
aliases: ["LLM Wiki Architecture", "Karpathy-style Wiki Map"]
tags: [llm-wiki, moc, architecture]
category: synthesis
type: moc
status: active
created: 2026-05-12
updated: 2026-05-13
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
summary: "LLM Wiki 总地图：连接官方来源、公开 wiki 层契约、架构偏差说明、维护规则和当前对齐审计。"
---

# LLM Wiki MOC

Use this page for the wiki operating model, not for raw migrated content.

## Architecture

- [[wiki/sources/karpathy-llm-wiki-pattern]] - official pattern source
- [[wiki/synthesis/karpathy-official-wiki-layer]] - public wiki layer contract
- [[CLAUDE]] - local schema and page contract
- [[AGENTS]] - operating rules for future agents
- [[wiki/sources-and-data-policy]] - public/private source boundary
- `scripts/check_karpathy_alignment.py` - 对齐官方模式的独立审计脚本

## Rebuild Records

- [[wiki/projects/wiki-projects-karpathy-llm-wiki-alignment-2026-05-12]] - rebuild alignment note
- [[wiki/projects/root-maintenance-backlog]] - durable follow-up list
- [[wiki/sources/pre-rebuild-vault-archive]] - migration source record
- [[log]] - append-only operation log

## Migrated LLM Wiki Notes

- [[wiki/topics/04-知识库-LLM-Wiki-articles-2026-04-11-Agentic-Wiki-编译样本]]
- [[wiki/topics/04-知识库-LLM-Wiki-articles-2026-04-14-多仓接入-样例]]
- [[wiki/topics/04-知识库-LLM-Wiki-index]]
- [[wiki/topics/04-知识库-LLM-Wiki-log]]
