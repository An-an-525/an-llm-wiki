// ============================================================
// 模块配置
// 定义前台导航模块的元数据
// 后端未来可动态控制此配置
// ============================================================

import type { SiteModule } from "./types";

export const modules: SiteModule[] = [
  {
    id: "home",
    name: "首页",
    key: "about",
    description: "藏馆总览与入口",
    href: "/",
    view: "card-grid",
    visible: true,
    order: 0,
  },
  {
    id: "library",
    name: "藏馆",
    key: "library",
    description: "收录我持续整理的工具、模型、项目、教程与资料。",
    href: "/library",
    view: "card-grid",
    visible: true,
    order: 1,
  },
  {
    id: "paths",
    name: "谱系",
    key: "path",
    description: "复刻路线、学习路径与构建方法。",
    href: "/paths",
    view: "route-map",
    visible: true,
    order: 2,
  },
  {
    id: "feed",
    name: "风信",
    key: "feed",
    description: "最新信息、资讯、动态与聚合内容。",
    href: "/feed",
    view: "info-feed",
    visible: true,
    order: 3,
  },
  {
    id: "works",
    name: "工坊",
    key: "work",
    description: "作品、项目、实验与成果。",
    href: "/works",
    view: "gallery",
    visible: true,
    order: 4,
  },
  {
    id: "journal",
    name: "手记",
    key: "journal",
    description: "日记、复盘、成长记录与开发过程。",
    href: "/journal",
    view: "article-list",
    visible: true,
    order: 5,
  },
  {
    id: "timeline",
    name: "年谱",
    key: "timeline",
    description: "个人历史线路与阶段节点。",
    href: "/timeline",
    view: "timeline",
    visible: true,
    order: 6,
  },
  {
    id: "about",
    name: "自序",
    key: "about",
    description: "关于我，关于本站。",
    href: "/about",
    view: "markdown",
    visible: true,
    order: 7,
  },
];

export const visibleModules = modules
  .filter((m) => m.visible)
  .sort((a, b) => a.order - b.order);

export const navModules = visibleModules.filter((m) => m.id !== "home");
