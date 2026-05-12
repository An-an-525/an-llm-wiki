import { Link } from "react-router-dom";
import { getJournalTypeLabel, formatDate, truncate } from "@/lib/utils";
import { ArrowRight, PenLine } from "lucide-react";
import { useDeferredValue, useState, useMemo } from "react";
import { SearchBox } from "@/components/filters/SearchBox";
import { useArchiveData } from "@/lib/archive-api";
import { EmptyState, ErrorState, LoadingState } from "@/components/views/DataState";

export function JournalPage() {
  const { data, loading, error } = useArchiveData();
  const { journalItems } = data;
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const sortedItems = useMemo(() => {
    let items = [...journalItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return items;
  }, [journalItems, deferredSearch]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <h1
          className="text-[24px] sm:text-[28px] font-normal text-[#1A1A1A] mb-3"
         
        >
          手记
        </h1>
        <p className="text-[14px] text-[#8C8C8C] leading-relaxed max-w-2xl">
          手记只放能公开的阶段复盘和整理记录，不展示私密日记、原始聊天或本地敏感上下文。
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchBox value={search} onChange={setSearch} placeholder="搜索手记..." />
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {sortedItems.map((item) => (
          <Link
            key={item.id}
            to={`/journal/${item.slug}`}
            className="group bg-[#F7F5F2] rounded-lg border border-[#EAEAEA] hover:border-[#D1B48C]/40 transition-all duration-400 hover:shadow-sm p-5"
          >
            {/* Top Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PenLine size={12} className="text-[#C4B9A8]" />
                <span className="text-[11px] text-[#8C8C8C]">
                  {getJournalTypeLabel(item.type)}
                </span>
                <span className="text-[#C4B9A8]">·</span>
                <span className="text-[11px] text-[#8C8C8C]">
                  {formatDate(item.date)}
                </span>
              </div>
              <ArrowRight
                size={13}
                className="text-[#C4B9A8] group-hover:text-[#D1B48C] group-hover:translate-x-0.5 transition-all duration-300"
              />
            </div>

            {/* Title */}
            <h3 className="text-[15px] font-medium text-[#1A1A1A] group-hover:text-[#D1B48C] transition-colors duration-300 mb-2">
              {item.title}
            </h3>

            {/* Summary */}
            <p className="text-[13px] text-[#8C8C8C] leading-relaxed">
              {truncate(item.summary, 120)}
            </p>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 bg-[#1A1A1A]/[0.04] text-[#8C8C8C] rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {sortedItems.length === 0 && (
        <EmptyState
          title="公开手记待上架"
          detail="后续会从维护记录和阶段复盘里挑选适合公开的内容，而不是直接公开原始笔记。"
        />
      )}
    </div>
  );
}
