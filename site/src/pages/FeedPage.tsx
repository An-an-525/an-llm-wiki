import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bookmark,
  ChevronDown,
  Inbox,
  Radio,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { FeedItemCard } from "@/components/cards/FeedItem";
import { useArchiveData } from "@/lib/archive-api";
import { ErrorState, LoadingState } from "@/components/views/DataState";
import type { FeedCategory, FeedItem } from "@/lib/types";
import { formatDate, getFeedCategoryLabel } from "@/lib/utils";

type CategoryFilter = "all" | FeedCategory;

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];
const itemsPerPage = 8;

const categories: { key: CategoryFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "ai-news", label: "AI 资讯" },
  { key: "model-release", label: "模型发布" },
  { key: "tool-update", label: "工具更新" },
  { key: "github-trending", label: "GitHub 趋势" },
  { key: "industry", label: "行业动态" },
  { key: "note", label: "本站动态" },
];

function categoryCounts(items: FeedItem[]) {
  const counts = Object.fromEntries(categories.map((cat) => [cat.key, 0])) as Record<
    CategoryFilter,
    number
  >;
  counts.all = items.length;
  for (const item of items) {
    counts[item.category] = (counts[item.category] || 0) + 1;
  }
  return counts;
}

function matchesSearch(item: FeedItem, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return [
    item.title,
    item.summary,
    item.source,
    item.shortComment || "",
    ...item.tags,
  ].some((value) => value.toLowerCase().includes(q));
}

interface DateGroup {
  date: string;
  items: FeedItem[];
}

function groupByDate(items: FeedItem[]): DateGroup[] {
  const groups = new Map<string, FeedItem[]>();
  for (const item of items) {
    const key = item.publishedAt.slice(0, 10);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }
  return Array.from(groups.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, groupItems]) => ({ date, items: groupItems }));
}

