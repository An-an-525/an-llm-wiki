import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  ExternalLink,
  Globe,
  Wrench,
  Video,
  Layers,
  BookOpen,
  Code2,
  Cpu,
  FlaskConical,
  X,
  Inbox,
  Clock,
  Users,
  AlertTriangle,
  Lightbulb,
  Route,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { works } from '@/data/mockWorks';
import type { Work } from '@/types';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Type inference                                                     */
/* ------------------------------------------------------------------ */

type WorkType = 'all' | 'website' | 'tool' | 'video' | 'miniapp' | 'resource' | 'opensource' | 'prototype' | 'experiment';
type WorkStatus = 'all' | 'in_progress' | 'completed' | 'archived';

function inferWorkType(work: Work): WorkType {
  const stack = work.techStack.join(' ').toLowerCase();
  const title = work.title.toLowerCase();
  if (title.includes('笔记') || title.includes('api') || stack.includes('cli') || stack.includes('node.js')) return 'tool';
  if (stack.includes('electron') || stack.includes('react native') || title.includes('应用')) return 'miniapp';
  if (stack.includes('three.js') || stack.includes('glsl') || stack.includes('css') || title.includes('实验')) return 'experiment';
  if (stack.includes('next.js') || title.includes('博客') || title.includes('网站') || title.includes('作品集') || title.includes('藏馆')) return 'website';
  return 'website';
}

const typeFilters: { key: WorkType; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '全部', icon: <Layers size={13} strokeWidth={1.5} /> },
  { key: 'website', label: '网站', icon: <Globe size={13} strokeWidth={1.5} /> },
  { key: 'tool', label: '工具', icon: <Wrench size={13} strokeWidth={1.5} /> },
  { key: 'video', label: '视频', icon: <Video size={13} strokeWidth={1.5} /> },
  { key: 'miniapp', label: '小程序', icon: <Cpu size={13} strokeWidth={1.5} /> },
  { key: 'resource', label: '资料包', icon: <BookOpen size={13} strokeWidth={1.5} /> },
  { key: 'opensource', label: '开源项目', icon: <Code2 size={13} strokeWidth={1.5} /> },
  { key: 'prototype', label: '系统原型', icon: <Cpu size={13} strokeWidth={1.5} /> },
  { key: 'experiment', label: '实验作品', icon: <FlaskConical size={13} strokeWidth={1.5} /> },
];

const statusFilters: { key: WorkStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'archived', label: '已归档' },
];

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  in_progress: { label: '进行中', bg: 'bg-[#FDF6F0]', text: 'text-[#C8956C]' },
  completed: { label: '已完成', bg: 'bg-[#F0F7F2]', text: 'text-[#6B9E7C]' },
  archived: { label: '已归档', bg: 'bg-light-gray', text: 'text-silver' },
};

const typeBadgeConfig: Record<string, { label: string; bg: string }> = {
  website: { label: '网站', bg: 'bg-[#E8EBF0]' },
  tool: { label: '工具', bg: 'bg-[#F0EDE5]' },
  video: { label: '视频', bg: 'bg-[#F5EDE8]' },
  miniapp: { label: '小程序', bg: 'bg-[#E8F0EB]' },
  resource: { label: '资料包', bg: 'bg-[#F0DDD8]' },
  opensource: { label: '开源项目', bg: 'bg-[#E8EBF0]' },
  prototype: { label: '系统原型', bg: 'bg-[#F5EDE8]' },
  experiment: { label: '实验作品', bg: 'bg-[#F0EDE5]' },
};

/* ------------------------------------------------------------------ */
/*  Page Guide                                                         */
/* ------------------------------------------------------------------ */

