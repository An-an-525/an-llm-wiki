import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Compass,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { PathCard } from "@/components/cards/PathCard";
import { useArchiveData } from "@/lib/archive-api";
import { EmptyState, ErrorState, LoadingState } from "@/components/views/DataState";
import type { PathItem } from "@/lib/types";

type DifficultyFilter = "all" | PathItem["difficulty"];
type ReadinessFilter = "all" | "featured" | "recommended" | "needs-review" | "public";

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const difficultyOptions: { key: DifficultyFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "beginner", label: "入门" },
  { key: "intermediate", label: "进阶" },
  { key: "advanced", label: "高级" },
];

const readinessOptions: { key: ReadinessFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "featured", label: "精选" },
  { key: "recommended", label: "推荐" },
  { key: "public", label: "公开" },
  { key: "needs-review", label: "待补来源" },
];

function readinessKey(item: PathItem): ReadinessFilter {
  if (item.quality?.needsSourceReview) return "needs-review";
  if (item.status.includes("featured")) return "featured";
  if (item.status.includes("recommended")) return "recommended";
  return "public";
}

function difficultyRank(item: PathItem) {
  if (item.difficulty === "beginner") return 0;
  if (item.difficulty === "intermediate") return 1;
  return 2;
}

function qualityValue(item: PathItem) {
  return item.quality?.qualityScore || 0;
}

function sortPaths(items: PathItem[]) {
  return [...items].sort((a, b) => {
    if (a.status.includes("featured") !== b.status.includes("featured")) {
      return a.status.includes("featured") ? -1 : 1;
    }
    const diff = difficultyRank(a) - difficultyRank(b);
    if (diff !== 0) return diff;
    return qualityValue(b) - qualityValue(a) || b.updatedAt.localeCompare(a.updatedAt);
  });
}

function matchesSearch(item: PathItem, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return [
    item.title,
    item.summary,
    item.goal,
    item.audience,
    item.finalOutput,
    ...item.tags,
    ...item.prerequisites,
    ...item.steps.map((step) => `${step.title} ${step.goal} ${step.description}`),
  ].some((value) => value.toLowerCase().includes(q));
}

function countDifficulties(items: PathItem[]): Record<DifficultyFilter, number> {
  const counts: Record<DifficultyFilter, number> = {
    all: items.length,
    beginner: 0,
    intermediate: 0,
    advanced: 0,
  };
  for (const item of items) {
    counts[item.difficulty] += 1;
  }
  return counts;
}

function countReadiness(items: PathItem[]): Record<ReadinessFilter, number> {
  const counts: Record<ReadinessFilter, number> = {
    all: items.length,
    featured: 0,
    recommended: 0,
    public: 0,
    "needs-review": 0,
  };
  for (const item of items) {
    counts[readinessKey(item)] += 1;
  }
  return counts;
}

