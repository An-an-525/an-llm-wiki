import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, ExternalLink, Sparkles, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { LibraryItem } from "@/lib/types";
import {
  getTypeLabel,
  getPricingLabel,
  getDifficultyLabel,
  getSourceReliabilityLabel,
  formatRelativeDate,
  truncate,
} from "@/lib/utils";
import { StatusBadge } from "@/components/filters/StatusBadge";

interface ArchiveCardProps {
  item: LibraryItem;
  compact?: boolean;
}

const typeColor: Record<string, string> = {
  source: "#8C6B42",
  tool: "#3F716C",
  model: "#746187",
  github: "#4F6F9F",
  tutorial: "#6B8F71",
  website: "#8B6F4E",
  article: "#8C6B42",
  video: "#9B6B6B",
  api: "#536E7D",
  software: "#687D67",
  case: "#7C733A",
};

const reliabilityClass: Record<LibraryItem["sourceReliability"], string> = {
  "verified-source": "border-[#6B9E7C]/30 bg-[#6B9E7C]/10 text-[#3F716C]",
  "source-backed": "border-[#D1B48C]/30 bg-[#D1B48C]/10 text-[#8C6B42]",
  "needs-review": "border-[#C8956C]/30 bg-[#C8956C]/10 text-[#9B6A43]",
};

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5" aria-label={`质量评分 ${rating}/5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={11}
          className={index < rating ? "fill-[#D1B48C] text-[#D1B48C]" : "text-[#E2DED6]"}
        />
      ))}
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty?: LibraryItem["difficulty"] }) {
  if (!difficulty) return null;
  const classes: Record<NonNullable<LibraryItem["difficulty"]>, string> = {
    low: "border-[#6B9E7C]/25 bg-[#6B9E7C]/10 text-[#4E765F]",
    medium: "border-[#D1B48C]/30 bg-[#D1B48C]/10 text-[#8C6B42]",
    high: "border-[#C47D6E]/30 bg-[#C47D6E]/10 text-[#9B6457]",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${classes[difficulty]}`}>
      <Zap size={10} />
      {getDifficultyLabel(difficulty)}
    </span>
  );
}

export function ArchiveCard({ item, compact = false }: ArchiveCardProps) {
  const accent = typeColor[item.type] || "#8C6B42";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-[#EAEAEA] bg-white transition-all duration-500 hover:border-[#D1B48C]/40 hover:shadow-lg hover:shadow-[#D1B48C]/[0.08]">
        <div className="h-1 w-full" style={{ backgroundColor: accent }} />
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span
              className="rounded-sm px-2 py-0.5 text-[11px]"
              style={{ backgroundColor: `${accent}18`, color: accent }}
            >
              {getTypeLabel(item.type) || item.type}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[11px] ${reliabilityClass[item.sourceReliability]}`}>
              {getSourceReliabilityLabel(item.sourceReliability)}
            </span>
            <DifficultyBadge difficulty={item.difficulty} />
            {item.isRecommended && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#C8956C]/25 bg-[#C8956C]/10 px-2 py-0.5 text-[11px] text-[#9B6A43]">
                <Sparkles size={10} />
                推荐
              </span>
            )}
          </div>

          <Link
            to={`/library/${item.slug}`}
            className="mb-2 block text-[15px] font-medium leading-snug text-[#1A1A1A] transition-colors duration-300 group-hover:text-[#8C6B42]"
          >
            <span className="inline-flex items-center gap-1.5">
              {item.title}
              <ArrowUpRight
                size={13}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#D1B48C]"
              />
            </span>
          </Link>

          <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-[#777]">
            {truncate(item.summary, compact ? 76 : 108)}
          </p>

          <div className="mb-3 rounded-lg bg-[#F7F5F2] px-3 py-2">
            <p className="line-clamp-2 text-[12px] leading-relaxed text-[#4F4F4F]">
              <span className="text-[#8C8C8C]">适合：</span>
              {item.whoFor}
            </p>
          </div>

          {!compact && item.myThoughts && (
            <p className="mb-3 line-clamp-2 border-l-2 border-[#E8DED1] pl-3 text-[12px] leading-relaxed text-[#8C8C8C]">
              {item.myThoughts}
            </p>
          )}

          {item.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {item.tags.slice(0, compact ? 2 : 4).map((tag) => (
                <span key={tag} className="rounded-sm bg-[#1A1A1A]/[0.04] px-2 py-0.5 text-[11px] text-[#777]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#EAEAEA] pt-3">
            <div className="min-w-0">
              <StarRating rating={item.rating} />
              <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-[#9B948C]">
                <span>{item.timeToLearn}</span>
                <span>{formatRelativeDate(item.updatedAt)}</span>
                {item.pricing && item.pricing !== "unknown" && <span>{getPricingLabel(item.pricing)}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {item.verified && <CheckCircle2 size={13} className="text-[#6B9E7C]" />}
              {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="打开外部来源"
                className="text-[#8C8C8C] transition-colors duration-300 hover:text-[#8C6B42]"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={13} />
              </a>
            )}
            </div>
          </div>

          {item.status.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.status
                .filter((s) => s !== "public")
                .map((s) => (
                  <StatusBadge key={s} status={s} />
                ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
