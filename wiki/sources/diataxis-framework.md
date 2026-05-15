---
title: Diataxis Documentation Framework
aliases: ["Diataxis", "教程 How-to Reference Explanation"]
tags: [documentation, learning, framework, source, curated]
category: source
type: source
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - https://diataxis.fr/
publicSafety: public-safe
sourceLabels: [official docs, documentation, learning design]
reviewStatus: challenged
reviewNotes: "已检查来源、公开边界、小白可读性和前端展示适配；后续可继续补强复刻细节。"
whyItMattered: "It prevents learning packages from becoming one long unclear note."
operationStory:
  - "Separate beginner path, task recipe, field reference, and explanation."
  - "Use that split to make project knowledge easier to copy and practice."
replicationSteps:
  - "Write a tutorial for the first successful run."
  - "Write how-to steps for repeated tasks."
  - "Write reference tables for fields, gates, and commands."
  - "Write explanation sections for tradeoffs and risks."
failureModes: [mixing tutorial and reference, hiding prerequisites, skipping failure modes]
lessons: [clear learning material has different modes, copyable packages need both steps and reasons]
summary: "Documentation framework used to shape beginner-readable lifecycle learning packages."
---

# Diataxis Documentation Framework

Diataxis splits documentation into four jobs:

- tutorial - help a beginner finish a first path;
- how-to - help someone solve a specific task;
- reference - list exact fields, commands, rules, or checks;
- explanation - explain why the system is designed this way.

## How This Wiki Uses It

Each lifecycle package should contain all four, but keep them visibly separate. A beginner should not have to guess whether a paragraph is an instruction, a checklist, or background reasoning.

## Related

- [[wiki/synthesis/lifecycle-replication-package-workflow]]
- [[wiki/concepts/lifecycle-replication-package-template]]
