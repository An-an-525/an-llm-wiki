import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronDown,
  GitBranch,
  GraduationCap,
  Hammer,
  Library,
  Radio,
  Search,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ArchiveCard } from "@/components/cards/ArchiveCard";
import { PathCard } from "@/components/cards/PathCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/views/DataState";
import { navModules } from "@/lib/modules";
import { useArchiveData } from "@/lib/archive-api";
import { formatShortDate, truncate } from "@/lib/utils";
import type { ArchiveContentItem, LibraryItem, PathItem, WorkItem } from "@/lib/types";

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const entryIcons: Record<string, LucideIcon> = {
  library: Library,
  paths: GitBranch,
  feed: Radio,
  works: Hammer,
  journal: BookOpen,
  timeline: CalendarDays,
  about: User,
};

const entryDescriptions: Record<string, string> = {
  library: "资料收藏与整理",
  paths: "学习路径与复刻路线",
  feed: "最新动态与信息流",
  works: "作品与项目展示",
  journal: "随笔与思考记录",
  timeline: "成长时间线",
  about: "关于本站的说明",
};

function contentHref(item: Pick<ArchiveContentItem, "slug"> & { module?: string; href?: string }) {
  if (item.module === "library") return `/library/${item.slug}`;
  if (item.module === "paths") return `/paths/${item.slug}`;
  if (item.module === "journal") return `/journal/${item.slug}`;
  return item.href || `/content/${item.slug}`;
}

function byUpdated<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function SectionTitle({
  title,
  subtitle,
  linkTo,
  linkText,
}: {
  title: string;
  subtitle: string;
  linkTo: string;
  linkText: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
      <div>
        <h2 className="font-serif text-[22px] font-normal text-ink md:text-[28px]">{title}</h2>
        <p className="mt-1 text-[13px] text-silver md:text-[14px]">{subtitle}</p>
      </div>
      <Link
        to={linkTo}
        className="group flex shrink-0 items-center gap-1 text-[12px] text-silver transition-colors duration-150 hover:text-ink md:text-[13px]"
      >
        {linkText}
        <ArrowRight size={14} strokeWidth={1.5} className="transition-transform duration-150 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function HeroSection({
  query,
  setQuery,
  results,
}: {
  query: string;
  setQuery: (value: string) => void;
  results: ArchiveContentItem[];
}) {
  return (
    <section className="relative flex min-h-[calc(85dvh-56px)] flex-col items-center justify-center border-b border-border-color bg-gradient-to-b from-white to-cream md:min-h-[calc(100dvh-64px)]">
      <motion.h1
        className="text-center font-serif text-[32px] font-normal leading-[1.15] tracking-normal text-ink md:text-[56px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
      >
        藏馆
      </motion.h1>

      <motion.p
        className="mt-4 max-w-[520px] px-5 text-center text-[14px] font-light leading-relaxed text-silver md:text-[16px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.25 }}
      >
        一座关于资料、路径、作品与成长的个人藏馆。公开页只展示经过来源复核、隐私过滤和人工策展的内容。
      </motion.p>

      <motion.div
        className="relative mt-8 w-full max-w-[560px] px-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut, delay: 0.4 }}
      >
        <Search size={16} strokeWidth={1.5} className="absolute left-9 top-1/2 -translate-y-1/2 text-light-silver" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="搜索资料、路径、来源或标签..."
          className="h-11 w-full rounded-xl border border-border-color bg-white pl-10 pr-4 text-[14px] text-graphite outline-none transition-all placeholder:text-light-silver focus:border-border-dark focus:shadow-[0_0_0_3px_rgba(200,200,200,0.12)]"
        />

        {query && (
          <div className="absolute left-5 right-5 top-[50px] z-20 overflow-hidden rounded-xl border border-border-color bg-white shadow-lg">
            {results.length > 0 ? (
              results.map((item) => (
                <Link
                  key={item.id}
                  to={contentHref(item)}
                  className="flex items-start justify-between gap-4 border-b border-border-color px-4 py-3 transition-colors last:border-b-0 hover:bg-cream"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] text-graphite">{item.title}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-silver">
                      {truncate(item.summary, 86)}
                    </span>
                  </span>
                  <ArrowRight size={14} className="mt-1 shrink-0 text-status-active" />
                </Link>
              ))
            ) : (
              <div className="px-4 py-5 text-[13px] text-silver">当前精选层没有匹配条目，可能还在复核队列里。</div>
            )}
          </div>
        )}
      </motion.div>

      <button
        className="absolute bottom-8 text-silver transition-colors duration-150 hover:text-graphite"
        onClick={() => document.getElementById("core-entries")?.scrollIntoView({ behavior: "smooth" })}
        aria-label="向下滚动"
      >
        <ChevronDown size={24} strokeWidth={1.5} className="animate-bounce-subtle" />
      </button>
    </section>
  );
}

