import type { ReactNode } from "react";

interface DataStateProps {
  title?: string;
  detail?: string;
  action?: ReactNode;
}

export function LoadingState({ title = "正在读取资料库" }: DataStateProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="inline-flex h-8 w-8 animate-spin rounded-full border border-[#D1B48C]/20 border-t-[#D1B48C]" />
      <p className="mt-4 text-[13px] text-[#8C8C8C]">{title}</p>
    </div>
  );
}

export function ErrorState({
  title = "资料库暂时不可用",
  detail,
}: DataStateProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <h2 className="text-[18px] text-[#1A1A1A] mb-2">{title}</h2>
      {detail && <p className="text-[13px] text-[#8C8C8C]">{detail}</p>}
    </div>
  );
}

export function EmptyState({
  title = "这里还在整理",
  detail = "当前只展示已完成来源和隐私复核的精选内容，后续会从本地知识库继续补充。",
  action,
}: DataStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-[#D8D1C8] bg-white px-5 py-10 text-center">
      <h2 className="text-[16px] text-[#1A1A1A]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-[1.8] text-[#777]">{detail}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
