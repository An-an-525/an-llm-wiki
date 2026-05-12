import type { ContentStatus } from "@/lib/types";
import { getStatusLabel } from "@/lib/utils";

interface StatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const statusStyles: Record<ContentStatus, string> = {
  draft: "bg-[#F0EDE8] text-[#999]",
  public: "bg-emerald-50 text-emerald-600",
  featured: "bg-[#D1B48C]/10 text-[#B8956A]",
  recommended: "bg-sky-50 text-sky-600",
  verified: "bg-[#D1B48C]/10 text-[#D1B48C]",
  pending: "bg-amber-50 text-amber-600",
  archived: "bg-[#F0EDE8] text-[#999]",
  outdated: "bg-rose-50 text-rose-400",
};

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusStyles[status]} ${className}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
