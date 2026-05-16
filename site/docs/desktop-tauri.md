# 安的书房桌面端说明

## 1. 当前定位

桌面端使用 Tauri 2，把现有 `Vite + React` 前端包成 Windows 可安装应用。

这一版只负责三件事：

- 展示公开资料内容
- 打开公开外链
- 连接公开部署的小安服务

它不是本地黑曜石浏览器，也不会把 `_raw/`、`private-wiki/`、本机路径、环境变量或密钥打进安装包。

## 1.1 三端分工

- 网页 / PWA：负责最轻入口，刷网页就能拿到最新内容
- Windows 桌面：负责长期阅读和应用内更新
- Android：负责手机端原生入口，发布走 APK / AAB，不和桌面 updater 混用

三端共用同一套内容源和 API，差异只放在发布、安装和更新策略上。

## 2. 开发方式

在 `site/` 目录运行：

```powershell
npm ci
npm run dev
npm run dev:api
npm run desktop:dev
```

说明：

- `npm run dev` 在 `http://127.0.0.1:5173` 启动前端开发服务
- `npm run dev:api` 启动本地小安代理
- `npm run desktop:dev` 用 Tauri 启动桌面壳；如果 `5173` 上已经是这套前端，它会直接复用

## 3. 桌面端 API 约束

桌面端不直接带认证材料。

如果要让桌面包里的小安正常工作，只允许两种方式：

1. 构建时通过 `.env.desktop.example` 对应的 `VITE_XIAOAN_API_BASE_URL` 指向公开服务
2. 把真实模型密钥和转发地址放在服务端环境变量，不进前端包

公开服务如果和桌面包跨域，允许来源至少要覆盖：

- `tauri://localhost`
- `http://tauri.localhost`
- `https://tauri.localhost`

## 4. 打包方式

在 `site/` 目录运行：

```powershell
npm run desktop:build
```

第一版产物路径：

```text
site/src-tauri/target/release/bundle/nsis/
```

当前目标是先稳定产出 Windows 安装包，所以默认只打 `nsis`。

桌面端更新链路依赖两件事：

1. `src-tauri/tauri.conf.json` 里开启 `createUpdaterArtifacts`
2. 构建环境能提供签名私钥

签名私钥支持两种输入方式：

1. 本机签名：`TAURI_SIGNING_PRIVATE_KEY_PATH`，或默认路径 `~/.tauri/an-study-room-updater.key`
2. GitHub Actions：`TAURI_SIGNING_PRIVATE_KEY` 直接放密钥内容，必要时再补 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

如果你的私钥本身没有口令，也建议把 `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` 显式设为空字符串，避免签名工具等待交互输入。

构建脚本会自动兼容这两种方式，并生成：

- `public/downloads/release.json`
- `public/updates/latest.json`
- `dist/downloads/release.json`
- `dist/updates/latest.json`
- `public/downloads/an-study-room_<version>_x64-setup.exe`
- `public/downloads/an-study-room_<version>_x64-setup.exe.sig`

## 4.1 GitHub 自动构建

仓库根目录已经预留两条工作流：

- `.github/workflows/ci.yml`
- `.github/workflows/desktop-release.yml`

用途分工：

- `ci.yml`：只做轻量检查，避免把你本地机器继续压满
- `desktop-release.yml`：只在 GitHub Windows runner 上生成带签名的桌面安装包和 updater manifest

需要在 GitHub 仓库里配置：

- `Secrets`
  - `TAURI_SIGNING_PRIVATE_KEY`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`（没有口令可留空）
- `Variables`
  - `AN_STUDY_ROOM_PUBLIC_BASE_URL`

这样以后桌面出包主要走云端，不再依赖本地长期重型构建。

## 4.2 本地服务器发布

如果你已经在本机持有签名私钥和服务器 SSH 密钥，可以走本地签名、本地发布：

```powershell
npm run desktop:build
npm run desktop:deploy
```

`desktop:deploy` 只会处理 `study-room` 这条静态前端链路，目标目录由这些环境变量控制：

- `AN_STUDY_ROOM_DEPLOY_HOST`
- `AN_STUDY_ROOM_DEPLOY_PORT`
- `AN_STUDY_ROOM_DEPLOY_USER`
- `AN_STUDY_ROOM_DEPLOY_KEY_PATH`
- `AN_STUDY_ROOM_REMOTE_FRONTEND_ROOT`

它会把当前 `dist/` 上传成一个新 release 目录，再切换 `/opt/an-study-room/frontend/current` 指向新的 release。根域中转站不会被这条脚本改动。

## 4.3 Android 预留工作流

Android 目前只预留工作流，不强行产出成品：

```powershell
npm run android:init
npm run android:build:apk
npm run android:build:aab
```

优先级是：

1. 先让 Windows 桌面 updater 跑通
2. 再把 Android 的共享前端与共享 API 接上
3. 最后再考虑发布渠道和上架流程

## 5. 当前验收重点

- 桌面应用能正常启动
- 首页、藏馆、工坊、详情页可正常浏览
- 外链从桌面壳跳到系统浏览器
- 小安服务不可用时，页面仍能回退到本地导览回答
- 安装包里没有密钥、本机路径或私有仓库内容
- updater manifest 和安装包签名能一起发布
- Android 只保留工作流和契约，不强塞桌面 updater

## 6. 还没做的部分

- 自动更新
- Windows 代码签名
- 公网正式服务发布
- 桌面端专用设置页
