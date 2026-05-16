import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ExternalLink,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';
import { libraryItems } from '@/data/mockLibrary';
import type { LibraryItem, LibraryReaderCategory } from '@/types';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';
import { toPublicLabel } from '@/lib/publicLabels';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ── status helpers ── */
const statusConfig: Record<
  LibraryItem['status'],
  { label: string; bg: string; text: string }
> = {
  done: { label: '亲测', bg: 'bg-[#C8956C]', text: 'text-white' },
  doing: { label: '持续更新', bg: 'bg-[#6B9E7C]', text: 'text-white' },
  todo: { label: '待验证', bg: 'bg-[#A0A0A0]', text: 'text-white' },
};

/* ── beginner category helpers ── */
type BeginnerLibraryCategory = Exclude<LibraryReaderCategory, 'xiaoan'>;

const categoryConfig: Record<BeginnerLibraryCategory, { label: string; color: string; hint: string }> = {
  frontend: { label: '做网页', color: '#C8956C', hint: '页面、交互、手机阅读和可安装网页' },
  backend: { label: '管资料', color: '#8A9BB8', hint: '把公开内容稳定送到网页和 App' },
  tools: { label: '用工具', color: '#8AAE9B', hint: '软件、平台、浏览器和工作台' },
  agents: { label: '搭智能体', color: '#B8A87F', hint: '能按步骤协作的 AI 工作流' },
  prompts: { label: '写提示词', color: '#9C8FB8', hint: '目标、材料、约束、输出和验收' },
  archive: { label: '资料整理', color: '#6B9E7C', hint: '把散乱材料整理成公开书页' },
  learning: { label: '学习路线', color: '#9A8E6A', hint: '从一个最小成果开始复刻' },
  security: { label: '边界保护', color: '#A06A62', hint: '发布前检查、改写和保护隐私' },
  sources: { label: '参考资料', color: '#7C8FA6', hint: '官方文档、参考项目和来源说明' },
  other: { label: '其他', color: '#A0A0A0', hint: '暂未归入上面大类的内容' },
};

const categoryFilters = [
  { key: 'all', label: '全部' },
  { key: 'frontend', label: '做网页' },
  { key: 'backend', label: '管资料' },
  { key: 'tools', label: '用工具' },
  { key: 'agents', label: '搭智能体' },
  { key: 'prompts', label: '写提示词' },
  { key: 'archive', label: '整理资料' },
  { key: 'learning', label: '学习路线' },
  { key: 'security', label: '边界保护' },
  { key: 'sources', label: '参考资料' },
] as const;

function getBeginnerCategory(item: LibraryItem): BeginnerLibraryCategory {
  if (item.readerCategory === 'xiaoan') return 'agents';
  return item.readerCategory || 'other';
}