function StatBarSection({
  libraryCount,
  pathCount,
  workCount,
  journalCount,
}: {
  libraryCount: number;
  pathCount: number;
  workCount: number;
  journalCount: number;
}) {
  const stats: { value: number; label: string; Icon: LucideIcon }[] = [
    { value: libraryCount, label: "条资源", Icon: Library },
    { value: pathCount, label: "条路径", Icon: GitBranch },
    { value: workCount, label: "件作品", Icon: Hammer },
    { value: journalCount, label: "篇手记", Icon: BookOpen },
  ];

  return (
    <section className="border-b border-border-color bg-cream py-4">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.5 }}
        >
          {stats.map(({ value, label, Icon }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={15} strokeWidth={1.5} className="text-silver" />
              <span className="text-[16px] font-medium text-ink">{value}</span>
              <span className="text-[13px] text-silver">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function CoreEntriesSection() {
  return (
    <section id="core-entries" className="bg-cream py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <motion.div
          className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {navModules.map((mod) => {
            const Icon = entryIcons[mod.id] || Sparkles;
            return (
              <motion.div
                key={mod.id}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
                }}
              >
                <Link
                  to={mod.href}
                  className="card-tap group block w-full rounded-xl border border-border-color bg-white px-4 py-5 text-left transition-all duration-250 hover:-translate-y-[3px] hover:border-border-dark hover:shadow-md md:px-5 md:py-7"
                >
                  <Icon
                    size={22}
                    strokeWidth={1.5}
                    className="mb-2 text-silver transition-colors duration-250 group-hover:text-status-active md:mb-3"
                  />
                  <div className="text-[14px] font-medium text-graphite md:text-[15px]">{mod.name}</div>
                  <div className="mt-1 truncate text-[11px] text-silver md:text-[12px]">
                    {entryDescriptions[mod.id] || mod.description}
                  </div>
                </Link>
              </motion.div>
            );
          })}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
            }}
          >
            <a
              href="#top"
              className="card-tap group block w-full rounded-xl border border-border-color bg-white px-4 py-5 text-left transition-all duration-250 hover:-translate-y-[3px] hover:border-border-dark hover:shadow-md md:px-5 md:py-7"
            >
              <Search size={22} strokeWidth={1.5} className="mb-2 text-silver transition-colors duration-250 group-hover:text-status-active md:mb-3" />
              <div className="text-[14px] font-medium text-graphite md:text-[15px]">搜索</div>
              <div className="mt-1 truncate text-[11px] text-silver md:text-[12px]">全站内容检索</div>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function QuickStartSection({
  paths,
  resources,
}: {
  paths: PathItem[];
  resources: LibraryItem[];
}) {
  const items: ReactNode[] = [];
  paths.slice(0, 3).forEach((path) => {
    items.push(<PathCard key={`path-${path.id}`} item={path} />);
  });
  resources.slice(0, Math.max(0, 3 - items.length)).forEach((item) => {
    items.push(<ArchiveCard key={`resource-${item.id}`} item={item} compact />);
  });

  return (
    <section className="border-b border-border-color bg-white py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <motion.div
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <div className="mb-2 flex items-center gap-2">
            <GraduationCap size={20} strokeWidth={1.5} className="text-status-active" />
            <h2 className="font-serif text-[22px] font-normal text-ink md:text-[28px]">新手从这里开始</h2>
          </div>
          <p className="text-[13px] text-silver md:text-[14px]">不知道从哪里入手？先看短、清楚、来源状态稳定的路径和资源。</p>
        </motion.div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">{items}</div>
        ) : (
          <EmptyState title="新手入口待整理" detail="当前只展示已完成来源和隐私复核的精选内容。" />
        )}
      </div>
    </section>
  );
}

