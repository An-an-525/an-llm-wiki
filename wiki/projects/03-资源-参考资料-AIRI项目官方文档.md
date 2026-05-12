---
title: "AIRI项目官方文档"
aliases: []
tags: [llm-wiki, migrated]
category: project
type: project
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "6041b2ee8ce3"
summary: "Project AIRI - Re-creating Neuro-sama, a soul container of AI waifu / virtual characters"
---

# AIRI项目官方文档

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# AIRI项目官方文档

> Project AIRI - Re-creating Neuro-sama, a soul container of AI waifu / virtual characters

---

## 项目定位

AIRI 是一个AI虚拟角色/数字伴侣容器项目，灵感来源于 Neuro-sama。

**核心愿景：**
让你拥有自己的数字生命，赛博生命体，轻松、随时随地。

---

## 核心特性

### 技术栈优势

不同于其他AI VTuber项目，AIRI从第一天就原生支持多种Web技术：

- WebGPU - GPU加速
- WebAudio - 音频处理
- Web Workers - 多线程
- WebAssembly - 高性能计算
- WebSocket - 实时通信

**这意味着：** AIRI可以在现代浏览器和设备上运行，包括移动端（PWA支持）。

### 性能优化

桌面版支持原生硬件加速：
- NVIDIA CUDA (via HuggingFace candle)
- Apple Metal

---

## 当前能力

### Brain（大脑）
- 玩 Minecraft
- 玩 Factorio（WIP）
- Telegram聊天
- Discord聊天
- Memory Alaya（记忆系统，WIP）

### Ears（耳朵）
- 浏览器音频输入
- Discord音频输入
- 客户端语音识别
- 客户端说话检测

### Mouth（嘴巴）
- ElevenLabs 语音合成

### Body（身体）
- VRM支持（自动眨眼、注视、眼动）
- Live2D支持（自动眨眼、注视、眼动）

---

## 多平台支持

| 平台 | 状态 | 启动命令 |
|------|------|---------|
| Web (Browser) | 可用 | pnpm dev |
| Desktop (Tamagotchi) | 可用 | pnpm dev:tamagotchi |
| Mobile (Pocket) | 可用 | pnpm dev:pocket:ios |

---

## 支持的LLM API

- AIHubMix / OpenRouter / vLLM / SGLang / Ollama
- OpenAI / Azure OpenAI / Anthropic Claude
- DeepSeek / Qwen / Google Gemini
- 以及更多...

---

## 相关链接

- 官网：https://airi.moeru.ai
- GitHub：https://github.com/moeru-ai/airi
- Discord：https://discord.gg/TgQ3Cu2F7A

---

## 与本地项目的关系

你的本地 [local path redacted] 项目是基于官方AIRI的定制版本。

---

*来源：[local path redacted]
*归档日期：2026-04-09*

## 关联

- [[全系统指挥中心]]
- [[airi|airi 项目总览]]
- [[airi-server|airi-server 项目总览]]