function PageGuide() {
  return (
    <motion.div
      className="mb-6 rounded-xl bg-light-pink p-4 md:p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.16 }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70">
          <Compass size={16} strokeWidth={1.5} className="text-status-active" />
        </div>
        <div>
          <p className="mb-1 text-[14px] font-medium text-graphite">
            谱系是给新手看的路线图
          </p>
          <p className="text-[13px] leading-relaxed text-silver">
            每条路线都回答三个问题：适合谁、先做什么、最后能产出什么。它不会直接倾倒原始笔记，只展示已经整理过的公开节点。
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function StartHereBanner({ items }: { items: PathItem[] }) {
  if (items.length === 0) return null;

  return (
    <motion.div
      className="mb-8 rounded-xl border border-[#F0E5DC] bg-gradient-to-r from-[#FDF6F0] to-light-pink p-5 md:p-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easeOut }}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          <Sparkles size={18} strokeWidth={1.5} className="text-status-active" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="mb-1.5 text-[15px] font-medium text-graphite">
            初次来访？从这里开始
          </h2>
          <p className="mb-3 text-[13px] leading-relaxed text-silver">
            先看入口路线，再顺着来源、维护规则和公开边界理解这个资料库。后续高质量资料会继续补进这些路线。
          </p>
          <div className="flex flex-wrap gap-2">
            {items.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                to={`/paths/${item.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border-color bg-white px-3 py-1.5 text-[12px] text-graphite transition-shadow duration-150 hover:shadow-sm"
              >
                {item.title}
                <ArrowRight size={11} strokeWidth={1.5} className="text-silver" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface FilterBarProps {
  search: string;
  setSearch: (value: string) => void;
  difficulty: DifficultyFilter;
  setDifficulty: (value: DifficultyFilter) => void;
  readiness: ReadinessFilter;
  setReadiness: (value: ReadinessFilter) => void;
  difficultyCounts: Record<DifficultyFilter, number>;
  readinessCounts: Record<ReadinessFilter, number>;
  onClear: () => void;
}

function FilterBar({
  search,
  setSearch,
  difficulty,
  setDifficulty,
  readiness,
  setReadiness,
  difficultyCounts,
  readinessCounts,
  onClear,
}: FilterBarProps) {
  const hasFilter = search || difficulty !== "all" || readiness !== "all";

  return (
    <div className="sticky top-16 z-30 border-b border-border-color bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-5 py-3.5 md:flex-row md:items-center md:justify-between md:px-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide sm:pb-0">
            {readinessOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setReadiness(option.key)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] transition-colors duration-150 ${
                  readiness === option.key
                    ? "bg-light-pink text-graphite"
                    : "text-silver hover:bg-light-gray hover:text-graphite"
                }`}
              >
                {option.label}
                <span className="ml-1 text-[11px] text-light-silver">
                  {readinessCounts[option.key] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide sm:pb-0">
            <span className="mr-1 shrink-0 text-[12px] text-light-silver">难度</span>
            {difficultyOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setDifficulty(option.key)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-[13px] transition-colors duration-150 ${
                  difficulty === option.key
                    ? "bg-light-pink text-graphite"
                    : "text-silver hover:bg-light-gray hover:text-graphite"
                }`}
              >
                {option.label}
                <span className="ml-1 text-[11px] text-light-silver">
                  {difficultyCounts[option.key] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1 md:w-[280px] md:flex-none">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-light-silver"
            />
            <input
              type="text"
              placeholder="搜索路线、目标或步骤..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="h-9 w-full rounded-lg border border-border-color bg-white pl-8 pr-8 text-[13px] text-graphite outline-none transition-all duration-200 placeholder:text-light-silver focus:border-border-dark focus:shadow-[0_0_0_3px_rgba(200,200,200,0.12)]"
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
          {hasFilter && (
            <button
              onClick={onClear}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border-color bg-white px-3 text-[12px] text-silver transition-colors hover:text-graphite"
            >
              <RotateCcw size={13} />
              重置
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PathsPage() {
  const { data, loading, error } = useArchiveData();
  const { pathItems } = data;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [readiness, setReadiness] = useState<ReadinessFilter>("all");

  const sortedPaths = useMemo(() => sortPaths(pathItems), [pathItems]);

  const filteredItems = useMemo(() => {
    return sortedPaths.filter((item) => {
      if (difficulty !== "all" && item.difficulty !== difficulty) return false;
      if (readiness !== "all" && readinessKey(item) !== readiness) return false;
      return matchesSearch(item, deferredSearch.toLowerCase());
    });
  }, [sortedPaths, difficulty, readiness, deferredSearch]);

  const difficultyCounts = useMemo(
    () => countDifficulties(pathItems),
    [pathItems],
  );

  const readinessCounts = useMemo(
    () => countReadiness(pathItems),
    [pathItems],
  );

  const startItems = useMemo(() => {
    const beginners = sortedPaths.filter((item) => item.difficulty === "beginner");
    return beginners.length > 0 ? beginners : sortedPaths.slice(0, 3);
  }, [sortedPaths]);

  const clearFilters = () => {
    setSearch("");
    setDifficulty("all");
    setReadiness("all");
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  return (
    <div className="min-h-[100dvh] bg-white">
      <section
        className="pb-6 pt-[96px]"
        style={{ background: "linear-gradient(180deg, #FAF9F7 0%, #FFFFFF 62%)" }}
      >
        <div className="mx-auto max-w-[1200px] px-5 md:px-12">
          <motion.h1
            className="mb-2 font-serif text-[34px] font-normal leading-tight text-ink md:text-[40px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            谱系
          </motion.h1>
          <motion.p
            className="mb-4 max-w-2xl text-[15px] leading-relaxed text-silver"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
          >
            把资料、来源、规则和项目整理成可跟随的学习路线。小白可以从入口路线开始，维护者可以直接检查来源和发布边界。
          </motion.p>

          <PageGuide />
          <StartHereBanner items={startItems} />

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-border-color bg-white p-3">
              <div className="flex items-center gap-2 text-[12px] text-silver">
                <Compass size={13} />
                路线总数
              </div>
              <p className="mt-1 font-serif text-[24px] text-ink">{pathItems.length}</p>
            </div>
            <div className="rounded-lg border border-border-color bg-white p-3">
              <div className="flex items-center gap-2 text-[12px] text-silver">
                <ShieldCheck size={13} />
                精选路线
              </div>
              <p className="mt-1 font-serif text-[24px] text-ink">
                {readinessCounts.featured || 0}
              </p>
            </div>
            <div className="rounded-lg border border-border-color bg-white p-3">
              <div className="flex items-center gap-2 text-[12px] text-silver">
                <Sparkles size={13} />
                复核队列
              </div>
              <p className="mt-1 font-serif text-[24px] text-ink">
                {data.curation.reviewQueue || 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <FilterBar
        search={search}
        setSearch={setSearch}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        readiness={readiness}
        setReadiness={setReadiness}
        difficultyCounts={difficultyCounts}
        readinessCounts={readinessCounts}
        onClear={clearFilters}
      />

      <section className="pb-16 pt-10">
        <div className="mx-auto max-w-[1200px] px-5 md:px-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="font-serif text-[20px] text-ink">
              {search || difficulty !== "all" || readiness !== "all" ? "筛选结果" : "全部路线"}
            </h2>
            <span className="shrink-0 text-[12px] text-silver">
              共找到 {filteredItems.length} 条
            </span>
          </div>

          <AnimatePresence mode="wait">
            {filteredItems.length > 0 ? (
              <motion.div
                key={`${deferredSearch}-${difficulty}-${readiness}`}
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {filteredItems.map((item, index) => (
                  <PathCard
                    key={item.id}
                    item={item}
                    featured={item.status.includes("featured")}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-dark bg-cream px-5 py-16 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white">
                    <AlertCircle size={26} strokeWidth={1.2} className="text-light-silver" />
                  </div>
                  <h3 className="text-[15px] text-graphite">没有找到匹配的路线</h3>
                  <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-silver">
                    试着减少筛选条件。后续导入高质量资料时，会优先整理成可跟走的路线，而不是散乱笔记。
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-5 rounded-lg bg-light-pink px-4 py-2 text-[13px] text-graphite transition-colors hover:bg-[#F0E5DE]"
                  >
                    清除全部筛选
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="bg-cream py-12">
        <div className="mx-auto max-w-[720px] px-5 text-center md:px-12">
          <h2 className="mb-4 font-serif text-[20px] text-ink">路线如何补数据</h2>
          <p className="text-[14px] leading-[1.8] text-silver">
            新资料先进入本地私有编译层，经过隐私扫描、来源复核和新手化改写后，再变成公开路线节点。公开页只展示可解释、可追溯、可维护的高质量内容。
          </p>
        </div>
      </section>

      {pathItems.length === 0 && (
        <div className="mx-auto max-w-[720px] px-5 pb-14 md:px-12">
          <EmptyState
            title="谱系还未上架"
            detail="等后端编译出通过复核的公开路线后，这里会展示可复刻的学习与构建路径。"
          />
        </div>
      )}
    </div>
  );
}
