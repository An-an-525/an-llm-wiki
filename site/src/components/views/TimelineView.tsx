import type { TimelineItem } from "@/lib/types";
import {
  formatShortDate,
  getTimelineTypeLabel,
  truncate,
} from "@/lib/utils";
import { Circle } from "lucide-react";

interface TimelineViewProps {
  items: TimelineItem[];
}

export function TimelineView({ items }: TimelineViewProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-[#8C8C8C] text-sm">
        暂无数据
      </div>
    );
  }

  // Group items by phase
  const grouped = items.reduce<Record<string, TimelineItem[]>>(
    (acc, item) => {
      if (!acc[item.phase]) acc[item.phase] = [];
      acc[item.phase].push(item);
      return acc;
    },
    {}
  );

  const phases = Object.keys(grouped);

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#EAEAEA]" />

      <div className="space-y-10">
        {phases.map((phase) => (
          <div key={phase}>
            {/* Phase Header */}
            <div className="flex items-center gap-3 mb-5">
              <Circle
                size={14}
                className="fill-[#D1B48C] text-[#D1B48C] relative z-10"
              />
              <h3
                className="text-sm font-medium text-[#1A1A1A] tracking-wide"
               
              >
                {phase}
              </h3>
            </div>

            {/* Phase Items */}
            <div className="space-y-4 ml-[26px]">
              {grouped[phase].map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-[#F7F5F2] rounded-lg border border-[#EAEAEA] hover:border-[#D1B48C]/40 transition-all duration-400 p-4"
                >
                  {/* Top Row: Date + Type */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-[#8C8C8C]">
                      {formatShortDate(item.date)}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-[#1A1A1A]/[0.04] text-[#8C8C8C] rounded-full">
                      {getTimelineTypeLabel(item.type)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-[14px] font-medium text-[#1A1A1A] group-hover:text-[#D1B48C] transition-colors duration-300 mb-1.5">
                    {item.title}
                  </h4>

                  {/* Summary */}
                  <p className="text-[12px] text-[#8C8C8C] leading-relaxed mb-2">
                    {truncate(item.summary, 100)}
                  </p>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 bg-[#1A1A1A]/[0.04] text-[#8C8C8C] rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Importance indicator */}
                  {item.importance === "high" && (
                    <div className="absolute left-0 top-4 bottom-4 w-0.5 bg-[#D1B48C]/40 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