function FeedGuide() {
  return (
    <motion.div
      className="mb-6 rounded-xl bg-light-pink p-4 md:p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.16 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70">
          <Radio size={16} strokeWidth={1.5} className="text-status-active" />
        </div>
        <div>
          <p className="mb-1 text-[14px] font-medium text-graphite">
            风信不是信息噪音流
          </p>
          <p className="text-[13px] leading-relaxed text-silver">
            只收录有来源、有摘要、有判断的信息。适合后续接入模型发布、工具更新、GitHub 项目和资料库维护动态。
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyFeed({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      className="rounded-xl border border-dashed border-border-dark bg-cream px-5 py-16 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: easeOut }}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white">
        <Inbox size={26} strokeWidth={1.2} className="text-light-silver" />
      </div>
      <h2 className="text-[16px] text-graphite">风信还未上架</h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.8] text-silver">
        当前公开包没有通过复核的信息流条目。后续导入时，每条都需要来源链接、摘要、影响判断和是否归档到藏馆的状态。
      </p>
      <button
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-light-pink px-4 py-2 text-[13px] text-graphite transition-colors hover:bg-[#F0E5DE]"
      >
        <RotateCcw size={13} />
        重置筛选
      </button>
    </motion.div>
  );
}

export function FeedPage() {
  const { data, loading, error } = useArchiveData();
  const { feedItems } = data;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);

  const counts = useMemo(() => categoryCounts(feedItems), [feedItems]);

  const filteredItems = useMemo(() => {
    return [...feedItems]
      .filter((item) => activeCategory === "all" || item.category === activeCategory)
      .filter((item) => matchesSearch(item, deferredSearch.toLowerCase()))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [feedItems, activeCategory, deferredSearch]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const groupedItems = useMemo(() => groupByDate(visibleItems), [visibleItems]);
  const hasMore = visibleCount < filteredItems.length;
  const hasFilter = search || activeCategory !== "all";

  const clearFilters = useCallback(() => {
    setSearch("");
    setActiveCategory("all");
    setVisibleCount(itemsPerPage);
  }, []);

  const changeCategory = useCallback((category: CategoryFilter) => {
    setActiveCategory(category);
    setVisibleCount(itemsPerPage);
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  return (
    <div className="min-h-[100dvh] bg-white">
      <section className="pb-8 pt-[96px] md:pt-[128px]">
        <div className="mx-auto max-w-[760px] px-5 text-center md:px-12">
          <motion.h1
            className="mb-3 font-serif text-[30px] font-normal leading-tight text-ink md:text-[38px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            风信
          </motion.h1>
          <motion.p
            className="text-[15px] leading-relaxed text-silver"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
          >
            面向新手的高质量信息流：少而准、有来源、有判断，必要时归档到藏馆或转成谱系节点。
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-[760px] px-5 md:px-12">
        <FeedGuide />
      </div>

      <div className="sticky top-16 z-30 border-y border-border-color bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-[760px] px-5 py-3 md:px-12">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[12px] text-silver">
              共 <span className="font-medium text-graphite">{filteredItems.length}</span> 条动态
            </span>
            {hasFilter && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-[12px] text-silver transition-colors hover:text-graphite"
              >
                <RotateCcw size={12} />
                重置
              </button>
            )}
          </div>

          <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => changeCategory(cat.key)}
                className={`shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] transition-colors duration-150 ${
                  activeCategory === cat.key
                    ? "bg-light-pink text-graphite"
                    : "text-silver hover:bg-cream hover:text-graphite"
                }`}
              >
                {cat.label}
                <span className="ml-1 text-[11px] text-light-silver">
                  {counts[cat.key] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-light-silver"
            />
            <input
              type="text"
              placeholder="搜索标题、来源或标签..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 w-full rounded-lg border border-border-color bg-white pl-8 pr-8 text-[13px] text-graphite outline-none transition-all placeholder:text-light-silver focus:border-border-dark focus:shadow-[0_0_0_3px_rgba(200,200,200,0.12)]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-light-silver transition-colors hover:text-graphite"
                aria-label="清除搜索"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[760px] px-5 py-10 md:px-12">
        {feedItems.length === 0 && (
          <div className="mb-6 rounded-xl border border-[#F0E5DC] bg-[#FDF6F0] p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle
                size={17}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-status-active"
              />
              <p className="text-[13px] leading-relaxed text-silver">
                后端已经准备好风信数据结构，但当前没有通过质量和来源复核的动态。这里保留展示框架，避免用模拟新闻填充页面。
              </p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {groupedItems.length > 0 ? (
            <motion.div
              key={`${activeCategory}-${deferredSearch}`}
              className="space-y-9"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {groupedItems.map((group) => (
                <div key={group.date} className="relative">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-status-active" />
                    <h2 className="font-serif text-[18px] text-ink">{formatDate(group.date)}</h2>
                  </div>
                  <div className="space-y-4">
                    {group.items.map((item) => (
                      <FeedItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setVisibleCount((count) => count + itemsPerPage)}
                    className="inline-flex items-center gap-2 rounded-lg border border-border-color bg-white px-4 py-2 text-[13px] text-silver transition-colors hover:border-border-dark hover:text-graphite"
                  >
                    加载更多
                    <ChevronDown size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <EmptyFeed key="empty" onClear={clearFilters} />
          )}
        </AnimatePresence>
      </section>

      <section className="bg-cream py-12">
        <div className="mx-auto max-w-[720px] px-5 text-center md:px-12">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white">
            <Bookmark size={17} strokeWidth={1.5} className="text-status-active" />
          </div>
          <h2 className="mb-3 font-serif text-[20px] text-ink">什么内容会进入风信</h2>
          <p className="text-[14px] leading-[1.8] text-silver">
            {categories
              .filter((cat) => cat.key !== "all")
              .map((cat) => getFeedCategoryLabel(cat.key))
              .join("、")}
            。每条动态都必须能解释“为什么值得看”和“下一步该归档到哪里”。
          </p>
        </div>
      </section>
    </div>
  );
}
