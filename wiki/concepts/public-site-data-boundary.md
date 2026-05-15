---
title: 公开站点数据边界
aliases: ["Frontend Data Boundary", "site-data Boundary"]
tags: [frontend, backend, site-data, publication, curated]
category: concept
type: architecture
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
  - "[[wiki/synthesis/karpathy-official-wiki-layer]]"
publicSafety: public-safe
sourceLabels: [public wiki, frontend backend boundary, architecture]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "It prevents the future website from depending on private vault structure or unreviewed Markdown."
actionText: "先读完这页的边界和做法，再用一个最小例子试一次，把结果和问题记录下来。"
operationStory:
  - "The public wiki remains the human-editable compiled layer."
  - "The generator turns curated wiki pages into JSON."
  - "The frontend reads generated data, not the private vault."
replicationSteps:
  - "Keep frontend inputs under generated site-data files."
  - "Do not expose local-only directories through routes or APIs."
  - "Treat every new public field as a publication surface."
failureModes: [direct vault reads, exposing review manifests, mixing draft and curated data, serving local-only directories]
lessons: [data contracts are publication policy, generated JSON should be narrower than the vault, backend work starts with field boundaries]
summary: "公开站点数据边界：网站只消费从公开 wiki 编译出的 JSON，不直接读取原始资料、私有层或本地审查队列。"
---

# 公开站点数据边界

The public site data boundary is the backend contract for the future archive website. It keeps the web layer small, predictable, and safer to deploy.

## Rule

The frontend can read generated public data. It cannot read raw local sources, local review pages, private reports, or arbitrary Markdown.

In this vault, `site-data/*.json` is the current backend contract. A later server can replace the file transport, but it should keep the same boundary: only curated public fields cross into the website.

## Allowed Shape

Public data can include:

- title, summary, tags, category, status;
- source labels that are safe to show;
- table of contents and related public links;
- operation story, repeatable steps, lessons, and failure modes;
- public timeline or path entries that were written for display.

Public data should not include local-only source locations, review-only queue details, raw transcripts, account state, or unreviewed personal records.

## API Shape

The current file transport can later become a read-only API without changing the publication boundary. The first server should expose only generated public records:

- `GET /api/site-data`;
- `GET /api/content`;
- `GET /api/content/:slug`;
- `GET /api/search?q=...`;
- `GET /api/modules`.

The detailed contract is [[wiki/concepts/public-api-contract]].

## Why This Is A Backend Decision

Even without a deployed server, the data generator is already acting as a backend. It chooses which pages are visible, which fields are exposed, and which items stay hidden. Treating it as a backend contract now makes the later server simpler.

## Related

- [[wiki/projects/personal-archive-platform]]
- [[wiki/projects/personal-archive-frontend]]
- [[wiki/concepts/public-api-contract]]
- [[wiki/concepts/private-to-public-promotion-pipeline]]
- [[wiki/topics/personal-archive-moc]]
