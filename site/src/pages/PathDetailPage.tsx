import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Target,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react";
import { getDifficultyLabel } from "@/lib/utils";
import { PathRouteMap } from "@/components/views/ModuleRenderer";
import { useArchiveData } from "@/lib/archive-api";
import { ErrorState, LoadingState } from "@/components/views/DataState";

export function PathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error } = useArchiveData();
  const path = id ? data.getPathItemBySlug(id) : undefined;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  if (!path) {
    return <Navigate to="/paths" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back */}
      <Link
        to="/paths"
        className="inline-flex items-center gap-1.5 text-[12px] text-[#8C8C8C] hover:text-[#D1B48C] transition-colors duration-300 mb-8"
      >
        <ArrowLeft size={13} />
        <span>返回谱系</span>
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              path.difficulty === "beginner"
                ? "bg-emerald-50 text-emerald-600"
                : path.difficulty === "intermediate"
                ? "bg-amber-50 text-amber-600"
                : "bg-rose-50 text-rose-600"
            }`}
          >
            {getDifficultyLabel(path.difficulty)}
          </span>
          {path.status.includes("featured") && (
            <span className="text-[11px] px-2 py-0.5 bg-[#D1B48C]/10 text-[#B8956A] rounded-full">
              精选
            </span>
          )}
        </div>

        <h1
          className="text-[24px] sm:text-[30px] font-normal text-[#1A1A1A] mb-4"
         
        >
          {path.title}
        </h1>

        <p className="text-[14px] text-[#8C8C8C] leading-relaxed mb-6 max-w-2xl">
          {path.summary}
        </p>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 bg-[#F7F5F2] rounded-lg border border-[#EAEAEA]">
            <Target size={14} className="text-[#D1B48C] shrink-0" />
            <div>
              <span className="text-[11px] text-[#8C8C8C] block">目标</span>
              <span className="text-[12px] text-[#1A1A1A]">{path.goal}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#F7F5F2] rounded-lg border border-[#EAEAEA]">
            <Users size={14} className="text-[#D1B48C] shrink-0" />
            <div>
              <span className="text-[11px] text-[#8C8C8C] block">适合</span>
              <span className="text-[12px] text-[#1A1A1A]">
                {path.audience}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#F7F5F2] rounded-lg border border-[#EAEAEA]">
            <Clock size={14} className="text-[#D1B48C] shrink-0" />
            <div>
              <span className="text-[11px] text-[#8C8C8C] block">预计</span>
              <span className="text-[12px] text-[#1A1A1A]">
                {path.estimatedTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {path.prerequisites.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[14px] font-medium text-[#1A1A1A] mb-3 flex items-center gap-1.5">
            <ChevronRight size={14} className="text-[#D1B48C]" />
            前置条件
          </h2>
          <div className="flex flex-wrap gap-2">
            {path.prerequisites.map((pre, idx) => (
              <span
                key={idx}
                className="text-[12px] px-3 py-1.5 bg-[#F7F5F2] border border-[#EAEAEA] text-[#666] rounded-full"
              >
                {pre}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {path.tags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-1.5">
            {path.tags.map((tag) => (
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

      {/* Route Map */}
      <div className="mb-10">
        <h2
          className="text-[20px] font-normal text-[#1A1A1A] mb-8"
         
        >
          路径路线图
        </h2>
        <PathRouteMap path={path} />
      </div>

      {/* Alternatives */}
      {path.alternatives && path.alternatives.length > 0 && (
        <div className="mt-10 pt-6 border-t border-[#EAEAEA]">
          <h2 className="text-[14px] font-medium text-[#1A1A1A] mb-3">
            替代路线
          </h2>
          <div className="flex flex-wrap gap-2">
            {path.alternatives.map((alt, idx) => (
              <span
                key={idx}
                className="text-[12px] px-3 py-1 bg-[#F7F5F2] text-[#8C8C8C] rounded-full"
              >
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
