import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Search,
  ArrowLeft,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  X,
  KeyRound,
  GraduationCap,
  Zap,
} from 'lucide-react';
import { journalEntries } from '@/data/mockJournal';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';
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

function extractHeadings(body: string): { level: number; text: string }[] {
  const lines = body.split('\n');
  const headings: { level: number; text: string }[] = [];
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)/);
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim() });
    }
  }
  return headings;
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
/*  Page Guide                                                        */
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
        手记记录我的学习过程、思考碎片与复盘总结。每篇都标注了阅读时长、难度和关键收获，方便你快速判断是否有兴趣深入。
      </p>
    </motion.div>
  );
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

  const minutes = readTime ?? estimateReadTime(entry.body);
  const diffCfg = difficulty ? difficultyConfig[difficulty] : null;

  return (
    <motion.article
      className="group py-6 md:py-7 border-b border-border-color cursor-pointer transition-colors duration-200 hover:bg-[rgba(250,249,247,0.6)] -mx-5 md:-mx-6 px-5 md:px-6 card-tap"
      style={{ borderLeft: '3px solid transparent' }}
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: easeOut }}
      whileHover={{ borderLeftColor: '#C47D6E' }}
    >
      {/* Cover image */}
      {entry.cover && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={entry.cover}
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

      {/* Excerpt */}
      <p className="text-[15px] font-sans text-silver leading-[1.7] line-clamp-3 mb-3">
        {entry.excerpt}
      </p>

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
/*  Journal Detail                                                    */
/* ------------------------------------------------------------------ */

function JournalDetail({
  entry,
  prevEntry,
  nextEntry,
  onBack,
  onNavigate,
}: {
  entry: JournalEntry;
  prevEntry: JournalEntry | null;
  nextEntry: JournalEntry | null;
  onBack: () => void;
  onNavigate: (entry: JournalEntry) => void;
}) {
  const headings = extractHeadings(entry.body);
  const category = getCategoryFromTags(entry.tags);
  const readTime = entry.readingTime;
  const difficulty = entry.difficulty;
  const keyTakeaways = entry.keyTakeaways ?? [];

  const minutes = readTime ?? estimateReadTime(entry.body);
  const diffCfg = difficulty ? difficultyConfig[difficulty] : null;

  return (
    <motion.div
      className="pt-16 md:pt-[96px] pb-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Back button */}
      <div className="max-w-[800px] mx-auto px-5 md:px-6 mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[14px] font-sans text-silver hover:text-ink transition-colors duration-150"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          返回列表
        </button>
      </div>

      <div className="max-w-[800px] mx-auto px-5 md:px-6">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
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
            <h1 className="font-serif text-[24px] md:text-[36px] leading-[1.3] text-ink mb-6">
              {entry.title}
            </h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6 pb-6 border-b border-border-color">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[12px] font-sans px-2.5 py-1 rounded bg-light-gray text-graphite"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Key Takeaways at top */}
            {keyTakeaways.length > 0 && (
              <div className="bg-[#F5EDE8] rounded-xl p-4 md:p-5 mb-8">
                <h4 className="text-[13px] font-sans font-medium text-graphite mb-3 flex items-center gap-1.5">
                  <KeyRound size={13} strokeWidth={1.5} className="text-[#C8956C]" />
                  关键收获
                </h4>
                <ul className="space-y-2">
                  {keyTakeaways.map((tk, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[14px] text-graphite leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] text-[#C8956C] font-medium shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{tk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Body */}
            <div className="prose-custom">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {entry.body}
              </ReactMarkdown>
            </div>

            {/* Prev/Next navigation */}
            <div className="mt-12 pt-8 border-t border-border-color grid grid-cols-1 md:grid-cols-2 gap-6">
              {prevEntry ? (
                <button
                  onClick={() => onNavigate(prevEntry)}
                  className="group text-left"
                >
                  <span className="text-[12px] font-sans text-silver mb-1 flex items-center gap-1">
                    <ChevronLeft size={14} strokeWidth={1.5} />
                    上一篇
                  </span>
                  <span className="text-[15px] font-serif text-ink group-hover:text-favorite transition-colors duration-200 line-clamp-1">
                    {prevEntry.title}
                  </span>
                </button>
              ) : (
                <div />
              )}
              {nextEntry ? (
                <button
                  onClick={() => onNavigate(nextEntry)}
                  className="group text-left md:text-right"
                >
                  <span className="text-[12px] font-sans text-silver mb-1 flex items-center gap-1 md:justify-end">
                    下一篇
                    <ChevronRight size={14} strokeWidth={1.5} />
                  </span>
                  <span className="text-[15px] font-serif text-ink group-hover:text-favorite transition-colors duration-200 line-clamp-1">
                    {nextEntry.title}
                  </span>
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Desktop TOC sidebar */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-[200px] shrink-0">
              <div className="sticky top-[96px]">
                <h4 className="text-[12px] font-sans text-silver mb-3 uppercase tracking-wider">
                  目录
                </h4>
                <nav className="space-y-2">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#heading-${i}`}
                      className="block text-[13px] font-sans text-silver hover:text-ink transition-colors duration-150 leading-relaxed"
                      style={{
                        paddingLeft: h.level === 1 ? 0 : h.level === 2 ? '12px' : '24px',
                      }}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Journal Page                                                 */
/* ------------------------------------------------------------------ */

export default function Journal() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedEntry, setSelectedEntry] = useState<(typeof journalEntries)[0] | null>(null);

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
    setSelectedEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle back
  const handleBack = useCallback(() => {
    setSelectedEntry(null);
  }, []);

  // Handle navigate from prev/next
  const handleNavigate = useCallback(
    (entry: (typeof journalEntries)[0]) => {
      setSelectedEntry(entry);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

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

  // Compute prev/next entries
  const currentIndex = selectedEntry
    ? filteredEntries.findIndex((e) => e.id === selectedEntry.id)
    : -1;
  const prevEntry = currentIndex > 0 ? filteredEntries[currentIndex - 1] : null;
  const nextEntry =
    currentIndex >= 0 && currentIndex < filteredEntries.length - 1
      ? filteredEntries[currentIndex + 1]
      : null;

  // TODO: 接入后端后使用 <PageSkeleton type="list" /> 替代

  // Error boundary
  if (!journalEntries || !Array.isArray(journalEntries)) {
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

  // Detail view
  if (selectedEntry) {
    return (
      <JournalDetail
        entry={selectedEntry}
        prevEntry={prevEntry}
        nextEntry={nextEntry}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    );
  }

  /* ---------------- List View ---------------- */
  return (
    <div className="pt-16 md:pt-[96px]">
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
          随笔与思考记录。不成体系，但真诚。
        </motion.p>
        <motion.span
          className="inline-block mb-4 text-[12px] font-sans text-light-silver"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          共 {journalEntries.length} 篇手记
        </motion.span>

        <PageGuide />
      </section>

      {/* 2. Filter & Search */}
      <section className="sticky top-16 md:top-16 z-30 bg-white/92 backdrop-blur-md border-b border-border-color">
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
                  —— 已展示全部手记 ——
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