function FeaturedWorksSection({ works }: { works: WorkItem[] }) {
  return (
    <section className="bg-cream py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <SectionTitle title="工坊" subtitle="作品与项目，每件都应该说明问题、实现和收获" linkTo="/works" linkText="查看全部" />
        {works.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {works.slice(0, 3).map((work) => (
              <Link
                key={work.id}
                to="/works"
                className="card-tap block rounded-xl border border-border-color bg-white p-5 transition-all duration-250 hover:-translate-y-[2px] hover:shadow-md"
              >
                <div className="mb-2 text-[11px] text-silver">{work.projectStatus}</div>
                <h3 className="font-serif text-[18px] text-ink">{work.title}</h3>
                <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-silver">{work.summary}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border-dark bg-white p-6">
            <div className="flex items-start gap-3">
              <Hammer size={20} strokeWidth={1.5} className="mt-1 text-status-active" />
              <div>
                <h3 className="font-serif text-[18px] text-ink">作品展柜待上架</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-silver">
                  先把前端、后端数据契约和安全边界打稳，再从本地项目里挑选可公开、可说明价值的项目补进来。
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function HomePage() {
  const { data, loading, error } = useArchiveData();
  const {
    contentItems,
    feedItems,
    journalItems,
    libraryItems,
    pathItems,
    timelineItems,
    workItems,
    curation,
  } = data;
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const searchResults = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return [];
    return contentItems
      .filter((item) => [item.title, item.summary, item.sourcePath || "", item.tags.join(" ")].join(" ").toLowerCase().includes(q))
      .slice(0, 8);
  }, [contentItems, deferredQuery]);

  const beginnerPaths = pathItems.filter((path) => path.difficulty === "beginner").slice(0, 3);
  const beginnerResources = libraryItems
    .filter((item) => item.isRecommended && item.sourceReliability !== "needs-review")
    .slice(0, 3);
  const featuredPaths = (pathItems.some((item) => item.status.includes("featured"))
    ? pathItems.filter((item) => item.status.includes("featured"))
    : [...pathItems].sort((a, b) => b.steps.length - a.steps.length)
  ).slice(0, 3);
  const recentFeed = byUpdated(feedItems).slice(0, 5);
  const recentTimeline = [...timelineItems].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  return (
    <div id="top" className="bg-white">
      <HeroSection query={query} setQuery={setQuery} results={searchResults} />
      <StatBarSection
        libraryCount={libraryItems.length}
        pathCount={pathItems.length}
        workCount={workItems.length}
        journalCount={journalItems.length}
      />
      <CoreEntriesSection />
      <QuickStartSection paths={beginnerPaths} resources={beginnerResources} />

      <section className="bg-cream py-12 md:py-20">
        <div className="mx-auto max-w-[1200px] px-5 md:px-12">
          <SectionTitle title="推荐谱系" subtitle="可复刻的学习与构建路径，每条都应该能跟走" linkTo="/paths" linkText="查看全部" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {featuredPaths.map((path) => (
              <PathCard key={path.id} item={path} featured={path.status.includes("featured")} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-20">
        <div className="mx-auto max-w-[800px] px-5 md:px-12">
          <SectionTitle title="风信" subtitle="最近的更新、收藏、发布与动态" linkTo="/feed" linkText="查看全部" />
          {recentFeed.length > 0 ? (
            <div className="relative">
              <div className="absolute bottom-2 left-[11px] top-2 w-[2px] bg-border-color" />
              <div>
                {recentFeed.map((feed, index) => (
                  <motion.div
                    key={feed.id}
                    className="relative pb-5 pl-8"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-30px" }}
                    transition={{ duration: 0.4, ease: easeOut, delay: index * 0.08 }}
                  >
                    <div className="absolute left-[6px] top-[9px] h-3 w-3 rounded-full border-2 border-white bg-status-active" />
                    <Link to={feed.href || "/feed"} className="group block">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-light-pink px-2 py-0.5 text-[11px] text-silver">{feed.category}</span>
                        {feed.importance === "high" && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-[#C47D6E]/10 px-1.5 py-0.5 text-[10px] text-[#C47D6E]">
                            <Zap size={9} strokeWidth={2} />
                            重要
                          </span>
                        )}
                      </div>
                      <h4 className="text-[15px] font-medium leading-snug text-graphite transition-colors duration-200 group-hover:text-status-active">
                        {feed.title}
                      </h4>
                      <p className="mt-0.5 truncate text-[13px] leading-relaxed text-silver">{feed.summary}</p>
                      <span className="mt-1 block text-[11px] text-light-silver">{feed.publishedAt}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState title="风信待接入" detail="后续承接高质量资讯、调研和资料更新，不展示低质量抓取流。" />
          )}
        </div>
      </section>

      <FeaturedWorksSection works={workItems} />

      <section className="bg-white pb-16 pt-12 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-[800px] px-5 md:px-12">
          <SectionTitle title="年谱" subtitle="资料库和项目演化的重要节点" linkTo="/timeline" linkText="查看全部" />
          <div className="relative">
            <div className="absolute bottom-0 left-[15px] top-0 w-[2px] origin-top bg-border-color md:left-1/2 md:-translate-x-1/2" />
            <div className="space-y-6">
              {recentTimeline.map((event, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={event.id} className={`relative flex items-center ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <motion.div
                      className={`w-full pl-10 md:w-1/2 md:pl-0 ${isLeft ? "md:pr-10" : "md:pl-10"}`}
                      initial={{ opacity: 0, scale: 0.94 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.35, ease: easeOut, delay: index * 0.1 }}
                    >
                      <Link to="/timeline" className="block rounded-xl border border-border-color bg-white p-4 transition-shadow duration-200 hover:shadow-md md:p-5">
                        <span className="mb-1 block text-[12px] text-silver">{formatShortDate(event.date)}</span>
                        <h4 className="text-[15px] font-medium text-graphite">{event.title}</h4>
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-silver">{event.summary}</p>
                      </Link>
                    </motion.div>
                    <div className="absolute left-[9px] z-10 md:left-1/2 md:-translate-x-1/2">
                      <div className="h-[10px] w-[10px] rounded-full bg-status-active" />
                    </div>
                    <div className="hidden w-1/2 md:block" />
                  </div>
                );
              })}
            </div>
          </div>
          <p className="mt-10 text-center text-[12px] text-light-silver">
            当前公开精选 {curation.displayedContent} 条，复核队列 {curation.reviewQueue} 条。
          </p>
        </div>
      </section>
    </div>
  );
}
