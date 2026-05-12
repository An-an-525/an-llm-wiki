import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  Clock3,
  LayoutGrid,
  ListFilter,
  RotateCcw,
  Rows3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ArchiveCard } from "@/components/cards/ArchiveCard";
import { SearchBox } from "@/components/filters/SearchBox";
import { TagFilter } from "@/components/filters/TagFilter";
import { AnimatedGrid, AnimatedItem } from "@/components/views/AnimatedGrid";
import { useArchiveData } from "@/lib/archive-api";
import { EmptyState, ErrorState, LoadingState } from "@/components/views/DataState";
import {
  getDifficultyLabel,
  getSourceReliabilityLabel,
  getTypeLabel,
  truncate,
} from "@/lib/utils";
import type { LibraryItem } from "@/lib/types";

type ViewMode = "shelf" | "list";
type ReliabilityFilter = "all" | LibraryItem["sourceReliability"];
type SortKey = "recommended" | "newest" | "rating" | "quick" | "name";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "recommended", label: "推荐优先" },
  { key: "newest", label: "最近更新" },
  { key: "rating", label: "质量评分" },
  { key: "quick", label: "新手快读" },
  { key: "name", label: "名称排序" },
];

const reliabilityOptions: { key: ReliabilityFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "verified-source", label: "精选来源" },
  { key: "source-backed", label: "有来源" },
  { key: "needs-review", label: "待补来源" },
];

function matchesReliability(item: LibraryItem, reliability: ReliabilityFilter) {
  return reliability === "all" || item.sourceReliability === reliability;
}

function qualityValue(item: LibraryItem) {
  if (typeof item.quality?.qualityScore === "number" && item.quality.qualityScore > 0) {
    return item.quality.qualityScore;
  }
  return (item.rating || 0) * 20;
}

function sortItems(items: LibraryItem[], sortBy: SortKey) {
  const sorted = [...items];
  switch (sortBy) {
    case "newest":
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    case "rating":
      return sorted.sort((a, b) => qualityValue(b) - qualityValue(a));
    case "quick":
      return sorted.sort((a, b) => {
        const diff = (a.readingMinutes || 0) - (b.readingMinutes || 0);
        return diff || qualityValue(b) - qualityValue(a);
      });
    case "name":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
    case "recommended":
    default:
      return sorted.sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) return a.isRecommended ? -1 : 1;
        if (a.sourceReliability !== b.sourceReliability) {
          if (a.sourceReliability === "verified-source") return -1;
          if (b.sourceReliability === "verified-source") return 1;
        }
        return qualityValue(b) - qualityValue(a) || b.updatedAt.localeCompare(a.updatedAt);
      });
  }
}

function GuideCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-lg border border-[#EAEAEA] bg-[#F7F5F2] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#8C6B42]" />
        <div>
          <h2 className="text-[15px] text-[#1A1A1A]">怎么逛这个藏馆</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-[#666]">
            先看“新手推荐”，再用类型、来源状态和标签缩小范围。每张卡片都说明适合谁、预计阅读时间、来源状态和策展备注，避免把原始资料堆成难读的清单。
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#777]">
            <span className="rounded-full bg-white px-2.5 py-1">精选来源：可优先阅读</span>
            <span className="rounded-full bg-white px-2.5 py-1">有来源：适合继续深挖</span>
            <span className="rounded-full bg-white px-2.5 py-1">待补来源：先当候选线索</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function NewbiePicks({ items }: { items: LibraryItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-[#C8956C]" />
        <h2 className="text-[16px] text-[#1A1A1A]">新手推荐</h2>
        <span className="text-[12px] text-[#8C8C8C]">短、清楚、来源状态更稳</span>
      </div>
      <AnimatedGrid className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <AnimatedItem key={item.id}>
            <ArchiveCard item={item} compact />
          </AnimatedItem>
        ))}
      </AnimatedGrid>
    </section>
  );
}

function ResultCountBar({
  count,
  total,
  isFiltered,
  sortLabel,
  onClear,
}: {
  count: number;
  total: number;
  isFiltered: boolean;
  sortLabel: string;
  onClear: () => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <span className="text-[13px] text-[#777]">
        共找到 <span className="text-[#1A1A1A]">{count}</span> 条精选资源
        {isFiltered && <span className="text-[#9B948C]">，筛选自 {total} 条</span>}
        <span className="ml-2 text-[#B0A69A]">排序：{sortLabel}</span>
      </span>
      {isFiltered && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 text-[12px] text-[#8C6B42] transition-colors hover:text-[#171717]"
        >
          <RotateCcw size={13} />
          清除筛选
        </button>
      )}
    </div>
  );
}

