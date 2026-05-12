import { type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Hash, Link2 } from "lucide-react";
import { useArchiveData } from "@/lib/archive-api";
import { ErrorState, LoadingState } from "@/components/views/DataState";
import { formatDate } from "@/lib/utils";

const wikilinkPattern = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|([^\]]+))?\]\]/g;

function anchorFor(title: string) {
  const anchor = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\u4e00-\u9fff]+/g, "");
  return anchor || "section";
}

function cleanInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(wikilinkPattern)) {
    if (match.index === undefined) continue;
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <span key={`${match.index}-${match[0]}`} className="text-[#8C6B42]">
        {match[2] || match[1]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

export function ContentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, loading, error } = useArchiveData();
  const item = slug ? data.getContentBySlug(slug) : undefined;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;
  if (!item) return <Navigate to="/library" replace />;

  const lines = item.contentLines?.length ? item.contentLines : [item.summary];
  const toc = (item.toc || [])
    .filter((entry) => entry.level >= 2 && entry.level <= 3)
    .slice(0, 12);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        to={item.module === "paths" ? "/paths" : item.module === "journal" ? "/journal" : "/library"}
        className="inline-flex items-center gap-1.5 text-[12px] text-[#8C8C8C] hover:text-[#B8956A] transition-colors duration-300 mb-8"
      >
        <ArrowLeft size={13} />
        <span>返回列表</span>
      </Link>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
        <article>
          <header className="mb-8 border-b border-[#EAEAEA] pb-8">
            <div className="text-[11px] text-[#B8956A] mb-3">
              {item.sourcePath || item.module}
            </div>
            <h1 className="text-[26px] sm:text-[34px] leading-[1.25] font-normal text-[#1A1A1A] mb-4">
              {item.title}
            </h1>
            <p className="text-[14px] text-[#666] leading-[1.9] max-w-3xl">
              {item.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-[#8C8C8C]">
              <span className="rounded-full bg-[#F7F5F2] px-2.5 py-1">
                更新：{formatDate(item.updatedAt)}
              </span>
              {item.readingMinutes && (
                <span className="rounded-full bg-[#F7F5F2] px-2.5 py-1">
                  约 {item.readingMinutes} 分钟
                </span>
              )}
              {item.metrics && (
                <span className="rounded-full bg-[#F7F5F2] px-2.5 py-1">
                  {item.metrics.linkCount} 个内部关联
                </span>
              )}
            </div>
          </header>

          <div className="space-y-3">
            {lines.map((line, index) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={index} className="h-2" />;
              if (trimmed.startsWith("### ")) {
                const title = trimmed.replace(/^###\s+/, "");
                return (
                  <h3
                    key={index}
                    id={anchorFor(title)}
                    className="scroll-mt-20 text-[16px] text-[#1A1A1A] mt-7 mb-2"
                  >
                    {cleanInline(title)}
                  </h3>
                );
              }
              if (trimmed.startsWith("## ")) {
                const title = trimmed.replace(/^##\s+/, "");
                return (
                  <h2
                    key={index}
                    id={anchorFor(title)}
                    className="scroll-mt-20 text-[20px] text-[#1A1A1A] mt-9 mb-3"
                  >
                    {cleanInline(title)}
                  </h2>
                );
              }
              if (trimmed.startsWith("# ")) {
                return null;
              }
              if (trimmed.startsWith("- ")) {
                return (
                  <div key={index} className="flex gap-2 text-[13px] text-[#555] leading-[1.9]">
                    <span className="mt-[0.72em] h-1 w-1 rounded-full bg-[#C4B9A8] shrink-0" />
                    <p>{cleanInline(trimmed.replace(/^-\s+/, ""))}</p>
                  </div>
                );
              }
              return (
                <p key={index} className="text-[14px] text-[#2F2F2F] leading-[1.95]">
                  {cleanInline(trimmed)}
                </p>
              );
            })}
          </div>

          <footer className="mt-10 pt-5 border-t border-[#EAEAEA] text-[11px] text-[#8C8C8C] flex flex-wrap gap-3">
            <span>创建：{formatDate(item.createdAt)}</span>
            <span>更新：{formatDate(item.updatedAt)}</span>
            {item.sources?.slice(0, 4).map((source) => (
              <span key={source}>{source}</span>
            ))}
          </footer>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            {toc.length > 0 && (
              <section className="rounded-lg border border-[#EAEAEA] bg-white p-4">
                <div className="flex items-center gap-2 text-[12px] text-[#1A1A1A] mb-3">
                  <Hash size={13} />
                  <span>目录</span>
                </div>
                <nav className="space-y-2">
                  {toc.map((entry) => (
                    <a
                      key={`${entry.anchor}-${entry.title}`}
                      href={`#${entry.anchor}`}
                      className="block text-[12px] leading-[1.5] text-[#777] hover:text-[#B8956A]"
                      style={{ paddingLeft: entry.level === 3 ? 12 : 0 }}
                    >
                      {entry.title}
                    </a>
                  ))}
                </nav>
              </section>
            )}

            <section className="rounded-lg border border-[#EAEAEA] bg-white p-4">
              <div className="flex items-center gap-2 text-[12px] text-[#1A1A1A] mb-3">
                <BookOpen size={13} />
                <span>来源与质量</span>
              </div>
              <div className="space-y-2 text-[12px] text-[#777]">
                <div>来源数：{item.metrics?.sourceCount ?? item.sources?.length ?? 0}</div>
                <div>标题数：{item.metrics?.headingCount ?? toc.length}</div>
                <div>状态：{item.quality?.needsSourceReview ? "待来源复核" : "公开展示"}</div>
              </div>
            </section>

            {item.links && item.links.length > 0 && (
              <section className="rounded-lg border border-[#EAEAEA] bg-white p-4">
                <div className="flex items-center gap-2 text-[12px] text-[#1A1A1A] mb-3">
                  <Link2 size={13} />
                  <span>内部关联</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.links.slice(0, 12).map((link) => (
                    <span
                      key={`${link.target}-${link.label}`}
                      className="rounded-full bg-[#F7F5F2] px-2 py-1 text-[11px] text-[#777]"
                    >
                      {link.label}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
