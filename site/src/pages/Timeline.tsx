import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router';
import {
  Trophy,
  BookOpen,
  Hammer,
  Heart,
  ArrowRight,
  Circle,
  Target,
  Quote,
  Route,
  Sparkles,
} from 'lucide-react';
import { timelineEvents } from '@/data/mockTimeline';
import type { TimelineEvent } from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

const categoryConfig: Record<
  string,
  { label: string; color: string; icon: typeof Trophy }
> = {
  milestone: { label: '里程碑', color: '#C47D6E', icon: Trophy },
  learning: { label: '学习', color: '#C8956C', icon: BookOpen },
  work: { label: '作品', color: '#6B9E7C', icon: Hammer },
  life: { label: '生活', color: '#8A9BB8', icon: Heart },
};

const yearFilters = ['all', '2025', '2024', '2023', '2022'];
const categoryFilters = ['all', 'milestone', 'learning', 'work', 'life'];

const importanceColors: Record<string, string> = {
  normal: '#C8C8C6',
  important: '#C8956C',
  major: '#C47D6E',
};

const importanceSize: Record<string, number> = {
  normal: 10,
  important: 14,
  major: 18,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getYearFromDate(dateStr: string): string {
  return dateStr.split('.')[0];
}

function getMonthFromDate(dateStr: string): string {
  const parts = dateStr.split('.');
  if (parts.length < 2) return '';
  return parseInt(parts[1], 10) + ' 月';
}

function groupByYear(events: typeof timelineEvents) {
  const groups: Record<string, typeof timelineEvents> = {};
  for (const event of events) {
    const year = getYearFromDate(event.date);
    if (!groups[year]) groups[year] = [];
    groups[year].push(event);
  }
  const sortedYears = Object.keys(groups).sort((a, b) => parseInt(b) - parseInt(a));
  return sortedYears.map((year) => ({ year, events: groups[year] }));
}

/* ------------------------------------------------------------------ */
/*  Page Guide                                                        */
/* ------------------------------------------------------------------ */

function PageGuide() {
  return (
    <motion.div
      className="bg-[#F5EDE8] rounded-xl p-4 md:p-5 mb-6 max-w-[720px] mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.25 }}
    >
      <p className="text-[13px] font-sans text-silver leading-relaxed">
        年谱记录我的成长历程与关键节点。每个阶段都标注了成果、反思与关联的学习路径。
      </p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stage Summary Card                                                */
/* ------------------------------------------------------------------ */

function StageSummaryCard({
  year,
  eventCount,
  achievements,
}: {
  year: string;
  eventCount: number;
  achievements: string[];
}) {
  if (achievements.length === 0) return null;

  return (
    <motion.div
      className="my-4 md:my-6 bg-[#FAF9F7] rounded-xl p-4 md:p-5 border border-[#F0F0EE]"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} strokeWidth={1.5} className="text-[#C8956C]" />
        <span className="text-[13px] font-sans font-medium text-graphite">
          {year} 年阶段总结
        </span>
        <span className="text-[11px] text-silver">· {eventCount} 个节点</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {achievements.map((ach, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 text-[12px] px-2.5 py-1 bg-white rounded-lg text-graphite border border-[#E5E5E3]"
          >
            <Target size={10} strokeWidth={1.5} className="text-[#6B9E7C]" />
            {ach}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline Card                                                     */
/* ------------------------------------------------------------------ */

function TimelineCard({
  event,
  config,
  Icon,
}: {
  event: TimelineEvent;
  config: { label: string; color: string; icon: typeof Trophy };
  Icon: typeof Trophy;
}) {
  const achievements = event.achievements ?? [];
  const reflection = event.reflection;
  const relatedPathIds = event.relatedPathIds ?? [];

  return (
    <motion.div
      className="bg-white border border-border-color rounded-xl p-4 md:p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Category badge + date */}
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: config.color }}
        >
          <Icon size={10} strokeWidth={1.5} />
          {config.label}
        </span>
        <span className="text-[11px] font-sans text-light-silver">
          {getMonthFromDate(event.date)}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-[15px] font-sans font-medium text-ink mb-1.5 leading-snug">
        {event.title}
      </h4>

      {/* Description */}
      <p className="text-[13px] font-sans text-silver leading-relaxed mb-3">
        {event.description}
      </p>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-3">
          <p className="text-[11px] font-sans text-silver mb-1.5 flex items-center gap-1">
            <Target size={11} strokeWidth={1.5} />
            成果
          </p>
          <div className="flex flex-wrap gap-1.5">
            {achievements.map((ach, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded bg-[#F0F7F2] text-graphite"
              >
                {ach}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reflection */}
      {reflection && (
        <div className="bg-[#FAF9F7] rounded-lg p-3 border border-[#F0F0EE] mb-3">
          <p className="text-[11px] text-silver mb-1 flex items-center gap-1">
            <Quote size={10} strokeWidth={1.5} />
            感悟
          </p>
          <p className="text-[12px] text-graphite italic leading-relaxed">{reflection}</p>
        </div>
      )}

      {/* Related Paths */}
      {relatedPathIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {relatedPathIds.map((pid) => (
            <Link
              key={pid}
              to={`/paths/${pid}`}
              className="inline-flex items-center gap-1 text-[11px] font-sans text-[#C8956C] hover:opacity-80 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Route size={10} strokeWidth={1.5} />
              关联路径
              <ArrowRight size={10} strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      )}

      {/* Related links */}
      {event.relatedLinks && event.relatedLinks.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F0F0EE]">
          {event.relatedLinks.map((link) => (
            <Link
              key={link}
              to={link}
              className="inline-flex items-center gap-1 text-[12px] font-sans text-favorite hover:opacity-80 transition-opacity duration-150"
            >
              了解更多
              <ArrowRight size={12} strokeWidth={1.5} />
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline Node                                                     */
/* ------------------------------------------------------------------ */

function TimelineNode({
  event,
  index,
  isLeft,
}: {
  event: (typeof timelineEvents)[0];
  index: number;
  isLeft: boolean;
}) {
  const config = categoryConfig[event.category] || categoryConfig.milestone;
  const Icon = config.icon;
  const dotColor = importanceColors[event.importance] || importanceColors.normal;
  const dotSize = importanceSize[event.importance] || importanceSize.normal;
  const isMajor = event.importance === 'major';

  return (
    <div className="relative flex items-start md:items-stretch">
      {/* Desktop alternating layout */}
      <div className="hidden md:contents">
        {isLeft ? (
          <>
            <motion.div
              className="flex-1 pr-8 flex justify-end"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: easeOut }}
            >
              <TimelineCard event={event} config={config} Icon={Icon} />
            </motion.div>

            <div className="relative flex flex-col items-center shrink-0">
              <div className="relative" style={{ width: 2, backgroundColor: '#E5E5E3' }}>
                <motion.div
                  className="absolute top-6 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: index * 0.1, duration: 0.3, ease: easeSpring }}
                >
                  <div
                    className="rounded-full flex items-center justify-center relative"
                    style={{
                      width: dotSize,
                      height: dotSize,
                      backgroundColor: dotColor,
                      ...(isMajor
                        ? { boxShadow: '0 0 0 3px rgba(196,125,110,0.15)' }
                        : {}),
                    }}
                  >
                    {isMajor && (
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ animation: 'pulse-major 2.5s ease-in-out infinite' }}
                      />
                    )}
                  </div>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 mt-1"
                    style={{ color: dotColor }}
                  >
                    <Icon size={12} strokeWidth={1.5} />
                  </div>
                </motion.div>
                <div className="w-[2px] bg-border-color flex-1 min-h-[100px]" />
              </div>
            </div>

            <div className="flex-1 pl-8" />
          </>
        ) : (
          <>
            <div className="flex-1 pr-8" />

            <div className="relative flex flex-col items-center shrink-0">
              <div className="relative" style={{ width: 2, backgroundColor: '#E5E5E3' }}>
                <motion.div
                  className="absolute top-6 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: index * 0.1, duration: 0.3, ease: easeSpring }}
                >
                  <div
                    className="rounded-full flex items-center justify-center relative"
                    style={{
                      width: dotSize,
                      height: dotSize,
                      backgroundColor: dotColor,
                      ...(isMajor
                        ? { boxShadow: '0 0 0 3px rgba(196,125,110,0.15)' }
                        : {}),
                    }}
                  >
                    {isMajor && (
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ animation: 'pulse-major 2.5s ease-in-out infinite' }}
                      />
                    )}
                  </div>
                  <div
                    className="absolute left-1/2 -translate-x-1/2 mt-1"
                    style={{ color: dotColor }}
                  >
                    <Icon size={12} strokeWidth={1.5} />
                  </div>
                </motion.div>
                <div className="w-[2px] bg-border-color flex-1 min-h-[100px]" />
              </div>
            </div>

            <motion.div
              className="flex-1 pl-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: easeOut }}
            >
              <TimelineCard event={event} config={config} Icon={Icon} />
            </motion.div>
          </>
        )}
      </div>

      {/* Mobile: single column, left-aligned */}
      <div className="flex md:hidden items-start gap-4 w-full">
        <div className="flex flex-col items-center shrink-0 pt-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.1, duration: 0.3, ease: easeSpring }}
          >
            <div
              className="rounded-full"
              style={{
                width: dotSize,
                height: dotSize,
                backgroundColor: dotColor,
                ...(isMajor
                  ? { boxShadow: '0 0 0 3px rgba(196,125,110,0.15)' }
                  : {}),
              }}
            />
          </motion.div>
        </div>

        <motion.div
          className="flex-1 min-w-0"
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ delay: index * 0.1 + 0.05, duration: 0.4, ease: easeOut }}
        >
          <TimelineCard event={event} config={config} Icon={Icon} />
        </motion.div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Year Marker                                                       */
/* ------------------------------------------------------------------ */

function YearMarker({ year }: { year: string }) {
  return (
    <div className="relative flex items-center justify-center py-6 md:py-8">
      <div className="hidden md:flex items-center">
        <div className="flex-1" />
        <div className="relative flex justify-center" style={{ width: 2 }}>
          <motion.div
            className="w-12 h-12 rounded-full bg-cream border-2 border-border-color flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easeSpring }}
          >
            <span className="font-serif text-[14px] text-silver">{year}</span>
          </motion.div>
        </div>
        <div className="flex-1" />
      </div>

      <div className="flex md:hidden items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-cream border-2 border-border-color flex items-center justify-center shrink-0">
          <span className="font-serif text-[12px] text-silver">{year}</span>
        </div>
        <span className="font-serif text-[20px] text-silver/30">{year}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                       */
/* ------------------------------------------------------------------ */

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      className="py-20 flex flex-col items-center text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <Circle size={48} strokeWidth={1} className="text-light-silver mb-4" />
      <h3 className="font-serif text-[18px] text-ink mb-2">暂无节点</h3>
      <p className="text-[14px] font-sans text-silver mb-6">
        当前筛选条件下没有年谱节点
      </p>
      <button
        onClick={onClear}
        className="text-[14px] font-sans text-ink border border-border-color rounded-lg px-4 py-2 hover:bg-cream transition-colors duration-150"
      >
        清除筛选
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter counts helpers                                             */
/* ------------------------------------------------------------------ */

function getYearCounts() {
  const counts: Record<string, number> = { all: timelineEvents.length };
  yearFilters.forEach((year) => {
    if (year !== 'all') {
      counts[year] = timelineEvents.filter((e) => getYearFromDate(e.date) === year).length;
    }
  });
  return counts;
}

function getCategoryCounts() {
  const counts: Record<string, number> = { all: timelineEvents.length };
  categoryFilters.forEach((cat) => {
    if (cat !== 'all') {
      counts[cat] = timelineEvents.filter((e) => e.category === cat).length;
    }
  });
  return counts;
}

/* ------------------------------------------------------------------ */
/*  Main Timeline Page                                                */
/* ------------------------------------------------------------------ */

export default function Timeline() {
  const [activeYear, setActiveYear] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');

  const yearCounts = useMemo(() => getYearCounts(), []);
  const categoryCounts = useMemo(() => getCategoryCounts(), []);

  // Compute stats
  const stats = useMemo(() => {
    return {
      nodes: timelineEvents.length,
      years: new Set(timelineEvents.map((e) => getYearFromDate(e.date))).size,
      completedPaths: timelineEvents.filter(
        (e) => e.category === 'milestone' && (e.importance === 'important' || e.importance === 'major')
      ).length,
    };
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    let events = [...timelineEvents];
    if (activeYear !== 'all') {
      events = events.filter((e) => getYearFromDate(e.date) === activeYear);
    }
    if (activeCategory !== 'all') {
      events = events.filter((e) => e.category === activeCategory);
    }
    return events;
  }, [activeYear, activeCategory]);

  // Group by year
  const yearGroups = useMemo(() => groupByYear(filteredEvents), [filteredEvents]);

  const clearFilters = () => {
    setActiveYear('all');
    setActiveCategory('all');
  };

  const yearRange = useMemo(() => {
    if (timelineEvents.length === 0) return '';
    const years = timelineEvents.map((e) => parseInt(getYearFromDate(e.date)));
    const min = Math.min(...years);
    const max = Math.max(...years);
    return `${min} — ${max}`;
  }, []);

  return (
    <div className="pt-16 md:pt-[96px]">
      {/* 1. Page Header */}
      <section className="max-w-[800px] mx-auto px-5 md:px-6 pt-12 md:pt-[48px] pb-8 border-b border-border-color text-center">
        <motion.h1
          className="font-serif text-[28px] md:text-[36px] leading-[1.3] text-ink mb-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          年谱
        </motion.h1>
        <motion.p
          className="text-[15px] font-sans text-silver leading-relaxed mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: easeOut }}
        >
          成长的重要节点，从过去到现在。每一步都算数。
        </motion.p>
        <motion.div
          className="flex items-center justify-center gap-2 text-[12px] font-sans text-silver"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <span>
            {stats.nodes} 个节点 · {stats.years} 年 · {stats.completedPaths} 条路径已完成
          </span>
        </motion.div>
        <motion.span
          className="inline-block mt-2 text-[12px] font-sans text-light-silver"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {yearRange}
        </motion.span>

        <PageGuide />
      </section>

      {/* 2. Filter Bar */}
      <section className="sticky top-16 md:top-16 z-30 bg-white/92 backdrop-blur-md border-b border-border-color">
        <div className="max-w-[900px] mx-auto px-5 md:px-6 py-3">
          {/* Year filters with counts */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-2 pb-1">
            {yearFilters.map((year) => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`shrink-0 text-[13px] font-sans px-3.5 py-1.5 rounded-lg transition-colors duration-150 ${
                  activeYear === year
                    ? 'bg-light-pink text-graphite'
                    : 'text-silver hover:text-graphite hover:bg-light-gray'
                }`}
              >
                {year === 'all' ? '全部' : year}
                <span className="text-[11px] text-light-silver ml-0.5">
                  {yearCounts[year] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Category filters with color dots and counts */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categoryFilters.map((cat) => {
              const config = categoryConfig[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 inline-flex items-center gap-1.5 text-[13px] font-sans px-3 py-1.5 rounded-lg transition-colors duration-150 ${
                    activeCategory === cat
                      ? 'bg-light-pink text-graphite'
                      : 'text-silver hover:text-graphite hover:bg-light-gray'
                  }`}
                >
                  {cat !== 'all' && config && (
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: config.color }}
                    />
                  )}
                  {cat === 'all' ? '全部' : config?.label}
                  <span className="text-[11px] text-light-silver">
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Result count */}
      <section className="max-w-[900px] mx-auto px-5 md:px-6 pt-6 pb-2">
        <span className="text-[12px] font-sans text-silver">
          共 {filteredEvents.length} 个节点
        </span>
      </section>

      {/* 4. Timeline Body */}
      <section className="bg-cream">
        <div className="max-w-[900px] mx-auto px-5 md:px-6 py-12 md:py-20">
          <AnimatePresence mode="wait">
            {filteredEvents.length > 0 ? (
              <motion.div
                key="timeline"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Desktop: alternating timeline */}
                <div className="hidden md:block relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-border-color -translate-x-1/2" />

                  {yearGroups.map((group, groupIdx) => {
                    const globalOffset = yearGroups
                      .slice(0, groupIdx)
                      .reduce((acc, g) => acc + g.events.length, 0);

                    // Collect achievements for stage summary
                    const achievements: string[] = [];
                    group.events.forEach((event) => {
                      achievements.push(...(event.achievements ?? []));
                    });

                    return (
                      <div key={group.year}>
                        <YearMarker year={group.year} />
                        {group.events.map((event, idx) => (
                          <div key={event.id} className="py-4">
                            <TimelineNode
                              event={event}
                              index={globalOffset + idx}
                              isLeft={(globalOffset + idx) % 2 === 0}
                            />
                          </div>
                        ))}
                        {/* Stage Summary Card */}
                        <StageSummaryCard
                          year={group.year}
                          eventCount={group.events.length}
                          achievements={achievements}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Mobile: single column */}
                <div className="md:hidden relative">
                  <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-border-color" />

                  {yearGroups.map((group, groupIdx) => {
                    const globalOffset = yearGroups
                      .slice(0, groupIdx)
                      .reduce((acc, g) => acc + g.events.length, 0);

                    const achievements: string[] = [];
                    group.events.forEach((event) => {
                      achievements.push(...(event.achievements ?? []));
                    });

                    return (
                      <div key={group.year}>
                        <YearMarker year={group.year} />
                        {group.events.map((event, idx) => (
                          <div key={event.id} className="py-3">
                            <TimelineNode
                              event={event}
                              index={globalOffset + idx}
                              isLeft={false}
                            />
                          </div>
                        ))}
                        <StageSummaryCard
                          year={group.year}
                          eventCount={group.events.length}
                          achievements={achievements}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <EmptyState key="empty" onClear={clearFilters} />
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
