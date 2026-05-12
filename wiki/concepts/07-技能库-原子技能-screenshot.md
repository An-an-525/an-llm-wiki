---
title: "screenshot 技能"
aliases: ["screenshot"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "9527f4e68238"
summary: "当用户明确要桌面截图、窗口截图、区域截图，或当前工具链没有更合适的专用截图能力时使用。适合系统级、桌面级而非单网页级抓取。"
---

# screenshot 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📸 screenshot 技能

> 当用户明确要桌面截图、窗口截图、区域截图，或当前工具链没有更合适的专用截图能力时使用。适合系统级、桌面级而非单网页级抓取。

---

## 🛠️ 核心能力

- **桌面全屏截取**: 适合保留当前系统状态或跨应用上下文。
- **窗口/应用截取**: 适合 Codex、VS Code、桌面客户端等非浏览器界面。
- **区域截图**: 适合小范围 UI、报错区域、像素级细节确认。
- **工具优先级回退**: 若 Figma / Playwright / 浏览器专用能力不可用，再退回系统级截图。

---

## 📖 使用原则

- **用户指定路径优先**: 用户说了保存位置就用该位置。
- **未指定路径时走默认规则**: 用户显式要求截图但未给路径，保存到系统默认截图目录。
- **仅供 AI 自查时**: 保存到临时目录，避免污染工作区。

---

## ⚠️ 注意事项

- **不是浏览器首选**: 浏览器或 Electron 界面优先用 playwright 或专用工具截图。
- **适合桌面应用**: 当目标是整个窗口或系统视图时，本技能比网页工具更稳。
- **平台权限要先确认**: 尤其在 macOS 上，需要 Screen Recording 权限预检。

---

## 🔗 相关链接

- [[技能库 MOC]]
- playwright
- [[debug-tauri]]

---

*最后更新：2026-04-11*
