---
title: Karpathy LLM Wiki Pattern
aliases: ["Karpathy LLM Wiki", "llm-wiki.md"]
tags: [llm-wiki, source, obsidian]
category: source
type: source
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
summary: "Official pattern source for this vault architecture."
---

# Karpathy LLM Wiki Pattern

The official architecture source for this vault is Andrej Karpathy's `llm-wiki.md` gist:

- https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

Local interpretation:

- raw material remains separate from compiled wiki pages
- the LLM maintains a persistent Markdown artifact
- Obsidian is the browsing and graph surface
- schema/rule files guide future agent maintenance
- Git tracks the public-safe artifact

Operational consequence for this vault:

- `wiki/` is the public compiled layer, not a staging area
- `private-wiki/` can guide future rewrites, but it is not a public source
- durable answers should improve the wiki graph instead of living only in chat
- every promotion should update indexes and `log.md`

Related:

- [[wiki/synthesis/karpathy-official-wiki-layer]]
- [[wiki/topics/llm-wiki-moc]]
