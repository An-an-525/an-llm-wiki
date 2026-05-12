import { ArrowUpRight, ExternalLink, Github, Lightbulb, Route } from "lucide-react";
import { motion } from "framer-motion";
import type { WorkItem } from "@/lib/types";
import { getProjectStatusLabel, getWorkTypeLabel, truncate } from "@/lib/utils";

const coverImages: Record<string, string> = {
  "personal-archive": "/images/cover-library.jpg",
  "ambient-timer": "/images/cover-journal.jpg",
  "3d-gallery-experiment": "/images/cover-paths.jpg",
  "obsidian-sync-tool": "/images/cover-works.jpg",
  "design-system-wip": "/images/cover-works.jpg",
  "typing-practice-app": "/images/cover-journal.jpg",
};

const statusStyles: Record<string, string> = {
  idea: "bg-light-gray text-silver",
  building: "bg-[#FDF6F0] text-[#C8956C]",
  online: "bg-[#F0F7F2] text-[#6B9E7C]",
  maintaining: "bg-[#EEF3F5] text-[#5C7C89]",
  paused: "bg-light-gray text-silver",
  archived: "bg-light-gray text-silver",
};

const typeStyles: Record<string, string> = {
  website: "bg-[#E8EBF0]",
  tool: "bg-[#F0EDE5]",
  video: "bg-[#F5EDE8]",
  "mini-app": "bg-[#E8F0EB]",
  course: "bg-[#F0EDE5]",
  "open-source": "bg-[#E8EBF0]",
  prototype: "bg-[#F5EDE8]",
  experiment: "bg-[#F0EDE5]",
};

interface WorkCardProps {
  item: WorkItem;
  index?: number;
}

export function WorkCard({ item, index = 0 }: WorkCardProps) {
  const cover = coverImages[item.slug] || "/images/cover-works.jpg";
  const statusClass = statusStyles[item.projectStatus] || statusStyles.archived;
  const typeClass = typeStyles[item.type] || "bg-light-gray";

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0, 0, 0.2, 1], delay: index * 0.06 }}
    >
      <article className="card-tap flex h-full cursor-default flex-col overflow-hidden rounded-xl border border-border-color bg-white transition-all duration-250 hover:-translate-y-0.5 hover:border-border-dark hover:shadow-lg">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={cover}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-black/55 to-transparent p-5 md:block">
            <h3 className="text-[16px] font-medium text-white">{item.title}</h3>
            <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-white/80">{item.summary}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span className={`rounded px-2 py-0.5 text-[11px] text-graphite ${typeClass}`}>
              {getWorkTypeLabel(item.type)}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${statusClass}`}>
              {getProjectStatusLabel(item.projectStatus)}
            </span>
            {item.relatedPath && (
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-status-active">
                <Route size={11} strokeWidth={1.5} />
                路径作品
              </span>
            )}
          </div>

          <h3 className="mb-1.5 text-[16px] font-medium leading-[1.5] text-graphite transition-colors duration-200 group-hover:text-ink">
            <span className="inline-flex items-center gap-1.5">
              {item.title}
              <ArrowUpRight size={14} className="text-light-silver opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </span>
          </h3>

          <p className="mb-3 line-clamp-2 text-[13px] leading-[1.7] text-silver">
            {truncate(item.summary, 110)}
          </p>

          {item.nextPlan && (
            <div className="mb-3 flex items-start gap-1.5 rounded-lg bg-[#F0F7F2] px-2.5 py-1.5 text-[12px] text-graphite">
              <Lightbulb size={12} strokeWidth={1.5} className="mt-0.5 shrink-0 text-[#6B9E7C]" />
              <span className="line-clamp-1">下一步：{item.nextPlan}</span>
            </div>
          )}

          {item.techStack && item.techStack.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {item.techStack.slice(0, 5).map((tech) => (
                <span key={tech} className="rounded bg-cream px-2 py-0.5 text-[11px] text-silver">
                  {tech}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-border-color pt-3">
            <span className="text-[11px] text-light-silver">{item.updatedAt}</span>
            <div className="flex items-center gap-1">
              {item.githubUrl && (
                <a
                  href={item.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border-color text-silver transition-all duration-150 hover:border-border-dark hover:bg-cream hover:text-graphite"
                  onClick={(event) => event.stopPropagation()}
                  aria-label="GitHub"
                >
                  <Github size={14} strokeWidth={1.5} />
                </a>
              )}
              {item.demoUrl && (
                <a
                  href={item.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border-color text-silver transition-all duration-150 hover:border-border-dark hover:bg-cream hover:text-graphite"
                  onClick={(event) => event.stopPropagation()}
                  aria-label="外部链接"
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>
        </div>
      </article>
    </motion.div>
  );
}
