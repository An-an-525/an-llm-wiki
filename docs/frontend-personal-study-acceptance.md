# 前端个人书房验收标准

本文件定义 `an-llm-wiki` 前端的主要方向：它首先是一个面向中国读者的个人书房和学习展柜，其次才是技术资料库、项目索引和未来 App 外壳。

## 1. 外部标准来源

本项目前端参考这些外部标准和教程，并把它们翻译成本项目的约束：

| 来源 | 采用点 | 本项目落地 |
|---|---|---|
| Karpathy `llm-wiki.md` | raw source 与 compiled wiki 分层 | 前端只读公开编译数据，不读原始材料 |
| Obsidian Properties | `tags`、`aliases`、日期和 YAML frontmatter | 公共页面必须有规范 frontmatter |
| Diátaxis 文档框架 | tutorial、how-to、reference、explanation 四类内容 | 小白路径、复刻步骤、概念解释和标准页分开写 |
| GitHub Docs / GitHub Skills | Markdown、PR、Pages、公开协作流程 | 每次前端和内容更新都走提交、PR、验收记录 |
| MDN / web.dev PWA | manifest、service worker、缓存和安装体验 | 网页可安装；数据用运行时 JSON 刷新 |
| React 官方文档 | 使用组件、hooks、memoization 时保持数据流清楚 | 生成数据集中管理，页面用 memo/filter 控制渲染 |
| WCAG 可访问性原则 | 结构、键盘、对比度、语义标签 | 导航、搜索、卡片和按钮要能被普通用户稳定使用 |

## 2. 第一屏标准

首页第一屏必须像一间书房，不像技术后台。

必须做到：

- 标题文艺、安静、清楚；
- 第一段写“人、路、书房、学习”，不堆技术名词；
- 首屏只给三件事：看见学习如何成形、沿路径复刻、只展示适合公开的书页；
- 技术词下沉到模块、项目详情和复刻路径里。

不允许：

- 首屏出现一堆平台名、模型名、框架名；
- 把首页做成营销页；
- 把个人书房写成冷冰冰的仪表盘。

## 3. 工坊标准

工坊不是简历墙，而是项目学习展柜。每张卡片至少要让读者知道：

- 这是什么；
- 当前状态；
- 做它为什么有意义；
- 有多少操作记录；
- 有多少复刻步骤；
- 点开后能看到完整说明。

项目详情页必须优先展示：

1. 先用一句话说清楚；
2. 工具与材料；
3. 真实操作历程；
4. 小白复刻路径；
5. 三层理解：心理层、社会层、哲学层；
6. 容易踩的坑；
7. 留下来的经验；
8. 下一步；
9. 完整公开笔记。

## 4. 内容写作标准

写给小白，但不降低思想密度。

每个重要项目必须同时满足：

- **文学性**：句子有节奏，有画面，但不空泛；
- **心理层**：讲学习动机、焦虑、注意力、阻力或信心变化；
- **社会层**：讲工具、平台、协作、社区、学校、市场或工作流背景；
- **哲学层**：讲系统、边界、时间、失败、手艺或人的主动性；
- **复刻性**：读者能照着做一个最小版本。

知识内容必须额外通过来源与挑刺标准：前端核心卡片、详情页、风信和工坊不能只依赖内部想法生成。每条重要内容要能说明个人证据、公开参考、适配理由和审查结论，具体规则见 `docs/knowledge-content-source-and-review-standard.md`。

## 5. 数据更新标准

别人安装成 App 后，数据更新应遵循这条路线：

1. 当前阶段：部署新的 `site-data/adapter.json`，前端定时和前台恢复时刷新；
2. 下一阶段：加“最近更新”提示和手动刷新按钮；
3. 服务器阶段：提供只读公开 API；
4. 实时阶段：只有在需要多人协作或实时动态时，再引入 SSE 或 WebSocket。

禁止让前端直接读取本地原始文件夹。

## 6. GitHub 技能流程

每次改前端，按这个流程走：

1. `information-architect`：确认页面结构和读者路径；
2. `senior-frontend`：实现组件、路由、状态和性能；
3. `react-best-practices`：检查 hooks、数据流和渲染；
4. `accessibility-auditor`：检查导航、按钮、标题、对比度；
5. `webapp-testing` 或 Browser/Playwright：跑真实页面；
6. GitHub 技能链：提交、PR、验收说明。

## 7. 发布验收

前端发布前必须通过：

```powershell
python scripts/wiki_check.py .
python scripts/privacy_scan.py .
python scripts/build_site_data.py .
python scripts/build_public_inventory.py .
python -m unittest discover -s tests
git diff --check
cd site
npm run lint
npm run build
```

浏览器验收至少检查：

- 首页首屏是否像个人书房；
- 工坊卡片是否是中文、可读、可点开；
- 项目详情是否显示复刻路径和三层理解；
- 搜索能找到项目；
- 移动端底部导航可用；
- 无明显控制台错误。

## 8. 当前总待办

当前改造待办写入 `docs/an-personal-study-room-todo.md`。后续所有前端、内容、数据、后端、小安和 App 化工作，都从这份待办拆任务，不再靠聊天记忆推进。

## 9. 参考链接

- Karpathy LLM Wiki gist: https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
- Obsidian Properties: https://help.obsidian.md/properties
- Diátaxis: https://diataxis.fr/
- GitHub Docs - Writing on GitHub: https://docs.github.com/en/get-started/writing-on-github
- GitHub Pages Quickstart: https://docs.github.com/en/pages/quickstart
- MDN PWA Reference: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Reference
- web.dev Web App Manifest: https://web.dev/learn/pwa/web-app-manifest
- React `useMemo`: https://react.dev/reference/react/useMemo
