---
title: "transcript-fixer 技能"
aliases: ["transcript-fixer"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "31c86fab6b53"
summary: "✍️ transcript-fixer 技能"
---

# transcript-fixer 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# ✍️ transcript-fixer 技能

> Fix, format, and structure raw transcripts (SRT, VTT, or plain text) into readable summaries, action items, and structured meeting notes.

---

## 🛠️ 核心功能

- **噪声消除**: 自动移除口癖、重复词及无意义的停顿。
- **结构化重组**: 将散乱的对话转化为议程、决策点及待办事项。
- **角色映射**: 尝试识别发言人并标注对话归属。

---

## 📖 使用方法

### 基础转换
```bash
python3 scripts/fix_transcript.py input.srt --output meeting_notes.md
```

### 生成总结模式
```bash
python3 scripts/fix_transcript.py input.txt --summary-only
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[MuleRun_Skills_Hub]]
- 文档处理
- [[bulk-summarize]] - 生成结构化会议纪要。
- paperless-ngx - 存档处理后的文档。

---

*最后更新：2026-04-10*
