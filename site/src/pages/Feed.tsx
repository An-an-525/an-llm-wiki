import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  TrendingUp,
  Sparkles,
  BookOpen,
  Star,
  ChevronDown,
  Inbox,
  Radio,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { format, isToday, isYesterday, subDays, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { feedItems } from '@/data/mockFeed';
import type { FeedItem } from '@/types';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Type config                                                         */
/* ------------------------------------------------------------------ */

type FeedType = 'all' | 'resource' | 'path_update' | 'work' | 'journal' | 'milestone';

const typeFilters: { key: FeedType; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'resource', label: '资源收藏' },
  { key: 'path_update', label: '路径更新' },
  { key: 'work', label: '新作品' },
  { key: 'journal', label: '手记' },
  { key: 'milestone', label: '里程碑' },
];

const typeConfig: Record<
  string,
  {
    icon: React.ReactNode;
    dotColor: string;
    label: string;
    bg: string;
    hoverText: string;
  }
> = {
  resource: {
    icon: <Bookmark size={13} strokeWidth={1.5} />,
    dotColor: '#C8956C',
    label: '资源',
    bg: 'bg-[#F5EDE8]',
    hoverText: 'hover:text-[#C8956C]',
  },
  path_update: {
    icon: <TrendingUp size={13} strokeWidth={1.5} />,
    dotColor: '#6B9E7C',
    label: '路径',
    bg: 'bg-[#E8F0EB]',
    hoverText: 'hover:text-[#6B9E7C]',
  },
  work: {
    icon: <Sparkles size={13} strokeWidth={1.5} />,
    dotColor: '#C47D6E',
    label: '作品',
    bg: 'bg-[#F0DDD8]',
    hoverText: 'hover:text-[#C47D6E]',
  },
  journal: {
    icon: <BookOpen size={13} strokeWidth={1.5} />,
    dotColor: '#8A9BB8',
    label: '手记',
    bg: 'bg-[#E8EBF0]',
    hoverText: 'hover:text-[#8A9BB8]',
  },
  milestone: {
    icon: <Star size={13} strokeWidth={1.5} />,
    dotColor: '#B8A87F',
    label: '里程碑',
    bg: 'bg-[#F0EDE5]',
    hoverText: 'hover:text-[#B8A87F]',
  },
};

const importanceConfig: Record<string, { label: string; color: string; borderClass: string }> = {
  critical: { label: '重要', color: '#C47D6E', borderClass: 'border-l-[#C47D6E]' },
  important: { label: '关注', color: '#C8956C', borderClass: 'border-l-[#C8956C]' },
  normal: { label: '普通', color: 'transparent', borderClass: 'border-l-transparent' },
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function parseDate(d: string): Date {
  return new Date(d);
}

function getDateLabel(d: Date): string {
  if (isToday(d)) return '今天';
  if (isYesterday(d)) return '昨天';
  const threeDaysAgo = subDays(new Date(), 3);
  if (isSameDay(d, threeDaysAgo)) return '3 天前';
  const sevenDaysAgo = subDays(new Date(), 7);
  if (d > sevenDaysAgo) {
    const diff = Math.floor((new Date().getTime() - d.getTime()) / 86400000);
    return `${diff} 天前`;
  }
  return format(d, 'yyyy年M月d日', { locale: zhCN });
}

function getTimeString(d: Date): string {
  return format(d, 'HH:mm');
}

/* ------------------------------------------------------------------ */
/*  Filter counts                                                       */
/* ------------------------------------------------------------------ */

function useTypeCounts(items: FeedItem[]) {
  return useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    typeFilters.forEach((f) => {
      if (f.key !== 'all') {
        counts[f.key] = items.filter((i) => i.type === f.key).length;
      }
    });
    return counts;
  }, [items]);
}

/* ------------------------------------------------------------------ */
/*  Group by date                                                       */
/* ------------------------------------------------------------------ */

interface DateGroup {
  date: Date;
  dateLabel: string;
  items: FeedItem[];
}

function groupByDate(items: FeedItem[]): DateGroup[] {
  const map = new Map<string, { date: Date; items: FeedItem[] }>();
  for (const item of items) {
    const d = parseDate(item.createdAt);
    const key = format(d, 'yyyy-MM-dd');
    const existing = map.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      map.set(key, { date: d, items: [item] });
    }
  }
  // Sort by date descending
  const sorted = Array.from(map.entries()).sort(
    (a, b) => b[1].date.getTime() - a[1].date.getTime()
  );
  return sorted.map(([, { date, items }]) => ({
    date,
    dateLabel: getDateLabel(date),
    items: items.sort((a, b) => parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime()),
  }));
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

