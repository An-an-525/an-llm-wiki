import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const vaultRoot = resolve(siteRoot, "..");
const source = resolve(vaultRoot, "site-data");
const target = resolve(siteRoot, "public", "site-data");
const indexPath = resolve(source, "index.json");
const generatedPath = resolve(siteRoot, "src", "data", "siteData.generated.ts");

if (!existsSync(source)) {
  throw new Error(
    "Missing ../site-data. Run `python scripts/build_site_data.py .` from the vault root first.",
  );
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function date(value) {
  return text(value, "2026-05-12").slice(0, 10);
}

function slugPath(module, id) {
  return `/content/${id}`;
}

function toPlainTags(tags) {
  return asArray(tags).filter((tag) => typeof tag === "string" && tag.trim());
}

function statusHas(item, values) {
  const statuses = asArray(item.status);
  return values.some((value) => statuses.includes(value));
}

function libraryType(item) {
  const raw = text(item.contentType || item.type).toLowerCase();
  if (raw === "video") return "video";
  if (raw === "tutorial") return "course";
  if (raw === "tool" || raw === "api" || raw === "software" || raw === "github") return "tool";
  if (raw === "book") return "book";
  if (raw === "source" || raw === "doc") return "doc";
  return "article";
}

function publicStatus(item) {
  if (statusHas(item, ["draft", "pending"])) return "doing";
  if (statusHas(item, ["archived", "outdated"])) return "todo";
  return "done";
}

function projectStatus(item) {
  const raw = text(item.projectStatus).toLowerCase();
  if (raw === "online" || raw === "maintaining") return "completed";
  if (raw === "building" || raw === "idea") return "in_progress";
  return raw === "paused" || raw === "archived" ? "archived" : "in_progress";
}

function pathStatus(item) {
  if (statusHas(item, ["archived", "outdated"])) return "planned";
  if (statusHas(item, ["verified", "featured", "recommended"])) return "completed";
  return "in_progress";
}

function difficulty(item) {
  const count = Number(item.wordCount || 0);
  if (count > 2000) return "advanced";
  if (count > 800) return "intermediate";
  return "beginner";
}

function resourceFromItem(item) {
  return {
    id: item.id,
    title: item.title,
    url: text(item.href, slugPath(item.module, item.id)),
    type: libraryType(item),
    description: item.summary,
  };
}

function toLibrary(item) {
  const score = Number(item.qualityScore || item.quality?.qualityScore || 0);
  const sources = asArray(item.sources);
  return {
    id: item.id,
    title: item.title,
    description: item.summary,
    type: libraryType(item),
    tags: toPlainTags(item.tags),
    links: [
      { label: "打开详情", url: text(item.href, slugPath(item.module, item.id)) },
      ...sources.slice(0, 2).map((source, index) => ({
        label: `来源 ${index + 1}`,
        url: String(source),
      })),
    ],
    rating: score >= 90 ? 5 : score >= 75 ? 4 : score >= 55 ? 3 : undefined,
    status: publicStatus(item),
    cover: "/hero-cover.jpg",
    useCase: text(item.whyItMattered, item.summary),
    difficulty: difficulty(item) === "advanced" ? "hard" : difficulty(item) === "intermediate" ? "medium" : "easy",
    timeToLearn: item.readingMinutes ? `约 ${item.readingMinutes} 分钟` : "按需阅读",
    myThoughts: text(item.philosophicalLayer, text(item.whyItMattered, "已从公开 wiki 编译为可展示条目。")),
    isRecommended: statusHas(item, ["featured", "recommended", "verified"]),
    recommendedFor: text(item.whoFor, "想理解公开资料库、AI 操作路径和复刻方法的新手"),
    pros: [
      item.sources?.length ? "有来源引用" : "已进入公开展示层",
      item.toc?.length ? "章节结构清晰" : "适合作为入口卡片",
    ],
    cons: item.quality?.needsSourceReview ? ["仍需来源复核"] : [],
    whoFor: text(item.whoFor, "新手、协作者和未来的自己"),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}

function toPathStage(step, index) {
  return {
    id: text(step.id, `stage-${index + 1}`),
    title: text(step.title, `阶段 ${index + 1}`),
    description: text(step.description, text(step.goal, "阅读本阶段并完成对应检查。")),
    order: index + 1,
    resources: asArray(step.resources),
    status: index === 0 ? "available" : "locked",
    checklist: [text(step.completion, "能解释本阶段的目标和产出。")],
    deliverable: text(step.completion, "形成一个可复核的小产出。"),
    tips: "按公开资料逐步复刻，不要跳过来源和隐私边界。",
  };
}

function toPath(item, index) {
  const steps = asArray(item.steps);
  return {
    id: item.id,
    title: item.title,
    description: item.summary,
    cover: ["/path-frontend.jpg", "/path-design.jpg", "/path-backend.jpg"][index % 3],
    difficulty: difficulty(item),
    estimatedTime: text(item.estimatedTime, item.readingMinutes ? `约 ${item.readingMinutes} 分钟` : "按主题自定"),
    status: pathStatus(item),
    stages: steps.length ? steps.map(toPathStage) : [
      toPathStage({ title: "阅读公开页面", description: item.summary, completion: "读完页面并能说明它解决什么问题。" }, 0),
    ],
    tags: toPlainTags(item.tags),
    whoFor: text(item.audience, "想沿着公开资料复刻 AI 知识库工作流的读者"),
    prerequisites: asArray(item.prerequisites),
    outcomes: [text(item.finalOutput, "形成一条可复用的公开学习或构建路径。")],
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}

function toPathDetail(item, path) {
  return {
    ...path,
    prerequisites: path.prerequisites.map((value, index) => ({
      title: `前置条件 ${index + 1}`,
      description: value,
    })),
    outcomes: path.outcomes,
    longDescription: asArray(item.contentLines).join("\n") || item.summary,
    pitfalls: asArray(item.failureModes).map((value) => ({
      title: value,
      description: "在复刻时需要提前识别并处理。",
    })),
    advancedDirections: asArray(item.links).slice(0, 4).map((link) => ({
      title: text(link.label, link.target),
      link: text(link.target, "#"),
    })),
    relatedResourceIds: [],
  };
}

function toWork(item, index) {
  return {
    id: item.id,
    title: item.title,
    description: item.summary,
    cover: index % 2 === 0 ? "/work-portfolio.jpg" : "/work-tool.jpg",
    techStack: toPlainTags(item.techStack || item.tags),
    status: projectStatus(item),
    link: text(item.demoUrl || item.href),
    github: text(item.githubUrl),
    duration: "持续迭代",
    teamSize: "个人主导",
    challenges: asArray(item.failureModes).join("；") || "需要持续补充公开安全证据。",
    learnings: asArray(item.lessons).join("；") || text(item.whyItMattered, item.summary),
    relatedPathIds: asArray(item.relatedPath ? [item.relatedPath] : []),
    relatedJournalIds: asArray(item.relatedJournal),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}

function toFeed(item) {
  return {
    id: item.id,
    type: item.module === "works" ? "work" : item.module === "paths" ? "path_update" : "resource",
    title: item.title,
    content: item.summary,
    link: text(item.href, slugPath(item.module, item.id)),
    source: text(item.source, "an-llm-wiki"),
    importanceLevel: item.importance === "high" ? "important" : "normal",
    actionText: "查看详情",
    tags: toPlainTags(item.tags),
    createdAt: date(item.publishedAt || item.updatedAt),
  };
}

function toJournal(item) {
  return {
    id: item.id,
    title: item.title,
    date: date(item.date || item.updatedAt),
    tags: toPlainTags(item.tags),
    excerpt: item.summary,
    body: asArray(item.bodyLines || item.contentLines).join("\n") || item.summary,
    cover: "/cover-journal.jpg",
    readingTime: Number(item.readingMinutes || 1),
    keyTakeaways: asArray(item.lessons),
    difficulty: "easy",
    relatedPathIds: asArray(item.relatedPath ? [item.relatedPath] : []),
    createdAt: date(item.createdAt),
    updatedAt: date(item.updatedAt),
  };
}

function toTimeline(item) {
  return {
    id: item.id,
    date: date(item.date || item.updatedAt),
    title: item.title,
    description: item.summary,
    category: item.type === "project" ? "work" : item.type === "learning" ? "learning" : "milestone",
    importance: item.importance === "high" ? "major" : "normal",
    cover: "/hero-cover.jpg",
    relatedLinks: asArray(item.relatedLibraryItems).map((id) => `/content/${id}`),
    achievements: asArray(item.lessons),
    reflection: text(item.philosophicalLayer, item.summary),
    stage: text(item.phase, "公开资料"),
    relatedPathIds: asArray(item.relatedPaths),
  };
}

const payload = JSON.parse(await readFile(indexPath, "utf8"));

const libraryItems = asArray(payload.library).map(toLibrary);
const paths = asArray(payload.paths).map(toPath);
const pathDetails = Object.fromEntries(asArray(payload.paths).map((item, index) => [item.id, toPathDetail(item, paths[index])]));
const works = asArray(payload.works).map(toWork);
const feedItems = asArray(payload.feed).map(toFeed);
const journalEntries = asArray(payload.journal).map(toJournal);
const timelineEvents = asArray(payload.timeline).map(toTimeline);

const generated = `// Generated by site/scripts/sync-site-data.mjs. Do not edit by hand.
import type { FeedItem, JournalEntry, LibraryItem, Path, TimelineEvent, Work } from "@/types";
import type { PathDetail } from "./mockPaths";

export const libraryItems: LibraryItem[] = ${JSON.stringify(libraryItems, null, 2)};

export const paths: Path[] = ${JSON.stringify(paths, null, 2)};

export const pathDetails: Record<string, PathDetail> = ${JSON.stringify(pathDetails, null, 2)};

export const works: Work[] = ${JSON.stringify(works, null, 2)};

export const feedItems: FeedItem[] = ${JSON.stringify(feedItems, null, 2)};

export const journalEntries: JournalEntry[] = ${JSON.stringify(journalEntries, null, 2)};

export const timelineEvents: TimelineEvent[] = ${JSON.stringify(timelineEvents, null, 2)};
`;

await writeFile(generatedPath, generated, "utf8");
await mkdir(resolve(siteRoot, "public"), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });

console.log(`synced site-data: ${source} -> ${target}`);
console.log(`generated Kimi data adapter: ${generatedPath}`);
