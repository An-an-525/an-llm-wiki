# Agent Skill Stack

This file is the local skill baseline for future work on `an-llm-wiki`.

It now aligns with the official Codex best-practice model used across OpenAI
Codex docs and the `openai/codex` GitHub repo:

- durable repo rules live in `AGENTS.md`
- repeatable methods become repo-local or user-local skills
- automations run only after the method is stable manually

Canonical alignment note:

- `docs/codex-github-best-practice-alignment.md`

This means the goal is no longer “use more skills”. The goal is “use the
smallest correct skill chain that produces a reviewable result”.

## 0. Official Codex Baseline

Use these rules before choosing or adding skills:

1. Put durable repository guidance in `AGENTS.md`, not in every prompt.
2. Keep `AGENTS.md` short and practical. Link deeper docs when needed.
3. Turn repeated work into a skill only after the workflow works manually.
4. Keep each skill scoped to one job with a clear trigger, input, output, and
   done condition.
5. Use automations only after the workflow is predictable.
6. Validate skill changes with at least a smoke test and a small trigger set.

## 1. Sources

Use GitHub-hosted skills first:

- Official OpenAI skills catalog: `https://github.com/openai/skills`
- Community Codex skills catalog: `https://github.com/vadimcomanescu/codex-skills`
- Content and research skills from `https://github.com/claude-office-skills/skills`
- UX writing skill from `https://github.com/content-designer/ux-writing-skill`

Project-specific rules may wrap these skills, but they should not replace them
without a clear reason.

## 2. Installed Official Skills

Installed from `openai/skills`:

- `openai-docs`
- `playwright-interactive`
- `vercel-deploy`
- `netlify-deploy`
- `cloudflare-deploy`
- `render-deploy`
- `security-ownership-map`
- `sentry`
- `winui-app`
- `aspnet-core`
- `chatgpt-apps`
- `figma-use`
- `figma-implement-design`
- `figma-generate-design`
- `figma-create-design-system-rules`

These cover official docs, browser QA, deployment targets, observability,
Windows app work, ASP.NET backend work, ChatGPT apps, and Figma design handoff.

## 3. Installed Community Skills

Installed from `vadimcomanescu/codex-skills` through
`codex-skills-registry`:

### Product And IA

- `product/product-manager-toolkit`
- `product/feature-design-assistant`
- `design/information-architect`

Use these before changing product scope, module layout, navigation, taxonomy,
content model, or feature priority.

### Frontend And Design

- `design/frontend-design`
- `design/ui-design-system`
- `design/accessibility-auditor`
- `platform/react-best-practices`
- `platform/senior-frontend`

Use these before replacing or heavily refactoring the public frontend. The
project still follows `docs/kimi-frontend-reference.md` and
`site-data/index.json` as local source of truth.

### Backend, Fullstack, And DevOps

- `platform/senior-backend`
- `platform/senior-fullstack`
- `platform/senior-architect`
- `platform/senior-devops`
- `ai/api-integration-specialist`

Use these before adding a server, API contract, database, deployment pipeline,
agent integration, or external API.

### QA And Code Quality

- `quality/code-reviewer`
- `quality/webapp-testing`
- `quality/senior-qa`
- `quality/test-driven-development`
- `quality/systematic-debugging`

Use these for implementation review, bug fixes, browser behavior, regression
tests, and release acceptance.

### Security

- `security/security-compliance`
- `security/senior-secops`

Use these together with local privacy gates before publishing or deploying.

### AI And Prompting

- `ai/senior-prompt-engineer`

Use this for prompt patterns, Kimi instructions, agent workflows, and future
frontend content generation prompts.

### Knowledge Content And Review

Use the smallest chain that fits the task:

1. Extraction:
   - `data-extractor`
   - `doc-parser`
   - `an-source-research-and-extraction`
2. Challenge and evidence strengthening, only when needed:
   - `deep-research`
   - `academic-search`
3. Compile or rewrite:
   - `archive-content-curator`
   - `content-writer`
4. Public-facing polish, only when the result is reader-visible:
   - `brand-guidelines`
   - `ux-writing-skill`
   - matching module curator skill
5. Safety and release:
   - `security-best-practices`
   - local privacy and publication gates
6. Optional specialization:
   - `information-architect` for taxonomy or routing changes
   - `senior-prompt-engineer` for reusable prompt systems

The written rule is `docs/knowledge-content-source-and-review-standard.md`.

Frontend visibility rule: the reader only sees the website or future App. Do not
write public content that depends on local Obsidian, local file paths, private
wiki pages, or generated JSON. If a fact matters to the reader, it belongs in a
frontend detail page or a public GitHub/official/source link.

The local module skills live under the local Codex skills directory in the
`an-study-room` group. Restart Codex after adding or changing skills so future
sessions can discover them from the skill index.

## 3.5 AGENTS vs Skill vs Automation

Use the right surface for the right kind of knowledge:

- `AGENTS.md`: durable repo rules, verification rules, do-not rules
- `SKILL.md`: a repeatable method for one bounded job
- automation: cadence, environment, and scheduling for a stable method

Do not put long task scripts into `AGENTS.md`.
Do not turn unstable workflows into automations.
Do not create umbrella skills that try to absorb the whole project.

### Git And Release Notes

- `devtools/git-commit-helper`
- `devtools/changelog-generator`

Use these after validation when preparing commits, PR notes, and changelogs.

## 4. Standard Skill Chain By Task

### GitHub Code Change

1. `github` or `devtools/git-commit-helper`
2. task-specific skill
3. `quality/code-reviewer`
4. local validation gates
5. `devtools/changelog-generator` when release notes are needed

### Frontend Work

1. `design/information-architect`
2. `design/frontend-design`
3. `design/ui-design-system`
4. `platform/react-best-practices`
5. `design/accessibility-auditor`
6. `quality/webapp-testing`

### Backend/API Work

1. `platform/senior-architect`
2. `platform/senior-backend`
3. `ai/api-integration-specialist` when external APIs are involved
4. `security/security-compliance`
5. `quality/test-driven-development`
6. `platform/senior-devops` before deployment

### App Software Work

1. `product/product-manager-toolkit`
2. `platform/senior-architect`
3. `platform/senior-fullstack`
4. `winui-app` for Windows app work
5. `security/security-compliance`
6. `quality/senior-qa`

## 5. Local Project Overrides

External skills do not override these project constraints:

- Public data comes from `site-data/index.json`.
- Private layers never enter the frontend, public API, or GitHub.
- User-provided frontend packages are treated as primary references when the
  user says they are preferred.
- Empty modules use real empty states, not fake data.
- Publish only after `wiki_check`, `privacy_scan`, `build_site_data`,
  `build_public_inventory`, tests, lint, and build gates pass.

## 6. Operational Note

After installing or updating skills, restart Codex so the new skill metadata is
available in future sessions.

When a skill keeps misfiring or stays unused, do not keep adding prompt text
around it. Either tighten the skill description, split the skill, or remove it
from the active chain.
