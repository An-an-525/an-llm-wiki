import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Clock,
  Database,
  Github,
  PenLine,
  Route,
  ShieldCheck,
  Sparkles,
  Wind,
  Wrench,
} from "lucide-react";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { useArchiveData } from "@/lib/archive-api";
import { ErrorState, LoadingState } from "@/components/views/DataState";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const moduleRows: {
  icon: IconType;
  title: string;
  text: string;
  href: string;
}[] = [
  {
    icon: BookOpen,
    title: "藏馆",
    text: "公开资源、工具、项目、资料与知识条目。",
    href: "/library",
  },
  {
    icon: Route,
    title: "谱系",
    text: "学习路径、复刻路线和主题地图。",
    href: "/paths",
  },
  {
    icon: Wind,
    title: "风信",
    text: "经过来源判断的信息流和最近收录。",
    href: "/feed",
  },
  {
    icon: Wrench,
    title: "工坊",
    text: "公开项目、系统原型和维护成果。",
    href: "/works",
  },
  {
    icon: PenLine,
    title: "手记",
    text: "能公开的复盘、整理记录和开发过程。",
    href: "/journal",
  },
  {
    icon: Clock,
    title: "年谱",
    text: "公开资料库和项目的阶段时间线。",
    href: "/timeline",
  },
];

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border-color bg-white p-3">
      <p className="text-[12px] text-silver">{label}</p>
      <p className="mt-1 font-serif text-[24px] leading-none text-ink">{value}</p>
    </div>
  );
}

function ModuleRow({
  icon: Icon,
  title,
  text,
  href,
}: {
  icon: IconType;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="group flex items-start gap-3 rounded-xl border border-border-color bg-white p-4 transition-all duration-200 hover:border-border-dark hover:shadow-sm"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-light-pink text-status-active">
        <Icon width={15} height={15} strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-[14px] font-medium text-graphite">{title}</h3>
          <ArrowRight
            size={13}
            strokeWidth={1.5}
            className="text-light-silver opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-silver">{text}</p>
      </div>
    </Link>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      className="border-t border-border-color pt-8"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <h2 className="mb-4 font-serif text-[22px] text-ink">{title}</h2>
      {children}
    </motion.section>
  );
}

export function AboutPage() {
  const { data, loading, error } = useArchiveData();
  const { about, counts, curation } = data;

  if (loading) return <LoadingState />;
  if (error) return <ErrorState detail={error} />;

  return (
    <div className="min-h-[100dvh] bg-white">
      <section className="pb-8 pt-[96px] md:pt-[128px]">
        <div className="mx-auto max-w-[840px] px-5 md:px-12">
          <motion.div
            className="mb-5 flex items-center gap-2 text-[12px] text-silver"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <Sparkles size={14} strokeWidth={1.5} className="text-status-active" />
            About an-llm-wiki
          </motion.div>
          <motion.h1
            className="mb-5 font-serif text-[32px] font-normal leading-tight text-ink md:text-[42px]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
          >
            一个公开安全的个人资料库展示层
          </motion.h1>
          <motion.p
            className="max-w-2xl text-[15px] leading-[1.9] text-silver"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.16 }}
          >
            {about.summary}
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-[840px] px-5 pb-16 md:px-12">
        <motion.div
          className="mb-10 rounded-xl bg-light-pink p-4 md:p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.22 }}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/70">
              <ShieldCheck size={16} strokeWidth={1.5} className="text-status-active" />
            </div>
            <p className="text-[13px] leading-relaxed text-silver">
              本站只展示通过隐私和来源复核的公开编译层。个人资料、密钥线索、本地路径、原始会话和未审查导入不会进入前端数据包。
            </p>
          </div>
        </motion.div>

        <div className="mb-12 grid gap-3 sm:grid-cols-4">
          <StatCard label="精选内容" value={counts.content || 0} />
          <StatCard label="藏品" value={counts.library || 0} />
          <StatCard label="谱系" value={counts.paths || 0} />
          <StatCard label="复核队列" value={curation.reviewQueue || 0} />
        </div>

        <div className="space-y-10">
          <Section title="这个站是什么">
            <div className="space-y-3 text-[14px] leading-[1.9] text-graphite">
              <p>
                它不是普通博客，也不是简单资源导航站。它是一座个人公开藏馆，用来把资料、工具、路线、项目和维护记录整理成小白也能阅读的展示系统。
              </p>
              <p>
                当前前端只读取 `site-data/index.json`，这个数据包由 Obsidian 公开 wiki 编译生成。前端不会直接读取本地 vault，也不会接触私有原始资料。
              </p>
            </div>
          </Section>

          <Section title="内容如何组织">
            <div className="grid gap-3 sm:grid-cols-2">
              {moduleRows.map((row) => (
                <ModuleRow key={row.title} {...row} />
              ))}
            </div>
          </Section>

          <Section title="数据从哪里来">
            <div className="rounded-xl border border-border-color bg-cream p-5">
              <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-graphite">
                <Database size={15} strokeWidth={1.5} className="text-status-active" />
                Obsidian 编译后端
              </div>
              <p className="text-[14px] leading-[1.9] text-silver">
                原始资料先进入本地私有层，经过筛选、脱敏、来源复核和新手化改写后，才会提升到公开 wiki，再由脚本生成站点数据。展示层负责把这些高质量条目变成可导航、可搜索、可筛选的前端页面。
              </p>
            </div>
          </Section>

          <Section title="发布边界">
            <div className="grid gap-3 sm:grid-cols-2">
              {curation.rules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-lg border border-border-color bg-white p-4 text-[13px] leading-relaxed text-silver"
                >
                  {rule}
                </div>
              ))}
            </div>
          </Section>

          <Section title="后续如何补数据">
            <ol className="space-y-3">
              {curation.nextImportWorkflow.map((step, index) => (
                <li key={step} className="flex gap-3 text-[13px] leading-[1.8] text-graphite">
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-light-pink text-[11px] text-[#8C6B42]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-[12px] leading-[1.8] text-silver">
              当前质量清单：{curation.qualityManifest}
            </p>
          </Section>

          <Section title="公开仓库">
            <a
              href="https://github.com/An-an-525/an-llm-wiki"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-lg border border-border-color bg-white px-4 py-2 text-[13px] text-graphite transition-all duration-200 hover:border-border-dark hover:shadow-sm"
            >
              <Github size={15} strokeWidth={1.5} />
              GitHub: an-llm-wiki
              <ArrowRight
                size={13}
                strokeWidth={1.5}
                className="text-light-silver transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </a>
          </Section>
        </div>
      </div>
    </div>
  );
}
