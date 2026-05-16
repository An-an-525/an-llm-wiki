---
title: Codex Session 2026-05-16 Anxin Performance Goal
status: active
created: 2026-05-16
updated: 2026-05-16
tags: [codex-session, anxin, performance, validation, app]
---

# Codex Session 2026-05-16 Anxin Performance Goal

## Project Goal

把安芯书房从“能跑”推进到“可按顶级产品标准持续验收”的跨端应用：网页、桌面端、Android 都要有包体、缓存、安装、更新和资料层的机器闸门。

## Repository / Path

- Vault: `[local Obsidian vault]`
- Site: `[local Obsidian vault]/site`
- Performance goal slug: `anxin-study-room-performance-baseline`

## Key Decisions

- 使用 `oh-my-codex:performance-goal` 建立 evaluator-gated 工作流。
- 不再只凭主观感觉说“优化了”，新增 `npm run perf:budget` 作为明确通过线。
- 图片不继续放任原始大图进入 App 包，按展示尺寸重采样。
- PWA 缓存只服务公开壳层和公开资料，不缓存 API、安装包和私有材料。
- 对标来源落到可执行约束：Web Vitals、PWA caching、Android startup、Tauri updater。

## Configuration Steps

- 新增 `site/scripts/performance-budget-check.mjs`。
- 新增 `site/package.json` 脚本：`perf:budget`。
- 新增 `docs/anxin-performance-benchmark-and-budget.md`。
- 生成报告：`manifests/site_performance_budget_report.json`。

## Optimization

- 首次评估失败：图片总量 1.87 MB，超过 1.25 MB 预算。
- 已压缩并重采样：
  - `hero-cover.jpg`
  - `og-image.jpg`
  - `avatar*.jpg`
  - `images/cover-*.jpg`
  - `images/hero-*.jpg`
  - `work-*.jpg`
  - `path-*.jpg`
- 重跑后通过：`performance_status: pass`，`failures: 0`，`warnings: 0`。

## Deployment Status

- 本轮性能预算变更仍在本地工作区，尚未发布到公网。
- 上一次公网版本仍可访问；本轮如果继续发布，应先跑完整质量闸门，再使用现有部署脚本只更新 study-room 前端。

## Verification

- `npm run perf:budget` passed.
- 本地预览服务 `http://127.0.0.1:4173/#/` 返回 200。
- Browser MCP tools were unavailable in this session, so no screenshot verification was captured in this round.

## Known Risks

- 当前预算主要是构建与资源预算，还没有接入真实用户 LCP、INP、CLS 数据。
- Android 启动还没有做真机 TTID/TTFD 采样。
- 读者端个人系统仍缺统一缓存层，收藏目前散在页面逻辑中。
- 品牌名“安芯书房”尚未完成 App 名、Logo、图标、安装包的一致迁移。

## Next Actions

1. 接入真实 Web Vitals 采集，只记录匿名性能指标。
2. 建立读者端本地个人系统：收藏、最近阅读、阅读进度、小安历史、清除缓存。
3. 用真机或模拟器采样 Android 冷启动、热启动和页面切换。
4. 统一品牌识别到“安芯书房”，重做图标和 Logo。
5. 发布前重跑性能、隐私、结构、内容质量和单元测试。