function pickFirstText(...values: Array<string | undefined>) {
  return values.find((value) => value?.trim())?.trim();
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

function shortText(value?: string, max = 72) {
  const text = stripMarkdown(value);
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/[，。；、\s]+$/u, '')}…`;
}

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'done', label: '亲测' },
  { key: 'doing', label: '持续更新' },
  { key: 'todo', label: '待验证' },
] as const;

/* ── sort options ── */
const sortOptions = [
  { key: 'recommendFirst', label: '书房顺序' },
  { key: 'newest', label: '最新收藏' },
  { key: 'oldest', label: '最早收藏' },
  { key: 'rating', label: '最高评分' },
  { key: 'name', label: '名称排序' },
] as const;

/* ── RecommendedBadge ── */
function RecommendedBadge({ text }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#C8956C]/10 text-[#C8956C] border border-[#C8956C]/30">
      <Sparkles size={10} strokeWidth={2} />
      {text || '推荐'}
    </span>
  );
}

/* ── Card component ── */
function LibraryCard({
  item,
  index,
}: {
  item: LibraryItem;
  index: number;
}) {
  const navigate = useNavigate();
  const beginnerCategory = getBeginnerCategory(item);
  const categoryInfo = categoryConfig[beginnerCategory];
  const statusInfo = statusConfig[item.status];
  const isExternal = item.links.some((l) => l.url.startsWith('http'));
  const judgmentText = shortText(pickFirstText(item.description, item.useCase), 82);
  const whoText = pickFirstText(item.whoFor, item.recommendedFor);
  const nextText = pickFirstText(item.actionText, item.links[0]?.label);
  const riskText = pickFirstText(item.cons?.[0], item.publicSafety);
  const sourceText = item.sourceLabels?.slice(0, 2).join(' / ');
  const detailUrl = `/content/${item.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        ease: easeOut,
      }}
      className="group bg-white border border-border-color rounded-xl shadow-sm hover:shadow-md hover:border-border-dark transition-all duration-250 flex flex-col overflow-hidden card-tap cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C8956C]"
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      role="link"
      tabIndex={0}
      onClick={() => navigate(detailUrl)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(detailUrl);
        }
      }}
    >
      {/* Top color bar */}
      <div className="h-1 w-full" style={{ backgroundColor: categoryInfo.color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Row 1: category + status */}
        <div className="flex items-center flex-wrap gap-2 mb-2.5">
          <span
            className="text-[11px] font-sans font-normal px-2.5 py-0.5 rounded-sm"
            style={{
              backgroundColor: categoryInfo.color + '18',
              color: categoryInfo.color,
            }}
            title={categoryInfo.hint}
          >
            {categoryInfo.label}
          </span>
          <span
            className={`text-[11px] font-sans font-normal px-2.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
          >
            {statusInfo.label}
          </span>
          {item.isRecommended && <RecommendedBadge text="推荐" />}
        </div>

        {/* Row 2: Title */}
        <Link
          to={detailUrl}
          className="text-[15px] font-sans font-medium text-graphite group-hover:text-ink transition-colors duration-150 mb-1.5 leading-snug"
          onClick={(event) => event.stopPropagation()}
        >
          {item.title}
        </Link>

        <p className="mb-3 text-[13px] font-sans text-graphite leading-relaxed line-clamp-3">
          {judgmentText}
        </p>

        <div className="mb-3 space-y-2 rounded-lg bg-[#FCFBF9] px-3 py-3">
          {whoText && (
            <p className="text-[12px] font-sans text-graphite leading-relaxed line-clamp-2">
              <span className="mr-1 text-light-silver">读者：</span>
              {shortText(whoText, 48)}
            </p>
          )}
          {nextText && (
            <p className="text-[12px] font-sans text-graphite leading-relaxed line-clamp-2">
              <span className="mr-1 text-light-silver">先做：</span>
              {shortText(nextText, 52)}
            </p>
          )}
          {(riskText || sourceText) && (
            <p className="text-[12px] font-sans text-graphite leading-relaxed line-clamp-2">
              <span className="mr-1 text-light-silver">注意：</span>
              {shortText(riskText || `来源：${sourceText}`, 52)}
            </p>
          )}
          {sourceText && (
            <p className="hidden text-[11px] font-sans text-silver leading-relaxed line-clamp-1 md:block">
              来源：{sourceText}
            </p>
          )}
        </div>

        {/* Row 4: Tags */}
        <div className="hidden flex-wrap gap-1.5 mb-3 md:flex">
          {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-sans text-silver bg-light-pink hover:bg-[#EDE5E0] px-2 py-0.5 rounded-sm transition-colors duration-150"
              >
                {toPublicLabel(tag)}
              </span>
            ))}
          </div>

        {/* Row 5: Bottom bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0F0EE] mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-sans text-light-silver">
              {item.timeToLearn}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Link
              to={detailUrl}
              className="inline-flex items-center gap-1.5 rounded-full border border-border-color px-2.5 py-1.5 text-[12px] font-sans text-silver transition-colors hover:border-border-dark hover:bg-cream hover:text-graphite"
              onClick={(event) => event.stopPropagation()}
            >
              打开资料包
              <ArrowRight size={12} strokeWidth={1.5} />
            </Link>
            {isExternal && (
              <a
                href={item.links[0].url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-light-silver hover:text-graphite transition-colors duration-150"
                onClick={(e) => e.stopPropagation()}
                aria-label="外部链接"
              >
                <ExternalLink size={13} strokeWidth={1.5} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── ResultCountBar ── */
function ResultCountBar({
  count,
  total,
  onClear,
  isFiltered,
}: {
  count: number;
  total: number;
  onClear: () => void;
  isFiltered: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <span className="text-[13px] font-sans text-silver">
        共找到 <span className="text-graphite font-medium">{count}</span> 条资源
        {isFiltered && (
          <span className="text-light-silver ml-1">（共 {total} 条）</span>
        )}
      </span>
      {isFiltered && (
        <button
          onClick={onClear}
          className="text-[12px] font-sans text-silver hover:text-graphite transition-colors duration-150 flex items-center gap-1"
        >
          <RotateCcw size={12} strokeWidth={1.5} />
          清除筛选
        </button>
      )}
    </div>
  );
}

/* ── compute filter counts ── */
function useFilterCounts(items: LibraryItem[], signature: string) {
  void signature;
  const counts = {
    category: {} as Record<string, number>,
    status: {} as Record<string, number>,
  };
  categoryFilters.forEach((f) => {
    if (f.key === 'all') {
      counts.category[f.key] = items.length;
    } else {
      counts.category[f.key] = items.filter((i) => getBeginnerCategory(i) === f.key).length;
    }
  });
  statusFilters.forEach((f) => {
    if (f.key === 'all') {
      counts.status[f.key] = items.length;
    } else {
      counts.status[f.key] = items.filter((i) => i.status === f.key).length;
    }
  });
  return counts;
}

/* ── Main Library Page ── */
export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommendFirst');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(9);
  const librarySignature = libraryItems
    .map((item) => `${item.id}:${item.updatedAt}:${item.status}:${item.tags.join(',')}`)
    .join('|');

  const counts = useFilterCounts(libraryItems, librarySignature);
  const allTags = Array.from(new Set(libraryItems.flatMap((item) => item.tags))).sort();
  const visibleCategoryFilters = categoryFilters.filter(
    (item) => item.key === 'all' || (counts.category[item.key] ?? 0) > 0
  );
  let filteredItems = [...libraryItems];

  // Search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredItems = filteredItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.useCase || '').toLowerCase().includes(q) ||
        (item.actionText || '').toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        categoryConfig[getBeginnerCategory(item)].label.toLowerCase().includes(q) ||
        (item.readerCategoryLabel || '').toLowerCase().includes(q) ||
        (item.whoFor || '').toLowerCase().includes(q) ||
        (item.myThoughts || '').toLowerCase().includes(q) ||
        (item.sourceLabels || []).some((label) => label.toLowerCase().includes(q))
    );
  }

  // Beginner category filter
  if (activeType !== 'all') {
    filteredItems = filteredItems.filter((item) => getBeginnerCategory(item) === activeType);
  }

  // Tag filter
  if (activeTag) {
    filteredItems = filteredItems.filter((item) => item.tags.includes(activeTag));
  }

  // Status filter
  if (activeStatus !== 'all') {
    filteredItems = filteredItems.filter((item) => item.status === activeStatus);
  }

  // Sort
  switch (sortBy) {
    case 'recommendFirst':
      filteredItems.sort((a, b) => {
        if (a.isRecommended && !b.isRecommended) return -1;
        if (!a.isRecommended && b.isRecommended) return 1;
        if (a.difficulty === 'easy' && b.difficulty !== 'easy') return -1;
        if (a.difficulty !== 'easy' && b.difficulty === 'easy') return 1;
        return (b.rating || 0) - (a.rating || 0);
      });
      break;
    case 'newest':
      filteredItems.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      break;
    case 'oldest':
      filteredItems.sort(
        (a, b) =>
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      );
      break;
    case 'rating':
      filteredItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'name':
      filteredItems.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
      break;
  }

  const displayedItems = filteredItems.slice(0, displayCount);
  const hasMore = displayCount < filteredItems.length;
  const currentSortLabel = sortOptions.find((s) => s.key === sortBy)?.label || '书房顺序';
  const advancedFilterCount = (activeStatus !== 'all' ? 1 : 0) + (activeTag ? 1 : 0);

  const isFiltered =
    searchQuery !== '' ||
    activeType !== 'all' ||
    activeTag !== null ||
    activeStatus !== 'all';

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveType('all');
    setActiveTag(null);
    setActiveStatus('all');
    setDisplayCount(9);
  }, []);

  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + 9);
  }, []);

  // 数据源固定后，这里直接渲染内容；后端接入时可切换为统一生命周期骨架

  // Error boundary
  if (!libraryItems || !Array.isArray(libraryItems)) {
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
    <div className="min-h-[100dvh]">
      {/* ── Page Header ── */}
      <section className="pt-[calc(var(--app-nav-height)+32px)] pb-8 px-5 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut, delay: 0.1 }}
            className="font-serif text-[28px] md:text-[36px] text-ink mb-2"
          >
            藏馆
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeOut, delay: 0.2 }}
            className="text-[15px] text-silver mb-6"
          >
            想做页面就看“做网页”，想让内容稳定更新就看“管资料”，不知道选哪张卡，先打开推荐资料包。
          </motion.p>

          <div className="border-b border-border-color" />
        </div>
      </section>

      {/* ── Search & Filter Bar (sticky) ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="sticky top-[var(--app-nav-height)] z-40 bg-white border-b border-border-color px-5 md:px-12 py-4"
      >
        <div className="max-w-[1200px] mx-auto space-y-3">
          {/* Row 1: Search + Sort */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-[360px] focus-within:max-w-[420px] transition-all duration-300 hidden md:block">
              <Search
                size={16}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-light-silver"
              />
              <input
                type="text"
                placeholder="搜索资料、工具、路线..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(9);
                }}
                className="w-full h-10 pl-9 pr-4 text-[14px] font-sans text-graphite bg-white border border-border-color rounded-lg placeholder:text-light-silver focus:outline-none focus:border-light-silver focus:shadow-[0_0_0_3px_rgba(200,200,200,0.12)] transition-all duration-200"
              />
            </div>

            {/* Mobile search (full width) */}
            <div className="relative flex-1 md:hidden">
              <Search
                size={16}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-light-silver"
              />
              <input
                type="text"
                placeholder="搜索资料、工具、路线..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(9);
                }}
                className="w-full h-10 pl-9 pr-4 text-[14px] font-sans text-graphite bg-white border border-border-color rounded-lg placeholder:text-light-silver focus:outline-none focus:border-light-silver focus:shadow-[0_0_0_3px_rgba(200,200,200,0.12)] transition-all duration-200"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-sans text-graphite bg-white border border-border-color rounded-lg hover:bg-light-gray transition-colors duration-150"
              >
                {currentSortLabel}
                <ChevronDown
                  size={14}
                  strokeWidth={1.5}
                  className={`transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-border-color rounded-lg shadow-lg py-1 z-50 min-w-[140px]"
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setSortBy(opt.key);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-[13px] font-sans transition-colors duration-150 ${
                          sortBy === opt.key
                            ? 'text-ink bg-light-pink'
                            : 'text-graphite hover:bg-light-gray'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Row 2: category filter tabs with counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {visibleCategoryFilters.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setActiveType(t.key);
                  setDisplayCount(9);
                }}
                className={`shrink-0 px-3.5 py-1.5 text-[13px] font-sans rounded-lg transition-colors duration-150 ${
                  activeType === t.key
                    ? 'bg-light-pink text-graphite'
                    : 'text-silver hover:text-graphite hover:bg-light-gray'
                }`}
              >
                {t.label}
                <span className="ml-1 text-[11px] text-light-silver">
                  ({counts.category[t.key] || 0})
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

            {(activeStatus !== 'all' || activeTag !== null) && (
              <button
                onClick={() => {
                  setActiveTag(null);
                  setActiveStatus('all');
                  setDisplayCount(9);
                }}
                className="text-[12px] font-sans text-silver hover:text-graphite transition-colors duration-150 flex items-center gap-1"
              >
                <RotateCcw size={12} strokeWidth={1.5} />
                清除细分
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
                        onClick={() => {
                          setActiveStatus(s.key);
                          setDisplayCount(9);
                        }}
                        className={`shrink-0 px-3 py-1 text-[12px] font-sans rounded-full transition-colors duration-150 ${
                          activeStatus === s.key
                            ? 'bg-graphite text-white'
                            : 'text-silver hover:text-graphite hover:bg-light-gray'
                        }`}
                      >
                        {s.label}
                        <span className="ml-0.5 text-[10px] opacity-70">
                          {counts.status[s.key] || 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                    <span className="text-[11px] font-sans text-light-silver mr-1 shrink-0">细分主题</span>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setActiveTag((prev) => (prev === tag ? null : tag));
                          setDisplayCount(9);
                        }}
                        className={`shrink-0 px-2.5 py-1 text-[11px] font-sans rounded-sm transition-colors duration-150 ${
                          activeTag === tag
                            ? 'bg-light-pink text-graphite'
                            : 'text-silver bg-light-gray hover:bg-[#E8E8E6]'
                        }`}
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
      </motion.section>

      {/* ── Card Grid ── */}
      <section id="library-grid" className="px-5 md:px-12 py-8 pb-16">
        <div className="max-w-[1200px] mx-auto">
          {/* Result count */}
          <ResultCountBar
            count={filteredItems.length}
            total={libraryItems.length}
            onClear={clearFilters}
            isFiltered={isFiltered}
          />

          <AnimatePresence mode="wait">
            {filteredItems.length === 0 ? (
              <LifecycleEmptyState
                icon={Search}
                title="未找到匹配的内容"
                description="尝试调整筛选条件或搜索关键词"
                action={{
                  label: '清除筛选',
                  onClick: clearFilters,
                }}
              />
            ) : (
              <motion.div
                key={`${activeType}-${activeTag}-${activeStatus}-${sortBy}-${searchQuery}`}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.5 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {displayedItems.map((item, index) => (
                  <LibraryCard key={item.id} item={item} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load more / End */}
          {filteredItems.length > 0 && (
            <div className="flex items-center justify-center mt-10">
              {hasMore ? (
                <button
                  onClick={handleLoadMore}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-[13px] font-sans text-graphite bg-white border border-border-color rounded-lg hover:bg-light-gray transition-colors duration-150"
                >
                  <ChevronDown size={14} strokeWidth={1.5} />
                  加载更多
                </button>
              ) : (
                <span className="text-[12px] font-sans text-light-silver">
                  已展示全部资源
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
