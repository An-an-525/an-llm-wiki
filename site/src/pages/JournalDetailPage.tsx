import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, PenLine } from "lucide-react";
import { getJournalTypeLabel, formatDate } from "@/lib/utils";
import { useArchiveData } from "@/lib/archive-api";
import { ErrorState, LoadingState } from "@/components/views/DataState";

export function JournalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useArchiveData();
  const item = id ? data.getJournalItemBySlug(id) : undefined;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  if (!item) {
    return <Navigate to="/journal" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back */}
      <Link
        to="/journal"
        className="inline-flex items-center gap-1.5 text-[12px] text-[#8C8C8C] hover:text-[#D1B48C] transition-colors duration-300 mb-8"
      >
        <ArrowLeft size={13} />
        <span>返回手记</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <PenLine size={13} className="text-[#C4B9A8]" />
          <span className="text-[11px] text-[#8C8C8C]">
            {getJournalTypeLabel(item.type)}
          </span>
          <span className="text-[#C4B9A8]">·</span>
          <span className="text-[11px] text-[#8C8C8C]">
            {formatDate(item.date)}
          </span>
        </div>

        {item.mood && (
          <span className="text-[11px] text-[#D1B48C] mb-2 block">
            {item.mood}
          </span>
        )}

        <h1
          className="text-[22px] sm:text-[26px] font-normal text-[#1A1A1A] mb-4"
         
        >
          {item.title}
        </h1>

        {/* Summary */}
        <p className="text-[14px] text-[#8C8C8C] leading-relaxed">
          {item.summary}
        </p>
      </div>

      {/* Body */}
      <div className="prose-custom">
        {item.body.split("\n\n").map((paragraph, idx) => (
          <p key={idx} className="text-[14px] text-[#1A1A1A] leading-[1.9] mb-4">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-[#EAEAEA]">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 bg-[#1A1A1A]/[0.04] text-[#8C8C8C] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      <div className="mt-8 text-[11px] text-[#C4B9A8]">
        {item.relatedWork && <p>关联作品：{item.relatedWork}</p>}
        {item.relatedPath && <p>关联谱系：{item.relatedPath}</p>}
        {item.relatedTimeline && <p>关联年谱：{item.relatedTimeline}</p>}
      </div>
    </div>
  );
}