const ITEMS_PER_PAGE = 8;

export default function Feed() {
  const [activeType, setActiveType] = useState<FeedType>('all');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const typeCounts = useTypeCounts(feedItems);

  const filtered = useMemo(() => {
    let list = [...feedItems];
    if (activeType !== 'all') {
      list = list.filter((i) => i.type === activeType);
    }
    // Sort by date descending
    list.sort((a, b) => parseDate(b.createdAt).getTime() - parseDate(a.createdAt).getTime());
    return list;
  }, [activeType]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const visibleItems = useMemo(() => {
    let count = 0;
    const result: DateGroup[] = [];
    for (const group of grouped) {
      if (count >= visibleCount) break;
      const remaining = visibleCount - count;
      const sliced = group.items.slice(0, remaining);
      result.push({ ...group, items: sliced });
      count += sliced.length;
    }
    return { groups: result, hasMore: count < filtered.length };
  }, [grouped, visibleCount, filtered.length]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((c) => c + ITEMS_PER_PAGE);
  }, []);

  const handleTypeChange = useCallback((key: FeedType) => {
    setActiveType(key);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  // TODO: 接入后端后使用 <PageSkeleton type="feed" /> 替代

  // Error boundary
  if (!feedItems || !Array.isArray(feedItems)) {
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
        <div className="max-w-[720px] mx-auto px-5 md:px-12 text-center">
          <motion.h1
            className="font-serif text-[28px] md:text-[36px] font-normal text-ink leading-[1.3] tracking-[-0.01em] mb-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            风信
          </motion.h1>
          <motion.p
            className="text-[15px] font-sans font-normal text-silver leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.15 }}
          >
            风信汇聚AI资讯、工具更新、路径进展与我的动态。重要消息会高亮显示，每条都标注了来源与建议行动。
          </motion.p>
        </div>
      </section>

      {/* ========== Sticky Filters ========== */}
      <div className="sticky top-16 z-30 bg-white/90 backdrop-blur-[8px] border-b border-border-color">
        <div className="max-w-[720px] mx-auto px-5 md:px-12 py-3">
          {/* Result count */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-sans text-silver">
              共 <span className="text-graphite font-medium">{filtered.length}</span> 条动态
            </span>
          </div>
          {/* Type filters with counts */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
            {typeFilters.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTypeChange(t.key)}
                className={
                  activeType === t.key
                    ? 'shrink-0 px-3.5 py-1.5 rounded-lg text-[13px] font-sans font-normal transition-colors duration-150 bg-light-pink text-graphite'
                    : 'shrink-0 px-3.5 py-1.5 rounded-lg text-[13px] font-sans font-normal text-silver hover:text-graphite hover:bg-cream transition-colors duration-150'
                }
              >
                <span className="flex items-center gap-1.5">
                  {t.key !== 'all' && (
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: typeConfig[t.key]?.dotColor || '#C8C8C6' }}
                    />
                  )}
                  {t.label}
                  <span className="text-[11px] text-light-silver">
                    ({typeCounts[t.key] || 0})
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========== Feed List ========== */}
      <section className="py-8 md:py-12 pb-16">
        <div className="max-w-[720px] mx-auto px-5 md:px-12">
          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <LifecycleEmptyState
                key="empty"
                icon={Inbox}
                title="暂无动态"
                description="暂时没有符合条件的动态，试试其他筛选条件吧"
                action={{
                  label: '查看全部',
                  onClick: () => setActiveType('all'),
                }}
              />
            ) : (
              <motion.div
                key={activeType}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {visibleItems.groups.map((group, gIdx) => (
                  <div key={format(group.date, 'yyyy-MM-dd')} className="mb-8">
                    {/* Date header - sticky */}
                    <div className="sticky top-[124px] md:top-[128px] z-20 bg-white/95 backdrop-blur-[4px] py-2 mb-2 border-b border-border-color/60">
                      <span className="text-[12px] font-sans font-normal text-silver tracking-[0.02em] uppercase">
                        {group.dateLabel}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="relative pl-5">
                      {/* Vertical timeline line */}
                      <div
                        className="absolute left-[3px] top-0 bottom-0 w-[2px] bg-border-color"
                        aria-hidden="true"
                      />

                      {group.items.map((item, iIdx) => {
                        const cfg = typeConfig[item.type] || typeConfig.resource;
                        const impCfg = importanceConfig[item.importanceLevel || 'normal'];
                        const itemDate = parseDate(item.createdAt);
                        const isCritical = item.importanceLevel === 'critical';

                        return (
                          <motion.div
                            key={item.id}
                            className={`relative pb-5 pl-5 ${
                              isCritical
                                ? 'bg-[rgba(196,125,110,0.04)] -mr-5 pr-5 rounded-r-lg'
                                : ''
                            }`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              ease: easeOut,
                              delay: gIdx * 0.04 + iIdx * 0.04,
                            }}
                          >
                            {/* Dot */}
                            <div
                              className="absolute left-0 top-[22px] w-2 h-2 rounded-full border-2 border-white"
                              style={{ backgroundColor: cfg.dotColor }}
                            />

                            {/* Content */}
                            <div
                              className={`pt-4 pb-1 border-l-2 pl-4 -ml-4 ${impCfg.borderClass}`}
                            >
                              {/* Meta row: type + source + time + importance */}
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-sans font-normal ${cfg.bg} text-graphite`}
                                >
                                  {cfg.icon}
                                  {cfg.label}
                                </span>
                                <span className="text-[11px] font-sans text-light-silver">
                                  {getTimeString(itemDate)}
                                </span>
                                {/* Source badge */}
                                <span className="inline-flex items-center gap-1 text-[11px] font-sans text-silver bg-light-gray px-2 py-0.5 rounded">
                                  <Radio size={10} strokeWidth={1.5} />
                                  {item.source}
                                </span>
                                {/* Importance badge */}
                                {isCritical && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-sans text-[#C47D6E] bg-[#C47D6E]/10 px-2 py-0.5 rounded">
                                    <AlertTriangle size={10} strokeWidth={1.5} />
                                    重要
                                  </span>
                                )}
                                {item.importanceLevel === 'important' && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-sans text-[#C8956C] bg-[#C8956C]/10 px-2 py-0.5 rounded">
                                    <Star size={10} strokeWidth={1.5} />
                                    关注
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <Link
                                to={item.link || '#'}
                                className={`block text-[15px] font-sans font-medium text-graphite leading-[1.6] mb-1 transition-colors duration-200 ${cfg.hoverText}`}
                              >
                                {item.title}
                              </Link>

                              {/* Content */}
                              {item.content && (
                                <p className="text-[13px] font-sans font-normal text-silver leading-[1.7] mb-2 line-clamp-2">
                                  {item.content}
                                </p>
                              )}

                              {/* Action text */}
                              {item.actionText && (
                                <div className="flex items-start gap-1.5 mb-2 bg-[#F5EDE8]/50 rounded-lg px-3 py-2">
                                  <ArrowRight size={12} strokeWidth={1.5} className="text-[#C8956C] mt-0.5 shrink-0" />
                                  <p className="text-[12px] font-sans text-graphite leading-relaxed">
                                    <span className="text-silver">建议：</span>
                                    {item.actionText}
                                  </p>
                                </div>
                              )}

                              {/* Tags + link */}
                              <div className="flex items-center gap-2 flex-wrap mt-2">
                                {item.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 rounded text-[11px] font-sans font-normal bg-light-gray text-silver hover:bg-light-pink transition-colors duration-150"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {item.link && (
                                  <Link
                                    to={item.link}
                                    className="text-[12px] font-sans text-silver hover:text-graphite transition-colors duration-150 ml-auto flex items-center gap-0.5"
                                  >
                                    查看
                                    <ArrowRight size={12} strokeWidth={1.5} />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Load more */}
                <div className="flex justify-center mt-12">
                  {visibleItems.hasMore ? (
                    <button
                      onClick={handleLoadMore}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-border-color text-[13px] font-sans font-normal text-graphite hover:bg-cream hover:border-border-dark transition-all duration-200"
                    >
                      加载更早的动态
                      <ChevronDown size={14} strokeWidth={1.5} />
                    </button>
                  ) : filtered.length > 0 ? (
                    <p className="text-[12px] font-sans text-light-silver tracking-[0.02em]">
                      —— 已展示全部动态 ——
                    </p>
                  ) : null}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
