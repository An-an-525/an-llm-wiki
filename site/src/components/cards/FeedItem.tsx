import type { FeedItem } from "@/lib/types";
import {
  getFeedCategoryLabel,
  formatDate,
  truncate,
} from "@/lib/utils";
import { ArrowUpRight, Bookmark } from "lucide-react";

interface FeedItemProps {
  item: FeedItem;
}

export function FeedItemCard({ item }: FeedItemProps) {
  const importanceColor: Record<string, string> = {
    low: "",
    medium: "border-l-amber-300",
    high: "border-l-rose-300",
  };

  return (
    <div
      className={`group bg-[#F7F5F2] rounded-lg border border-[#EAEAEA] hover:border-[#D1B48C]/40 transition-all duration-400 hover:shadow-sm pl-4 ${importanceColor[item.importance]}`}
    >
      <div className="p-4 sm:p-5">
        {/* Top Row: Source + Date + Category */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] tracking-wider text-[#8C8C8C]">
              {item.source}
            </span>
            <span className="text-[#D1B48C]">·</span>
            <span className="text-[11px] text-[#8C8C8C]">
              {formatDate(item.publishedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2 py-0.5 bg-[#1A1A1A]/[0.04] text-[#8C8C8C] rounded-full">
              {getFeedCategoryLabel(item.category)}
            </span>
            {item.archivedToLibrary && (
              <Bookmark size={11} className="text-[#D1B48C]" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-medium text-[#1A1A1A] group-hover:text-[#D1B48C] transition-colors duration-300 mb-2">
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1"
            >
              <span>{item.title}</span>
              <ArrowUpRight
                size={13}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </a>
          ) : (
            item.title
          )}
        </h3>

        {/* Summary */}
        <p className="text-[13px] text-[#8C8C8C] leading-relaxed mb-3">
          {truncate(item.summary, 120)}
        </p>

        {/* Short Comment */}
        {item.shortComment && (
          <p className="text-[12px] text-[#D1B48C]/80 italic mb-3 border-l-2 border-[#D1B48C]/20 pl-3">
            {item.shortComment}
          </p>
        )}

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
      </div>
    </div>
  );
}
