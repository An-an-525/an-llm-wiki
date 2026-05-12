// ============================================================
// 核心类型定义
// 个人藏馆 - 类型系统
// ============================================================

export type ContentStatus =
  | "draft"
  | "public"
  | "featured"
  | "recommended"
  | "verified"
  | "pending"
  | "archived"
  | "outdated";

export type ModuleType =
  | "library"
  | "path"
  | "paths"
  | "feed"
  | "work"
  | "works"
  | "journal"
  | "timeline"
  | "about";

export type ViewType =
  | "card-grid"
  | "article-list"
  | "info-feed"
  | "timeline"
  | "table"
  | "gallery"
  | "route-map"
  | "markdown"
  | "link-list";

export type PublicSafety =
  | "public-safe"
  | "needs-redaction"
  | "local-only-source";

export interface ContentDepth {
  publicSafety?: PublicSafety;
  sourceLabels?: string[];
  whyItMattered?: string;
  operationStory?: string[];
  psychologicalLayer?: string;
  sociologicalLayer?: string;
  philosophicalLayer?: string;
  replicationSteps?: string[];
  failureModes?: string[];
  lessons?: string[];
  nextPlan?: string;
}

// ---- 基础内容 ----

export interface BaseContent extends ContentDepth {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags: string[];
  status: ContentStatus[];
  createdAt: string;
  updatedAt: string;
  cover?: string;
  href?: string;
  sourcePath?: string;
  sources?: string[];
  contentLines?: string[];
  toc?: ContentTocItem[];
  wordCount?: number;
  readingMinutes?: number;
  metrics?: ContentMetrics;
  quality?: ContentQuality;
}

export interface ContentTocItem {
  level: number;
  title: string;
  anchor: string;
}

export interface ContentMetrics {
  lineCount: number;
  headingCount: number;
  linkCount: number;
  sourceCount: number;
}

export interface ContentQuality {
  hasSources: boolean;
  hasToc: boolean;
  summaryLength: number;
  needsSourceReview: boolean;
  displayTier?: "showcase" | "starter" | "candidate" | "hidden";
  qualityScore?: number;
  hiddenReasons?: string[];
  explicitlyCurated?: boolean;
}

export interface SiteCuration {
  mode: string;
  displayedContent: number;
  reviewQueue: number;
  allPublicMarkdown: number;
  qualityManifest: string;
  rules: string[];
  nextImportWorkflow: string[];
}

// ---- 模块配置 ----

export interface SiteModule {
  id: string;
  name: string;
  key: ModuleType;
  description: string;
  href: string;
  view: ViewType;
  visible: boolean;
  order: number;
  icon?: string;
}

// ---- 藏馆 ----

export type LibraryItemType =
  | "source"
  | "tool"
  | "model"
  | "github"
  | "tutorial"
  | "website"
  | "article"
  | "video"
  | "api"
  | "software"
  | "case";

export interface LibraryItem extends BaseContent {
  type: LibraryItemType;
  url?: string;
  reason: string;
  note?: string;
  rating?: 1 | 2 | 3 | 4 | 5;
  verified: boolean;
  difficulty?: "low" | "medium" | "high";
  pricing?: "free" | "paid" | "freemium" | "unknown";
  whoFor: string;
  timeToLearn: string;
  myThoughts?: string;
  pros?: string[];
  cons?: string[];
  isRecommended: boolean;
  recommendedFor?: string;
  sourceReliability: "verified-source" | "source-backed" | "needs-review";
  relatedPaths?: string[];
  alternatives?: string[];
}

// ---- 谱系 ----

export interface PathStep {
  id: string;
  title: string;
  goal: string;
  description: string;
  resources: string[];
  notes?: string;
  pitfalls?: string[];
  completion: string;
  optional?: boolean;
}

export interface PathItem extends BaseContent {
  goal: string;
  audience: string;
  prerequisites: string[];
  estimatedTime: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  finalOutput: string;
  steps: PathStep[];
  commonPitfalls?: string[];
  alternatives?: string[];
  nextSteps?: string[];
  relatedWorks?: string[];
}

// ---- 风信 ----

export type FeedCategory =
  | "ai-news"
  | "model-release"
  | "tool-update"
  | "github-trending"
  | "industry"
  | "note";

export interface FeedItem extends BaseContent {
  source: string;
  sourceUrl?: string;
  publishedAt: string;
  importance: "low" | "medium" | "high";
  category: FeedCategory;
  archivedToLibrary?: boolean;
  shortComment?: string;
}

// ---- 工坊 ----

export type WorkItemType =
  | "website"
  | "tool"
  | "video"
  | "mini-app"
  | "course"
  | "open-source"
  | "prototype"
  | "experiment";

export type WorkProjectStatus =
  | "idea"
  | "building"
  | "online"
  | "maintaining"
  | "paused"
  | "archived";

export interface WorkItem extends BaseContent {
  type: WorkItemType;
  projectStatus: WorkProjectStatus;
  role?: "owner-built" | "adapted" | "reference-study" | "mixed";
  techStack?: string[];
  demoUrl?: string;
  githubUrl?: string;
  relatedPath?: string;
  relatedJournal?: string[];
}

// ---- 手记 ----

export type JournalItemType =
  | "daily"
  | "review"
  | "devlog"
  | "learning"
  | "thought"
  | "stage-summary"
  | "life";

export interface JournalItem extends BaseContent {
  date: string;
  mood?: string;
  type: JournalItemType;
  body: string;
  visibility: "public" | "hidden" | "summary-only";
  relatedWork?: string;
  relatedPath?: string;
  relatedTimeline?: string;
}

// ---- 年谱 ----

export type TimelineItemType =
  | "project"
  | "learning"
  | "system"
  | "release"
  | "insight"
  | "life"
  | "migration";

export interface TimelineItem extends BaseContent {
  date: string;
  phase: string;
  type: TimelineItemType;
  importance: "low" | "medium" | "high";
  relatedWorks?: string[];
  relatedPaths?: string[];
  relatedJournals?: string[];
  relatedLibraryItems?: string[];
}

// ---- 辅助类型 ----

export interface FilterState {
  search: string;
  tags: string[];
  status: ContentStatus[];
  type: string[];
}

export interface ArchiveContentItem extends BaseContent {
  module: string;
  category?: string;
  type?: string;
  contentType?: string;
  links?: { target: string; label: string }[];
}
