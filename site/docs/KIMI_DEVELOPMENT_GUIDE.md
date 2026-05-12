# 萦思藏馆 · 开发者指南

> 本文档面向参与藏馆项目开发的前端开发者，涵盖项目架构、核心概念、开发流程和常见问题。

---

## 目录

- [1. 项目概览](#1-项目概览)
- [2. 开发环境搭建](#2-开发环境搭建)
- [3. 项目架构说明](#3-项目架构说明)
- [4. 核心概念](#4-核心概念)
- [5. 各模块详解](#5-各模块详解)
- [6. 添加新内容的流程](#6-添加新内容的流程)
- [7. 构建和部署](#7-构建和部署)
- [8. 常见问题](#8-常见问题)

---

## 1. 项目概览

### 1.1 这是什么

**萦思藏馆**是一个**个人公开资料馆与成长记录系统**。它用 Web 的形式，把一个人的知识收藏、学习路线、作品项目和成长轨迹组织成一个可以浏览、搜索、探索的数字空间。

项目采用纯前端架构，所有数据目前以 Mock 形式存在于代码中，未来可平滑接入后端 API。

### 1.2 核心功能

| 模块 | 路径 | 功能描述 |
|------|------|----------|
| **藏馆** | `/library` | 资料收藏与整理，支持 8 类资源卡片、多维筛选搜索 |
| **风信** | `/feed` | 时间线动态，记录近期更新、收藏、里程碑 |
| **手记** | `/journal` | 文章记录，Markdown 渲染，支持分类和标签筛选 |
| **书房** | `/about` | 个人信息展示，自序与藏馆说明 |
| **谱系** | `/paths` | 可复刻的学习路线，每条路线含多个阶段 |
| **工坊** | `/works` | 作品与项目展示 |
| **年谱** | `/timeline` | 成长时间线，记录重要节点与反思 |

### 1.3 技术选型理由

| 技术 | 版本 | 选型理由 |
|------|------|----------|
| React | 19.2 | 组件化 UI 框架，生态成熟，AI 辅助编写友好 |
| TypeScript | 5.9 | 静态类型检查，提升代码可维护性和重构信心 |
| Vite | 7.2 | 极速冷启动，原生 ESM，比 CRA 快 10 倍以上 |
| Tailwind CSS | 3.4 | 原子化 CSS，AI 生成准确度高，开发效率高 |
| shadcn/ui | - | Headless UI 组件，可完全自定义样式，不锁设计 |
| Framer Motion | 12.38 | 声明式动画 API，页面切换和滚动动画效果细腻 |
| react-router | 7.6 | HashRouter 适配静态部署，无需服务端配置 |
| react-markdown | 10.1 | 安全、灵活的 Markdown 渲染方案 |
| lucide-react | 0.562 | 轻量、风格统一的图标库 |

---

## 2. 开发环境搭建

### 2.1 前置需求

- **Node.js** >= 20 （推荐 20 LTS）
- **npm** >= 10

验证：

```bash
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 2.2 安装步骤

```bash
# 1. 克隆仓库
git clone <repo-url>
cd app

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

开发服务器默认在 `http://localhost:3000` 启动。

### 2.3 可用脚本

```bash
npm run dev       # 启动开发服务器 (port 3000)
npm run build     # TypeScript 编译 + Vite 构建
npm run preview   # 预览生产构建
npm run lint      # ESLint 代码检查
```

### 2.4 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录，包含：

```
dist/
├── index.html
└── assets/
    ├── index-xxx.js
    ├── index-xxx.css
    └── ...
```

---

## 3. 项目架构说明

### 3.1 目录结构详解

```
src/
├── App.tsx              # 路由定义（10 条路由）
├── main.tsx             # 应用入口：挂载 React + HashRouter
├── index.css            # 全局样式：Tailwind 指令 + CSS 变量 + 字体
├── App.css              # 少量应用级样式
├── types/index.ts       # 全站 TypeScript 接口定义
│
├── data/                # 数据层（纯 Mock，未来可替换为 API）
│   ├── mockLibrary.ts       # 藏馆资源（37 条 LibraryItem）
│   ├── mockFeed.ts          # 风信动态（FeedItem[]）
│   ├── mockJournal.ts       # 手记文章（JournalEntry[]）
│   ├── mockPaths.ts         # 谱系路线（Path[] + PathDetail 扩展）
│   ├── mockWorks.ts         # 工坊作品（Work[]）
│   ├── mockTimeline.ts      # 年谱事件（TimelineEvent[]）
│   └── mockSiteConfig.ts    # 站点导航配置（NavItem[]）
│
├── pages/               # 页面级组件（对应路由）
│   ├── Home.tsx             # 首页：8 入口 + 各模块预览
│   ├── Library.tsx          # 藏馆：筛选/搜索/排序/卡片列表
│   ├── Feed.tsx             # 风信：时间线 + 类型筛选
│   ├── Journal.tsx          # 手记：文章列表 + Markdown 详情
│   ├── Works.tsx            # 工坊：作品卡片 + 筛选
│   ├── Timeline.tsx         # 年谱：时间轴布局
│   ├── Paths.tsx            # 谱系列表：路线概览卡片
│   ├── PathDetail.tsx       # 谱系详情：阶段展开 + 资源
│   ├── About.tsx            # 书房：自序文字页
│   └── ContentDetail.tsx    # 通用内容详情页（统一适配 6 种类型）
│
├── components/          # 共享组件
│   ├── Layout.tsx           # 页面布局壳：导航 + 主内容 + 页脚 + 动画
│   ├── Navbar.tsx           # 顶部导航栏（桌面 + 移动端菜单）
│   ├── MobileNav.tsx        # 底部移动导航栏（4 入口 Tab）
│   ├── Footer.tsx           # 页脚
│   ├── SearchOverlay.tsx    # 全局搜索浮层（Cmd+K 唤起）
│   └── ui/                  # UI 组件库
│       ├── lifecycle.tsx    # 生命周期组件库
│       ├── button.tsx       # shadcn/ui Button
│       ├── card.tsx         # shadcn/ui Card
│       ├── skeleton.tsx     # shadcn/ui Skeleton
│       ├── dialog.tsx       # shadcn/ui Dialog
│       ├── badge.tsx        # shadcn/ui Badge
│       ├── sonner.tsx       # Toast 通知组件
│       └── ... (共 40+ 个)
│
├── hooks/
│   └── use-mobile.ts        # 断点 768px 以下判断是否为移动端
│
└── lib/
    └── utils.ts             # 工具函数：cn() 合并 Tailwind 类名
```

### 3.2 文件命名约定

| 类型 | 命名方式 | 示例 |
|------|----------|------|
| 页面组件 | PascalCase + 语义名 | `Home.tsx`, `Library.tsx` |
| 共享组件 | PascalCase | `Layout.tsx`, `Navbar.tsx` |
| UI 组件 | kebab-case | `button.tsx`, `skeleton.tsx` |
| 数据文件 | camelCase + mock 前缀 | `mockLibrary.ts` |
| 类型定义 | PascalCase 接口 | `LibraryItem`, `FeedItem` |
| Hook | use-前缀 + camelCase | `use-mobile.ts` |

### 3.3 模块划分逻辑

项目按**功能模块**划分，每个模块独立管理自己的数据、类型和页面：

- **数据层** (`src/data/`)：纯 Mock 数据，以数组形式导出，可直接替换为 API 调用
- **页面层** (`src/pages/`)：每个页面对应一个路由，负责数据消费和 UI 呈现
- **组件层** (`src/components/`)：共享布局组件 + shadcn/ui 组件库
- **类型层** (`src/types/index.ts`)：全站类型统一定义

---

## 4. 核心概念

### 4.1 路由系统

#### HashRouter 配置

```tsx
// main.tsx
import { HashRouter } from 'react-router';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
```

采用 `HashRouter` 而非 `BrowserRouter`，原因是：

- 项目为纯静态站点，可部署到 GitHub Pages / Vercel 等任何静态托管
- 无需服务端配置 fallback 路由
- 路由形式为 `/#/library`、`/#/feed` 等

#### 路由定义

```tsx
// App.tsx
import { Routes, Route } from 'react-router';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
        <Route path="/paths" element={<Paths />} />
        <Route path="/paths/:id" element={<PathDetail />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/works" element={<Works />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/about" element={<About />} />
        <Route path="/content/:id" element={<ContentDetail />} />
      </Routes>
    </Layout>
  );
}
```

#### 页面切换动画

`Layout.tsx` 使用 `AnimatePresence` + `motion.div` 包裹路由内容，实现页面切换时的淡入淡出：

```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

同时监听 `location.pathname` 变化，自动滚动到页面顶部。

### 4.2 数据层

#### Mock 数据结构

所有数据以**纯 TypeScript 数组**形式存储在 `src/data/` 中，类型定义在 `src/types/index.ts`：

```ts
// types/index.ts — 核心类型一览

export interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'doc';
  tags: string[];
  links: { label: string; url: string }[];
  rating?: number;
  status: 'todo' | 'doing' | 'done';
  // ... 更多字段
}

export interface FeedItem {
  id: string;
  type: 'resource' | 'path_update' | 'work' | 'journal' | 'milestone';
  title: string;
  content: string;
  link?: string;
  tags: string[];
  createdAt: string;
  importanceLevel?: 'critical' | 'important' | 'normal';
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  body: string;
  readingTime?: number;
  keyTakeaways?: string[];
}

export interface Path {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stages: PathStage[];
  // ...
}

export interface Work {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: 'in_progress' | 'completed' | 'archived';
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  category: 'milestone' | 'learning' | 'work' | 'life';
  importance: 'normal' | 'important' | 'major';
}
```

#### 未来接后端的扩展点

当前数据层完全解耦，替换为后端 API 只需修改数据导入方式：

```ts
// 当前：直接导入 mock 数据
import { libraryItems } from '@/data/mockLibrary';

// 未来：替换为 API 调用
import { useLibraryItems } from '@/hooks/useLibrary';
const { libraryItems, loading, error } = useLibraryItems();
```

建议按以下步骤迁移：

1. 创建 `src/api/` 目录，封装 `fetch` 或 `axios`
2. 创建 `src/hooks/useData.ts` 系列 Hook
3. 页面组件中替换数据导入，加入 `loading` 和 `error` 处理
4. Mock 数据可作为离线兜底或开发环境使用

### 4.3 组件体系

#### 页面组件 vs 共享组件

| 类型 | 位置 | 职责 | 示例 |
|------|------|------|------|
| 页面组件 | `src/pages/` | 对应路由，负责数据获取/消费和页面级布局 | `Library.tsx` |
| 共享组件 | `src/components/` | 跨页面复用的布局和交互组件 | `Layout.tsx`, `Navbar.tsx` |
| UI 组件 | `src/components/ui/` | 基础 UI 元素，无业务逻辑 | `button.tsx`, `card.tsx` |

#### shadcn/ui 组件使用

项目使用 shadcn/ui 的组件模式：组件源码直接存在于项目中，可完全自定义。

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

<Button variant="outline" onClick={handleClick}>
  点击
</Button>
```

可用的 shadcn/ui 组件包括：Button、Card、Skeleton、Dialog、Badge、Input、Textarea、Accordion、Alert、Avatar、Breadcrumb、Checkbox、Collapsible、ContextMenu、DropdownMenu、Form、HoverCard、Menubar、NavigationMenu、Popover、Progress、RadioGroup、ScrollArea、Select、Separator、Sheet、Slider、Switch、Table、Tabs、Toast、Toggle、ToggleGroup、Tooltip 等 40+ 个。

### 4.4 样式方案

#### Tailwind 配置

```js
// tailwind.config.js
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // shadcn/ui 变量
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        primary: { DEFAULT: 'hsl(var(--primary))', /* ... */ },
        // 自定义设计系统色彩
        cream: '#FAF9F7',
        'light-pink': '#F5EDE8',
        'light-gray': '#F2F2F0',
        ink: '#1E1E1E',
        graphite: '#4A4A48',
        silver: '#8A8A88',
        'light-silver': '#C8C8C6',
        'border-color': '#E5E5E3',
        'border-dark': '#D0D0CE',
        'status-active': '#C8956C',
        'status-done': '#6B9E7C',
        favorite: '#C47D6E',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
      // ...
    },
  },
};
```

#### 自定义主题

项目采用**低饱和暖色系**设计，以赭石色为点缀，营造纸质书卷气息：

| 色彩名称 | 色值 | 用途 |
|----------|------|------|
| cream | `#FAF9F7` | 页面背景 |
| light-pink | `#F5EDE8` | 卡片高亮、标签背景 |
| ink | `#1E1E1E` | 主标题、正文 |
| graphite | `#4A4A48` | 副标题、次级文字 |
| silver | `#8A8A88` | 描述文字、辅助信息 |
| status-active | `#C8956C` | 强调色、进行中状态 |
| status-done | `#6B9E7C` | 完成状态 |
| favorite | `#C47D6E` | 重要标记、收藏 |

#### 响应式策略

项目采用**三端适配**策略，以 Tailwind 断点为基础：

| 断点 | 范围 | 布局特点 |
|------|------|----------|
| Mobile | < 768px | 单列布局，底部 Tab 导航，触控优化 |
| Tablet | 768px - 1024px | 双列网格，侧边栏收起 |
| Desktop | > 1024px | 三列网格，完整导航，最大宽度 1200px 居中 |

```tsx
// 响应式示例
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

移动端专用 Hook：

```ts
// hooks/use-mobile.ts
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);
  // 监听 768px 断点
  // ...
  return isMobile; // true when < 768px
}
```

### 4.5 生命周期组件

`src/components/ui/lifecycle.tsx` 提供了一套覆盖页面完整生命周期的状态组件：

#### PageSkeleton — 页面骨架屏

```tsx
import { PageSkeleton } from '@/components/ui/lifecycle';

// 根据页面类型选择骨架样式
<PageSkeleton type="grid" count={9} />    // 网格布局（藏馆、工坊）
<PageSkeleton type="list" count={6} />    // 列表布局（风信）
<PageSkeleton type="detail" />            // 详情布局（内容页）
<PageSkeleton type="cards" count={6} />   // 卡片布局（谱系）
<PageSkeleton type="feed" count={5} />    // 动态布局（风信）
```

#### EmptyState — 空状态（带 CTA）

```tsx
import { EmptyState } from '@/components/ui/lifecycle';

<EmptyState
  icon={Search}
  title="没有找到相关内容"
  description="试试其他关键词，或者换个筛选条件"
  action={{ label: '清除筛选', onClick: () => clearFilters() }}
/>
```

#### ErrorState — 错误状态（带重试）

```tsx
import { ErrorState } from '@/components/ui/lifecycle';

<ErrorState
  title="加载失败"
  description="请检查网络后重试"
  onRetry={() => refetch()}
/>
```

#### NetworkStatus — 断网提示条

自动检测网络状态，断网时在页面顶部显示提示条。已集成在 `Layout.tsx` 中，无需手动引入。

#### ImagePlaceholder — 图片加载占位

```tsx
import { ImagePlaceholder } from '@/components/ui/lifecycle';

<ImagePlaceholder
  src="/cover.jpg"
  alt="封面"
  aspectRatio="16/9"
  objectFit="cover"
/>
```

---

## 5. 各模块详解

### 5.1 藏馆 (`/library`)

藏馆是项目的核心模块，展示 37 条经过分类整理的资源条目。

#### 数据结构

```ts
interface LibraryItem {
  id: string;           // 唯一标识，如 "cursor"
  title: string;        // 资源名称
  description: string;  // 详细描述
  type: 'article' | 'video' | 'book' | 'course' | 'tool' | 'doc';
  tags: string[];       // 标签数组
  links: { label: string; url: string }[];
  rating?: number;      // 1-5 星级评分
  status: 'todo' | 'doing' | 'done';
  useCase?: string;     // 使用场景
  difficulty?: 'easy' | 'medium' | 'hard';
  timeToLearn?: string; // 学习时间
  myThoughts?: string;  // 个人感想
  isRecommended?: boolean;
  whoFor?: string;      // 适合人群
  createdAt: string;    // ISO 日期
  updatedAt: string;
}
```

#### 分类体系

资源按 vibe coding 全链路分为 **8 大类**（定义在 `mockLibrary.ts` 的 `libraryCategories`）：

1. **氛围编程核心** — AI IDE 与编程助手
2. **对话艺术** — 提示词工程
3. **前端营造** — 从浏览器变色到完整应用
4. **后端与数据** — 从假数据到真数据库
5. **部署与上线** — 从 GitHub Pages 到云
6. **视觉与文字** — 设计、字体、内容创作
7. **自动化与集成** — MCP、API、工作流
8. **思维与判断** — 产品、学习、协作

#### 筛选与搜索

藏馆页面提供多维筛选：

- **类型筛选**：全部 / AI工具 / 文档 / 教程 / 文章 / 视频 / 书籍
- **状态筛选**：全部 / 亲测 / 持续更新 / 待验证
- **标签筛选**：动态提取所有标签
- **搜索**：支持标题、描述、标签、适用人群、个人感想全文搜索
- **排序**：推荐优先 / 最新收藏 / 最早收藏 / 最高评分 / 名称排序
- **新手推荐区**：无筛选时自动展示 `isRecommended + easy` 的条目

#### 展示方式

```
页面头部（标题 + 统计 + 引导卡片）
  ↓
筛选栏（sticky 吸顶）
  ↓
新手推荐区（条件展示）
  ↓
资源卡片网格（3 列 → 2 列 → 1 列响应式）
  ↓
加载更多 / 到底提示
```

每张卡片包含：顶部彩色条（按类型着色）、类型标签、状态徽章、难度徽章、标题、描述、适用人群、标签、个人感想、评分、操作按钮。

### 5.2 风信 (`/feed`)

风信是动态信息流模块，以时间线形式展示近期更新和重要事件。

#### 数据结构

```ts
interface FeedItem {
  id: string;
  type: 'resource' | 'path_update' | 'work' | 'journal' | 'milestone';
  title: string;
  content: string;
  link?: string;        // 关联链接
  source?: string;      // 来源
  importanceLevel?: 'critical' | 'important' | 'normal';
  actionText?: string;  // CTA 文字
  tags: string[];
  createdAt: string;    // ISO 日期时间
}
```

#### 展示方式

- **时间线布局**：左侧竖线 + 彩色圆点，右侧内容卡片
- **日期分组**：今天 / 昨天 / 本周 / 具体日期
- **类型标识**：5 种类型各有颜色和图标
- **重要度标记**：critical 级别带红色高亮和闪电图标
- **类型筛选**：顶部 Tab 可筛选全部/资源收藏/路径更新/新作品/手记/里程碑

### 5.3 手记 (`/journal`)

手记是文章记录模块，支持 Markdown 渲染和阅读体验优化。

#### 数据结构

```ts
interface JournalEntry {
  id: string;
  title: string;
  date: string;         // YYYY-MM-DD
  tags: string[];
  excerpt: string;      // 摘要
  body: string;         // Markdown 正文
  cover?: string;       // 封面图路径
  readingTime?: number; // 阅读时长（分钟）
  keyTakeaways?: string[]; // 关键收获
  difficulty?: 'easy' | 'medium' | 'hard';
}
```

#### 展示方式

**列表视图**：
- 分类标签 + 日期 + 阅读时长 + 难度徽章
- 标题 + 摘要（最多 3 行）
- 关键收获卡片（列表形式）
- 标签云
- 左侧悬停边框颜色变化

**详情视图**：
- 返回按钮 + 面包屑
- 元信息行（分类 / 日期 / 阅读时长 / 难度）
- 关键收获（编号列表）
- Markdown 正文渲染（含目录侧边栏）
- 上一篇 / 下一篇导航

**Markdown 渲染**：使用 `react-markdown` + `remark-gfm` 插件，支持 GitHub Flavored Markdown（表格、删除线、任务列表等）。样式通过 Tailwind 自定义，确保与整体设计系统一致。

### 5.4 书房 (`/about`)

书房是个人信息展示页，以文学化的方式介绍藏馆的由来和定位。

#### 内容结构

- **自序**：文学化的个人介绍，讲述为什么要做这座藏馆
- **藏馆说明**：八大分类的说明文字
- **联系方式**：相关链接和联系信息

#### 特点

纯文字页面，没有复杂交互。排版注重阅读体验：段落间距舒适、关键文字加粗、装饰性分割线。

### 5.5 其他模块

#### 谱系 (`/paths` + `/paths/:id`)

展示可复刻的学习路线。每条路线包含多个阶段，每个阶段有：标题、描述、状态（未解锁/可开始/进行中/已完成）、检查清单、产出物、技巧提示。详情页展示路线的完整信息：前置条件、预期产出、注意事项、进阶方向。

#### 工坊 (`/works`)

展示个人作品和项目。每个作品包含：标题、描述、封面、技术栈、状态、链接、GitHub、开发时长、团队规模、遇到的挑战、学到的经验。支持按类型（网站/工具/视频/小程序等）和状态筛选。

#### 年谱 (`/timeline`)

以时间轴形式展示成长中的重要节点。支持按年份和分类（里程碑/学习/作品/生活）筛选。不同重要程度的事件以不同大小的圆点表示。

#### 内容详情 (`/content/:id`)

通用详情页，根据 ID 自动匹配 6 种数据类型（resource/path/work/journal/feed/timeline），展示对应的内容详情和面包屑导航。同时根据标签相似度推荐相关内容。

---

## 6. 添加新内容的流程

所有内容目前通过修改 Mock 数据文件添加。以下分模块说明。

### 6.1 添加新的藏馆资源

编辑 `src/data/mockLibrary.ts`，在 `libraryItems` 数组中添加新对象：

```ts
{
  id: 'my-new-tool',           // 唯一标识，英文，kebab-case
  title: '我的新工具',
  description: '工具的详细描述...',
  type: 'tool',                // article | video | book | course | tool | doc
  tags: ['IDE', 'AI', '推荐'],
  links: [{ label: '官网', url: 'https://example.com' }],
  status: 'doing',             // todo | doing | done
  rating: 4,
  difficulty: 'easy',          // easy | medium | hard
  timeToLearn: '1 周',
  useCase: '快速原型开发',
  myThoughts: '这个工具帮我省了很多时间...',
  whoFor: '想快速搭建原型的开发者',
  isRecommended: true,
  createdAt: '2025-06-01',
  updatedAt: '2025-06-01',
}
```

添加后，藏馆页面会自动展示新资源（无需修改页面代码）。

### 6.2 添加新的风信动态

编辑 `src/data/mockFeed.ts`，在 `feedItems` 数组开头添加新对象（新的放在最前）：

```ts
{
  id: 'f-0601',                // 格式：f-月日
  type: 'resource',            // resource | path_update | work | journal | milestone
  title: '新动态标题',
  content: '动态详细内容...',
  link: '/library',            // 可选，关联页面路径
  source: '藏馆',
  importanceLevel: 'normal',   // critical | important | normal
  actionText: '查看详情',
  tags: ['更新'],
  createdAt: '2025-06-01T10:00:00',
}
```

### 6.3 添加新的手记文章

编辑 `src/data/mockJournal.ts`，在 `journalEntries` 数组中添加新对象：

```ts
{
  id: 'j-my-new-article',      // 唯一标识，j-前缀
  title: '文章标题',
  date: '2025-06-01',
  tags: ['思考', 'AI'],
  excerpt: '文章摘要，一段话概括内容...',
  body: `文章正文，支持 Markdown 语法。

## 二级标题

正文段落...

- 列表项 1
- 列表项 2

**加粗文字** 和 *斜体*。
`,
  readingTime: 5,
  keyTakeaways: [
    '第一个关键收获',
    '第二个关键收获',
  ],
  difficulty: 'easy',
}
```

### 6.4 添加新的谱系路线

编辑 `src/data/mockPaths.ts`，在 `paths` 数组中添加新 `Path` 对象：

```ts
{
  id: 'my-new-path',           // 唯一标识
  title: '如何用 AI 做一个新东西',
  description: '路线描述...',
  cover: '/path-cover.jpg',    // 可选封面图
  difficulty: 'beginner',      // beginner | intermediate | advanced
  estimatedTime: '2-3 周',
  status: 'in_progress',       // in_progress | completed | planned
  tags: ['AI', '前端'],
  whoFor: '适合谁',
  outcomes: ['预期产出 1', '预期产出 2'],
  createdAt: '2025-06-01',
  updatedAt: '2025-06-01',
  stages: [
    {
      id: 's1-w1',
      title: '第一阶段标题',
      description: '阶段描述...',
      order: 1,
      status: 'completed',     // locked | available | in_progress | completed
      resources: [],
      checklist: ['步骤 1', '步骤 2'],
      deliverable: '阶段产出',
      tips: '技巧提示...',
    },
    // 更多阶段...
  ],
}
```

如果需要在详情页展示额外信息（前置条件、注意事项等），还需在 `pathDetails` 对象中添加对应数据。

---

## 7. 构建和部署

### 7.1 构建命令

```bash
npm run build
```

该命令会先执行 `tsc -b` 进行 TypeScript 类型检查，然后调用 `vite build` 进行打包。

### 7.2 输出目录

构建产物位于 `dist/` 目录：

```
dist/
├── index.html              # 入口 HTML
└── assets/
    ├── index-xxx.js        # 打包后的 JS
    ├── index-xxx.css       # 打包后的 CSS
    └── ...                 # 其他资源
```

Vite 配置中 `base: './'` 确保资源引用使用相对路径，适配各种部署环境。

### 7.3 部署方式

本项目为纯静态文件，可部署到任何静态托管服务：

| 平台 | 方式 |
|------|------|
| **Vercel** | 连接 Git 仓库自动部署 |
| **GitHub Pages** | GitHub Actions 或手动推送 dist 目录 |
| **Netlify** | 拖拽 dist 目录或连接 Git |
| **Cloudflare Pages** | 连接 Git 仓库 |
| **自有服务器** | 将 dist/ 内容上传到 Web 服务器 |

部署时只需托管 `dist/` 目录中的文件，无需服务端渲染或 API 支持。

---

## 8. 常见问题

### 8.1 类型报错如何处理

**Q: 导入 Mock 数据时类型不匹配？**

A: 确保新增的数据对象符合 `src/types/index.ts` 中定义的接口。例如添加 `LibraryItem` 时，`status` 字段必须是 `'todo' | 'doing' | 'done'` 之一，不能写其他值。

**Q: `cn()` 函数报错？**

A: `cn()` 来自 `@/lib/utils.ts`，它使用 `clsx` + `tailwind-merge`。确保传入的都是有效的 Tailwind 类名字符串。

### 8.2 添加新页面需要修改哪些文件

添加新页面需要修改以下 3 处：

1. **创建页面组件**：`src/pages/NewPage.tsx`
2. **注册路由**：在 `src/App.tsx` 中添加 `<Route>`：
   ```tsx
   import NewPage from '@/pages/NewPage';
   // ...
   <Route path="/new-page" element={<NewPage />} />
   ```
3. **添加到导航**（如需）：编辑 `src/data/mockSiteConfig.ts`，在 `navItems` 中添加：
   ```ts
   { label: '新页面', path: '/new-page' }
   ```

如果新页面需要数据，还需创建对应的 Mock 数据文件和类型定义。

### 8.3 如何接入真实后端

当前数据层完全解耦，接入后端建议按以下步骤：

**步骤 1：创建 API 封装**

```ts
// src/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function fetchLibraryItems(): Promise<LibraryItem[]> {
  const res = await fetch(`${API_BASE}/library`);
  if (!res.ok) throw new Error('Failed to fetch library items');
  return res.json();
}
```

**步骤 2：创建数据 Hook**

```ts
// src/hooks/useLibrary.ts
import { useState, useEffect } from 'react';
import { fetchLibraryItems } from '@/api/client';
import type { LibraryItem } from '@/types';

export function useLibraryItems() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchLibraryItems()
      .then(setItems)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { items, loading, error };
}
```

**步骤 3：页面中替换数据导入**

```tsx
// 修改前的 Library.tsx
import { libraryItems } from '@/data/mockLibrary';

// 修改后的 Library.tsx
import { useLibraryItems } from '@/hooks/useLibrary';

export default function Library() {
  const { items: libraryItems, loading, error } = useLibraryItems();

  if (loading) return <PageSkeleton type="grid" />;
  if (error) return <ErrorState onRetry={() => window.location.reload()} />;

  // 其余逻辑不变...
}
```

**步骤 4：保留 Mock 数据做离线兜底**

```ts
// src/hooks/useLibrary.ts
import { libraryItems as mockLibraryItems } from '@/data/mockLibrary';

export function useLibraryItems() {
  // ...
  if (error) {
    console.warn('API failed, falling back to mock data');
    return { items: mockLibraryItems, loading: false, error: null };
  }
}
```

### 8.4 样式不生效怎么办

**Q: 新写的 Tailwind 类名没有生效？**

A: 检查 `tailwind.config.js` 的 `content` 配置是否包含你的文件路径：

```js
content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
```

如果文件在 `src/` 外，需要手动添加路径。修改配置后需要重启开发服务器。

**Q: 自定义颜色找不到？**

A: 自定义颜色在 `tailwind.config.js` 的 `theme.extend.colors` 中定义，使用时直接用 kebab-case 名称：

```html
<div class="bg-cream text-ink border border-border-color">
```

### 8.5 移动端适配注意事项

- 底部 Tab 栏在 `md`（768px）以上隐藏，桌面端显示顶部导航
- 触控优化类名：`.tap-active`、`.card-tap` 提供点击反馈
- 图片使用 `loading="lazy"` 实现懒加载
- 搜索框在移动端占满全宽，桌面端限制最大宽度
- 安全区适配：底部导航使用 `env(safe-area-inset-bottom)`
