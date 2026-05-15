import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  FileText,
  X,
  KeyRound,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { journalEntries } from '@/data/mockJournal';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';
import { resolveAssetUrl } from '@/lib/runtime';
import type { JournalEntry } from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const categories = [
  { id: 'all', name: '全部' },
  { id: '技术', name: '技术' },
  { id: '设计', name: '设计' },
  { id: '思考', name: '思考' },
  { id: '独立开发', name: '独立开发' },
  { id: '工具', name: '工具' },
];

const sortOptions = [
  { id: 'newest', name: '最新' },
  { id: 'oldest', name: '最早' },
];

/* ------------------------------------------------------------------ */
/*  Difficulty helpers                                                */
/* ------------------------------------------------------------------ */

const difficultyConfig = {
  easy: { label: '简单', color: 'bg-[#F0F7F2] text-[#6B9E7C]', icon: <Zap size={11} strokeWidth={1.5} /> },
  medium: { label: '中等', color: 'bg-[#FDF6F0] text-[#C8956C]', icon: <GraduationCap size={11} strokeWidth={1.5} /> },
  hard: { label: '困难', color: 'bg-[#F5E8E5] text-[#C47D6E]', icon: <KeyRound size={11} strokeWidth={1.5} /> },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getCategoryFromTags(tags: string[]): string {
  const tagMap: Record<string, string> = {
    'TypeScript': '技术',
    'React': '技术',
    '前端': '技术',
    '编程': '技术',
    '设计': '设计',
    '极简主义': '设计',
    'UI': '设计',
    '思考': '思考',
    '知识管理': '思考',
    '独立开发': '独立开发',
    '日常': '独立开发',
    '自由职业': '独立开发',
    '工具': '工具',
    '效率': '工具',
    '推荐': '工具',
  };
  for (const tag of tags) {
    if (tagMap[tag]) return tagMap[tag];
  }
  return '思考';
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function estimateReadTime(body: string): number {
  const count = body.length;
  return Math.max(1, Math.round(count / 300));
}

function getAllTags(entries: typeof journalEntries): string[] {
  const set = new Set<string>();
  entries.forEach((e) => e.tags.forEach((t) => set.add(t)));
  return Array.from(set);
}

function getJournalGuidance(entry: JournalEntry) {
  const keyTakeaway = entry.keyTakeaways?.[0];
  const action = entry.actionText || '读完后只留下一个可重复的做法，不急着扩展成完整系统。';
  const reason = keyTakeaway
    ? '这篇手记已经从事件里抽出一个方法点，适合先看收获再读细节。'
    : '它的价值不在记录情绪，而在帮助读者看见一次判断或方法怎样改变。';

  return {
    conclusion: keyTakeaway || entry.excerpt,
    reason,
    action,
  };
}

/* ------------------------------------------------------------------ */
/*  Category counts                                                   */
/* ------------------------------------------------------------------ */

function getCategoryCounts() {
  const counts: Record<string, number> = { all: journalEntries.length };
  categories.forEach((cat) => {
    if (cat.id !== 'all') {
      counts[cat.id] = journalEntries.filter((e) => getCategoryFromTags(e.tags) === cat.id).length;
    }
  });
  return counts;
}

/* ------------------------------------------------------------------ */
/*  Journal List Item                                                 */
/* ------------------------------------------------------------------ */

function JournalListItem({
  entry,
  index,
  onClick,
}: {
  entry: JournalEntry;
  index: number;
  onClick: () => void;
}) {
  const category = getCategoryFromTags(entry.tags);
  const readTime = entry.readingTime;
  const difficulty = entry.difficulty;
  const keyTakeaways = entry.keyTakeaways ?? [];
  const guidance = getJournalGuidance(entry);

  const minutes = readTime ?? estimateReadTime(entry.body);
  const diffCfg = difficulty ? difficultyConfig[difficulty] : null;

  return (
    <motion.article
      className="group py-6 md:py-7 border-b border-border-color cursor-pointer transition-colors duration-200 hover:bg-[rgba(250,249,247,0.6)] -mx-5 md:-mx-6 px-5 md:px-6 card-tap"
      style={{ borderLeft: '3px solid transparent' }}
      onClick={onClick}
      role="link"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: easeOut }}
      whileHover={{ borderLeftColor: '#C47D6E' }}
    >
      {/* Cover image */}
      {entry.cover && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={resolveAssetUrl(entry.cover)}
            alt={entry.title}
            className="w-full aspect-[21/9] object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
      )}

      {/* Meta row: date + reading time + difficulty */}
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <span className="text-[12px] font-sans px-2.5 py-1 rounded bg-light-pink text-graphite">
          {category}
        </span>
        <span className="text-[12px] font-sans text-silver">
          {formatShortDate(entry.date)}
        </span>
        <span className="text-[12px] font-sans text-silver flex items-center gap-1">
          <Clock size={12} strokeWidth={1.5} />
          {minutes} 分钟阅读
        </span>
        {diffCfg && (
          <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded ${diffCfg.color}`}>
            {diffCfg.icon}
            {diffCfg.label}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-serif text-[18px] md:text-[22px] leading-[1.4] md:leading-[1.5] text-ink mb-2 transition-colors duration-200 group-hover:text-favorite">
        {entry.title}
      </h3>

      <div className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-3">
        <div className="rounded-lg bg-[#FAF9F7] px-3 py-2 md:col-span-3">
          <p className="mb-1 text-[11px] font-sans text-silver">结论</p>
          <p className="text-[14px] font-sans text-graphite leading-[1.7] line-clamp-2">
            {guidance.conclusion}
          </p>
        </div>
        <div className="rounded-lg border border-[#F0F0EE] bg-white px-3 py-2 md:col-span-2">
          <p className="mb-1 text-[11px] font-sans text-silver">原因</p>
          <p className="text-[12px] font-sans text-silver leading-relaxed">
            {guidance.reason}
          </p>
        </div>
        <div className="rounded-lg border border-[#E8DDD4] bg-white px-3 py-2">
          <p className="mb-1 text-[11px] font-sans text-silver">下一步</p>
          <p className="text-[12px] font-sans text-graphite leading-relaxed">
            {guidance.action}
          </p>
        </div>
      </div>

      {/* Key Takeaways */}
      {keyTakeaways.length > 0 && (
        <div className="mb-3 bg-[#FAF9F7] rounded-lg p-3 border border-[#F0F0EE]">
          <p className="text-[11px] font-sans text-silver mb-1.5 flex items-center gap-1">
            <KeyRound size={11} strokeWidth={1.5} />
            关键收获
          </p>
          <ul className="space-y-1">
            {keyTakeaways.slice(0, 3).map((tk, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-graphite leading-relaxed">
                <span className="w-1 h-1 rounded-full bg-[#C8956C] mt-1.5 shrink-0" />
                <span>{tk}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="text-[12px] font-sans px-2.5 py-1 rounded bg-light-gray text-graphite transition-colors duration-150 hover:bg-light-pink"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Journal Page                                                 */
/* ------------------------------------------------------------------ */

export default function Journal() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const allTags = useMemo(() => getAllTags(journalEntries), []);
  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  // Filter + sort entries
  const filteredEntries = useMemo(() => {
    let entries = [...journalEntries];

    // Category filter
    if (activeCategory !== 'all') {
      entries = entries.filter((e) => {
        const cat = getCategoryFromTags(e.tags);
        return cat === activeCategory;
      });
    }

    // Tag filter
    if (activeTag) {
      entries = entries.filter((e) => e.tags.includes(activeTag));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      entries = entries.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.excerpt.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    entries.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });

    return entries;
  }, [activeCategory, activeTag, searchQuery, sortOrder]);

  // Handle entry click
  const handleEntryClick = useCallback((entry: (typeof journalEntries)[0]) => {
    navigate(`/content/${entry.id}`);
  }, [navigate]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setActiveCategory('all');
    setActiveTag(null);
    setSearchQuery('');
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // 数据源固定后，这里直接渲染内容；后端接入时可切换为统一生命周期骨架

  // Error boundary
  if (!journalEntries || !Array.isArray(journalEntries)) {
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

  /* ---------------- List View ---------------- */
  return (
    <div className="pt-[calc(var(--app-nav-height)+16px)]">
      {/* 1. Page Header */}
      <section className="max-w-[800px] mx-auto px-5 md:px-6 pt-12 md:pt-[48px] pb-8 border-b border-border-color">
        <motion.h1
          className="font-serif text-[28px] md:text-[36px] leading-[1.3] text-ink mb-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          手记
        </motion.h1>
        <motion.p
          className="text-[15px] font-sans text-silver leading-relaxed mb-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: easeOut }}
        >
          每篇先看方法结论，再看事件原因，最后带走一个下一步。
        </motion.p>
        <motion.span
          className="inline-block mb-4 text-[12px] font-sans text-light-silver"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          共 {journalEntries.length} 篇手记
        </motion.span>

      </section>

      {/* 2. Filter & Search */}
      <section className="sticky top-[var(--app-nav-height)] z-30 bg-white/92 backdrop-blur-md border-b border-border-color">
        <div className="max-w-[800px] mx-auto px-5 md:px-6 py-3">
          {/* Row 1: search + sort */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1 max-w-[400px]">
              <Search
                size={16}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-light-silver pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索手记..."
                className="w-full h-10 pl-9 pr-9 text-[14px] font-sans text-ink bg-white border border-border-color rounded-lg placeholder:text-light-silver focus:outline-none focus:border-light-silver focus:shadow-[0_0_0_3px_rgba(200,200,200,0.12)] transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-light-silver hover:text-silver transition-colors"
                >
                  <X size={14} strokeWidth={1.5} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortOrder(opt.id as 'newest' | 'oldest')}
                  className={`text-[13px] font-sans px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                    sortOrder === opt.id
                      ? 'bg-light-pink text-graphite'
                      : 'text-silver hover:text-graphite hover:bg-light-gray'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: category filter tabs with counts */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 text-[13px] font-sans px-3.5 py-1.5 rounded-lg transition-colors duration-150 ${
                  activeCategory === cat.id
                    ? 'bg-light-pink text-graphite'
                    : 'text-silver hover:text-graphite hover:bg-light-gray'
                }`}
              >
                {cat.name}
                <span className="text-[11px] text-light-silver ml-0.5">
                  {categoryCounts[cat.id] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Row 3: tag filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mt-2">
            <span className="text-[12px] font-sans text-light-silver mr-1 shrink-0">
              标签
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`shrink-0 text-[12px] font-sans px-2.5 py-1 rounded transition-colors duration-150 ${
                  activeTag === tag
                    ? 'bg-light-pink text-graphite'
                    : 'bg-light-gray text-graphite hover:bg-light-pink'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Result count */}
      <section className="max-w-[800px] mx-auto px-5 md:px-6 pt-6 pb-2">
        <span className="text-[12px] font-sans text-silver">
          共 {filteredEntries.length} 篇手记
        </span>
      </section>

      {/* 4. Article List */}
      <section className="max-w-[800px] mx-auto px-5 md:px-6 pb-16">
        <AnimatePresence mode="wait">
          {filteredEntries.length > 0 ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {filteredEntries.map((entry, index) => (
                <JournalListItem
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onClick={() => handleEntryClick(entry)}
                />
              ))}

              {/* End of list */}
              <div className="pt-10 text-center">
                <span className="text-[13px] font-sans text-light-silver">
                  已展示全部手记
                </span>
              </div>
            </motion.div>
          ) : (
            <LifecycleEmptyState
              key="empty"
              icon={FileText}
              title="暂无手记"
              description="当前筛选条件下没有匹配的手记"
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
