---
title: "最佳实践来源清单（用于后续持续更新）"
aliases: []
tags: [llm-wiki, migrated]
category: project
type: project
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "a6d2f8c6c2eb"
summary: "最佳实践来源清单（用于后续持续更新）"
---

# 最佳实践来源清单（用于后续持续更新）

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# 最佳实践来源清单（用于后续持续更新）

## MCP / 工具安全

- OWASP MCP Security Cheat Sheet: <http://cheatsheetseries.owasp.org/cheatsheets/MCP_Security_Cheat_Sheet.html>
- Microsoft Foundry MCP security guidance: <https://learn.microsoft.com/en-us/azure/foundry/mcp/security-best-practices>

## Qwen Function Calling / Agent

- Qwen Function Calling: <https://qwen.readthedocs.io/en/v2.5/framework/function_call.html>
- Qwen-Agent MCP integration: <https://qwenlm.github.io/Qwen-Agent/en/guide/core_moduls/mcp/>
- Qwen-Agent tool registration: <https://qwenlm.github.io/Qwen-Agent/en/guide/core_moduls/tool/>

## 训练与效率

- QLoRA paper (Dettmers et al.): <https://arxiv.org/abs/2305.14314>
- Unsloth benchmarks: <https://docs.unsloth.ai/basics/unsloth-benchmarks>
- HF + Unsloth TRL blog: <https://huggingface.co/blog/unsloth-trl>

## Agent评测

- AgentHallu benchmark: <https://arxiv.org/abs/2601.06818>
- ToolCall-15 benchmark repo: <https://github.com/stevibe/ToolCall-15>

## 记忆体系

- SQLite + local embeddings memory pattern: <https://fazm.ai/blog/ai-agent-long-term-memory-sqlite-embeddings>

## 使用约定

- 以上链接作为“外部事实基线”；每次迭代先更新来源，再更新 `configs/requirements.yaml` 与 `scripts/*`。
