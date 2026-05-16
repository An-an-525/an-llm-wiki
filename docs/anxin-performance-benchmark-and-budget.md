---
title: 安芯书房跨端性能与体验预算
status: active
created: 2026-05-16
updated: 2026-05-16
tags: [anxin, performance, pwa, android, desktop, benchmark]
---

# 安芯书房跨端性能与体验预算

这份文件把“对标顶级产品”落成可执行约束。安芯书房不是后台文档站，而是读者会安装、会反复打开、会离线阅读、会询问小安的个人书房型应用。

## 对标来源

| 维度 | 对标来源 | 转成安芯书房的约束 |
| --- | --- | --- |
| Web 体验 | web.dev Core Web Vitals | 后续接入 LCP、INP、CLS 实测；当前先用构建预算防止包体失控。 |
| PWA 离线 | web.dev PWA Caching | 只缓存必要壳层和公开资料，不把安装包、接口、私有材料放进离线缓存。 |
| Android 启动 | Android App startup / Android vitals | 控制 APK、图片和启动资源；后续用真机 TTID/TTFD 测冷启动。 |
| Android 资源 | Android app startup best practices | 图片按展示尺寸压缩；未来优先 WebP/矢量资源，避免启动时加载大图。 |
| 桌面更新 | Tauri v2 Updater | 更新清单必须保留签名、版本和 HTTPS 地址，桌面端走受控更新。 |

## 当前机器闸门

命令：

```bash
npm run perf:budget
```

它会先构建，再检查：

- JavaScript 总量、最大依赖包、最大页面包、内嵌资料包；
- CSS 总量；
- 图片总量和单图大小；
- `site-data/adapter.json` 与生成数据模块大小；
- PWA manifest、maskable 图标、Service Worker 缓存契约；
- Windows 安装包、Android APK、桌面更新清单。

报告写入：

```text
manifests/site_performance_budget_report.json
```

## 当前通过线

| 项目 | 预算 |
| --- | ---: |
| CSS 总量 | 140 KB |
| 最大公共依赖包 | 360 KB |
| 最大页面包 | 90 KB |
| 资料包 JS | 460 KB |
| JavaScript 总量 | 1.35 MB |
| 公开 adapter | 560 KB |
| 生成数据模块 | 560 KB |
| 单张图片 | 420 KB |
| 图片总量 | 1.25 MB |
| Windows 安装包 | 32 MB |
| Android APK | 25 MB |

## 本轮本地结论

- 失败点：图片总量曾达到 1.87 MB，超过预算。
- 处理：把首屏、OG、头像、卡片图按展示尺寸重采样。
- 结果：`npm run perf:budget` 已通过，`failures: 0`，`warnings: 0`。

## 后续提高标准

1. 接入真实 Web Vitals：线上记录 LCP、INP、CLS，只采匿名性能指标，不采读者隐私。
2. Android 真机测试：记录冷启动、热启动、页面切换和小安入口耗时。
3. 读者端个人系统：收藏、最近阅读、学习进度、小安历史必须有统一缓存层和清除入口。
4. 图片升级：新增内容优先生成或导入 WebP/AVIF，并保留 JPEG 兼容兜底。
5. 品牌升级：App 名、Logo、图标统一迁移到“安芯书房”，再重新生成安装包。

## 参考链接

- web.dev Core Web Vitals: https://web.dev/articles/vitals
- web.dev Service Worker caching patterns: https://web.dev/articles/offline-cookbook
- Android app startup: https://developer.android.com/topic/performance/vitals/launch-time
- Android app quality: https://developer.android.com/docs/quality-guidelines/core-app-quality
- Tauri updater: https://v2.tauri.app/plugin/updater/
