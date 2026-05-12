import { useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  Cpu,
  FlaskConical,
  Globe,
  Hammer,
  Inbox,
  Layers,
  RotateCcw,
  Search,
  Video,
  Wrench,
  X,
} from "lucide-react";
import { WorkCard } from "@/components/cards/WorkCard";
import { ErrorState, LoadingState } from "@/components/views/DataState";
import { useArchiveData } from "@/lib/archive-api";
import { getProjectStatusLabel, getWorkTypeLabel } from "@/lib/utils";
import type { WorkItem, WorkItemType, WorkProjectStatus } from "@/lib/types";

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

type TypeFilter = "all" | WorkItemType;
type StatusFilter = "all" | WorkProjectStatus;

const typeFilters: { key: TypeFilter; label: string; icon: React.ReactNode }[] = [
  { key: "all", label: "全部", icon: <Layers size={13} strokeWidth={1.5} /> },
  { key: "website", label: "网站", icon: <Globe size={13} strokeWidth={1.5} /> },
  { key: "tool", label: "工具", icon: <Wrench size={13} strokeWidth={1.5} /> },
  { key: "video", label: "视频", icon: <Video size={13} strokeWidth={1.5} /> },
  { key: "mini-app", label: "小程序", icon: <Cpu size={13} strokeWidth={1.5} /> },
  { key: "course", label: "课程", icon: <BookOpen size={13} strokeWidth={1.5} /> },
  { key: "open-source", label: "开源", icon: <Code2 size={13} strokeWidth={1.5} /> },
  { key: "prototype", label: "原型", icon: <Cpu size={13} strokeWidth={1.5} /> },
  { key: "experiment", label: "实验", icon: <FlaskConical size={13} strokeWidth={1.5} /> },
];

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "building", label: "构建中" },
  { key: "online", label: "已上线" },
  { key: "maintaining", label: "维护中" },
  { key: "idea", label: "构想中" },
  { key: "paused", label: "已暂停" },
  { key: "archived", label: "已归档" },
];

function countBy<T extends string>(items: WorkItem[], getter: (item: WorkItem) => T) {
  const counts = new Map<T | "all", number>([["all", items.length]]);
  items.forEach((item) => counts.set(getter(item), (counts.get(getter(item)) || 0) + 1));
  return counts;
}

function PageGuide() {
  return (
    <motion.div
      className="mb-6 rounded-xl bg-light-pink p-4 md:p-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.25 }}
    >
      <p className="text-[13px] leading-relaxed text-silver">
        工坊只展示能说明能力、过程和收获的作品。未整理、过期、只有本地上下文或涉及隐私的项目不会上架；后续每件作品都要有目标、技术栈、挑战、复盘和可公开链接。
      </p>
    </motion.div>
  );
}

