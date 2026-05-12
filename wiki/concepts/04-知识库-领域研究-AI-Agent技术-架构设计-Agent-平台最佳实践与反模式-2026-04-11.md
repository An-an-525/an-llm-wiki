---
title: "Agent 平台最佳实践与反模式"
aliases: []
tags: [llm-wiki, migrated]
category: concept
type: concept
status: active
created: 2026-05-12
updated: 2026-05-12
sources:
  - "[[wiki/sources/pre-rebuild-vault-archive]]"
source_id: "671222b96fb9"
summary: "目标：把公开 Agent 框架里反复被验证过的方法，压到当前本地现实里，形成适用于 `Codex -> Multica -> execution runtimes` 的落地准则。"
---

# Agent 平台最佳实践与反模式

> Migrated from the pre-rebuild vault after privacy filtering. Local paths and direct identifiers were redacted.

## Content

# Agent 平台最佳实践与反模式

> 目标：把公开 Agent 框架里反复被验证过的方法，压到当前本地现实里，形成适用于 `Codex -> Multica -> execution runtimes` 的落地准则。

---

## 1. 当前本地最重要的五条最佳实践

1. **单主控优先，不做多主脑**
   - 当前本地应坚持 `Codex` 作为唯一主控，`Multica` 作为真实运行时控制台与调度承载层。
2. **先定义执行契约，再谈智能协作**
   - 当前优先事项应是 `execution manifest`、`attempt lease`、`runtime capability metadata`、`traceability`，而不是先搭一套泛化“群聊式多 Agent”。
3. **委派以工件为中心，不以聊天为中心**
   - 研究结果、验收结论、路径卡片、变更摘要都应落到可引用工件，再由主控整合，而不是让子代理自由散聊。
4. **角色与权限分离**
   - `researcher / worker / reviewer` 是职责抽象；真正的安全边界应由工具权限、写入目标和审批门控制。
5. **本地证据优先，外部模式后置内化**
   - 先核当前机器、当前项目、当前运行时，再吸收 `LangGraph / AutoGen / CrewAI / MCP` 等公共模式。

---

## 2. 适合当前机器的 Agent 平台做法

| 主题 | 当前推荐做法 | 原因 |
| :--- | :--- | :--- |
| 控制面 | `Codex` 统一研究、判断、验收 | 避免多控制面冲突 |
| 运行时 | `Multica` 负责 runtime 注册、任务派发、执行回传 | 它是当前真实运行目标 |
| 知识回写 | `Obsidian` 负责导航、索引、过程记忆 | 便于连续接手和操作记忆 |
| 规范与硬规则 | `AI_Commander_Docs` 负责治理文本 | 避免把规范仓误当平台 |
| 委派传输 | 先走 `execution manifest + artifact handoff` | 比通用消息总线更贴近当前主线 |
| 运行时选择 | 先按 capability 和环境稳定性筛选，再派发 | 比“哪个模型更聪明”更关键 |

---

## 3. 当前最危险的反模式

- **把文档仓当平台本体**
  - `[local path redacted]` 当前只是规格与知识仓，不是实现仓。
- **把已安装产物误写成源码事实**
  - `aipy`、`accio` 当前更像安装态运行时，不应直接当源码仓描述。
- **多 Agent 先上消息总线，后补执行契约**
  - 这会让问题从“没实现”升级成“难审计、难验收、难回放”。
- **把角色名当成权限模型**
  - 真正的风险不在名称，而在能否执行 shell、改文件、发外部请求、写外部系统。
- **把“更聪明”当成平台升级方向**
  - 当前本地主线更需要可解释调度、权限边界、回放链路和 Windows 补偿控制。
- **把单次聊天结论当持久知识**
  - 非 trivial 结论必须沉淀回 `Obsidian` 或 `AI_Commander_Docs`。

---

## 4. 对本地项目的直接指导

- `Multica` 继续作为真实运行时目标，不要被 `mcc`、`airi` 的历史沉淀分散主线。
- `mcc` 当前更适合作为控制面/内存架构参考资产，而不是立刻替代当前运行时。
- `aipy / accio / airi-server` 需要优先写成“运行时实盘卡片”，而不是继续混成抽象概念。
- 黑曜石知识页要优先补“边界、入口、证据、阅读顺序”，而不是继续堆抽象愿景。

---

## 5. 推荐阅读顺序

1. [[本地运行时角色边界矩阵-2026-04-11]]
2. [[多Agent协调与受控委派-2026-04-11]]
3. [[多Agent通信信封与工件传递-2026-04-11]]
4. [[本地工具权限地图与审批边界-2026-04-11]]

---

## 相关链接

- [[Frameworks_MOC]]
- [[Agent_Design_Patterns_2026]]
- [[MCP_Protocol_Standard]]
- [[01 - 项目中枢/活跃项目/Multica 运行时目标]]
- [[本地运行时角色边界矩阵-2026-04-11]]
- [[06 - 周期回顾/2026-04-11-详细行动存证]]
