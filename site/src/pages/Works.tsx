import { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Github,
  ExternalLink,
  Globe,
  Wrench,
  Layers,
  BookOpen,
  Code2,
  Cpu,
  FlaskConical,
  X,
  Inbox,
  Clock,
  Users,
  ArrowRight,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { works } from '@/data/mockWorks';
import type { Work } from '@/types';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';
import { resolveAssetUrl } from '@/lib/runtime';
import { toPublicLabel } from '@/lib/publicLabels';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Type inference                                                     */
/* ------------------------------------------------------------------ */

type WorkType = 'all' | 'website' | 'tool' | 'video' | 'miniapp' | 'resource' | 'opensource' | 'prototype' | 'experiment';
type WorkStatus = 'all' | 'in_progress' | 'completed' | 'archived';
type WorkCardData = Work & { inferredType: WorkType; whoFor?: string };

function inferWorkType(work: Work): WorkType {
  const stack = work.techStack.join(' ').toLowerCase();
  const title = work.title.toLowerCase();
  if (title.includes('学习包') || title.includes('复刻') || stack.includes('学习')) return 'resource';
  if (stack.includes('react') || stack.includes('vite') || title.includes('前端') || title.includes('网站') || title.includes('app')) return 'website';
  if (title.includes('api') || title.includes('后端') || stack.includes('接口') || stack.includes('后端')) return 'miniapp';
  if (title.includes('agent') || title.includes('智能体') || title.includes('coze') || stack.includes('智能体') || title.includes('小安') || stack.includes('小安')) return 'opensource';
  if (title.includes('资料库') || title.includes('书房') || title.includes('藏馆') || stack.includes('资料库')) return 'tool';
  if (stack.includes('three.js') || stack.includes('glsl') || title.includes('实验')) return 'experiment';
  return 'website';
}

const typeFilters: { key: WorkType; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: '全部', icon: <Layers size={13} strokeWidth={1.5} /> },
  { key: 'website', label: '前端', icon: <Globe size={13} strokeWidth={1.5} /> },
  { key: 'miniapp', label: '后端', icon: <Cpu size={13} strokeWidth={1.5} /> },
  { key: 'tool', label: '工具', icon: <Wrench size={13} strokeWidth={1.5} /> },
  { key: 'opensource', label: '智能体', icon: <Code2 size={13} strokeWidth={1.5} /> },
  { key: 'resource', label: '学习路线', icon: <BookOpen size={13} strokeWidth={1.5} /> },
  { key: 'experiment', label: '工具实验', icon: <FlaskConical size={13} strokeWidth={1.5} /> },
];

const statusFilters: { key: WorkStatus; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'in_progress', label: '建设中' },
  { key: 'completed', label: '已完成' },
  { key: 'archived', label: '阶段归档' },
];

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  in_progress: { label: '建设中', bg: 'bg-[#FDF6F0]', text: 'text-[#C8956C]' },
  completed: { label: '已完成', bg: 'bg-[#F0F7F2]', text: 'text-[#6B9E7C]' },
  archived: { label: '阶段归档', bg: 'bg-light-gray', text: 'text-silver' },
};

const typeBadgeConfig: Record<string, { label: string; bg: string }> = {
  website: { label: '前端', bg: 'bg-[#E8EBF0]' },
  tool: { label: '工具', bg: 'bg-[#F0EDE5]' },
  video: { label: '视频', bg: 'bg-[#F5EDE8]' },
  miniapp: { label: '后端', bg: 'bg-[#E8F0EB]' },
  resource: { label: '学习路线', bg: 'bg-[#F0DDD8]' },
  opensource: { label: '智能体', bg: 'bg-[#E8EBF0]' },
  prototype: { label: '智能体', bg: 'bg-[#F5EDE8]' },
  experiment: { label: '工具实验', bg: 'bg-[#F0EDE5]' },
};

const featuredWorkTitles = [
  '个人资料库展示前端',
  '个人资料库平台复刻学习包',
  'Coze 风格 Agent 搭建器研究',
];

function pickFirstText(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim())?.trim();
}

function splitFirstText(value?: string) {
  return value
    ?.split(/[；;]/)
    .map((item) => item.trim())
    .find(Boolean);
}

