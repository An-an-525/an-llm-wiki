import { useParams, Link, Navigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";
import {
  getTypeLabel,
  getPricingLabel,
  getDifficultyLabel,
  getSourceReliabilityLabel,
  formatDate,
} from "@/lib/utils";
import { StatusBadge } from "@/components/filters/StatusBadge";
import { useArchiveData } from "@/lib/archive-api";
import { ErrorState, LoadingState } from "@/components/views/DataState";

export function LibraryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useArchiveData();
  const item = id ? data.getLibraryItemBySlug(id) : undefined;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  if (!item) {
    return <Navigate to="/library" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back Link */}
      <Link
        to="/library"
        className="inline-flex items-center gap-1.5 text-[12px] text-[#8C8C8C] hover:text-[#D1B48C] transition-colors duration-300 mb-8"
      >
        <ArrowLeft size={13} />
        <span>返回藏馆</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] tracking-wider text-[#8C8C8C] uppercase">
            {getTypeLabel(item.type)}
          </span>
          {item.verified && (
            <CheckCircle2 size={13} className="text-[#D1B48C]" />
          )}
        </div>

        <h1
          className="mb-4 text-[24px] font-normal text-[#1A1A1A] sm:text-[28px]"
        >
          {item.title}
        </h1>

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          {item.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < item.rating!
                      ? "fill-[#D1B48C] text-[#D1B48C]"
                      : "text-[#EAEAEA]"
                  }
                />
              ))}
            </div>
          )}
          {item.pricing && item.pricing !== "unknown" && (
            <span className="text-[12px] text-[#8C8C8C] px-2 py-0.5 bg-[#F7F5F2] rounded-full">
              {getPricingLabel(item.pricing)}
            </span>
          )}
          {item.difficulty && (
            <span className="text-[12px] text-[#8C8C8C]">
              难度：{getDifficultyLabel(item.difficulty)}
            </span>
          )}
          <span className="inline-flex items-center gap-1 text-[12px] text-[#8C8C8C]">
            <Clock3 size={12} />
            {item.timeToLearn}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#F7F5F2] px-2 py-0.5 text-[12px] text-[#8C6B42]">
            <ShieldCheck size={12} />
            {getSourceReliabilityLabel(item.sourceReliability)}
          </span>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] text-[#D1B48C] hover:text-[#B8956A] transition-colors"
            >
              <span>访问</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* Status */}
        <div className="flex flex-wrap gap-1.5">
          {item.status.map((s) => (
            <StatusBadge key={s} status={s} />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#F7F5F2] rounded-lg border border-[#EAEAEA] p-5 mb-6">
        <p className="text-[14px] text-[#1A1A1A] leading-relaxed">
          {item.summary}
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#EAEAEA] bg-white p-4">
          <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A]">
            <UserRound size={14} className="text-[#8C6B42]" />
            适合谁
          </h2>
          <p className="text-[13px] leading-relaxed text-[#666]">{item.whoFor}</p>
        </div>
        {item.recommendedFor && (
          <div className="rounded-lg border border-[#EAEAEA] bg-white p-4">
            <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A]">
              <Sparkles size={14} className="text-[#C8956C]" />
              推荐阅读场景
            </h2>
            <p className="text-[13px] leading-relaxed text-[#666]">{item.recommendedFor}</p>
          </div>
        )}
      </div>

      {/* Reason */}
      {item.reason && (
        <div className="mb-6">
          <h2 className="text-[13px] font-medium text-[#1A1A1A] mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-[#D1B48C]" />
            推荐理由
          </h2>
          <p className="text-[13px] text-[#666] leading-relaxed pl-5">
            {item.reason}
          </p>
        </div>
      )}

      {/* Note */}
      {(item.note || item.myThoughts) && (
        <div className="mb-6">
          <h2 className="text-[13px] font-medium text-[#1A1A1A] mb-2 flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500" />
            策展备注
          </h2>
          <p className="pl-5 text-[13px] leading-relaxed text-[#8C8C8C]">
            {item.myThoughts || item.note}
          </p>
          {item.note && item.myThoughts && (
            <p className="mt-2 pl-5 text-[12px] leading-relaxed text-[#B0A69A]">{item.note}</p>
          )}
        </div>
      )}

      {Boolean(item.pros?.length || item.cons?.length) && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          {item.pros && item.pros.length > 0 && (
            <div className="rounded-lg border border-[#EAEAEA] bg-white p-4">
              <h2 className="mb-2 text-[13px] font-medium text-[#1A1A1A]">适合先看的理由</h2>
              <ul className="space-y-1 text-[13px] leading-relaxed text-[#666]">
                {item.pros.map((pro) => (
                  <li key={pro}>- {pro}</li>
                ))}
              </ul>
            </div>
          )}
          {item.cons && item.cons.length > 0 && (
            <div className="rounded-lg border border-[#EAEAEA] bg-white p-4">
              <h2 className="mb-2 text-[13px] font-medium text-[#1A1A1A]">阅读前注意</h2>
              <ul className="space-y-1 text-[13px] leading-relaxed text-[#666]">
                {item.cons.map((con) => (
                  <li key={con}>- {con}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[13px] font-medium text-[#1A1A1A] mb-2">标签</h2>
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-[12px] px-3 py-1 bg-[#F7F5F2] border border-[#EAEAEA] text-[#8C8C8C] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {item.alternatives && item.alternatives.length > 0 && (
        <div className="mb-6">
          <h2 className="text-[13px] font-medium text-[#1A1A1A] mb-2">替代品</h2>
          <div className="flex flex-wrap gap-1.5">
            {item.alternatives.map((alt) => (
              <span
                key={alt}
                className="text-[12px] px-3 py-1 bg-[#F7F5F2] text-[#8C8C8C] rounded-full"
              >
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Dates */}
      <div className="pt-4 border-t border-[#EAEAEA] text-[11px] text-[#C4B9A8] flex items-center gap-3">
        <span>收录：{formatDate(item.createdAt)}</span>
        <span>更新：{formatDate(item.updatedAt)}</span>
      </div>
    </div>
  );
}
