---
title: "video-comparer 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "c17406334b39"
summary: "🎞️ video-comparer 技能"
---

# video-comparer 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🎞️ video-comparer 技能

> Analyze and compare two video files for visual differences, metadata consistency, and frame-level variations.

---

## 🛠️ 核心功能

- **元数据对比**: 检查分辨率、帧率、编码格式及码率差异。
- **视觉差异检测**: 基于关键帧的像素级对比。
- **同步验证**: 检查音画同步及多轨一致性。

---

## 📖 使用方法

### 1. 基础对比报告
```bash
python3 scripts/compare_videos.py video1.mp4 video2.mp4
```

### 2. 生成可视化差异图
```bash
python3 scripts/compare_videos.py video1.mp4 video2.mp4 --visual-diff
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- [[playwright]]

---

*最后更新：2026-04-10*
