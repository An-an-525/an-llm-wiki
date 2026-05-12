---
title: "generating-memes 技能"
aliases: ["generating-memes"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "7ad6363943d9"
summary: "🎭 generating-memes 技能"
---

# generating-memes 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🎭 generating-memes 技能

> Creates memes using the meme CLI with 298+ templates. Supports animations, text-based and image-based memes.

---

## 🛠️ 核心指令

- `meme list`: 列出所有 298 个模板。
- `meme search <keyword>`: 关键词搜索模板。
- `meme info <template>`: 查看模板所需参数（图片数、文字数）。
- `meme generate <template>`: 生成表情包。

---

## 📖 常用模板参考

| 模板 | 描述 | 类型 |
| :--- | :--- | :--- |
| `petpet` | 摸摸头动画 | 图片 |
| `slap` | 一巴掌 | 图片 |
| `shock` | 震惊 | 文字 |
| `5000choyen` | 5000兆 (大小文字对比) | 文字 |

---

## 💡 使用示例

```bash
# 生成摸摸头 GIF
meme generate petpet --images my_photo.jpg > output.gif

# 生成 5000 兆梗图
meme generate 5000choyen --texts "太强了" "完全不懂"
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
