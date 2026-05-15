# 安的书房桌面端（Tauri）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `D:\Obsidian\初始\site` 打包成一个别人可以安装的 Windows 桌面端，前端壳可安装、可运行、可连接公开内容与小安服务，但不把任何密钥或本地私有材料打进安装包。

**Architecture:** 使用 Tauri 2 为现有 `Vite + React` 前端提供桌面壳。桌面端只负责展示层和受控外链打开，公开内容继续读 `site-data`，小安请求改成可配置服务端地址。安装包默认不携带本地 Node 代理和私密配置，只允许连接显式配置的公开服务地址。

**Tech Stack:** Tauri 2, Rust, Vite, React, TypeScript, existing `site-data` runtime refresh flow, existing Xiaoan proxy contract.

---

## File Map

**Create**
- `D:\Obsidian\初始\site\src\lib\runtime.ts`
- `D:\Obsidian\初始\site\src-tauri\Cargo.toml`
- `D:\Obsidian\初始\site\src-tauri\build.rs`
- `D:\Obsidian\初始\site\src-tauri\capabilities\default.json`
- `D:\Obsidian\初始\site\src-tauri\icons\32x32.png`
- `D:\Obsidian\初始\site\src-tauri\icons\128x128.png`
- `D:\Obsidian\初始\site\src-tauri\icons\128x128@2x.png`
- `D:\Obsidian\初始\site\src-tauri\icons\icon.ico`
- `D:\Obsidian\初始\site\src-tauri\icons\icon.icns`
- `D:\Obsidian\初始\site\src-tauri\src\lib.rs`
- `D:\Obsidian\初始\site\src-tauri\src\main.rs`
- `D:\Obsidian\初始\site\src-tauri\tauri.conf.json`
- `D:\Obsidian\初始\site\.env.desktop.example`
- `D:\Obsidian\初始\site\docs\desktop-tauri.md`

**Modify**
- `D:\Obsidian\初始\site\package.json`
- `D:\Obsidian\初始\site\vite.config.ts`
- `D:\Obsidian\初始\site\src\components\XiaoanChat.tsx`
- `D:\Obsidian\初始\site\src\components\Layout.tsx`
- `D:\Obsidian\初始\site\src\main.tsx`
- `D:\Obsidian\初始\site\src\registerServiceWorker.ts`
- `D:\Obsidian\初始\docs\an-personal-study-room-todo.md`

**Verify**
- `D:\Obsidian\初始\site\dist\`
- `D:\Obsidian\初始\site\src-tauri\target\release\bundle\`

---

### Task 1: 桌面运行时边界与 API 入口抽象

**Files:**
- Create: `D:\Obsidian\初始\site\src\lib\runtime.ts`
- Modify: `D:\Obsidian\初始\site\src\components\XiaoanChat.tsx`
- Modify: `D:\Obsidian\初始\site\src\components\Layout.tsx`
- Modify: `D:\Obsidian\初始\site\src\main.tsx`
- Modify: `D:\Obsidian\初始\site\src\registerServiceWorker.ts`

- [ ] **Step 1: 新增运行时配置工具**

在 `src/lib/runtime.ts` 定义：

```ts
export type DesktopRuntimeConfig = {
  platform: 'web' | 'desktop';
  apiBaseUrl: string;
  enableServiceWorker: boolean;
};

declare global {
  interface Window {
    __AN_STUDY_ROOM_DESKTOP__?: {
      apiBaseUrl?: string;
      platform?: 'desktop';
    };
  }
}

function normalizeBaseUrl(value: string | undefined) {
  const raw = (value || '').trim();
  if (!raw) return '';
  return raw.replace(/\/+$/, '');
}

export function detectDesktopPlatform() {
  return typeof window !== 'undefined' && window.__AN_STUDY_ROOM_DESKTOP__?.platform === 'desktop';
}

