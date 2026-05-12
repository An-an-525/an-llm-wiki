---
title: Personal Archive Public Roadmap
aliases: ["Archive Public Roadmap", "Public Content Roadmap"]
tags: [archive, roadmap, synthesis, publication, curated]
category: synthesis
type: roadmap
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
  - "[[wiki/projects/personal-archive-platform]]"
publicSafety: public-safe
sourceLabels: [public wiki, roadmap, publication]
whyItMattered: "It turns a large local archive into a staged public writing plan instead of a risky bulk release."
operationStory:
  - "Start with architecture and process pages."
  - "Then promote project pages with evidence."
  - "Then add capability pages tied to projects."
replicationSteps:
  - "Promote one batch at a time."
  - "Run gates after every batch."
  - "Keep unresolved items in review queues."
failureModes: [trying to publish everything, writing generic self-branding, separating skills from project evidence, ignoring unfinished status]
lessons: [roadmaps reduce publication risk, capability claims need evidence, unfinished status is useful when explicit]
summary: "A staged roadmap for growing the public personal archive from safe architecture pages into project and capability pages."
---

# Personal Archive Public Roadmap

This roadmap defines the next public wiki batches. It keeps growth deliberate: the archive should become useful without exposing local-only material or publishing thin pages.

## Batch 1: Architecture And Boundary

Status: started.

- [[wiki/projects/personal-archive-platform]]
- [[wiki/concepts/private-to-public-promotion-pipeline]]
- [[wiki/concepts/public-site-data-boundary]]
- [[wiki/concepts/agent-skill-governance]]

This batch explains how the archive works and how it stays safe.

## Batch 2: Project Evidence

Next candidates should be rewritten project pages. A good project page needs:

- public goal;
- role and tools;
- what changed;
- what can be repeated;
- what is unfinished;
- links to concept or source pages.

Do not promote projects that still depend on unrevised personal context or local setup details.

## Batch 3: Capability Pages

Capability pages should not be generic skill lists. Each capability should connect to at least one project and one repeatable workflow.

Likely themes:

- knowledge-base compilation;
- agent workflow design;
- frontend archive implementation;
- validation and publication gates;
- local-first data processing.

## Batch 4: Website Display

Only after pages are curated should `site-data/` expose them to the website. Display data should remain smaller than the wiki, because not every useful page is ready to be a showcase item.

## Related

- [[wiki/topics/personal-archive-moc]]
- [[wiki/concepts/public-site-data-boundary]]
- [[wiki/topics/publication-maintenance-moc]]
