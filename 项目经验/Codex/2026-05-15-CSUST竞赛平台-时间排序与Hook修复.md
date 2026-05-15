---
title: CSUST 竞赛平台时间排序与 Hook 修复
created: 2026-05-15 18:14:12 +08:00
tags: [codex, 项目经验, 长沙理工大学, 竞赛平台, GitHubPages]
status: done
project: CSUST Civil Competition Platform
repository: C:\Users\fkl26\Documents\Codex\2026-05-12\https-qingyixia111-github-io-csust-competition
github: https://github.com/An-an-525/csust-civil-competition-platform
pages: https://an-an-525.github.io/csust-civil-competition-platform/
---

# CSUST 竞赛平台时间排序与 Hook 修复

## 本次目标

修复用户指出的竞赛时间安排问题：学生应优先看到最近、将要发生或刚发生的竞赛，再看到更早的历史竞赛。同时处理 Codex Stop hook 报错：`hook returned invalid stop hook JSON output`。

## 关键实现

- 学生端竞赛列表、重点竞赛、竞赛日历统一使用时间感知排序。
- 排序规则：未来或当前相关日期最近的竞赛优先；已过去的竞赛按最近历史时间倒序；未知日期靠后。
- 同一时间分组内保留置顶、排序权重、更新时间作为辅助排序。
- 静态 GitHub Pages 数据、浏览器静态后端、Node 后端 `/api/competitions` 三处排序规则保持一致。
- 学生端状态展示改为有效状态：只有 `registrationIsOpen` 为真才显示“可报名”；后台状态仍可保留原始生命周期。
- Stop hook 改为只输出机器可解析 JSON：`{"continue":true,"suppressOutput":true}`，避免 stdout/stderr 混入普通文本。

## 修改文件

- `js/competition-hub.js`
- `js/static-backend.js`
- `render-backend/server.js`
- 本地 Codex hook：`C:\Users\fkl26\.codex\hooks\obsidian-project-experience-stop.cjs`

## 验证结果

- `npm run build` 通过，脚本语法检查通过。
- 数据排序检查通过，首屏顺序为 2026 近期竞赛、2026 已结束竞赛、2025 历史竞赛、2024/2023 历史竞赛。
- 本地浏览器验证竞赛大全页：第一条为 `2026年全国数字建筑创新应用大赛校内选拔赛`，后续按时间向历史延伸。
- 本地浏览器验证竞赛日历页：顺序同样从 2026 近期到 2025、2024、2023。
- 过期报名不再显示为“可报名”，显示为“报名已关闭”或原始发布状态。
- Stop hook 手动测试输出为合法 JSON。

## 部署状态

待提交并推送到 GitHub。GitHub Pages 地址仍为：

`https://an-an-525.github.io/csust-civil-competition-platform/`

## 已知风险

- GitHub Pages 是静态演示环境，数据保存在浏览器本地和公开 JSON，无法作为长期真实生产数据库。
- 真正上线仍建议使用服务器后端和 PostgreSQL，AI 云端调用和报名数据管理需要后端保护。
- 当前排序按日期字段推断近期程度，若管理员未填写关键日期，竞赛会排到靠后位置。

## 下一步动作

- 提交并推送本次排序修复。
- 若要正式验收，建议再次确认 GitHub Actions Pages 工作流成功。
- 后续可在后台列表增加“按时间排序/按权重排序”切换，满足管理员手工运营需要。