export function runtimeConfig(): DesktopRuntimeConfig {
  const desktopBase = normalizeBaseUrl(window.__AN_STUDY_ROOM_DESKTOP__?.apiBaseUrl);
  const envBase = normalizeBaseUrl(import.meta.env.VITE_XIAOAN_API_BASE_URL);
  const apiBaseUrl = desktopBase || envBase || '';

  return {
    platform: detectDesktopPlatform() ? 'desktop' : 'web',
    apiBaseUrl,
    enableServiceWorker: !detectDesktopPlatform(),
  };
}

export function resolveApiUrl(path: string) {
  const { apiBaseUrl } = runtimeConfig();
  if (!apiBaseUrl) return path;
  return `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
```

- [ ] **Step 2: 让小安请求走运行时 API 地址**

把 `src/components/XiaoanChat.tsx` 里的：

```ts
const response = await fetch('/api/xiaoan/chat', {
```

改成：

```ts
import { resolveApiUrl } from '@/lib/runtime';

const response = await fetch(resolveApiUrl('/api/xiaoan/chat'), {
```

- [ ] **Step 3: 桌面端禁用 service worker**

在 `src/registerServiceWorker.ts` 中使用 `runtimeConfig()`：

```ts
import { runtimeConfig } from './lib/runtime';

export function registerServiceWorker() {
  if (!runtimeConfig().enableServiceWorker) return;
  if (!import.meta.env.PROD) return;
  if (!('serviceWorker' in navigator)) return;
  ...
}
```

- [ ] **Step 4: 保留站点数据运行时刷新，但不破坏桌面模式**

`src/components/Layout.tsx` 保持现有 `refreshSiteData()`，不改成远程强依赖。桌面版第一期继续用打包时的公开内容 + 本地 `site-data` 刷新逻辑。

- [ ] **Step 5: 运行前端验证**

Run:

```powershell
cd D:\Obsidian\初始\site
npm run lint
npm run build
```

Expected:
- `lint` 通过
- `build` 通过

---

### Task 2: 按官方 Vite + Tauri 方式初始化桌面壳

**Files:**
- Modify: `D:\Obsidian\初始\site\package.json`
- Modify: `D:\Obsidian\初始\site\vite.config.ts`
- Create: `D:\Obsidian\初始\site\src-tauri\Cargo.toml`
- Create: `D:\Obsidian\初始\site\src-tauri\build.rs`
- Create: `D:\Obsidian\初始\site\src-tauri\src\main.rs`
- Create: `D:\Obsidian\初始\site\src-tauri\src\lib.rs`
- Create: `D:\Obsidian\初始\site\src-tauri\tauri.conf.json`
- Create: `D:\Obsidian\初始\site\src-tauri\capabilities\default.json`

- [ ] **Step 1: 安装 Tauri 依赖**

Run:

```powershell
cd D:\Obsidian\初始\site
npm install @tauri-apps/api @tauri-apps/plugin-opener
npm install -D @tauri-apps/cli
```

Expected:
- `package.json` 新增 Tauri 依赖

- [ ] **Step 2: 增加 Tauri 脚本**

把 `package.json` scripts 扩成至少包含：

```json
{
  "tauri": "tauri",
  "desktop:dev": "tauri dev",
  "desktop:build": "tauri build"
}
```

- [ ] **Step 3: 按官方 Vite 接法收紧开发配置**

`vite.config.ts` 调整为兼容 Tauri 开发：

```ts
server: {
  port: 3000,
  strictPort: true,
  host: '127.0.0.1',
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8788',
      changeOrigin: true,
    },
  },
},
clearScreen: false,
envPrefix: ['VITE_', 'TAURI_'],
```

- [ ] **Step 4: 创建最小 Rust 入口**

`src-tauri/src/lib.rs`：

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let script = r#"
                  window.__AN_STUDY_ROOM_DESKTOP__ = {
                    platform: 'desktop',
                    apiBaseUrl: ''
                  };
                "#;
                let _ = window.eval(script);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

`src-tauri/src/main.rs`：

```rust
fn main() {
    an_study_room_lib::run();
}
```

- [ ] **Step 5: 创建最小能力文件**

`src-tauri/capabilities/default.json`：

```json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capability for An Study Room desktop shell",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "opener:default"
  ]
}
```

- [ ] **Step 6: 写 tauri.conf.json**

按官方 Vite 模式设置：

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "productName": "安的书房",
  "version": "0.1.0",
  "identifier": "xin.an.studyroom",
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devUrl": "http://127.0.0.1:3000",
    "frontendDist": "../dist"
  },
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "安的书房",
        "width": 1440,
        "height": 960,
        "minWidth": 1100,
        "minHeight": 760,
        "resizable": true
      }
    ],
    "security": {
      "csp": null
    }
  },
  "bundle": {
    "active": true,
    "targets": ["nsis", "msi"],
    "createUpdaterArtifacts": false,
    "windows": {
      "digestAlgorithm": "sha256"
    }
  }
}
```

- [ ] **Step 7: 运行桌面开发模式**

Run:

```powershell
cd D:\Obsidian\初始\site
npm run desktop:dev
```

Expected:
- Tauri 窗口能打开
- 首页能显示
- 控制台无 Tauri 初始化错误

---

### Task 3: 生成图标、安装包和可分发文档

**Files:**
- Create: `D:\Obsidian\初始\site\src-tauri\icons\*`
- Create: `D:\Obsidian\初始\site\.env.desktop.example`
- Create: `D:\Obsidian\初始\site\docs\desktop-tauri.md`
- Modify: `D:\Obsidian\初始\docs\an-personal-study-room-todo.md`

- [ ] **Step 1: 从现有图形生成 Tauri 图标**

Run:

```powershell
cd D:\Obsidian\初始\site
npx tauri icon public/app-icon.svg
```

Expected:
- `src-tauri/icons/` 下生成 Windows 和通用图标

- [ ] **Step 2: 增加桌面环境样例**

创建 `.env.desktop.example`：

```env
VITE_XIAOAN_API_BASE_URL=https://your-public-domain.example.com
```

说明：桌面包不带密钥，只带公开服务地址。

- [ ] **Step 3: 写分发文档**

`site/docs/desktop-tauri.md` 必须包含：
- 桌面版定位
- 不打包密钥的原则
- 开发启动方式
- 打包命令
- Windows 安装包输出路径
- 后续接公网服务的方式

- [ ] **Step 4: 更新总待办**

`docs/an-personal-study-room-todo.md` 新增桌面端项：
- Tauri 壳完成
- Windows 安装包验证
- 远程 API 地址切换
- 后续 updater / 签名 / 发布

- [ ] **Step 5: 构建安装包**

Run:

```powershell
cd D:\Obsidian\初始\site
npm run desktop:build
```

Expected:
- `src-tauri/target/release/bundle/` 下出现 `nsis` 或 `msi`
- 安装包可以双击安装

---

### Task 4: 桌面端验收与发布边界

**Files:**
- Verify: `D:\Obsidian\初始\site\src-tauri\target\release\bundle\`
- Verify: `D:\Obsidian\初始\site\docs\desktop-tauri.md`

- [ ] **Step 1: 验收安装行为**

检查：
- 安装包能启动
- 桌面端首页、藏馆、工坊、详情页正常
- 小安按钮可见
- 没有把密钥、`.env.local`、本地路径打进包

- [ ] **Step 2: 验收远程服务边界**

检查：
- 桌面端只调用公开 API 地址
- 无任何客户端内嵌密钥
- 小安服务不可用时，回退到本地导览文案

- [ ] **Step 3: 运行完整验证**

Run:

```powershell
cd D:\Obsidian\初始
python -m unittest discover -s tests
python scripts/check_public_content_quality.py .
python scripts/wiki_check.py .
python scripts/privacy_scan.py .
cd site
npm run lint
npm run build
```

Expected:
- 全部通过

- [ ] **Step 4: 记录当前局限**

在最终说明里明确：
- 第一版桌面端还没有自动更新
- 还没有 Windows 签名
- 小安正式公网服务地址仍待服务器部署
- 当前安装包适合内测和结构验证，下一步再做签名与 updater

