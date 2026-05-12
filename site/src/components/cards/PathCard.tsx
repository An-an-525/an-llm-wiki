import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Compass,
  FileText,
  ListChecks,
  Target,
  Users,
} from "lucide-react";
import type { PathItem } from "@/lib/types";
import { truncate } from "@/lib/utils";

interface PathCardProps {
  item: PathItem;
  featured?: boolean;
  index?: number;
}

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const difficultyConfig: Record<
  PathItem["difficulty"],
  { className: string; label: string; accent: string; marker: string }
> = {
  beginner: {
    className: "bg-[#E8F0EB] text-[#4F7D5E]",
    label: "入门",
    accent: "#6B9E7C",
    marker: "从零开始",
  },
  intermediate: {
    className: "bg-[#F5EDE8] text-[#8C6B42]",
    label: "进阶",
    accent: "#C8956C",
    marker: "需要一点背景",
  },
  advanced: {
    className: "bg-[#F0DDD8] text-[#A85F52]",
    label: "高级",
    accent: "#C47D6E",
    marker: "适合深挖",
  },
};

function readiness(item: PathItem) {
  if (item.quality?.needsSourceReview) {
    return {
      label: "待补来源",
      className: "bg-[#F2F2F0] text-silver",
      dot: "bg-status-todo",
    };
  }
  if (item.status.includes("featured")) {
    return {
      label: "精选路线",
      className: "bg-status-active text-white",
      dot: "bg-status-active",
    };
  }
  if (item.status.includes("recommended")) {
    return {
      label: "推荐阅读",
      className: "bg-[#E8F0EB] text-[#4F7D5E]",
      dot: "bg-status-done",
    };
  }
  return {
    label: "公开路线",
    className: "bg-[#F2F2F0] text-graphite",
    dot: "bg-light-silver",
  };
}

function structureScore(item: PathItem) {
  const base = item.steps.length > 0 ? 40 : 20;
  const stepScore = Math.min(item.steps.length * 10, 35);
  const sourceScore = item.sources && item.sources.length > 0 ? 15 : 0;
  const outputScore = item.finalOutput ? 10 : 0;
  return Math.min(base + stepScore + sourceScore + outputScore, 100);
}

export function PathCard({ item, featured = false, index = 0 }: PathCardProps) {
  const difficulty = difficultyConfig[item.difficulty] ?? difficultyConfig.intermediate;
  const state = readiness(item);
  const score = structureScore(item);
  const steps = item.steps.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.35, ease: easeOut, delay: Math.min(index * 0.04, 0.24) }}
      className="h-full"
    >
      <Link
        to={`/paths/${item.slug}`}
        className={`group flex h-full flex-col overflow-hidden rounded-xl border border-border-color bg-white shadow-sm transition-all duration-300 hover:border-border-dark hover:shadow-md ${
          featured ? "ring-1 ring-status-active/20" : ""
        }`}
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-cream">
          {item.cover ? (
            <img
              src={item.cover}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${difficulty.className}`}>
                  {difficulty.label}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${state.className}`}>
                  {state.label}
                </span>
              </div>
              <div>
                <Compass
                  size={26}
                  strokeWidth={1.4}
                  className="mb-3 text-status-active"
                />
                <p className="text-[12px] leading-relaxed text-silver">
                  {difficulty.marker} · {item.steps.length || 1} 个路线节点
                </p>
              </div>
            </div>
          )}
          {item.cover && (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${difficulty.className}`}>
                  {difficulty.label}
                </span>
              </div>
              <div className="absolute right-3 top-3">
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${state.className}`}>
                  {state.label}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-5">
          <h3 className="font-serif text-[18px] leading-snug text-ink transition-colors duration-200 group-hover:text-favorite">
            {item.title}
          </h3>
          <p className="mt-2 min-h-[44px] text-[13px] leading-relaxed text-silver">
            {truncate(item.summary, 94)}
          </p>

          <div className="mt-4 space-y-2.5 text-[12px] text-graphite">
            <div className="flex items-start gap-2">
              <Target size={13} strokeWidth={1.5} className="mt-1 shrink-0 text-status-active" />
              <span>{truncate(item.goal || item.summary, 58)}</span>
            </div>
            <div className="flex items-start gap-2">
              <Users size={13} strokeWidth={1.5} className="mt-1 shrink-0 text-status-active" />
              <span>{truncate(item.audience, 58)}</span>
            </div>
            <div className="flex items-center gap-2 text-silver">
              <Clock size={13} strokeWidth={1.5} className="shrink-0" />
              <span>{item.estimatedTime}</span>
            </div>
          </div>

          {steps.length > 0 && (
            <div className="mt-4 space-y-2 rounded-lg bg-cream p-3">
              {steps.map((step, stepIndex) => (
                <div key={step.id} className="flex items-start gap-2 text-[12px]">
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                    style={{ backgroundColor: difficulty.accent }}
                  >
                    {stepIndex + 1}
                  </span>
                  <span className="min-w-0 truncate text-graphite">{step.title}</span>
                </div>
              ))}
              {item.steps.length > steps.length && (
                <p className="pl-6 text-[11px] text-silver">
                  还有 {item.steps.length - steps.length} 个节点
                </p>
              )}
            </div>
          )}

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-silver">
              <span className="flex items-center gap-1">
                <ListChecks size={11} strokeWidth={1.5} />
                路线结构
              </span>
              <span>{score}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-light-gray">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: difficulty.accent }}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.7, ease: easeOut, delay: 0.12 }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {item.prerequisites.slice(0, 3).map((pre) => (
              <span key={pre} className="rounded bg-light-gray px-2 py-0.5 text-[11px] text-silver">
                {pre}
              </span>
            ))}
            {item.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded bg-light-pink px-2 py-0.5 text-[11px] text-graphite">
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-[#F0F0EE] pt-4">
            <span className="flex min-w-0 items-center gap-1.5 text-[11px] text-silver">
              <FileText size={12} strokeWidth={1.5} className="shrink-0" />
              <span className="truncate">{truncate(item.finalOutput, 32)}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-[12px] text-status-active opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              查看
              <ArrowRight size={13} strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
