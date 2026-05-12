---
title: "strudel 技能"
aliases: ["strudel"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "ba4ee1c832ef"
summary: "Live-coding music environment porting TidalCycles to JavaScript. Use for musical patterns, melodies, and generative compositions in the browser."
---

# strudel 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🎵 strudel 技能

> Live-coding music environment porting TidalCycles to JavaScript. Use for musical patterns, melodies, and generative compositions in the browser.

---

## 🛠️ 核心工作流

1. **音乐意图理解**: 明确风格（Techno, Ambient 等）、BPM 及元素需求。
2. **编写 Pattern**: 使用 Strudel 的函数式组合方法。
3. **输出给用户**: 提供 **Raw Code** (用于粘贴) 及 **Encoded URL** (用于直接打开)。

---

## 📖 语法示例

```javascript
// 简单鼓点序列
s("bd hh sd hh")

// 分层组合
stack(
  s("bd(3,8)"), // 欧几里得节奏
  s("hh*8"),    // 8分音符
  s("~ sd ~ sd")
).cpm(120)      // 设置速度
```

---

## 🔗 资源参考

- **URL 编码工具**: `scripts/strudel_url.py`。
- **风格指南**: `references/genre-styles.md`。
- **技术手册**: `references/strudel-reference.md`。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