export function LibraryPage() {
  const { data, loading, error } = useArchiveData();
  const { libraryItems, curation } = data;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedReliability, setSelectedReliability] = useState<ReliabilityFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("recommended");
  const [viewMode, setViewMode] = useState<ViewMode>("shelf");
  const [displayCount, setDisplayCount] = useState(9);

  const allTags = useMemo(
    () => Array.from(new Set(libraryItems.flatMap((item) => item.tags))).sort((a, b) => a.localeCompare(b, "zh-CN")),
    [libraryItems],
  );

  const allTypes = useMemo(
    () => Array.from(new Set(libraryItems.map((item) => item.type))).sort((a, b) => a.localeCompare(b, "zh-CN")),
    [libraryItems],
  );

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    libraryItems.forEach((item) => counts.set(item.type, (counts.get(item.type) || 0) + 1));
    return counts;
  }, [libraryItems]);

  const reliabilityCounts = useMemo(() => {
    const counts = new Map<ReliabilityFilter, number>([["all", libraryItems.length]]);
    libraryItems.forEach((item) =>
      counts.set(item.sourceReliability, (counts.get(item.sourceReliability) || 0) + 1),
    );
    return counts;
  }, [libraryItems]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setSelectedTags([]);
    setSelectedTypes([]);
    setSelectedReliability("all");
    setDisplayCount(9);
  }, []);

  const filteredItems = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const filtered = libraryItems.filter((item) => {
      if (q) {
        const haystack = [
          item.title,
          item.summary,
          item.whoFor,
          item.myThoughts || "",
          item.recommendedFor || "",
          item.note || "",
          item.sourcePath || "",
          item.tags.join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) {
        return false;
      }

      if (selectedTags.length > 0 && !selectedTags.some((tag) => item.tags.includes(tag))) {
        return false;
      }

      return matchesReliability(item, selectedReliability);
    });

    return sortItems(filtered, sortBy);
  }, [libraryItems, deferredSearch, selectedTypes, selectedTags, selectedReliability, sortBy]);

  const hasActiveFilter = Boolean(search || selectedTags.length || selectedTypes.length || selectedReliability !== "all");
  const newbiePicks = useMemo(() => {
    if (hasActiveFilter) return [];
    const primary = libraryItems.filter(
      (item) => item.isRecommended && item.difficulty === "low" && item.sourceReliability !== "needs-review",
    );
    const fallback = libraryItems.filter(
      (item) => item.isRecommended && item.sourceReliability === "verified-source",
    );
    return sortItems(primary.length >= 3 ? primary : fallback, "recommended").slice(0, 3);
  }, [libraryItems, hasActiveFilter]);

  const visibleItems = filteredItems.slice(0, displayCount);
  const hasMore = displayCount < filteredItems.length;
  const currentSortLabel = sortOptions.find((option) => option.key === sortBy)?.label || "推荐优先";
  const recommendedCount = libraryItems.filter((item) => item.isRecommended).length;
  const sourceBackedCount = libraryItems.filter((item) => item.sourceReliability !== "needs-review").length;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
        <div>
          <h1 className="mb-3 text-[28px] font-normal text-[#1A1A1A] sm:text-[34px]">藏馆</h1>
          <p className="max-w-2xl text-[14px] leading-relaxed text-[#666]">
            这里是公开知识库的精选展柜，不是原始文件列表。先展示能帮助新手理解体系的高质量资料，后续再从本地资料库补充更细的内容。
          </p>
        </div>
        <div className="rounded-lg border border-[#EAEAEA] bg-white p-4">
          <div className="flex items-center gap-2 text-[12px] text-[#1A1A1A]">
            <ListFilter size={14} className="text-[#9B7A52]" />
            <span>策展状态</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
            {[
              ["上架", libraryItems.length],
              ["推荐", recommendedCount],
              ["有来源", sourceBackedCount],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[#F7F5F2] p-3">
                <div className="text-[20px] leading-none text-[#171717]">{value}</div>
                <div className="mt-1 text-[#8C8C8C]">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[#9B948C]">
            另有 {curation.reviewQueue} 条资料在复核队列中，确认来源和质量后再上架。
          </p>
        </div>
      </div>

      <div className="mb-6">
        <GuideCard />
      </div>

      <div className="mb-8 space-y-4 rounded-lg border border-[#EAEAEA] bg-white p-4">
        <SearchBox
          value={search}
          onChange={(value) => {
            setSearch(value);
            setDisplayCount(9);
          }}
          placeholder="搜索标题、适合人群、策展备注、标签或来源..."
        />

        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="space-y-4">
            <div>
              <span className="mb-2 block text-[11px] tracking-wider text-[#8C8C8C] uppercase">类型</span>
              <div className="flex flex-wrap gap-1.5">
                {allTypes.map((type) => {
                  const active = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedTypes(active ? selectedTypes.filter((item) => item !== type) : [...selectedTypes, type]);
                        setDisplayCount(9);
                      }}
                      className={`rounded-full border px-3 py-1 text-[12px] transition-all duration-300 ${
                        active
                          ? "border-[#D1B48C]/60 bg-[#D1B48C]/10 text-[#1A1A1A]"
                          : "border-[#EAEAEA] text-[#777] hover:border-[#D1B48C]/30 hover:text-[#1A1A1A]"
                      }`}
                    >
                      {getTypeLabel(type)}
                      <span className="ml-1 text-[10px] text-[#B0A69A]">{typeCounts.get(type) || 0}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-[11px] tracking-wider text-[#8C8C8C] uppercase">来源状态</span>
              <div className="flex flex-wrap gap-1.5">
                {reliabilityOptions.map((option) => (
                  <button
                    key={option.key}
                    onClick={() => {
                      setSelectedReliability(option.key);
                      setDisplayCount(9);
                    }}
                    className={`rounded-full px-3 py-1 text-[12px] transition-colors ${
                      selectedReliability === option.key
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-[#F7F5F2] text-[#777] hover:text-[#1A1A1A]"
                    }`}
                  >
                    {option.key === "all" ? option.label : getSourceReliabilityLabel(option.key)}
                    <span className="ml-1 text-[10px] opacity-70">{reliabilityCounts.get(option.key) || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedTypes.length === 0 && (
              <TagFilter
                tags={allTags.slice(0, 24)}
                selected={selectedTags}
                onChange={(next) => {
                  setSelectedTags(next);
                  setDisplayCount(9);
                }}
                label="标签"
              />
            )}
          </div>

          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-[11px] tracking-wider text-[#8C8C8C] uppercase">排序</span>
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value as SortKey);
                  setDisplayCount(9);
                }}
                className="h-9 w-full rounded-lg border border-[#EAEAEA] bg-[#F7F5F2] px-3 text-[12px] text-[#1A1A1A] outline-none focus:border-[#D1B48C]/60 lg:w-[150px]"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex rounded-lg border border-[#EAEAEA] bg-[#F7F5F2] p-1">
              {[
                { key: "shelf" as const, label: "展柜", icon: LayoutGrid },
                { key: "list" as const, label: "列表", icon: Rows3 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] transition-colors ${
                    viewMode === key ? "bg-white text-[#171717] shadow-sm" : "text-[#777] hover:text-[#171717]"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ResultCountBar
        count={filteredItems.length}
        total={libraryItems.length}
        isFiltered={hasActiveFilter}
        sortLabel={currentSortLabel}
        onClear={clearFilters}
      />

      <NewbiePicks items={newbiePicks} />

      {filteredItems.length === 0 ? (
        <EmptyState
          title="没有找到匹配的精选藏品"
          detail="可以换一个关键词，清除筛选，或者等本地复核队列里的资料整理后再上架。"
          action={
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#D1B48C]/40 bg-white px-3 py-1.5 text-[12px] text-[#8C6B42]"
            >
              <RotateCcw size={13} />
              清除筛选
            </button>
          }
        />
      ) : viewMode === "list" ? (
        <div className="overflow-hidden rounded-lg border border-[#EAEAEA] bg-white">
          {visibleItems.map((item) => (
            <Link
              key={item.id}
              to={`/library/${item.slug}`}
              className="grid gap-2 border-b border-[#F0EDE8] px-4 py-4 transition-colors last:border-b-0 hover:bg-[#FBFAF8] sm:grid-cols-[120px_1fr_150px_auto] sm:items-center"
            >
              <span className="text-[12px] text-[#9B7A52]">{getTypeLabel(item.type)}</span>
              <span className="min-w-0">
                <span className="block truncate text-[14px] text-[#171717]">{item.title}</span>
                <span className="mt-1 block text-[12px] leading-[1.6] text-[#777]">
                  {truncate(item.summary, 120)}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-1 text-[11px] text-[#8C8C8C]">
                <Clock3 size={12} />
                {item.timeToLearn}
                {item.difficulty && <span>· {getDifficultyLabel(item.difficulty)}</span>}
              </span>
              <ArrowRight size={14} className="hidden text-[#B8956A] sm:block" />
            </Link>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <AnimatedGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleItems.map((item) => (
              <AnimatedItem key={item.id}>
                <ArchiveCard item={item} />
              </AnimatedItem>
            ))}
          </AnimatedGrid>
        </AnimatePresence>
      )}

      {filteredItems.length > 0 && (
        <div className="mt-9 flex justify-center">
          {hasMore ? (
            <button
              onClick={() => setDisplayCount((value) => value + 9)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#EAEAEA] bg-white px-4 py-2 text-[13px] text-[#1A1A1A] transition-colors hover:bg-[#F7F5F2]"
            >
              <ChevronDown size={14} />
              加载更多
            </button>
          ) : (
            <span className="text-[12px] text-[#B0A69A]">已展示当前筛选下的全部资源</span>
          )}
        </div>
      )}
    </div>
  );
}