function PageGuide() {
  return (
    <motion.div
      className="bg-[#F5EDE8] rounded-xl p-4 md:p-5 mb-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.25 }}
    >
      <p className="text-[13px] font-sans text-silver leading-relaxed">
        工坊展示我的作品、项目与实验。每件作品都记录了开发周期、技术选型、遇到的挑战与收获。
        点击卡片可展开查看完整详情。
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

function useStats(allWorks: Work[]) {
  return useMemo(() => {
    const total = allWorks.length;
    const completed = allWorks.filter((w) => w.status === 'completed').length;
    const inProgress = allWorks.filter((w) => w.status === 'in_progress').length;
    const archived = allWorks.filter((w) => w.status === 'archived').length;
    return { total, completed, inProgress, archived };
  }, [allWorks]);
}

/* ------------------------------------------------------------------ */
/*  Work Card                                                          */
/* ------------------------------------------------------------------ */

function WorkCard({
  work,
  index,
  isExpanded,
  onToggle,
}: {
  work: Work & { inferredType: WorkType };
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cfg = statusConfig[work.status] || statusConfig.completed;
  const typeCfg = typeBadgeConfig[work.inferredType || 'website'] || typeBadgeConfig.website;

  const formattedDate = useMemo(() => {
    try {
      return format(new Date(work.createdAt), 'yyyy年M月', { locale: zhCN });
    } catch {
      return '';
    }
  }, [work.createdAt]);

  const duration = work.duration;
  const teamSize = work.teamSize;
  const challenges = work.challenges;
  const learnings = work.learnings;
  const relatedPathIds = work.relatedPathIds ?? [];
  const relatedJournalIds = work.relatedJournalIds ?? [];

  return (
    <motion.div
      className="group"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut, delay: index * 0.08 }}
      layout
    >
      <div
        className="bg-white rounded-xl border border-border-color overflow-hidden transition-all duration-250 hover:shadow-lg hover:-translate-y-0.5 hover:border-border-dark cursor-pointer card-tap"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onToggle}
      >
        {/* Cover Image */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={work.cover || '/work-portfolio.jpg'}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.05]"
            loading="lazy"
          />
          {/* Hover overlay - desktop only */}
          <div className="hidden md:block">
            <AnimatePresence>
              {hovered && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <motion.h3
                    className="text-white text-[16px] font-sans font-medium mb-1"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.25, ease: easeOut, delay: 0.05 }}
                  >
                    {work.title}
                  </motion.h3>
                  <motion.p
                    className="text-white/80 text-[12px] font-sans font-normal line-clamp-2 leading-relaxed"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.25, ease: easeOut, delay: 0.1 }}
                  >
                    {work.description}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-[11px] font-sans font-normal ${typeCfg.bg} text-graphite`}>
              {typeCfg.label}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-normal ${cfg.bg} ${cfg.text}`}>
              {cfg.label}
            </span>
            {/* Journey label */}
            {relatedPathIds.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[#C8956C] ml-auto">
                <Route size={11} strokeWidth={1.5} />
                学习路径作品
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[16px] font-sans font-medium text-graphite leading-[1.5] mb-1.5 group-hover:text-ink transition-colors duration-200">
            {work.title}
          </h3>

          {/* Description */}
          <p className="text-[13px] font-sans font-normal text-silver leading-[1.7] line-clamp-2 mb-3">
            {work.description}
          </p>

          {/* Duration & Team */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[12px] text-silver">
            {duration && (
              <span className="flex items-center gap-1">
                <Clock size={12} strokeWidth={1.5} />
                开发周期：{duration}
              </span>
            )}
            {teamSize && (
              <span className="flex items-center gap-1">
                <Users size={12} strokeWidth={1.5} />
                团队：{teamSize}
              </span>
            )}
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {work.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded text-[11px] font-sans font-normal bg-cream text-silver"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Challenge & Learnings (one line each) */}
          {challenges && (
            <div className="flex items-start gap-1.5 text-[12px] text-graphite mb-1.5 bg-[#FDF6F0] rounded-lg px-2.5 py-1.5">
              <AlertTriangle size={12} strokeWidth={1.5} className="text-[#C8956C] mt-0.5 shrink-0" />
              <span className="line-clamp-1">最大的挑战：{challenges}</span>
            </div>
          )}
          {learnings && (
            <div className="flex items-start gap-1.5 text-[12px] text-graphite mb-3 bg-[#F0F7F2] rounded-lg px-2.5 py-1.5">
              <Lightbulb size={12} strokeWidth={1.5} className="text-[#6B9E7C] mt-0.5 shrink-0" />
              <span className="line-clamp-1">收获：{learnings}</span>
            </div>
          )}

          {/* Footer: date + links */}
          <div className="flex items-center justify-between pt-3 border-t border-border-color">
            <span className="text-[11px] font-sans text-light-silver">{formattedDate}</span>
            <div className="flex items-center gap-1">
              {work.github && (
                <a
                  href={work.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-border-color text-silver hover:text-graphite hover:bg-cream hover:border-border-dark transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="GitHub"
                >
                  <Github size={14} strokeWidth={1.5} />
                </a>
              )}
              {work.link && (
                <a
                  href={work.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-border-color text-silver hover:text-graphite hover:bg-cream hover:border-border-dark transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="外部链接"
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Expanded detail */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="px-5 pb-5 border-t border-border-color/60 pt-4"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: easeOut }}
            >
              <p className="text-[13px] font-sans text-graphite leading-[1.8] mb-4">
                {work.description}
              </p>

              {/* Full challenges */}
              {challenges && (
                <div className="mb-3">
                  <h4 className="text-[12px] font-sans font-medium text-graphite mb-1.5 flex items-center gap-1">
                    <AlertTriangle size={12} strokeWidth={1.5} className="text-[#C47D6E]" />
                    遇到的挑战
                  </h4>
                  <p className="text-[13px] text-silver leading-relaxed">{challenges}</p>
                </div>
              )}

              {/* Full learnings */}
              {learnings && (
                <div className="mb-4">
                  <h4 className="text-[12px] font-sans font-medium text-graphite mb-1.5 flex items-center gap-1">
                    <Lightbulb size={12} strokeWidth={1.5} className="text-[#6B9E7C]" />
                    学到的东西
                  </h4>
                  <p className="text-[13px] text-silver leading-relaxed">{learnings}</p>
                </div>
              )}

              {/* Related paths */}
              {relatedPathIds.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-[12px] font-sans font-medium text-graphite mb-2 flex items-center gap-1">
                    <Route size={12} strokeWidth={1.5} className="text-[#C8956C]" />
                    关联路径
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedPathIds.map((pid) => (
                      <Link
                        key={pid}
                        to={`/paths/${pid}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-light-pink rounded-lg text-[12px] font-sans text-graphite hover:bg-[#F0E5DE] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看路径
                        <ArrowRight size={10} strokeWidth={1.5} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related journal */}
              {relatedJournalIds.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-[12px] font-sans font-medium text-graphite mb-2 flex items-center gap-1">
                    <BookOpen size={12} strokeWidth={1.5} className="text-[#C8956C]" />
                    相关手记
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedJournalIds.map((jid) => (
                      <Link
                        key={jid}
                        to={`/journal`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-light-gray rounded-lg text-[12px] font-sans text-graphite hover:bg-light-pink transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看手记
                        <ArrowRight size={10} strokeWidth={1.5} />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex items-center gap-4 pt-3 border-t border-border-color/60">
                {work.github && (
                  <a
                    href={work.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-sans text-silver hover:text-graphite transition-colors duration-150 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github size={12} strokeWidth={1.5} />
                    GitHub
                  </a>
                )}
                {work.link && (
                  <a
                    href={work.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-sans text-silver hover:text-graphite transition-colors duration-150 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={12} strokeWidth={1.5} />
                    查看项目
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function WorksPage() {
  const [activeType, setActiveType] = useState<WorkType>('all');
  const [activeStatus, setActiveStatus] = useState<WorkStatus>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);

  const stats = useStats(works);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    works.forEach((w) => w.techStack.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, []);

  // Enrich works with inferred type
  const enrichedWorks = useMemo(
    () =>
      works.map((w) => ({
        ...w,
        inferredType: inferWorkType(w),
      })),
    []
  );

  // Filter
  const filtered = useMemo(() => {
    let list = [...enrichedWorks];
    if (activeType !== 'all') {
      list = list.filter((w) => w.inferredType === activeType);
    }
    if (activeStatus !== 'all') {
      list = list.filter((w) => w.status === activeStatus);
    }
    if (activeTags.length > 0) {
      list = list.filter((w) => activeTags.some((t) => w.techStack.includes(t)));
    }
    return list;
  }, [enrichedWorks, activeType, activeStatus, activeTags]);

  // Type counts
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: works.length };
    typeFilters.forEach((t) => {
      if (t.key !== 'all') {
        counts[t.key] = enrichedWorks.filter((w) => w.inferredType === t.key).length;
      }
    });
    return counts;
  }, [enrichedWorks]);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: works.length };
    statusFilters.forEach((s) => {
      if (s.key !== 'all') {
        counts[s.key] = works.filter((w) => w.status === s.key).length;
      }
    });
    return counts;
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setActiveType('all');
    setActiveStatus('all');
    setActiveTags([]);
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpandedWorkId((prev) => (prev === id ? null : id));
  }, []);

  // TODO: 接入后端后使用 <PageSkeleton type="cards" /> 替代

  // Error boundary
  if (!works || !Array.isArray(works)) {
    return (
      <div className="min-h-[100dvh] pt-[96px] px-5 md:px-12">
        <ErrorState
          title="加载失败"
          description="数据加载异常，请刷新页面重试"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-white">
      {/* ========== Header ========== */}
      <section className="pt-[96px] md:pt-[144px] pb-8">
        <div className="max-w-[1200px] mx-auto px-5 md:px-12">
          <motion.h1
            className="font-serif text-[28px] md:text-[36px] font-normal text-ink leading-[1.3] tracking-[-0.01em] mb-3 text-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            工坊
          </motion.h1>
          <motion.p
            className="text-[15px] font-sans font-normal text-silver leading-relaxed text-center mb-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.15 }}
          >
            作品、项目与实验。每一件都是一段实践的结晶。
          </motion.p>
          <motion.p
            className="text-[12px] font-sans font-normal text-light-silver text-center tracking-[0.02em] mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.25 }}
          >
            {stats.total} 件作品 · {stats.completed} 已完成 · {stats.inProgress} 进行中
            {stats.archived > 0 ? ` · ${stats.archived} 已归档` : ''}
          </motion.p>

          {/* Page Guide */}
          <div className="max-w-[720px] mx-auto">
            <PageGuide />
          </div>
        </div>
      </section>

      {/* ========== Sticky Filters ========== */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-[8px] border-b border-border-color">
        <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-3">
          {/* Type filters with counts */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-2 pb-2 -mx-4 px-4">
            {typeFilters.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveType(t.key)}
                className={
                  activeType === t.key
                    ? 'shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-sans font-normal transition-colors duration-150 bg-light-pink text-graphite'
                    : 'shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-sans font-normal text-silver hover:text-graphite hover:bg-cream transition-colors duration-150'
                }
              >
                <span className="flex items-center gap-1.5">
                  {t.icon}
                  {t.label}
                  <span className="text-[11px] text-light-silver">{typeCounts[t.key] || 0}</span>
                </span>
              </button>
            ))}
          </div>

          {/* Tag filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <span className="text-[11px] font-sans text-light-silver mr-1 shrink-0">技术</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={
                  activeTags.includes(tag)
                    ? 'shrink-0 px-2.5 py-1 rounded-md text-[12px] font-sans font-normal bg-light-pink text-graphite transition-colors duration-150'
                    : 'shrink-0 px-2.5 py-1 rounded-md text-[12px] font-sans font-normal text-silver bg-light-gray hover:bg-cream transition-colors duration-150'
                }
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Status filters with counts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mt-2">
            <span className="text-[11px] font-sans text-light-silver mr-1">状态</span>
            {statusFilters.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveStatus(s.key)}
                className={
                  activeStatus === s.key
                    ? 'px-2.5 py-0.5 rounded-full text-[12px] font-sans font-normal bg-light-pink text-graphite transition-colors duration-150'
                    : 'px-2.5 py-0.5 rounded-full text-[12px] font-sans font-normal text-silver hover:text-graphite hover:bg-cream transition-colors duration-150'
                }
              >
                {s.label}
                <span className="text-[10px] text-light-silver ml-0.5">{statusCounts[s.key] || 0}</span>
              </button>
            ))}
            {(activeType !== 'all' || activeStatus !== 'all' || activeTags.length > 0) && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-[12px] font-sans text-silver hover:text-graphite transition-colors duration-150"
              >
                <X size={13} strokeWidth={1.5} />
                清除
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========== Result Count ========== */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-12 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-sans text-silver">
            共 {filtered.length} 件作品
          </span>
        </div>
      </section>

      {/* ========== Gallery Grid ========== */}
      <section className="max-w-[1200px] mx-auto px-5 md:px-12 pb-16 pt-4">
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${activeType}-${activeStatus}-${activeTags.join(',')}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filtered.map((work, index) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  index={index}
                  isExpanded={expandedWorkId === work.id}
                  onToggle={() => toggleExpand(work.id)}
                />
              ))}
            </motion.div>
          ) : (
            <LifecycleEmptyState
              icon={Inbox}
              title="没有找到匹配的作品"
              description="尝试调整筛选条件"
              action={{
                label: '清除筛选',
                onClick: clearFilters,
              }}
            />
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