function stripMarkdown(value?: string) {
  return (value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_>#-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortText(value?: string, max = 74) {
  const text = stripMarkdown(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/[，。；、\s]+$/u, '')}…`;
}

function WorkInfoLine({ label, children }: { label: string; children?: React.ReactNode }) {
  if (!children) return null;

  return (
    <p className="text-[12px] font-sans text-graphite leading-relaxed">
      <span className="mr-1 text-light-silver">{label}：</span>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Work Card                                                          */
/* ------------------------------------------------------------------ */

function WorkCard({
  work,
  index,
}: {
  work: WorkCardData;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
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
  const judgmentText = shortText(pickFirstText(work.description, work.whyItMattered), 92);
  const whoText = pickFirstText(work.whoFor, '想看真实项目、照着做一个小版本的读者');
  const whyText = pickFirstText(work.whyItMattered, work.learnings, work.challenges);
  const nextText = pickFirstText(work.actionText, work.replicationSteps?.[0], work.nextPlan);
  const riskText = pickFirstText(work.failureModes?.[0], splitFirstText(work.challenges), work.publicSafety);
  const detailUrl = `/content/${work.id}`;

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
        onClick={() => navigate(detailUrl)}
      >
        {/* Cover Image */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={resolveAssetUrl(work.cover || '/work-portfolio.jpg')}
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
          </div>

          {/* Title */}
          <h3 className="text-[16px] font-sans font-medium text-graphite leading-[1.5] mb-1.5 group-hover:text-ink transition-colors duration-200">
            {work.title}
          </h3>

          <p className="mb-3 text-[13px] font-sans text-graphite leading-relaxed line-clamp-3">
            {judgmentText}
          </p>

          <div className="space-y-2 rounded-lg bg-[#FCFBF9] px-3 py-3 mb-3">
            <WorkInfoLine label="适合">
              <span className="line-clamp-1 md:line-clamp-2">{shortText(whoText, 48)}</span>
            </WorkInfoLine>
            <WorkInfoLine label="看点">
              <span className="line-clamp-2">{shortText(whyText, 54)}</span>
            </WorkInfoLine>
            <WorkInfoLine label="先做">
              <span className="line-clamp-2">{shortText(nextText, 56)}</span>
            </WorkInfoLine>
            <WorkInfoLine label="小心">
              <span className="line-clamp-2">{shortText(riskText, 58)}</span>
            </WorkInfoLine>
          </div>

          {/* Duration & Team */}
          <div className="hidden flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[12px] text-silver md:flex">
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

          <div className="flex flex-wrap gap-1.5 mb-3">
            {work.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded text-[11px] font-sans font-normal bg-cream text-silver"
              >
                {toPublicLabel(tech)}
              </span>
            ))}
          </div>

          {/* Footer: date + links */}
          <div className="flex items-center justify-between pt-3 border-t border-border-color">
            <span className="text-[11px] font-sans text-light-silver">{formattedDate}</span>
            <div className="flex items-center gap-1">
              <Link
                to={detailUrl}
                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-full border border-border-color text-[12px] font-sans text-silver hover:text-graphite hover:bg-cream hover:border-border-dark transition-all duration-150"
                onClick={(e) => e.stopPropagation()}
                aria-label={`查看${work.title}的复刻步骤`}
              >
                <ArrowRight size={13} strokeWidth={1.5} />
                打开学习包
              </Link>
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
                  aria-label="打开项目"
                >
                  <ExternalLink size={14} strokeWidth={1.5} />
                </a>
              )}
            </div>
          </div>
        </div>

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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Extract all unique tags
  const allTags = (() => {
    const tagSet = new Set<string>();
    works.forEach((w) => w.techStack.forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  })();

  // Enrich works with inferred type
  const enrichedWorks = works.map((w) => ({
    ...w,
    inferredType: inferWorkType(w),
  }));

  // Filter
  let filtered = [...enrichedWorks];
  if (activeType !== 'all') {
    filtered = filtered.filter((w) => w.inferredType === activeType);
  }
  if (activeStatus !== 'all') {
    filtered = filtered.filter((w) => w.status === activeStatus);
  }
  if (activeTags.length > 0) {
    filtered = filtered.filter((w) => activeTags.some((t) => w.techStack.includes(t)));
  }

  // Type counts
  const typeCounts = (() => {
    const counts: Record<string, number> = { all: works.length };
    typeFilters.forEach((t) => {
      if (t.key !== 'all') {
        counts[t.key] = enrichedWorks.filter((w) => w.inferredType === t.key).length;
      }
    });
    return counts;
  })();

  const visibleTypeFilters = typeFilters.filter(
    (item) => item.key === 'all' || (typeCounts[item.key] ?? 0) > 0
  );

  // Status counts
  const statusCounts = (() => {
    const counts: Record<string, number> = { all: works.length };
    statusFilters.forEach((s) => {
      if (s.key !== 'all') {
        counts[s.key] = works.filter((w) => w.status === s.key).length;
      }
    });
    return counts;
  })();

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

  const advancedFilterCount = (activeStatus !== 'all' ? 1 : 0) + activeTags.length;
  const featuredWorks = featuredWorkTitles
    .map((title) => enrichedWorks.find((work) => work.title === title))
    .filter(Boolean) as WorkCardData[];

  // 数据源固定后，这里直接渲染内容；后端接入时可切换为统一生命周期骨架

  // Error boundary
  if (!works || !Array.isArray(works)) {
    return (
      <div className="min-h-[100dvh] pt-[calc(var(--app-nav-height)+32px)] px-5 md:px-12">
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
      <section className="pt-[calc(var(--app-nav-height)+32px)] md:pt-[calc(var(--app-nav-height)+80px)] pb-8">
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
            className="text-[15px] font-sans font-normal text-silver leading-relaxed text-center mb-4 max-w-[720px] mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.15 }}
          >
            这里不是作品墙。每张卡都是一份资料包：列表只帮你判断要不要打开，完整背景、复刻步骤、失败点和安的提醒都在详情页。
          </motion.p>
          {featuredWorks.length > 0 && (
            <motion.div
              className="mx-auto mt-5 flex max-w-[980px] flex-col gap-2 rounded-2xl border border-[#E8DDD4] bg-[#FCFAF7] p-3 text-left md:flex-row md:items-center md:gap-3 md:p-3.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: easeOut, delay: 0.25 }}
            >
              <div className="shrink-0 px-1 text-[12px] text-[#9B7E68] md:w-[78px]">
                推荐先读
              </div>
              {featuredWorks.map((work, index) => (
                <Link
                  key={work.id}
                  to={`/content/${work.id}`}
                  className="group flex min-w-0 items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left transition-all duration-200 hover:bg-[#F8F3EE] md:flex-1"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5EDE8] text-[11px] text-[#9B7E68]">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-graphite">{work.title}</span>
                  <ArrowRight
                    size={14}
                    strokeWidth={1.5}
                    className="shrink-0 text-silver transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </Link>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* ========== Sticky Filters ========== */}
      <div className="sticky top-[var(--app-nav-height)] z-30 bg-white/90 backdrop-blur-[8px] border-b border-border-color">
        <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-3">
          {/* Type filters with counts */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-2 pb-2 -mx-4 px-4">
            {visibleTypeFilters.map((t) => (
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

          <div className="flex items-center justify-between gap-3 px-4">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((value) => !value)}
              className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD4] bg-[#FBF8F4] px-3 py-1.5 text-[12px] text-graphite transition-colors hover:border-[#C9AF96] hover:text-ink"
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              细分筛选
              {advancedFilterCount > 0 && (
                <span className="rounded-full bg-light-pink px-1.5 py-0.5 text-[11px] text-graphite">
                  {advancedFilterCount}
                </span>
              )}
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className={`transition-transform duration-150 ${showAdvancedFilters ? 'rotate-180' : ''}`}
              />
            </button>

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

          <AnimatePresence initial={false}>
            {showAdvancedFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 rounded-xl border border-border-color bg-[#FCFBF9] px-4 py-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <span className="text-[11px] font-sans text-light-silver mr-1 shrink-0">状态</span>
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
                  </div>

                  <div className="mt-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <span className="text-[11px] font-sans text-light-silver mr-1 shrink-0">细分主题</span>
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
                        {toPublicLabel(tag)}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
