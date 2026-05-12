import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ExternalLink,
  Bookmark,
  RotateCcw,
  Star,
  Info,
  Sparkles,
  Zap,
} from 'lucide-react';
import { libraryItems } from '@/data/mockLibrary';
import type { LibraryItem } from '@/types';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ── difficulty config ── */
const difficultyConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  easy: { label: '简单', bg: 'bg-[#6B9E7C]/10', text: 'text-[#6B9E7C]', border: 'border-[#6B9E7C]/30' },
  medium: { label: '中等', bg: 'bg-[#C8956C]/10', text: 'text-[#C8956C]', border: 'border-[#C8956C]/30' },
  hard: { label: '困难', bg: 'bg-[#C47D6E]/10', text: 'text-[#C47D6E]', border: 'border-[#C47D6E]/30' },
};

/* ── status helpers ── */
const statusConfig: Record<
  LibraryItem['status'],
  { label: string; bg: string; text: string }
> = {
  done: { label: '亲测', bg: 'bg-[#C8956C]', text: 'text-white' },
  doing: { label: '持续更新', bg: 'bg-[#6B9E7C]', text: 'text-white' },
  todo: { label: '待验证', bg: 'bg-[#A0A0A0]', text: 'text-white' },
};

/* ── type helpers ── */
const typeConfig: Record<string, { label: string; color: string }> = {
  doc: { label: '文档', color: '#C8956C' },
  article: { label: '文章', color: '#C47D6E' },
  video: { label: '视频', color: '#8A9BB8' },
  book: { label: '书籍', color: '#B8A87F' },
  course: { label: '教程', color: '#6B9E7C' },
  tool: { label: '工具', color: '#8AAE9B' },
};

const typeFilters = [
  { key: 'all', label: '全部' },
  { key: 'tool', label: 'AI工具' },
  { key: 'doc', label: '文档' },
  { key: 'course', label: '教程' },
  { key: 'article', label: '文章' },
  { key: 'video', label: '视频' },
  { key: 'book', label: '书籍' },
] as const;

const statusFilters = [
  { key: 'all', label: '全部' },
  { key: 'done', label: '亲测' },
  { key: 'doing', label: '持续更新' },
  { key: 'todo', label: '待验证' },
] as const;

/* ── sort options ── */
const sortOptions = [
  { key: 'recommendFirst', label: '推荐优先' },
  { key: 'newest', label: '最新收藏' },
  { key: 'oldest', label: '最早收藏' },
  { key: 'rating', label: '最高评分' },
  { key: 'name', label: '名称排序' },
] as const;

/* ── extract all tags ── */
const allTags = Array.from(
  new Set(libraryItems.flatMap((item) => item.tags))
).sort();

/* ── format date ── */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

/* ── StarRating ── */
function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={11}
          strokeWidth={1.5}
          className={i < rating ? 'text-[#C8956C] fill-[#C8956C]' : 'text-light-silver'}
        />
      ))}
    </div>
  );
}

/* ── DifficultyBadge ── */
function DifficultyBadge({ difficulty }: { difficulty: LibraryItem['difficulty'] }) {
  const cfg = difficultyConfig[difficulty || 'easy'];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-sans font-normal px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {difficulty === 'easy' && <Zap size={10} strokeWidth={2} />}
      {difficulty === 'medium' && <Zap size={10} strokeWidth={2} />}
      {difficulty === 'hard' && <Zap size={10} strokeWidth={2} />}
      {cfg.label}
    </span>
  );
}

/* ── RecommendedBadge ── */
function RecommendedBadge({ text }: { text?: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#C8956C]/10 text-[#C8956C] border border-[#C8956C]/30">
      <Sparkles size={10} strokeWidth={2} />
      {text || '推荐'}
    </span>
  );
}

/* ── GuideCard ── */
function GuideCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.35 }}
      className="mb-6 bg-[#F5EDE8] border border-[#E5E5E3] rounded-xl p-4 md:p-5"
    >
      <div className="flex items-start gap-3">
        <Info size={18} strokeWidth={1.5} className="text-[#C8956C] mt-0.5 shrink-0" />
        <div className="space-y-3">
          <p className="text-[13px] font-sans text-graphite leading-relaxed">
            藏馆收录我亲测过的工具、教程、文档与资源。每条资源标注了上手难度、适用场景和我的真实评价，帮你快速判断是否适合自己。
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#6B9E7C]" />
              <span className="text-[11px] font-sans text-silver">简单 · 适合新手</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C8956C]" />
              <span className="text-[11px] font-sans text-silver">中等 · 需要基础</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C47D6E]" />
              <span className="text-[11px] font-sans text-silver">困难 · 深入进阶</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── NewbiePicks ── */
