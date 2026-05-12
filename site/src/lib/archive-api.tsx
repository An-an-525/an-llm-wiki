import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  ArchiveContentItem,
  ContentStatus,
  FeedCategory,
  FeedItem,
  JournalItem,
  JournalItemType,
  LibraryItem,
  LibraryItemType,
  PathItem,
  PathStep,
  TimelineItem,
  TimelineItemType,
  WorkItem,
  WorkItemType,
  WorkProjectStatus,
  SiteModule,
  SiteCuration,
} from "./types";

type PublicContentRecord = Record<string, unknown> & {
  id: string;
  title: string;
  slug: string;
  summary: string;
  tags?: string[];
  status?: string[];
  createdAt?: string;
  updatedAt?: string;
  sourcePath?: string;
  module?: string;
  category?: string;
  type?: string;
  contentType?: string;
  href?: string;
  contentLines?: string[];
  bodyLines?: string[];
  links?: { target: string; label: string }[];
  sources?: string[];
  toc?: { level: number; title: string; anchor: string }[];
  wordCount?: number;
  readingMinutes?: number;
  metrics?: {
    lineCount: number;
    headingCount: number;
    linkCount: number;
    sourceCount: number;
  };
  quality?: {
    hasSources: boolean;
    hasToc: boolean;
    summaryLength: number;
    needsSourceReview: boolean;
    displayTier?: "showcase" | "starter" | "candidate" | "hidden";
    qualityScore?: number;
    hiddenReasons?: string[];
    explicitlyCurated?: boolean;
  };
  displayTier?: "showcase" | "starter" | "candidate" | "hidden";
  qualityScore?: number;
  hiddenReasons?: string[];
};

interface PublicSiteData {
  generatedAt: string;
  schemaVersion: number;
  modules: SiteModule[];
  counts: Record<string, number>;
  facets?: Record<string, { key: string; count: number }[]>;
  homepage?: {
    headline: string;
    summary: string;
    featuredPathSlugs: string[];
    featuredWorkSlugs: string[];
    recentLibrarySlugs: string[];
    recentTimelineSlugs: string[];
  };
  curation?: SiteCuration;
  content: PublicContentRecord[];
  library: PublicContentRecord[];
  paths: PublicContentRecord[];
  feed: PublicContentRecord[];
  works: PublicContentRecord[];
  journal: PublicContentRecord[];
  timeline: PublicContentRecord[];
  about: { title: string; summary: string; body: string };
}

export interface ArchiveData {
  generatedAt: string;
  schemaVersion: number;
  counts: Record<string, number>;
  curation: SiteCuration;
  modules: SiteModule[];
  contentItems: ArchiveContentItem[];
  libraryItems: LibraryItem[];
  pathItems: PathItem[];
  feedItems: FeedItem[];
  workItems: WorkItem[];
  journalItems: JournalItem[];
  timelineItems: TimelineItem[];
  about: PublicSiteData["about"];
  getContentBySlug: (slug: string) => ArchiveContentItem | undefined;
  getLibraryItemById: (id: string) => LibraryItem | undefined;
  getLibraryItemBySlug: (slug: string) => LibraryItem | undefined;
  getPathItemBySlug: (slug: string) => PathItem | undefined;
  getJournalItemBySlug: (slug: string) => JournalItem | undefined;
}

interface ArchiveDataState {
  data: ArchiveData;
  loading: boolean;
  error: string | null;
}

const EMPTY_DATA: ArchiveData = {
  generatedAt: "",
  schemaVersion: 1,
  counts: {},
  curation: {
    mode: "curated-public-showcase",
    displayedContent: 0,
    reviewQueue: 0,
    allPublicMarkdown: 0,
    qualityManifest: "manifests/site_data_quality_review.csv",
    rules: [],
    nextImportWorkflow: [],
  },
  modules: [],
  contentItems: [],
  libraryItems: [],
  pathItems: [],
  feedItems: [],
  workItems: [],
  journalItems: [],
  timelineItems: [],
  about: {
    title: "关于 an-llm-wiki",
    summary: "公开安全的 Obsidian 资料库展示层。",
    body: "数据尚未载入。",
  },
  getContentBySlug: () => undefined,
  getLibraryItemById: () => undefined,
  getLibraryItemBySlug: () => undefined,
  getPathItemBySlug: () => undefined,
  getJournalItemBySlug: () => undefined,
};

