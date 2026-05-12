---
title: Information Review Queue
aliases: ["信息复核队列", "Review Queue"]
tags: [review, publication, information-architecture, curated]
category: synthesis
type: queue
status: verified
publish: curated
created: 2026-05-13
updated: 2026-05-13
sources:
  - "[[wiki/sources/local-private-compile-2026-05-13]]"
publicSafety: public-safe
sourceLabels: [public wiki, review queue, local compile]
whyItMattered: "It makes missing or uncertain information explicit instead of hiding it behind polished pages."
operationStory:
  - "Converted private follow-up questions into public-safe review categories."
  - "Kept sensitive values and identities out of the queue."
  - "Defined what must be decided before future public batches."
replicationSteps:
  - "Record uncertain information as a queue item."
  - "Classify whether it is security, identity, project, capability, or timeline risk."
  - "Promote only after review changes the state."
failureModes: [publishing uncertainty as fact, leaving security questions implicit, mixing private and public queues]
lessons: [review queues are part of the knowledge base, uncertainty is useful when labeled, public scope needs explicit gates]
summary: "Public-safe review queue for unresolved information decisions before more archive content is promoted."
---

# Information Review Queue

This queue keeps information quality visible. It is public-safe: it records categories and decisions, not private details.

## P0 Security Review

- Confirm which credential-like findings are live, stale, or false positives.
- Keep rotation actions outside the public wiki.
- Do not publish secret values, account state, or local environment maps.

## P1 Identity And Personal Scope

- Decide which personal details can be public.
- Keep private memories and unrevised personal records local-only.
- Rewrite growth information as project-linked milestones rather than raw biography.

## P2 Project Selection

- Choose the first ten public project candidates.
- Require each project to have a goal, evidence route, repeatable lesson, and unfinished status.
- Keep school, account, deployment, and private collaboration context out unless explicitly rewritten.

## P3 Capability Claims

- Bind each public capability to project evidence.
- Avoid generic claims that cannot be traced.
- Convert workflows into pages before adding broad skill summaries.

## P4 Agent Context

- Separate active rules from historical recovered rules.
- Publish operating models, not raw prompts or local runtime state.
- Keep skill creation focused on reusable work.

## Related

- [[wiki/synthesis/archive-information-architecture]]
- [[wiki/synthesis/project-evidence-matrix]]
- [[wiki/synthesis/public-growth-timeline-framework]]
