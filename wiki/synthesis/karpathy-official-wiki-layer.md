---
title: Karpathy Official Wiki Layer
aliases: ["Official Wiki Layer", "Wiki Layer Contract", "Karpathy Wiki Layer"]
tags: [llm-wiki, synthesis, architecture]
category: synthesis
type: operating-model
status: active
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
summary: "Public contract for how this vault turns source material into a Karpathy-style compiled wiki layer."
---

# Karpathy Official Wiki Layer

This page is the operating contract for the public `wiki/` layer. It follows Karpathy's LLM Wiki pattern: sources are evidence, the wiki is the compiled Markdown artifact, and schema files tell future agents how to keep the artifact coherent.

## Layer Contract

- Source notes in `wiki/sources/` record provenance and interpretation boundaries.
- Topic pages in `wiki/topics/` are maps of content, not raw import dumps.
- Concept pages in `wiki/concepts/` hold reusable ideas, methods, tools, and patterns.
- Project pages in `wiki/projects/` describe public-safe project evidence and maintenance work.
- People pages in `wiki/people/` are only for public figures or public-safe entity context.
- Synthesis pages in `wiki/synthesis/` connect multiple pages into higher-level models.
- Root `index.md`, `wiki/index.md`, and `log.md` keep navigation and chronology current.

## Ingest Standard

When a new public-safe source is promoted:

1. Create or update one source note.
2. Update the smallest existing pages that should absorb the new knowledge.
3. Create a new page only when the idea is durable enough to link again.
4. Add wikilinks from both the new page and the relevant MOC.
5. Append a short log entry with date, source, and pages changed.

The unit of work is not "one source becomes one summary." A source can update several pages, and one page can synthesize several sources.

## Promotion Standard

Material from local-only layers may enter `wiki/` only after it is rewritten as public knowledge:

- no raw conversation text;
- no live account, token, or environment details;
- no true local filesystem maps;
- no unreviewed personal records;
- claims point back to a source note or review ledger;
- page frontmatter includes `title`, `tags`, `category`, `type`, `status`, `created`, `updated`, `sources`, and `summary`.

Uncertain items stay in `private-wiki/` or the publication review ledger until reviewed.

## Query Standard

Future agents should answer from the compiled wiki first. If the wiki is stale or incomplete, they should locate the source note, update the relevant wiki pages, then answer from the updated graph.

## Lint Standard

The public wiki is acceptable only when:

- structure validation has no errors;
- unresolved wikilinks are either fixed or documented as explicit exceptions;
- public privacy scanning reports zero blocking findings;
- `site-data/` is generated only from public pages;
- private/local directories do not appear in `manifests/public_inventory.csv`.

## Related

- [[wiki/sources/karpathy-llm-wiki-pattern]]
- [[wiki/topics/llm-wiki-moc]]
- [[wiki/sources-and-data-policy]]
- [[CLAUDE]]
- [[AGENTS]]
