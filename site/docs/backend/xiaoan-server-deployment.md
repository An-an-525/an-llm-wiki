# 小安公网服务部署记录

## 当前状态

- 公网页面入口：`https://an520.xin/study-room/`
- 小安健康检查：`https://an520.xin/study-room/api/xiaoan/health`
- 小安对话接口：`https://an520.xin/study-room/api/xiaoan/chat`
- 公开内容接口：`https://an520.xin/study-room/api/site-data/adapter.json`
- 当前模型模式：服务端代理返回 `mode: model`
- 当前模型名：`deepseek-v4-pro`

## 服务分层

- Nginx 根域仍保留给原有中转站。
- `location ^~ /study-room/` 转发到本机 `127.0.0.1:7001`。
- `7001` 上的书房站点负责静态前端。
- `7001/api/` 再转发到 `127.0.0.1:8788`。
- `8788` 是 `an-study-room-xiaoan.service`，只在服务器本机监听。
- 网页/PWA 直接读取同源 `site-data/adapter.json`。
- 桌面端/Android 端如果构建时带 `VITE_XIAOAN_API_BASE_URL`，优先读取远程 `/api/site-data/adapter.json`，用于跨端内容更新。

## 服务器路径

- 前端当前版本：`/opt/an-study-room/frontend/current`
- 前端版本目录：`/opt/an-study-room/frontend/releases/`
- 小安后端当前版本：`/opt/an-study-room/backend/current`
- 小安后端服务：`/etc/systemd/system/an-study-room-xiaoan.service`
- 小安公开数据：`/opt/an-study-room/backend/current/public/site-data/adapter.json`

## 发布流程

1. 本地构建前端。
2. 打包 `dist/` 并上传到 `/opt/an-study-room/frontend/releases/<release-id>/`。
3. 切换 `/opt/an-study-room/frontend/current` 软链接。
4. 把同一份 `dist/site-data/adapter.json` 复制到小安后端的 `public/site-data/adapter.json`。
5. 验证 Nginx 配置，不重启中转站。
6. 重启 `an-study-room-xiaoan.service`，让新增后端接口生效。
7. 验证健康检查、页面入口、数据哈希、内容 API 和 APK 下载链接。

## Android 包

- 远程智能测试包必须在构建时设置：
  - `VITE_XIAOAN_API_BASE_URL=https://an520.xin/study-room`
- APK 不写入模型密钥，只写入公开 API 基础地址。
- 当前远程内容同步真机测试包：
  - `https://an520.xin/study-room/downloads/an-study-room-arm64-remote-content-sync-debug.apk`
- 上一版远程小安测试包：
  - `https://an520.xin/study-room/downloads/an-study-room-arm64-remote-xiaoan-debug.apk`
- 上一版模拟器测试包：
  - `https://an520.xin/study-room/downloads/an-study-room-x86_64-remote-xiaoan-debug.apk`

## 验收

- `https://an520.xin/study-room/` 返回 `200`。
- `https://an520.xin/study-room/api/xiaoan/health` 返回 `ok: true`、`mode: model`。
- `https://an520.xin/study-room/api/site-data/adapter.json` 返回公开资料数据。
- 服务器前端 `adapter.json` 与后端 `adapter.json` 哈希一致。
- 远程内容同步 APK 内包含 `https://an520.xin/study-room` 和 `/api/site-data/adapter.json`，不包含模型密钥。

## 边界

- 不改根域 `/` 的原有中转站。
- 不改 `/v1`、`/chat/completions` 等中转站接口。
- 不把密钥写入前端、APK、公开文档或 Git。
- 后续正式发布前，需要从 debug APK 升级为签名 release APK 或 AAB。