function EmptyWorks({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-light-gray">
        <Inbox size={28} strokeWidth={1} className="text-light-silver" />
      </div>
      <p className="mb-1 text-[15px] text-silver">作品展柜待上架</p>
      <p className="mb-5 max-w-[360px] text-[13px] leading-relaxed text-light-silver">
        这里不会用示例数据充数。等本地项目经过隐私过滤、质量筛选和公开复盘后，再进入正式展柜。
      </p>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1.5 rounded-lg bg-light-pink px-4 py-2 text-[13px] text-graphite transition-colors hover:bg-[#F0E5DE]"
      >
        <RotateCcw size={13} />
        清除筛选
      </button>
    </motion.div>
  );
}

export function WorksPage() {
  const { data, loading, error } = useArchiveData();
  const { workItems, curation } = data;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeType, setActiveType] = useState<TypeFilter>("all");
  const [activeStatus, setActiveStatus] = useState<StatusFilter>("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const typeCounts = useMemo(() => countBy(workItems, (item) => item.type), [workItems]);
  const statusCounts = useMemo(() => countBy(workItems, (item) => item.projectStatus), [workItems]);
  const allTags = useMemo(
    () => Array.from(new Set(workItems.flatMap((item) => item.techStack || item.tags))).sort((a, b) => a.localeCompare(b, "zh-CN")),
    [workItems],
  );

  const filteredItems = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return workItems.filter((item) => {
      if (activeType !== "all" && item.type !== activeType) return false;
      if (activeStatus !== "all" && item.projectStatus !== activeStatus) return false;
      if (activeTags.length > 0 && !activeTags.some((tag) => (item.techStack || item.tags).includes(tag))) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.summary,
        item.type,
        item.projectStatus,
        item.nextPlan || "",
        (item.techStack || []).join(" "),
        item.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [workItems, deferredSearch, activeType, activeStatus, activeTags]);

  const clearFilters = () => {
    setSearch("");
    setActiveType("all");
    setActiveStatus("all");
    setActiveTags([]);
  };

  const hasFilters = Boolean(search || activeType !== "all" || activeStatus !== "all" || activeTags.length);
  const completed = workItems.filter((item) => item.projectStatus === "online" || item.projectStatus === "maintaining").length;
  const inProgress = workItems.filter((item) => item.projectStatus === "building").length;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  return (
    <div className="min-h-[100dvh] bg-white">
      <section className="pb-8 pt-[96px] md:pt-[144px]">
        <div className="mx-auto max-w-[1200px] px-5 md:px-12">
          <motion.h1
            className="mb-3 text-center font-serif text-[28px] font-normal leading-[1.3] text-ink md:text-[36px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            工坊
          </motion.h1>
          <motion.p
            className="mb-4 text-center text-[15px] leading-relaxed text-silver"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.15 }}
          >
            作品、项目与实验。每一件都应该是一段实践的结晶。
          </motion.p>
          <motion.p
            className="mb-6 text-center text-[12px] text-light-silver"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.25 }}
          >
            {workItems.length} 件作品 · {completed} 已公开 · {inProgress} 构建中 · {curation.reviewQueue} 条资料待复核
          </motion.p>

          <div className="mx-auto max-w-[720px]">
            <PageGuide />
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-border-color bg-white/90 backdrop-blur-[8px]">
        <div className="mx-auto max-w-[1200px] px-5 py-3 md:px-12">
          <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {typeFilters.map((type) => (
              <button
                key={type.key}
                onClick={() => setActiveType(type.key)}
                className={
                  activeType === type.key
                    ? "shrink-0 rounded-lg bg-light-pink px-3 py-1.5 text-[13px] text-graphite transition-colors duration-150"
                    : "shrink-0 rounded-lg px-3 py-1.5 text-[13px] text-silver transition-colors duration-150 hover:bg-cream hover:text-graphite"
                }
              >
                <span className="flex items-center gap-1.5">
                  {type.icon}
                  {type.key === "all" ? type.label : getWorkTypeLabel(type.key)}
                  <span className="text-[11px] text-light-silver">{typeCounts.get(type.key) || 0}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="mb-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="mr-1 shrink-0 text-[11px] text-light-silver">状态</span>
            {statusFilters.map((status) => (
              <button
                key={status.key}
                onClick={() => setActiveStatus(status.key)}
                className={
                  activeStatus === status.key
                    ? "shrink-0 rounded-full bg-light-pink px-2.5 py-0.5 text-[12px] text-graphite transition-colors duration-150"
                    : "shrink-0 rounded-full px-2.5 py-0.5 text-[12px] text-silver transition-colors duration-150 hover:bg-cream hover:text-graphite"
                }
              >
                {status.key === "all" ? status.label : getProjectStatusLabel(status.key)}
                <span className="ml-0.5 text-[10px] text-light-silver">{statusCounts.get(status.key) || 0}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="mr-1 shrink-0 text-[11px] text-light-silver">技术</span>
              {allTags.length > 0 ? (
                allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() =>
                      setActiveTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]))
                    }
                    className={
                      activeTags.includes(tag)
                        ? "shrink-0 rounded-md bg-light-pink px-2.5 py-1 text-[12px] text-graphite"
                        : "shrink-0 rounded-md bg-light-gray px-2.5 py-1 text-[12px] text-silver transition-colors hover:bg-cream"
                    }
                  >
                    {tag}
                  </button>
                ))
              ) : (
                <span className="text-[12px] text-light-silver">待作品上架后生成</span>
              )}
            </div>

            <div className="relative md:w-[280px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-silver" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索作品、技术栈或下一步..."
                className="h-9 w-full rounded-lg border border-border-color bg-white pl-8 pr-8 text-[13px] text-graphite outline-none transition-all placeholder:text-light-silver focus:border-border-dark focus:shadow-[0_0_0_3px_rgba(200,200,200,0.12)]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-light-silver hover:text-graphite"
                  aria-label="清空搜索"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-5 pb-2 pt-6 md:px-12">
        <div className="flex items-center justify-between">
          <span className="text-[12px] text-silver">共 {filteredItems.length} 件作品</span>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-[12px] text-silver transition-colors hover:text-graphite">
              <X size={13} strokeWidth={1.5} />
              清除
            </button>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 pb-16 pt-4 md:px-12">
        <AnimatePresence mode="wait">
          {filteredItems.length > 0 ? (
            <motion.div
              key={`${activeType}-${activeStatus}-${activeTags.join(",")}-${deferredSearch}`}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredItems.map((item, index) => (
                <WorkCard key={item.id} item={item} index={index} />
              ))}
            </motion.div>
          ) : (
            <EmptyWorks onClear={clearFilters} />
          )}
        </AnimatePresence>

        {workItems.length === 0 && (
          <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              ["项目复盘", "目标、技术栈、关键难点、最后结果"],
              ["可访问链接", "demo、GitHub、截图和部署状态"],
              ["关联知识", "连接到谱系、手记、资料和时间线"],
            ].map(([title, detail]) => (
              <div key={title} className="rounded-xl border border-dashed border-border-dark bg-cream p-5">
                <Hammer size={18} strokeWidth={1.5} className="mb-3 text-status-active" />
                <h3 className="font-serif text-[17px] text-ink">{title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-silver">{detail}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
