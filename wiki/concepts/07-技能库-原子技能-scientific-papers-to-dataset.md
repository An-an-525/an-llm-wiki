---
title: "scientific-papers-to-dataset 技能"
aliases: ["scientific-papers-to-dataset"]
tags: [llm-wiki, migrated]
category: concept
type: concept
status: migrated-needs-source-review
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "96be4d70cae5"
summary: "🔬 scientific-papers-to-dataset 技能"
---

# scientific-papers-to-dataset 技能

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 🔬 scientific-papers-to-dataset 技能

> Build structured datasets from academic papers via OpenAlex API and PDF extraction.

---

## 🏗️ 架构模式：Subagent Pattern

为了保持主上下文整洁，必须使用子代理 (Subagents) 执行以下任务：
1. **pdf-downloader**: 下载论文 PDF。
2. **relevance-checker**: 基于标题/摘要评估相关性。
3. **data-extractor**: 读取 PDF 并提取结构化 JSON（推荐使用思维链模型）。
4. **citation-traverser**: 遍历引用图谱获取相关论文。

---

## 📖 核心工作流 (Loop)

1. **Pop ID**: 从 `bfs_queue.json` 弹出 OpenAlex ID。
2. **Download**: 执行下载并存储至 `projects/<name>/pdfs/`。
3. **Extract**: 依据 `prompt.txt` 规则提取数据。
4. **Traverse**: 获取 `referenced_works` 并补充到队列。

---

## 📋 队列追踪 (`bfs_queue.json`)
```json
{
  "queue": ["W123", "W456"],
  "processed": ["W789"],
  "failed": {"W222": "pdf not available"}
}
```

---

## 🔗 相关链接

- [[技能库 MOC]]
- 文档处理
- [[MuleRun_Skills_Hub]]

---

*最后更新：2026-04-10*
