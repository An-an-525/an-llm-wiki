---
title: Obsidian Properties
aliases: ["Obsidian 官方属性", "Obsidian Frontmatter"]
tags: [obsidian, properties, source, standards, curated]
category: source
type: source
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - https://help.obsidian.md/properties
publicSafety: public-safe
sourceLabels: [official docs, obsidian, metadata]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "It keeps wiki pages machine-readable and easy to filter in Obsidian."
operationStory:
  - "Use frontmatter fields for title, tags, aliases, status, dates, and sources."
  - "Keep public pages consistent so scripts and frontend data can read them."
replicationSteps:
  - "Start every public page with frontmatter."
  - "Use stable tags and aliases."
  - "Keep dates and sources explicit."
failureModes: [missing frontmatter, inconsistent tags, untraceable pages]
lessons: [metadata is part of the knowledge system, properties make later automation easier]
summary: "Official Obsidian reference for page properties and structured metadata."
---

# Obsidian Properties

Obsidian properties are the standard way to put structured metadata at the top of a note. In this wiki, that means a beginner can open any page and quickly see what it is, whether it is public, where it came from, and how current it is.

## How This Wiki Uses It

Every public learning page should include:

- `title` - the readable page name;
- `aliases` - other names someone may search for;
- `tags` - topic labels;
- `status` - draft, verified, featured, or another clear state;
- `created` and `updated` - maintenance dates;
- `sources` - source notes or official links;
- `summary` - a short preview.

## Beginner Rule

If a page cannot explain its title, status, source, and purpose in the frontmatter, it is not ready to become a public learning page.

## Related

- [[wiki/concepts/lifecycle-replication-package-template]]
- [[wiki/synthesis/lifecycle-replication-package-workflow]]
