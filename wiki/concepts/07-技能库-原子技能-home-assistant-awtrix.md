---
title: "home-assistant-awtrix 技能"
aliases: ["home-assistant-awtrix"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "faa77668c430"
summary: "📟 home-assistant-awtrix 技能"
---

# home-assistant-awtrix 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 📟 home-assistant-awtrix 技能

> Manage AWTRIX 3 pixel display devices via HTTP filesystem and utility endpoints.

---

## 🛠️ 核心功能

- **文件管理**: 支持对 AWTRIX 设备 Flash 上的文件进行列出、上传、重命名及删除。
- **图标导入**: 一键从 LaMetric 库导入像素图标。
- **实时预览**: 控制 LiveView 输出及设备状态检查。

---

## 📖 使用示例

```bash
# 检查设备状态
python3 scripts/awtrix_fs.py --host <device_ip> status

# 列出设备上的所有图标
python3 scripts/awtrix_fs.py --host <device_ip> icons list

# 导入特定 ID 的图标
python3 scripts/awtrix_fs.py --host <device_ip> icons import-lametric 1234
```

---

## ⚠️ 关键路径规范

- 必须使用绝对设备路径（以 `/` 开头），以规避固件解析错误。
- 核心脚本位置: `~/.codex/skills/home-assistant-awtrix/scripts/awtrix_fs.py`。

---

## 🔗 相关链接

- [[技能库 MOC]]
- home-assistant
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
