# 双端工作流

## 目标

同一套内容源，最终服务：

- Windows 桌面
- Android

网页只保留预览、试读和分发入口，不再作为最终客户端目标。

## 最佳实践

先遵守 `docs/ui-psychology-constraints.md`，再谈视觉和功能扩展。

### 1. 内容层统一

- 所有正文、卡片、时间线、作品和说明只维护一份
- 统一通过站点数据层输出给各端
- 公开内容和私有内容分离，不让客户端直接碰私有材料

### 2. 端能力分离

- Windows 桌面负责应用内更新
- Android 负责版本清单检查、APK 下载引导、AAB / 应用市场分发
- 网页只负责预览和下载引导

### 3. 发布分离

- Web：静态预览 + 下载分发 + 缓存策略
- Desktop：NSIS 安装包 + updater manifest + 签名
- Android：AAB 为主，APK 用于内测；客户端只提示下载，不做静默安装

### 4. 运行时分离

- Web 才启用 service worker
- Desktop 才启用 updater 和 relaunch
- Android 不走桌面 updater

### 5. 密钥分离

- 模型密钥只放服务端
- updater 私钥只放本机或签名机
- 客户端只保留 public key

## 推荐工作流

1. 改内容源或前端代码
2. 本地只跑轻量校验：`lint`、`build`、`cargo check`
3. 提交到 GitHub，让 `ci.yml` 先做基础验收
4. 需要桌面安装包时，用 `desktop-release.yml` 在 GitHub Windows runner 上打包和签名
5. 把 `release.json`、`latest.json`、安装包部署到 `study-room` 静态目录
6. 发布网页预览入口
7. Android 只在准备好签名和渠道后单独发版

## 远程更新规则

- 内容更新：网页、Windows、Android 共用 `/api/site-data/adapter.json`，服务端替换数据后各端下次打开即可读取。
- 网页/PWA 更新：service worker 发现新界面后提示刷新。
- Windows 版本更新：只读取 `updates/latest.json`，必须有更高版本号、签名和安装包。
- Android 版本更新：读取 `downloads/release.json` 的 Android 条目；发现更高版本后打开 APK 下载地址，由用户确认安装。
- Android 不使用桌面 updater，也不把密钥、私有数据或中转站凭据打进安装包。

## 验收

- 网页预览访问正常
- 桌面安装包能装
- 桌面可检查更新
- Android 安装页能读取远程版本清单并打开 APK 下载
- 桌面和 Android 使用同一套内容与小安 API
- Android 入口不影响桌面链路

## GitHub 最低配置

- `Secrets`
  - `TAURI_SIGNING_PRIVATE_KEY`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`
- `Variables`
  - `AN_STUDY_ROOM_PUBLIC_BASE_URL`

## 当前边界

- 网页预览可以远程更新界面和公开内容
- Windows 桌面现在走“云端构建，本地少打包”的路线
- 如果本机已有签名私钥和服务器 SSH 密钥，也支持“本地签名，本地发布”
- Android 已保留版本清单和 APK 下载入口，不和桌面 updater 混线
