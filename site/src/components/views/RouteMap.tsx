import { CheckCircle2, AlertTriangle, ChevronRight, BookOpen } from "lucide-react";
import type { PathItem } from "@/lib/types";
import { useArchiveData } from "@/lib/archive-api";
import { Link } from "react-router-dom";

interface RouteMapProps {
  path: PathItem;
}

export function RouteMap({ path }: RouteMapProps) {
  const { data } = useArchiveData();
  return (
    <div className="relative">
      {/* Center Line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-[#EAEAEA]" />

      <div className="space-y-6">
        {path.steps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Step Number */}
            <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-[#FFFDFB] border-2 border-[#D1B48C] flex items-center justify-center z-10">
              <span className="text-[13px] font-medium text-[#D1B48C]">
                {index + 1}
              </span>
            </div>

            {/* Content Card */}
            <div className="ml-14">
              <div className="bg-[#F7F5F2] rounded-lg border border-[#EAEAEA] p-5">
                {/* Title + Optional Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-[15px] font-medium text-[#1A1A1A]">
                    {step.title}
                  </h4>
                  {step.optional && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#F0EDE8] text-[#8C8C8C] rounded-full">
                      可选
                    </span>
                  )}
                </div>

                {/* Goal */}
                <p className="text-[13px] text-[#D1B48C] mb-3 font-medium">
                  目标：{step.goal}
                </p>

                {/* Description */}
                <p className="text-[13px] text-[#666] leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Notes */}
                {step.notes && (
                  <div className="flex items-start gap-2 mb-4 bg-[#FFFDFB] rounded-md p-3 border border-[#EAEAEA]">
                    <BookOpen size={13} className="text-[#D1B48C] mt-0.5 shrink-0" />
                    <p className="text-[12px] text-[#8C8C8C] leading-relaxed italic">
                      {step.notes}
                    </p>
                  </div>
                )}

                {/* Completion Criteria */}
                <div className="flex items-start gap-2 mb-4">
                  <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-[12px] text-[#666] leading-relaxed">
                    <span className="text-[#8C8C8C]">完成标准：</span>
                    {step.completion}
                  </p>
                </div>

                {/* Related Resources */}
                {step.resources.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] text-[#8C8C8C]">关联资源：</span>
                    {step.resources.map((resourceId) => {
                      const resource = data.getLibraryItemById(resourceId);
                      if (!resource) return null;
                      return (
                        <Link
                          key={resourceId}
                          to={`/library/${resource.slug}`}
                          className="text-[11px] px-2 py-0.5 bg-[#D1B48C]/10 text-[#B8956A] rounded-full hover:bg-[#D1B48C]/20 transition-colors"
                        >
                          {resource.title}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Pitfalls */}
                {step.pitfalls && step.pitfalls.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#EAEAEA]">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle size={11} className="text-amber-500" />
                      <span className="text-[11px] text-[#8C8C8C]">注意</span>
                    </div>
                    {step.pitfalls.map((pitfall, idx) => (
                      <p key={idx} className="text-[11px] text-[#8C8C8C] leading-relaxed ml-4">
                        · {pitfall}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Final Output */}
      <div className="mt-8 ml-14">
        <div className="bg-gradient-to-br from-[#D1B48C]/10 to-[#D1B48C]/5 rounded-lg border border-[#D1B48C]/20 p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={16} className="text-[#D1B48C]" />
            <h4 className="text-[15px] font-medium text-[#1A1A1A]">
              最终成果
            </h4>
          </div>
          <p className="text-[13px] text-[#666] leading-relaxed">
            {path.finalOutput}
          </p>
        </div>
      </div>

      {/* Common Pitfalls */}
      {path.commonPitfalls && path.commonPitfalls.length > 0 && (
        <div className="mt-6 ml-14">
          <div className="bg-[#FFFDFB] rounded-lg border border-[#EAEAEA] p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-500" />
              <h4 className="text-[14px] font-medium text-[#1A1A1A]">
                常见坑
              </h4>
            </div>
            <div className="space-y-2">
              {path.commonPitfalls.map((pitfall, idx) => (
                <p key={idx} className="text-[12px] text-[#8C8C8C] leading-relaxed">
                  {idx + 1}. {pitfall}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next Steps */}
      {path.nextSteps && path.nextSteps.length > 0 && (
        <div className="mt-6 ml-14">
          <div className="bg-[#F7F5F2] rounded-lg border border-[#EAEAEA] p-5">
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight size={14} className="text-[#8C8C8C]" />
              <h4 className="text-[14px] font-medium text-[#1A1A1A]">
                进阶方向
              </h4>
            </div>
            <div className="space-y-2">
              {path.nextSteps.map((step, idx) => (
                <p key={idx} className="text-[12px] text-[#8C8C8C] leading-relaxed">
                  {idx + 1}. {step}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
