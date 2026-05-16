# Codex GitHub 最佳实践对齐

本文件把 OpenAI 官方 `Codex` 文档和 `openai/codex` GitHub 仓库里的做法，收敛成当前仓库可直接执行的规则。

目标不是多加一层空话，而是把三个边界彻底分清：

- 什么写进 `AGENTS.md`
- 什么做成 `skill`
- 什么在稳定后才能做成 `automation`

## 1. 官方基线

参考来源：

- OpenAI Codex Best Practices
  <https://developers.openai.com/codex/learn/best-practices>
- OpenAI Codex GitHub repo
  <https://github.com/openai/codex>
- Using skills to accelerate OSS maintenance
  <https://developers.openai.com/blog/skills-agents-sdk>
- Testing Agent Skills Systematically with Evals
  <https://developers.openai.com/blog/eval-skills>

这些来源给出的共同方向很稳定：

1. 把 Codex 当成可配置、可迭代的队友，不是一次性聊天机器人。
2. 持久规则写进 `AGENTS.md`，但要短、准、可验证。
3. 重复工作做成 `skill`，并且每个 skill 只负责一个明确工作。
4. 工作流先人工跑顺，再自动化。
5. skill 不是“感觉更好”就算完成，应该有可复查的 smoke test、触发样例和结果检查。

## 2. 我们仓库的直接采用规则

### 2.1 Prompt 结构

临时任务默认按这四项给 Codex：

- `Goal`：要改什么
- `Context`：相关文件、目录、报错、样例
- `Constraints`：架构、安全、风格、边界
- `Done when`：什么结果算完成

这条来自官方 Best Practices。以后不要再用一大段松散叙述替代验收条件。

### 2.2 `AGENTS.md` 只放持久仓库规则

`AGENTS.md` 只负责这些内容：

- 仓库结构
- 运行 / 测试 / 构建命令
- 工程约束和禁区
- 完成定义
- 评审和验证规则

不应该塞进 `AGENTS.md` 的东西：

- 某个单独任务的长步骤
- 某个专题的一次性提示词
- 巨长的技能调用串
- 只适用于一个局部页面的写作套路

如果规则越来越长，就把主文件保持简短，然后链接到专门文档。

### 2.3 `skill` 只负责一个重复工作

一个合格 skill 至少要满足：

- 只解决一个明确工作
- 描述里写清楚“做什么”和“什么时候用”
- 有明确输入 / 输出
- 有最小完成定义
- 首版先本地使用，不急着全局推广

我们不再把 skill 写成“大而全控制器”。

### 2.4 `automation` 只调度，不承载方法

官方原则很明确：
`skills define the method, automations define the schedule`

因此本仓库以后统一采用：

- 方法写进 skill 或 workflow 文档
- 自动化只负责定时、环境、触发和产物落点
- 如果一个流程还需要频繁人工纠偏，就不进入自动化

### 2.5 skill 要有轻量 eval

在没有完整评测框架前，最低也要做到：

1. 明确定义成功条件
2. 至少一次人工 smoke test
3. 至少 2 到 3 个正向触发样例
4. 至少 1 个反向不该触发样例
5. 至少一个可检查产物或结构结果

如果后面扩展评测，再增加：

- 小型 prompt 集
- 确定性检查
- 结构化评分结果

## 3. 这对当前知识库工程意味着什么

### 3.1 现有问题

当前本地技能体系的主要偏差：

- 技能太多，但活跃主链路太少
- 部分文档把 skill 当“必须全套串行调用清单”
- `skills/`、`workflow`、`automation` 边界不够清楚
- 技能质量更多靠主观感觉，缺少固定触发和验收样例

### 3.2 收敛后的结构

本项目以后按这层关系走：

1. `AGENTS.md`
   只写仓库长期规则
2. `docs/*.md` / `private-wiki/workflows/*.md`
   写专题流程、长说明、架构解释
3. `SKILL.md`
   写可反复调用的单一方法
4. `automation`
   跑已经稳定的方法

### 3.3 知识库主链路的技能收敛

知识库相关任务不再默认串 10 多个技能。以后按最小链路选择：

- 资料提取：`data-extractor` / `doc-parser` / `an-source-research-and-extraction`
- 研究校对：`deep-research` / `academic-search`，只在需要时加
- 内容编译：`archive-content-curator` / `content-writer`
- 前端可见文案：`brand-guidelines` / `ux-writing-skill` / 模块技能
- 安全与发布：`security-best-practices` + 本地隐私门禁

不是每次都全开。

## 4. 本地执行标准

以后你要判断一个新经验能不能变成 Codex 技能，直接按这 6 条：

1. 这个工作是否重复出现
2. 是否真的是“一个工作”，而不是一坨流程
3. 是否能写清楚触发条件
4. 是否能写清楚输入、输出和完成定义
5. 是否已经人工跑顺
6. 是否有至少一个不该触发的反例

只要有两条答不上来，就先别做 skill。

## 5. 当前落地动作

这次对齐之后，本仓库采用这些变化：

- `docs/agent-skill-stack.md` 改成官方导向的最小技能栈，不再鼓励盲目串长链
- `private-wiki/guide/skill-extraction-workflow.md` 改成官方风格的提取与验收流程
- 后续如要继续治理，再补一份“技能白名单 / 冻结 / 废弃 / DeepSeek 替代”清单
