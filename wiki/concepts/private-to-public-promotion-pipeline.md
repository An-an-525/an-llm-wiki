---
title: Private To Public Promotion Pipeline
aliases: ["Public Promotion Pipeline", "公开晋升流程"]
tags: [publication, workflow, llm-wiki, curated]
category: concept
type: workflow
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
  - "[[wiki/sources-and-data-policy]]"
publicSafety: public-safe
sourceLabels: [public wiki, workflow, privacy filtered]
whyItMattered: "It gives the archive a repeatable way to grow without turning private review material into public content."
operationStory:
  - "Local evidence is indexed first."
  - "Private review pages identify themes and risk."
  - "Public pages are rewritten as source-aware lessons."
replicationSteps:
  - "Choose one theme from the private review layer."
  - "Create a public source note or cite an existing one."
  - "Write the smallest durable concept, project, or synthesis page."
  - "Run public structure and privacy gates."
failureModes: [copying raw evidence, over-broad batch imports, missing source notes, skipping validation]
lessons: [small batches are safer, source notes carry provenance, public writing should explain reusable knowledge]
summary: "The workflow for rewriting local-only archive material into public-safe wiki pages."
---

# Private To Public Promotion Pipeline

The promotion pipeline is the repeatable path from local review material to public wiki pages.

## Pipeline

1. Index local material without publishing it.
2. Compile local-only review pages that group sources by theme, project, skill, agent, and timeline.
3. Select one public-safe theme.
4. Write or update a source note.
5. Rewrite the theme as a compact public page.
6. Link it from the relevant MOC.
7. Run the structure and privacy gates.
8. Regenerate `site-data/` only after the public wiki passes.

## Public Page Test

A promoted page should answer:

- what is the reusable idea or project;
- why it matters;
- what source note supports it;
- what can be repeated by another person;
- what remains unfinished;
- what was deliberately excluded from public view.

## Good Promotion

Good promotion turns private evidence into a public lesson. It does not quote raw chats, reveal local setup, or convert every file into a page. One strong concept page is better than many thin summaries.

## Related

- [[wiki/projects/personal-archive-platform]]
- [[wiki/concepts/public-site-data-boundary]]
- [[wiki/synthesis/personal-archive-public-roadmap]]
