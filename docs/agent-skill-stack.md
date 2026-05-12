# Agent Skill Stack

This is the external-skill baseline for future work on `an-llm-wiki`. It exists
so local Codex, Kimi, and later cloud agents do not invent process from scratch.

## 1. Sources

Use GitHub-hosted skills first:

- Official OpenAI skills catalog: `https://github.com/openai/skills`
- Community Codex skills catalog: `https://github.com/vadimcomanescu/codex-skills`

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
