---
title: Agent Skill Governance
aliases: ["Skill Governance", "Agent Rules Governance"]
tags: [agent, skills, governance, llm-wiki, curated]
category: concept
type: operating-model
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
  - "[[wiki/synthesis/karpathy-official-wiki-layer]]"
  - "[[wiki/topics/skills-and-tools-moc]]"
publicSafety: public-safe
sourceLabels: [public wiki, agent workflow, skills]
whyItMattered: "It lets the archive preserve agent operating knowledge without publishing raw rules, prompts, or local state."
operationStory:
  - "Separate current active rules from historical recovered rules."
  - "Turn repeated workflows into skills only when they are reusable."
  - "Keep sensitive execution context outside the public wiki."
replicationSteps:
  - "Document the trigger for a skill."
  - "State what the skill must protect."
  - "Keep commands and validation gates concrete."
  - "Link public skills to public concepts, not local-only state."
failureModes: [treating old rules as current policy, publishing raw prompt text, creating skills for one-off actions, skipping validation]
lessons: [skills are reusable process assets, historical rules need promotion, public governance should be compact]
summary: "A public-safe model for preserving agent and skill knowledge without exposing local prompts or private runtime state."
---

# Agent Skill Governance

Agent skill governance is the practice of turning repeated agent workflows into durable process assets while keeping local runtime state out of the public archive.

## What Belongs In Public

Public pages can describe:

- the problem a skill solves;
- when to use it;
- what boundaries it protects;
- what validation commands prove it worked;
- how it connects to the wiki and website workflow.

This is enough for future agents and collaborators to understand the operating model.

## What Stays Local

Raw prompts, memory files, private session notes, unrevised rule packs, account-specific setup, and local tool state should stay in local-only layers. They may inform a rewritten public operating model, but they are not themselves public documentation.

## Current Pattern

The archive now uses a skill-style approach for local private compilation. The public lesson is not the private source list; it is the repeatable boundary:

- index local material;
- compile local review pages;
- rewrite safe concepts into `wiki/`;
- regenerate public data only after gates pass.

## Related

- [[wiki/topics/skills-and-tools-moc]]
- [[wiki/topics/ai-agent-systems-moc]]
- [[wiki/concepts/private-to-public-promotion-pipeline]]