function NewbiePicks({ items }: { items: LibraryItem[] }) {
  if (items.length === 0) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="mb-8"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} strokeWidth={1.5} className="text-[#C8956C]" />
        <h3 className="text-[15px] font-sans font-medium text-graphite">新手推荐</h3>
        <span className="text-[12px] font-sans text-silver">上手简单且亲测好用</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.3, ease: easeOut }}
          >
            <Link
              to={`/content/${item.id}`}
              className="group block bg-white border border-border-color rounded-xl p-4 hover:shadow-md hover:border-border-dark transition-all duration-250 card-tap"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-sm bg-[#F5EDE8] text-[#C8956C]">
                  新手推荐
                </span>
                <DifficultyBadge difficulty={item.difficulty} />
              </div>
              <h4 className="text-[14px] font-sans font-medium text-graphite group-hover:text-ink transition-colors duration-150 mb-1 truncate">
                {item.title}
              </h4>
              <p className="text-[12px] font-sans text-silver leading-relaxed line-clamp-2 mb-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans text-light-silver">
                  {item.timeToLearn}
                </span>
                <StarRating rating={item.rating} />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
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
  const typeInfo = typeConfig[item.type] || { label: item.type, color: '#A0A0A0' };
  const statusInfo = statusConfig[item.status];
  const isExternal = item.links.some((l) => l.url.startsWith('http'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
        ease: easeOut,
      }}
      className="group bg-white border border-border-color rounded-xl shadow-sm hover:shadow-md hover:border-border-dark transition-all duration-250 flex flex-col overflow-hidden card-tap"
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      {/* Top color bar */}
      <div className="h-1 w-full" style={{ backgroundColor: typeInfo.color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Row 1: Type tag + Status badge + Difficulty badge */}
        <div className="flex items-center flex-wrap gap-2 mb-2.5">
          <span
            className="text-[11px] font-sans font-normal px-2.5 py-0.5 rounded-sm"
            style={{
              backgroundColor: typeInfo.color + '18',
              color: typeInfo.color,
            }}
          >
            {typeInfo.label}
          </span>
          <span
            className={`text-[11px] font-sans font-normal px-2.5 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.text}`}
          >
            {statusInfo.label}
          </span>
          <DifficultyBadge difficulty={item.difficulty} />
          {item.isRecommended && <RecommendedBadge text="推荐" />}
        </div>

        {/* Row 2: Title */}
        <Link
          to={`/content/${item.id}`}
          className="text-[15px] font-sans font-medium text-graphite group-hover:text-ink transition-colors duration-150 mb-1.5 leading-snug"
        >
          {item.title}
        </Link>

        {/* Row 3: Description */}
        <p className="text-[13px] font-sans text-silver leading-relaxed line-clamp-2 mb-2.5">
          {item.description}
        </p>

        {/* Row 4: Use case */}
        <div className="bg-[#F5EDE8]/60 rounded-lg px-3 py-2 mb-2.5">
          <p className="text-[12px] font-sans text-graphite leading-relaxed">
            <span className="text-silver">适合：</span>
            {item.whoFor}
          </p>
        </div>

        {/* Row 5: Tags */}
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-sans text-silver bg-light-pink hover:bg-[#EDE5E0] px-2 py-0.5 rounded-sm transition-colors duration-150"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Row 6: My thoughts */}
        {item.myThoughts && (
          <p className="text-[12px] font-sans text-light-silver italic leading-relaxed mb-3 line-clamp-2 border-l-2 border-light-pink pl-3">
            {item.myThoughts}
          </p>
        )}

        {/* Row 7: Bottom bar */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F0F0EE] mt-auto">
          <div className="flex items-center gap-2 flex-wrap">
            <StarRating rating={item.rating} />
            <span className="text-[11px] font-sans text-light-silver">
              {item.timeToLearn}
            </span>
            <span className="text-[11px] font-sans text-light-silver">
              {formatDate(item.updatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
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
            <button
              className="p-1 text-light-silver hover:text-favorite transition-colors duration-150"
              aria-label="收藏"
            >
              <Bookmark size={13} strokeWidth={1.5} />
            </button>
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
function useFilterCounts(items: LibraryItem[]) {
  return useMemo(() => {
    const counts = {
      type: {} as Record<string, number>,
      status: {} as Record<string, number>,
    };
    typeFilters.forEach((f) => {
      if (f.key === 'all') {
        counts.type[f.key] = items.length;
      } else {
        counts.type[f.key] = items.filter((i) => i.type === f.key).length;
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
  }, [items]);
}

/* ── Main Library Page ── */
export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommendFirst');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [displayCount, setDisplayCount] = useState(9);

  const counts = useFilterCounts(libraryItems);

  const filteredItems = useMemo(() => {
    let items = [...libraryItems];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q)) ||
          (item.whoFor || '').toLowerCase().includes(q) ||
          (item.myThoughts || '').toLowerCase().includes(q)
      );
    }

    // Type filter
    if (activeType !== 'all') {
      items = items.filter((item) => item.type === activeType);
    }

    // Tag filter
    if (activeTag) {
      items = items.filter((item) => item.tags.includes(activeTag));
    }

    // Status filter
    if (activeStatus !== 'all') {
      items = items.filter((item) => item.status === activeStatus);
    }

    // Sort
    switch (sortBy) {
      case 'recommendFirst':
        items.sort((a, b) => {
          if (a.isRecommended && !b.isRecommended) return -1;
          if (!a.isRecommended && b.isRecommended) return 1;
          if (a.difficulty === 'easy' && b.difficulty !== 'easy') return -1;
          if (a.difficulty !== 'easy' && b.difficulty === 'easy') return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
      case 'newest':
        items.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        break;
      case 'oldest':
        items.sort(
          (a, b) =>
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
        );
        break;
      case 'rating':
        items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        items.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));
        break;
    }

    return items;
  }, [searchQuery, activeType, activeTag, activeStatus, sortBy]);

  const displayedItems = filteredItems.slice(0, displayCount);
  const hasMore = displayCount < filteredItems.length;
  const currentSortLabel = sortOptions.find((s) => s.key === sortBy)?.label || '推荐优先';

  const isFiltered =
    searchQuery !== '' || activeType !== 'all' || activeTag !== null || activeStatus !== 'all';

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

  // Newbie picks: easy + recommended items (only when no filter/search)
  const newbiePicks = useMemo(() => {
    if (isFiltered) return [];
    return libraryItems
      .filter((item) => item.isRecommended && item.difficulty === 'easy')
      .slice(0, 3);
  }, [isFiltered]);

  // TODO: 接入后端后使用 <PageSkeleton type="grid" /> 替代

  // Stats
  const totalItems = libraryItems.length;
  const totalTags = allTags.length;
  const typeCount = Object.keys(typeConfig).length;
  const thisMonthCount = libraryItems.filter((item) => {
    const d = new Date(item.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // Error boundary
  if (!libraryItems || !Array.isArray(libraryItems)) {
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
    <div className="min-h-[100dvh]">
      {/* ── Page Header ── */}
      <section className="pt-[96px] pb-8 px-5 md:px-12">
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
            收藏的资料、工具、文章与资源。按主题分类，持续更新。
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOut, delay: 0.3 }}
            className="flex flex-wrap gap-6 md:gap-8"
          >
            {[
              { value: totalItems, label: '资源' },
              { value: typeCount, label: '分类' },
              { value: totalTags, label: '标签' },
              { value: thisMonthCount, label: '本月新增' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.3, ease: easeOut }}
                className="flex items-baseline gap-1.5"
              >
                <span className="text-[22px] font-sans font-medium text-ink">
                  {stat.value}
                </span>
                <span className="text-[13px] font-sans text-silver">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Page Guide */}
          <div className="mt-6">
            <GuideCard />
          </div>

          <div className="border-b border-border-color" />
        </div>
      </section>

      {/* ── Search & Filter Bar (sticky) ── */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="sticky top-16 z-40 bg-white border-b border-border-color px-5 md:px-12 py-4"
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
                placeholder="搜索资源、文章、工具..."
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
                placeholder="搜索资源、文章、工具..."
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

          {/* Row 2: Type filter tabs with counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {typeFilters.map((t) => (
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
                  ({counts.type[t.key] || 0})
                </span>
              </button>
            ))}
          </div>

          {/* Row 3: Status filter + Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {/* Status with counts */}
            <div className="flex items-center gap-1 shrink-0 pr-3 border-r border-border-color">
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

            {/* Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
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
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Card Grid ── */}
      <section className="px-5 md:px-12 py-8 pb-16">
        <div className="max-w-[1200px] mx-auto">
          {/* Result count */}
          <ResultCountBar
            count={filteredItems.length}
            total={libraryItems.length}
            onClear={clearFilters}
            isFiltered={isFiltered}
          />

          {/* Newbie picks */}
          {!isFiltered && newbiePicks.length > 0 && (
            <NewbiePicks items={newbiePicks} />
          )}

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
                  —— 已展示全部资源 ——
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
