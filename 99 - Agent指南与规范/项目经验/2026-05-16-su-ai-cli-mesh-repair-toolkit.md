# 2026-05-16 su-ai-cli mesh repair toolkit

- Project goal: create local files for a model repair toolkit that can later be uploaded to the remote Windows workbench.
- Repository/path: `C:\Users\fkl26\Documents\Codex\2026-05-15\su-ai-cli`
- Target remote path: `C:\Users\a1570\Desktop\codex-workbench`
- Key implementation decisions: created an isolated `tools` Python package; kept single-model repair, batch repair, Blender repair, and MCP stdio server as separate scripts; default batch paths resolve relative to the copied workbench root.
- Dependencies: `trimesh` and `numpy` are required for inspection; `pymeshlab` is optional but preferred for repair; Blender is optional and used through `BLENDER_EXE` or `blender` on PATH for background repair/solidify fallback.
- Verification: scripts were created locally only; no remote connection was made.
- Known risks: exact `pymeshlab` filter availability can vary by version; Blender 3MF import depends on Blender/add-on support; near-planar solidification uses boundary edges and may need Blender fallback for unusual meshes.
- Next actions: upload/copy the `tools` directory to the remote workbench, install dependencies there, place models in `input-models`, then run `python tools\repair_all.py`.
