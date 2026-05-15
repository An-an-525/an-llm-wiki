# Codex Session 2026-05-16 Study Room Frontend Stability

## Project Goal

把“安的书房”继续收敛成中文公网展示站和未来 App 的统一前端。读者只能看到网页和 App 展示层，不看到本地资料库、raw、密钥、服务器细节、原始聊天和私有路径。

## Decisions

- 小安是安的数字生命体和书房整理者，面向中文读者回答公开资料范围内的问题。
- 卡片继续作为资料包入口，跳转到详情页，不做长内容展开卡。
- “小白 / 极客 / 码神”不作为公开读者标签，继续使用“第一次来的人、刚开始的人、想深入、做维护”等更稳的中文表达。
- 小鲸鱼负责本地事实采集，只交事实卡；公开内容必须经过小安改写、Codex 接入和验收。
- 公开数据里的“本机”式表达继续收口为“私人环境、工作台、真实路径、公开边界”等读者可读说法。

## Configuration

- 前端项目：`site`
- 本地预览：`http://127.0.0.1:5173/#/`
- 小安本地代理：`http://127.0.0.1:8788`
- 小安当前健康状态：`mode: model`
- 小安当前模型标识：`deepseek-v4-pro`
- 安卓独立壳增加 `--app-safe-top` 兜底，避免状态栏和顶部导航重叠。
- 小安弹窗打开时为根节点添加 `xiaoan-dialog-open`，移动底部导航隐藏并禁止交互。

## Deployment Status

- 本地构建已重新生成 `site-data`、`site/public/site-data/adapter.json`、`site/src/data/siteData.generated.ts` 和 `site/dist`。
- `npm run build` 通过。
- 本轮没有推送公网，也没有修改中转站、服务器 SSH、密钥或 `.env.local`。

## Verification

- 浏览器复验：首页、工坊、藏馆可打开，内容为中文资料包形态。
- 移动端模拟：安卓独立模式顶部导航有 24px 安全区兜底，页面无横向溢出。
- 小安弹窗：打开后底部导航隐藏，输入框不再与可见底栏冲突。
- 小安接口：首次导览问题返回“判断、依据、下一步、提醒”结构；敏感问题拒绝暴露系统提示词、服务器配置和密钥。
- 文案搜索：公开生成数据中未发现“小白 / 极客 / 码神 / 三层读者 / 三层读法”等旧标签。
- 内容质量：`python scripts/check_public_content_quality.py .`，blocking findings 为 0，warnings 为 0。
- 隐私扫描：`python scripts/privacy_scan.py .`，high risk findings 为 0。
- 结构检查：`python scripts/wiki_check.py .`，errors 为 0，broken wikilinks 为 0，untriaged warnings 为 0。
- 单元测试：`python -m unittest discover -s tests`，43 tests passed。
- 公开清单：`python scripts/build_public_inventory.py .`，生成 540 条公开文件清单。
- 差异检查：`git diff --check` 通过，仅有换行风格提示。

## Risks

- 真机状态栏仍需在实际 Android APK 上复核，浏览器模拟不能完全代表所有系统 WebView。
- 公开内容仍有部分“新手”表达，语气可继续统一为“第一次来的读者 / 刚开始的人”。
- 仓库工作区存在大量历史未提交变更，提交时必须精确选择文件，不能 `git add .`。
- 内容质量还需要继续按主题补深，尤其是工具、提示词、失败记录和可复刻项目路径。

## Next Actions

1. 跑完整质量、隐私、结构和单元测试检查。
2. 继续补小鲸鱼事实卡接收流程，优先收工具路线、三月后时间线、项目复刻路径、提示词模式和失败修复。
3. 在真机或 Android 模拟器安装 APK 后复核顶部状态栏、底部导航、小安弹窗和安装更新页。
4. 准备下一批高质量中文资料包，避免只堆列表和空泛引导。