const ArchiveDataContext = createContext<ArchiveDataState>({
  data: EMPTY_DATA,
  loading: true,
  error: null,
});

const allowedStatuses = new Set<ContentStatus>([
  "draft",
  "public",
  "featured",
  "recommended",
  "verified",
  "pending",
  "archived",
  "outdated",
]);

const fallbackDate = "2026-05-12";

function siteDataUrl() {
  const base = import.meta.env.BASE_URL || "/";
  const normalized = base.endsWith("/") ? base : `${base}/`;
  return `${normalized}site-data/index.json`;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function textArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function normalizeStatus(value: unknown): ContentStatus[] {
  const statuses = textArray(value).filter((status): status is ContentStatus =>
    allowedStatuses.has(status as ContentStatus),
  );
  return statuses.length > 0 ? statuses : ["public"];
}

function normalizeDate(value: unknown): string {
  const raw = text(value);
  return raw ? raw.slice(0, 10) : fallbackDate;
}

function baseContent(item: PublicContentRecord): ArchiveContentItem {
  const contentLines = textArray(item.contentLines);
  const toc = Array.isArray(item.toc)
    ? item.toc
        .filter((entry): entry is { level: number; title: string; anchor: string } => {
          return (
            typeof entry === "object" &&
            entry !== null &&
            typeof entry.level === "number" &&
            typeof entry.title === "string" &&
            typeof entry.anchor === "string"
          );
        })
        .map((entry) => ({
          level: entry.level,
          title: entry.title,
          anchor: entry.anchor,
        }))
    : [];
  return {
    id: item.id,
    title: text(item.title, "Untitled"),
    slug: text(item.slug, item.id),
    summary: text(item.summary, text(item.title, "Untitled")),
    tags: textArray(item.tags),
    status: normalizeStatus(item.status),
    createdAt: normalizeDate(item.createdAt),
    updatedAt: normalizeDate(item.updatedAt || item.createdAt),
    href: text(item.href),
    sourcePath: text(item.sourcePath),
    sources: textArray(item.sources),
    contentLines,
    toc,
    wordCount: typeof item.wordCount === "number" ? item.wordCount : undefined,
    readingMinutes:
      typeof item.readingMinutes === "number" ? item.readingMinutes : undefined,
    metrics:
      typeof item.metrics === "object" && item.metrics !== null
        ? {
            lineCount: Number(item.metrics.lineCount) || 0,
            headingCount: Number(item.metrics.headingCount) || 0,
            linkCount: Number(item.metrics.linkCount) || 0,
            sourceCount: Number(item.metrics.sourceCount) || 0,
          }
        : undefined,
    quality:
      typeof item.quality === "object" && item.quality !== null
        ? {
            hasSources: Boolean(item.quality.hasSources),
            hasToc: Boolean(item.quality.hasToc),
            summaryLength: Number(item.quality.summaryLength) || 0,
            needsSourceReview: Boolean(item.quality.needsSourceReview),
            displayTier:
              item.quality.displayTier === "showcase" ||
              item.quality.displayTier === "starter" ||
              item.quality.displayTier === "candidate" ||
              item.quality.displayTier === "hidden"
                ? item.quality.displayTier
                : undefined,
            qualityScore: Number(item.quality.qualityScore) || undefined,
            hiddenReasons: textArray(item.quality.hiddenReasons),
            explicitlyCurated: Boolean(item.quality.explicitlyCurated),
          }
        : undefined,
    module: text(item.module),
    category: text(item.category),
    type: text(item.type),
    contentType: text(item.contentType),
    links: Array.isArray(item.links) ? item.links : [],
  };
}

function libraryType(item: PublicContentRecord): LibraryItemType {
  const value = text(item.contentType || item.type).toLowerCase();
  const allowed = new Set<LibraryItemType>([
    "source",
    "tool",
    "model",
    "github",
    "tutorial",
    "website",
    "article",
    "video",
    "api",
    "software",
    "case",
  ]);
  return allowed.has(value as LibraryItemType) ? (value as LibraryItemType) : "article";
}

function libraryDifficulty(item: PublicContentRecord, base: ArchiveContentItem): LibraryItem["difficulty"] {
  const raw = text(item.difficulty).toLowerCase();
  if (raw === "low" || raw === "medium" || raw === "high") return raw;
  const minutes = base.readingMinutes || 0;
  if (minutes <= 3 && (base.quality?.qualityScore || 0) >= 70) return "low";
  if (minutes >= 10 || (base.metrics?.headingCount || 0) >= 8) return "high";
  return "medium";
}

function libraryRating(base: ArchiveContentItem): LibraryItem["rating"] {
  const score = base.quality?.qualityScore || 0;
  if (score >= 95) return 5;
  if (score >= 75) return 4;
  if (score >= 55) return 3;
  return undefined;
}

function libraryTimeToLearn(base: ArchiveContentItem): string {
  const minutes = base.readingMinutes || 0;
  if (minutes <= 1) return "约 1 分钟";
  if (minutes <= 8) return `约 ${minutes} 分钟`;
  return `约 ${minutes} 分钟，适合分段阅读`;
}

function libraryWhoFor(type: LibraryItemType, base: ArchiveContentItem): string {
  const tags = base.tags.join(" ").toLowerCase();
  if (type === "source") return "想追溯来源、验证资料边界和理解 wiki 架构的读者";
  if (type === "github") return "想参考公开项目实现、复刻工程结构的维护者";
  if (type === "tool" || type === "software" || type === "api") return "想快速判断工具用途、上手成本和适用场景的新手";
  if (type === "tutorial") return "希望按步骤学习并形成可复用方法的读者";
  if (tags.includes("privacy") || tags.includes("source")) return "关心公开发布安全、来源和隐私边界的维护者";
  if (tags.includes("agent") || tags.includes("llm")) return "想理解 AI agent、LLM wiki 和知识工作流的新手";
  return "希望先看精选摘要，再决定是否深入原文的读者";
}

function libraryReliability(base: ArchiveContentItem): LibraryItem["sourceReliability"] {
  if (base.quality?.needsSourceReview) return "needs-review";
  if (base.quality?.explicitlyCurated && base.sources && base.sources.length > 0) {
    return "verified-source";
  }
  return base.sources && base.sources.length > 0 ? "source-backed" : "needs-review";
}

function libraryPros(base: ArchiveContentItem): string[] {
  const pros: string[] = [];
  if (base.quality?.explicitlyCurated) pros.push("已进入公开精选层");
  if (base.sources && base.sources.length > 0) pros.push("保留来源引用");
  if (base.toc && base.toc.length > 1) pros.push("有清晰章节结构");
  if ((base.quality?.qualityScore || 0) >= 90) pros.push("质量评分高");
  return pros.slice(0, 3);
}

function libraryCons(base: ArchiveContentItem): string[] {
  const cons: string[] = [];
  if (base.quality?.needsSourceReview) cons.push("仍需来源复核");
  if (!base.sources || base.sources.length === 0) cons.push("缺少明确来源");
  if ((base.wordCount || 0) < 80) cons.push("内容较短，适合作为入口页");
  return cons.slice(0, 2);
}

function sourceLabel(source: string): string {
  const wikilink = source.match(/^\[\[(.+?)\]\]$/);
  const raw = wikilink ? wikilink[1] : source;
  const [target, alias] = raw.split("|");
  const label = alias || target.split(/[\\/]/).pop() || target;
  return label.replace(/\.md$/i, "").replace(/-/g, " ");
}

function libraryNote(base: ArchiveContentItem): string | undefined {
  if (base.sources && base.sources.length > 0) {
    return `来源：${base.sources.slice(0, 2).map(sourceLabel).join("，")}`;
  }
  return base.sourcePath ? `来源文件：${sourceLabel(base.sourcePath)}` : undefined;
}

function libraryCurationNote(reliability: LibraryItem["sourceReliability"]): string {
  if (reliability === "verified-source") {
    return "已通过公开层策展，适合作为新手入口或来源索引。";
  }
  if (reliability === "source-backed") {
    return "有公开来源支撑，后续可继续补充例子和使用场景。";
  }
  return "已通过隐私边界处理，但仍应优先补充来源后再重点展示。";
}

function toLibraryItem(item: PublicContentRecord): LibraryItem {
  const base = baseContent(item);
  const type = libraryType(item);
  const reliability = libraryReliability(base);
  const difficulty = libraryDifficulty(item, base);
  const whoFor = text(item.whoFor, libraryWhoFor(type, base));
  const isRecommended =
    base.status.includes("recommended") ||
    base.status.includes("featured") ||
    base.quality?.displayTier === "showcase" ||
    (base.quality?.qualityScore || 0) >= 90;
  return {
    ...base,
    type,
    reason: base.summary,
    note: libraryNote(base),
    verified: reliability !== "needs-review",
    rating: libraryRating(base),
    difficulty,
    pricing: "unknown",
    whoFor,
    timeToLearn: text(item.timeToLearn, libraryTimeToLearn(base)),
    myThoughts: text(item.myThoughts, libraryCurationNote(reliability)),
    pros: libraryPros(base),
    cons: libraryCons(base),
    isRecommended,
    recommendedFor: text(item.recommendedFor, whoFor),
    sourceReliability: reliability,
  };
}

function toPathStep(value: unknown, index: number): PathStep {
  const row = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return {
    id: text(row.id, `step-${index + 1}`),
    title: text(row.title, `步骤 ${index + 1}`),
    goal: text(row.goal, text(row.title, `步骤 ${index + 1}`)),
    description: text(row.description, "从公开 wiki 章节生成的路径节点。"),
    resources: textArray(row.resources),
    completion: text(row.completion, "读完本节并连接到相关公开页面。"),
    optional: Boolean(row.optional),
  };
}

function toPathItem(item: PublicContentRecord): PathItem {
  const base = baseContent(item);
  const steps = Array.isArray(item.steps)
    ? item.steps.map((step, index) => toPathStep(step, index))
    : [];
  return {
    ...base,
    goal: text(item.goal, base.summary),
    audience: text(item.audience, "希望复刻、学习或维护这条公开资料路线的读者。"),
    prerequisites: textArray(item.prerequisites),
    estimatedTime: text(item.estimatedTime, "按主题自定"),
    difficulty: text(item.difficulty, "intermediate") as PathItem["difficulty"],
    finalOutput: text(item.finalOutput, "形成一条可复用的公开学习或构建路径。"),
    steps,
  };
}

function workType(item: PublicContentRecord): WorkItemType {
  const category = text(item.category).toLowerCase();
  const contentType = text(item.contentType || item.type).toLowerCase();
  if (contentType === "github") return "open-source";
  if (category === "project") return "prototype";
  if (contentType === "tool") return "tool";
  return "experiment";
}

function toWorkItem(item: PublicContentRecord): WorkItem {
  const base = baseContent(item);
  const projectStatus = text(item.projectStatus, "archived") as WorkProjectStatus;
  return {
    ...base,
    type: workType(item),
    projectStatus,
    techStack: textArray(item.techStack).length ? textArray(item.techStack) : base.tags.slice(0, 6),
    nextPlan: text(item.nextPlan),
  };
}

function feedCategory(item: PublicContentRecord): FeedCategory {
  const tags = textArray(item.tags).join(" ").toLowerCase();
  if (tags.includes("github")) return "github-trending";
  if (tags.includes("model") || tags.includes("模型")) return "model-release";
  if (tags.includes("tool") || tags.includes("工具")) return "tool-update";
  if (tags.includes("ai") || tags.includes("llm")) return "ai-news";
  return "note";
}

function toFeedItem(item: PublicContentRecord): FeedItem {
  const base = baseContent(item);
  return {
    ...base,
    source: text(item.source, "an-llm-wiki"),
    publishedAt: normalizeDate(item.publishedAt || item.updatedAt),
    importance: text(item.importance, "medium") as FeedItem["importance"],
    category: feedCategory(item),
    archivedToLibrary: Boolean(item.archivedToLibrary),
    shortComment: base.sourcePath ? `公开来源：${base.sourcePath}` : undefined,
  };
}

function journalType(item: PublicContentRecord): JournalItemType {
  const type = text(item.type).toLowerCase();
  if (type === "log") return "devlog";
  if (type === "moc") return "stage-summary";
  return "thought";
}

function toJournalItem(item: PublicContentRecord): JournalItem {
  const base = baseContent(item);
  const bodyLines = textArray(item.bodyLines).length ? textArray(item.bodyLines) : base.contentLines || [];
  return {
    ...base,
    date: normalizeDate(item.date || item.updatedAt),
    type: journalType(item),
    body: bodyLines.join("\n"),
    visibility: "public",
  };
}

function timelineType(item: PublicContentRecord): TimelineItemType {
  const raw = text(item.type).toLowerCase();
  if (raw === "migration") return "migration";
  if (raw === "works" || raw === "project") return "project";
  if (raw === "paths") return "learning";
  if (raw === "journal") return "system";
  return "insight";
}

function timelinePhase(item: PublicContentRecord): string {
  const phase = text(item.phase || item.module);
  const labels: Record<string, string> = {
    library: "藏馆",
    paths: "谱系",
    feed: "风信",
    works: "工坊",
    journal: "手记",
    timeline: "年谱",
  };
  return labels[phase] || phase || "公开资料";
}

function toTimelineItem(item: PublicContentRecord): TimelineItem {
  const base = baseContent(item);
  return {
    ...base,
    date: normalizeDate(item.date || item.updatedAt || item.createdAt),
    phase: timelinePhase(item),
    type: timelineType(item),
    importance: text(item.importance, "medium") as TimelineItem["importance"],
    relatedLibraryItems: textArray(item.relatedLibraryItems),
  };
}

function buildData(payload: PublicSiteData): ArchiveData {
  const contentItems = payload.content.map(baseContent);
  const libraryItems = payload.library.map(toLibraryItem);
  const pathItems = payload.paths.map(toPathItem);
  const feedItems = payload.feed.map(toFeedItem);
  const workItems = payload.works.map(toWorkItem);
  const journalItems = payload.journal.map(toJournalItem);
  const timelineItems = payload.timeline.map(toTimelineItem);
  const contentBySlug = new Map(contentItems.map((item) => [item.slug, item]));
  const libraryById = new Map(libraryItems.map((item) => [item.id, item]));
  const libraryBySlug = new Map(libraryItems.map((item) => [item.slug, item]));
  const pathBySlug = new Map(pathItems.map((item) => [item.slug, item]));
  const journalBySlug = new Map(journalItems.map((item) => [item.slug, item]));

  return {
    generatedAt: payload.generatedAt,
    schemaVersion: payload.schemaVersion,
    counts: payload.counts,
    curation:
      payload.curation || {
        mode: "curated-public-showcase",
        displayedContent: payload.counts.content || contentItems.length,
        reviewQueue: payload.counts.reviewQueue || 0,
        allPublicMarkdown: payload.counts.publicMarkdown || contentItems.length,
        qualityManifest: "manifests/site_data_quality_review.csv",
        rules: [],
        nextImportWorkflow: [],
      },
    modules: payload.modules,
    contentItems,
    libraryItems,
    pathItems,
    feedItems,
    workItems,
    journalItems,
    timelineItems,
    about: payload.about,
    getContentBySlug: (slug: string) => contentBySlug.get(slug),
    getLibraryItemById: (id: string) => libraryById.get(id),
    getLibraryItemBySlug: (slug: string) => libraryBySlug.get(slug),
    getPathItemBySlug: (slug: string) => pathBySlug.get(slug),
    getJournalItemBySlug: (slug: string) => journalBySlug.get(slug),
  };
}

export function ArchiveDataProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<PublicSiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(siteDataUrl(), {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) {
          throw new Error(`site-data load failed: ${response.status}`);
        }
        const json = (await response.json()) as PublicSiteData;
        if (!cancelled) {
          setPayload(json);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "site-data load failed");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const data = useMemo(() => (payload ? buildData(payload) : EMPTY_DATA), [payload]);

  return (
    <ArchiveDataContext.Provider value={{ data, loading, error }}>
      {children}
    </ArchiveDataContext.Provider>
  );
}

export function useArchiveData() {
  return useContext(ArchiveDataContext);
}
