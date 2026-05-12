# an-llm-wiki Site

React + Vite frontend for the public archive display layer.

## Data Flow

The frontend does not read Obsidian files directly.

```txt
public Obsidian wiki
  -> python scripts/build_site_data.py .
  -> site-data/*.json
  -> site/scripts/sync-site-data.mjs
  -> site/public/site-data/*.json
  -> React app
```

`site-data/index.json` is the current backend contract. It contains:

- `modules`, `counts`, `facets`, `homepage`
- `curation`, including displayed count, review queue count, quality manifest, and import workflow
- `content`, `library`, `paths`, `feed`, `works`, `journal`, `timeline`
- per-item `toc`, `wordCount`, `readingMinutes`, `metrics`, `quality`
- `privacyBoundary` describing what is included and excluded

## Curation Contract

The public frontend is a curated showcase, not a full vault browser.

- Displayed items come from `displayTier: showcase` or `displayTier: starter`.
- Mechanical migrations, templates, raw skill fragments, sync reports, thin pages, and archive-only pages stay out of the frontend payload by default.
- Excluded public-safe-but-not-good-enough items are tracked in `manifests/site_data_quality_review.csv`.
- Promote a page only after rewriting it for beginner readers, adding sources, and passing privacy checks.

Future frontend replacements should keep this rule: render `site-data/index.json`, not the vault filesystem.

## Data Refill Skill

After the frontend and backend contract are stable, add real content through
`skills/archive-content-curator/SKILL.md`, not by editing generated frontend
data. Each public record should explain the operation for beginners and carry
evidence-backed literary, psychological, sociological, and philosophical depth.

The current TypeScript display contract lives in `site/src/types/index.ts`.
The generated adapter `site/src/data/siteData.generated.ts` is rebuilt by
`site/scripts/sync-site-data.mjs`.

## Commands

Run from the vault root:

```powershell
python scripts/build_site_data.py .
python scripts/privacy_scan.py .
python scripts/wiki_check.py .
```

Run from `site/`:

```powershell
npm ci
npm run dev
npm run lint
npm run build
```

`npm run dev` and `npm run build` copy `../site-data` into `site/public/site-data`.

## Publication Boundary

Allowed public inputs:

- `wiki/`
- `README.md`
- `index.md`
- `log.md`

Never expose these through the frontend or future API:

- `_raw/`
- `_archives/`
- `private-wiki/`
- `inbox/private/`
- `.obsidian/`
- `.claude/`, `.claudian/`, `.trash/`
- credentials, cookies, sessions, local paths, private personal data

Generated frontend copies are local build inputs and are ignored by Git:

- `site/public/site-data/`
- `site/dist/`
- `site/.vite/`

The tracked public backend artifact is root `site-data/`.

## Future Server Contract

When a real server is added, keep the same contract and expose read-only endpoints:

- `GET /api/site-data`
- `GET /api/content`
- `GET /api/content/:slug`
- `GET /api/search?q=...`
- `GET /api/modules`

The server must run the same gates before publishing:

- `python scripts/wiki_check.py .`
- `python scripts/privacy_scan.py .`
- `python scripts/build_public_inventory.py .`

Do not put secret keys in the browser bundle. Any future private operations must live server-side behind explicit auth and must not share the public data origin by accident.
