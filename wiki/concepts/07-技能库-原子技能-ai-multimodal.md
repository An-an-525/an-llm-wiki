---
title: "ai-multimodal 技能"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "d467a1c22474"
summary: "🎨 ai-multimodal 技能"
---

# ai-multimodal 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🎨 ai-multimodal 技能

> Process and generate multimedia content using Google Gemini API. Includes audio transcription, image understanding, video scene detection, and document extraction.

---

## 🛠️ 核心功能

- **音频分析**: 支持长达 9.5 小时的音频转录（带时间戳）、摘要及语音理解。
- **图像识别**: 具备 OCR、对象检测、设计提取及视觉问答能力。
- **视频处理**: 处理长达 6 小时的视频，支持场景检测、时序分析及 YouTube URL 接入。
- **内容生成**: 集成 Imagen 4 (图像生成) 与 Veo 3 (短视频生成)。

---

## 📖 快速上手

```bash
# 分析媒体文件
python scripts/gemini_batch_process.py --files <file> --task <analyze|transcribe|extract>

# 生成图像内容
python scripts/gemini_batch_process.py --task generate --prompt "A futuristic city at night"
```

### 💡 提示
当需要分析图像且环境支持 `gemini` 命令时，优先使用：
`cat image.png | gemini -y -m gemini-2.5-flash "Describe this image"`

---

## ⚠️ 限制与模型

- **模型选型**: 图像生成 (`imagen-4.0-generate-001`)，分析 (`gemini-2.5-flash`)。
- **大小限制**: 内联 20MB，File API 2GB。

---

## 🔗 相关链接

- [[技能库 MOC]]
- [[文档处理]]
- [[youtube-collector]]
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
