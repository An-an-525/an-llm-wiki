import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Clock3, RotateCcw, Search, ShieldCheck, X } from "lucide-react";
import { TimelineView } from "@/components/views/TimelineView";
import { useArchiveData } from "@/lib/archive-api";
import { EmptyState, ErrorState, LoadingState } from "@/components/views/DataState";
import type { TimelineItem, TimelineItemType } from "@/lib/types";
import { getTimelineTypeLabel } from "@/lib/utils";

type TypeFilter = "all" | TimelineItemType;

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const typeOptions: { key: TypeFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "project", label: "项目" },
  { key: "learning", label: "学习" },
  { key: "system", label: "系统" },
  { key: "release", label: "发布" },
  { key: "insight", label: "洞见" },
  { key: "life", label: "生活" },
  { key: "migration", label: "迁移" },
];

function countTypes(items: TimelineItem[]): Record<TypeFilter, number> {
  const counts: Record<TypeFilter, number> = {
    all: items.length,
    project: 0,
    learning: 0,
    system: 0,
    release: 0,
    insight: 0,
    life: 0,
    migration: 0,
  };
  for (const item of items) {
    counts[item.type] += 1;
  }
  return counts;
}

function matchesSearch(item: TimelineItem, query: string) {
  if (!query) return true;
  const q = query.toLowerCase();
  return [item.title, item.summary, item.phase, ...item.tags].some((value) =>
    value.toLowerCase().includes(q),
  );
}

export function TimelinePage() {
  const { data, loading, error } = useArchiveData();
  const { timelineItems } = data;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [activePhase, setActivePhase] = useState("all");

  const sortedItems = useMemo(
    () => [...timelineItems].sort((a, b) => b.date.localeCompare(a.date)),
    [timelineItems],
  );

  const typeCounts = useMemo(() => countTypes(timelineItems), [timelineItems]);
  const phases = useMemo(
    () => ["all", ...Array.from(new Set(timelineItems.map((item) => item.phase))).sort()],
    [timelineItems],
  );

  const filteredItems = useMemo(() => {
    return sortedItems.filter((item) => {
      if (activeType !== "all" && item.type !== activeType) return false;
      if (activePhase !== "all" && item.phase !== activePhase) return false;
      return matchesSearch(item, deferredSearch.toLowerCase());
    });
  }, [sortedItems, activeType, activePhase, deferredSearch]);

  const clearFilters = () => {
    setSearch("");
    setActiveType("all");
    setActivePhase("all");
  };

  const hasFilter = search || activeType !== "all" || activePhase !== "all";
  const firstDate = sortedItems[sortedItems.length - 1]?.date;
  const lastDate = sortedItems[0]?.date;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  return (
    <div className="min-h-[100dvh] bg-white">
      <section className="pb-8 pt-[96px] md:pt-[128px]">
        <div className="mx-auto max-w-[900px] px-5 text-center md:px-12">
          <motion.h1
            className="mb-3 font-serif text-[30px] font-normal leading-tight text-ink md:text-[38px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            年谱
          </motion.h1>
          <motion.p
            className="mx-auto max-w-2xl text-[15px] leading-relaxed text-silver"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
          >
            年谱只串起公开资料库、项目和内容维护节点，不展示私密时间线、原始聊天或本地敏感上下文。
          </motion.p>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-5 md:px-12">
        <motion.div
          className="mb-6 rounded-xl bg-light-pink p-4 md:p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.16 }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70">
              <CalendarDays size={16} strokeWidth={1.5} className="text-status-active" />
            </div>
            <p className="text-[13px] leading-relaxed text-silver">
              当前节点由后端从公开条目自动生成。等作品、风信和手记通过复核后，年谱会自然扩展成更完整的资料库演进时间线。
            </p>
          </div>
        </motion.div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border-color bg-white p-3">
            <div className="flex items-center gap-2 text-[12px] text-silver">
              <Clock3 size={13} />
              公开节点
            </div>
            <p className="mt-1 font-serif text-[24px] text-ink">{timelineItems.length}</p>
          </div>
          <div className="rounded-lg border border-border-color bg-white p-3">
            <div className="flex items-center gap-2 text-[12px] text-silver">
              <CalendarDays size={13} />
              时间范围
            </div>
            <p className="mt-2 text-[13px] text-graphite">
              {firstDate && lastDate ? `${firstDate} 至 ${lastDate}` : "待生成"}
            </p>
          </div>
          <div className="rounded-lg border border-border-color bg-white p-3">
            <div className="flex items-center gap-2 text-[12px] text-silver">
              <ShieldCheck size={13} />
              发布边界
            </div>
            <p className="mt-2 text-[13px] text-graphite">仅公开安全节点</p>
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-y border-border-color bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-[900px] px-5 py-3 md:px-12">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-[12px] text-silver">
              共 <span className="font-medium text-graphite">{filteredItems.length}</span> 个节点
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
            {typeOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setActiveType(option.key)}
                className={`shrink-0 rounded-lg px-3.5 py-1.5 text-[13px] transition-colors duration-150 ${
                  activeType === option.key
                    ? "bg-light-pink text-graphite"
                    : "text-silver hover:bg-cream hover:text-graphite"
                }`}
              >
                {option.key === "all" ? option.label : getTimelineTypeLabel(option.key)}
                <span className="ml-1 text-[11px] text-light-silver">
                  {typeCounts[option.key] || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide sm:max-w-[42%] sm:pb-0">
              {phases.map((phase) => (
                <button
                  key={phase}
                  onClick={() => setActivePhase(phase)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] transition-colors ${
                    activePhase === phase
                      ? "bg-light-gray text-graphite"
                      : "text-silver hover:bg-cream hover:text-graphite"
                  }`}
                >
                  {phase === "all" ? "全部阶段" : phase}
                </button>
              ))}
            </div>
            <div className="relative min-w-0 flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-light-silver"
              />
              <input
                type="text"
                placeholder="搜索节点、阶段或标签..."
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
      </div>

      <section className="mx-auto max-w-[900px] px-5 py-10 md:px-12">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div
              key={`${activeType}-${activePhase}-${deferredSearch}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <TimelineView items={filteredItems} />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <EmptyState
                title="没有匹配的年谱节点"
                detail="减少筛选条件，或等待后续公开条目通过复核后自动进入年谱。"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
