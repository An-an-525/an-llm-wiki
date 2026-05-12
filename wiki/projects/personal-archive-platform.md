---
title: Personal Archive Platform
aliases: ["个人资料库平台", "Archive Showcase Platform"]
tags: [archive, llm-wiki, project, showcase, beginner-friendly]
category: project
type: project
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/karpathy-llm-wiki-pattern]]"
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
  - "[[wiki/synthesis/karpathy-official-wiki-layer]]"
publicSafety: public-safe
sourceLabels: [public wiki, local compile, architecture]
whyItMattered: "It turns scattered work history into a governed archive that can feed a website without exposing local-only material."
operationStory:
  - "Split raw evidence, private compiled notes, public wiki pages, and frontend data."
  - "Added validation scripts so publishing depends on structure and privacy gates."
  - "Converted the website backend contract into generated site-data instead of direct vault reads."
replicationSteps:
  - "Define raw, private, public, and frontend data layers."
  - "Write a source note before promoting claims."
  - "Promote one project or concept at a time through structure and privacy checks."
failureModes: [publishing raw notes, treating private review pages as public sources, letting frontend read the vault directly]
lessons: [compiled pages beat raw dumps, public data needs a narrow contract, promotion should be reviewable]
summary: "A public-safe project page for the personal archive platform that connects the Obsidian wiki layer to future website data."
---

# Personal Archive Platform

The personal archive platform is the public-facing version of this vault. Its job is to turn learning history, projects, tools, agent work, and reusable methods into a navigable knowledge base and future website.

## What It Is

The platform has four working layers:

- local raw material that stays outside the public graph;
- a local compiled review layer for sensitive or unfinished material;
- `wiki/`, the public Karpathy-style compiled layer;
- `site-data/`, the generated data contract for the website.

The key design choice is that the website does not read the vault directly. It reads curated JSON generated from public wiki pages.

## What It Proves

This project demonstrates several capabilities:

- turning messy personal material into structured source notes and concepts;
- designing a publication workflow with validation gates;
- building a frontend data boundary that can later move behind a server API;
- using agent-readable schema files to keep future maintenance consistent.

## Current Public Scope

The first public scope is not a full autobiography. It is a governed archive of work patterns:

- [[wiki/concepts/private-to-public-promotion-pipeline]] explains how local material becomes public pages.
- [[wiki/concepts/public-site-data-boundary]] defines what the frontend is allowed to consume.
- [[wiki/concepts/agent-skill-governance]] records how agent skills and rules are kept usable without publishing raw prompts.
- [[wiki/synthesis/personal-archive-public-roadmap]] describes the next content batches.

## What Stays Out

Local setup details, raw private conversations, account state, unrevised personal records, and secret-like values do not belong in this page or in `site-data/`. They can inform rewritten lessons, but they are not public content.

## Related

- [[wiki/topics/personal-archive-moc]]
- [[wiki/synthesis/karpathy-official-wiki-layer]]
- [[wiki/sources/local-private-compile-2026-05-13]]
