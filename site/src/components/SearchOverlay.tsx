/**
 * 全局搜索浮层
 * Cmd+K 触发，搜索藏馆/谱系/工坊/手记内容
 * 使用 mock 数据，后续可替换为后端搜索 API
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Library, GitBranch, Hammer, FileText, ArrowRight } from 'lucide-react';
import { libraryItems } from '@/data/mockLibrary';
import { paths } from '@/data/mockPaths';
import { works } from '@/data/mockWorks';
import { journalEntries } from '@/data/mockJournal';
import { feedItems } from '@/data/mockFeed';
import { timelineEvents } from '@/data/mockTimeline';
// ImagePlaceholder available for future use when search results include images

type SearchResult = {
  id: string;
  title: string;
  description: string;
  type: 'library' | 'path' | 'work' | 'journal' | 'feed' | 'timeline' | 'about';
  typeLabel: string;
  url: string;
};

const typeConfig = {
  library: { label: '藏馆', icon: Library, color: 'text-blue-500 bg-blue-50' },
  path: { label: '谱系', icon: GitBranch, color: 'text-emerald-500 bg-emerald-50' },
  work: { label: '工坊', icon: Hammer, color: 'text-amber-500 bg-amber-50' },
  journal: { label: '手记', icon: FileText, color: 'text-purple-500 bg-purple-50' },
  feed: { label: '风信', icon: FileText, color: 'text-sky-500 bg-sky-50' },
  timeline: { label: '年谱', icon: FileText, color: 'text-rose-500 bg-rose-50' },
  about: { label: '书房', icon: FileText, color: 'text-stone-500 bg-stone-50' },
};

// 统一搜索数据源
function getAllSearchables(): SearchResult[] {
  const results: SearchResult[] = [];

  libraryItems.forEach((item) => {
    results.push({
      id: item.id,
      title: item.title,
      description: item.description,
      type: 'library',
      typeLabel: '藏馆',
      url: `/content/${item.id}`,
    });
  });

  paths.forEach((path) => {
    results.push({
      id: path.id,
      title: path.title,
      description: path.description,
      type: 'path',
      typeLabel: '谱系',
      url: `/paths/${path.id}`,
    });
  });

  works.forEach((work) => {
    results.push({
      id: work.id,
      title: work.title,
      description: work.description,
      type: 'work',
      typeLabel: '工坊',
      url: `/content/${work.id}`,
    });
  });

  journalEntries.forEach((entry) => {
    results.push({
      id: entry.id,
      title: entry.title,
      description: entry.excerpt,
      type: 'journal',
      typeLabel: '手记',
      url: `/content/${entry.id}`,
    });
  });

  feedItems.forEach((item) => {
    results.push({
      id: item.id,
      title: item.title,
      description: item.content,
      type: 'feed',
      typeLabel: '风信',
      url: `/content/${item.id}`,
    });
  });

  timelineEvents.forEach((item) => {
    results.push({
      id: item.id,
      title: item.title,
      description: item.description,
      type: 'timeline',
      typeLabel: '年谱',
      url: `/content/${item.id}`,
    });
  });

  results.push({
    id: 'about',
    title: '安的书房',
    description: '先认识安和小安，再开始看资料、路线和作品。',
    type: 'about',
    typeLabel: '书房',
    url: '/about',
  });

  return results;
}

// 简化的防抖 hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [activeType, setActiveType] = useState<string>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const navigate = useNavigate();
  const debouncedQuery = useDebounce(query, 150);

  const allResults = useMemo(() => getAllSearchables(), []);
  const closeSearch = useCallback(() => {
    setQuery('');
    setActiveType('all');
    onClose();
  }, [onClose]);

  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase().trim();
    let results = allResults.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.typeLabel.includes(q)
    );
    if (activeType !== 'all') {
      results = results.filter((r) => r.type === activeType);
    }
    return results.slice(0, 12); // 最多显示12条
  }, [debouncedQuery, activeType, allResults]);

  useEffect(() => {
    const node = resultRefs.current[activeIndex];
    if (node) {
      node.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // 按类型分组统计
  const counts = useMemo(() => {
    if (!debouncedQuery.trim()) return {} as Record<string, number>;
    const q = debouncedQuery.toLowerCase().trim();
    const matched = allResults.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
    const c: Record<string, number> = { all: matched.length };
    matched.forEach((r) => {
      c[r.type] = (c[r.type] || 0) + 1;
    });
    return c;
  }, [debouncedQuery, allResults]);

  // 自动聚焦
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Escape 关闭
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeSearch();
        return;
      }

      if (!debouncedQuery.trim() || filtered.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const target = filtered[activeIndex];
        if (target) {
          closeSearch();
          navigate(target.url);
        }
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeSearch, debouncedQuery, filtered, activeIndex, navigate]);

  const handleResultClick = useCallback(
    (url: string) => {
      closeSearch();
      navigate(url);
    },
    [navigate, closeSearch]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeSearch}
          />

          {/* Search panel */}
          <motion.div
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E5E5E3]">
              <Search size={18} strokeWidth={1.5} className="text-[#B8B8B6] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                  resultRefs.current = [];
                }}
                placeholder="搜索书房、藏馆、谱系、工坊、风信、年谱..."
                className="flex-1 text-[15px] bg-transparent outline-none placeholder:text-[#B8B8B6] text-[#1E1E1E]"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    setActiveIndex(0);
                    resultRefs.current = [];
                  }}
                  className="p-1 text-[#B8B8B6] hover:text-[#1E1E1E] transition-colors"
                >
                  <X size={16} />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] text-[#B8B8B6] bg-[#F2F2F0] rounded border border-[#E5E5E3] font-sans">
                ESC
              </kbd>
            </div>

            {/* Type filters */}
            {debouncedQuery.trim() && (
              <div className="flex items-center gap-1 px-4 py-2 border-b border-[#F5EDE8] overflow-x-auto scrollbar-hide">
                {[
                  { key: 'all', label: '全部', count: counts.all || 0 },
                  { key: 'library', label: '藏馆', count: counts.library || 0 },
                  { key: 'path', label: '谱系', count: counts.path || 0 },
                  { key: 'work', label: '工坊', count: counts.work || 0 },
                  { key: 'journal', label: '手记', count: counts.journal || 0 },
                  { key: 'feed', label: '风信', count: counts.feed || 0 },
                  { key: 'timeline', label: '年谱', count: counts.timeline || 0 },
                ]
                  .filter((t) => t.key === 'all' || t.count > 0)
                  .map((t) => (
                  <button
                    key={t.key}
                    onClick={() => {
                      setActiveType(t.key);
                      setActiveIndex(0);
                      resultRefs.current = [];
                    }}
                    className={`px-3 py-1 rounded-full text-[12px] whitespace-nowrap transition-colors ${
                      activeType === t.key
                        ? 'bg-[#1E1E1E] text-white'
                        : 'text-[#8A8A88] hover:bg-[#F2F2F0]'
                    }`}
                  >
                    {t.label}
                    {t.count > 0 && ` ${t.count}`}
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {!debouncedQuery.trim() ? (
                <div className="py-12 text-center">
                  <Search
                    size={32}
                    strokeWidth={1.2}
                    className="text-[#E5E5E3] mx-auto mb-3"
                  />
                  <p className="text-sm text-[#B8B8B6]">
                    输入关键词开始搜索
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-4 px-8">
                    {['前端', '小安', '智能体', '复刻', '年谱'].map(
                      (tag) => (
                        <button
                        key={tag}
                          onClick={() => {
                            setQuery(tag);
                            setActiveIndex(0);
                            resultRefs.current = [];
                          }}
                          className="px-3 py-1 text-[12px] text-[#8A8A88] bg-[#F2F2F0] rounded-full hover:bg-[#E5E5E3] transition-colors"
                        >
                          {tag}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm text-[#B8B8B6]">
                    没有找到「{debouncedQuery}」相关内容
                  </p>
                  <p className="text-xs text-[#C8C8C6] mt-1">
                    试试其他关键词
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {filtered.map((result, idx) => {
                    const config = typeConfig[result.type];
                    const Icon = config.icon;
                    return (
                      <motion.button
                        key={result.id}
                        ref={(node) => {
                          resultRefs.current[idx] = node;
                        }}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.2 }}
                        onClick={() => handleResultClick(result.url)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors group ${
                          activeIndex === idx ? 'bg-[#FAF9F7]' : 'hover:bg-[#FAF9F7]'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}
                        >
                          <Icon size={14} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] text-[#1E1E1E] font-medium truncate group-hover:text-[#C8956C] transition-colors">
                              {result.title}
                            </span>
                            <span className="text-[10px] text-[#B8B8B6] bg-[#F2F2F0] px-1.5 py-0.5 rounded shrink-0">
                              {config.label}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#8A8A88] truncate mt-0.5">
                            {result.description}
                          </p>
                        </div>
                        <ArrowRight
                          size={14}
                          className="text-[#D0D0CE] group-hover:text-[#8A8A88] transition-colors shrink-0 mt-1"
                        />
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#F5EDE8] bg-[#FAF9F7]">
              <span className="text-[11px] text-[#B8B8B6]">
                {filtered.length > 0 ? `找到 ${filtered.length} 条结果` : '安的书房搜索'}
              </span>
              {filtered.length > 0 && (
                <div className="flex items-center gap-2 text-[11px] text-[#B8B8B6]">
                  <kbd className="px-1 py-0.5 bg-white rounded border border-[#E5E5E3]">↑↓</kbd>
                  <span>选择</span>
                  <kbd className="px-1 py-0.5 bg-white rounded border border-[#E5E5E3]">Enter</kbd>
                  <span>打开</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
