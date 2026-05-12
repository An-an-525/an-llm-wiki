import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Clock,
  ArrowRight,
  X,
  Users,
  ListChecks,
  Sparkles,
  Compass,
} from 'lucide-react';
import { paths } from '@/data/mockPaths';
import type { Path } from '@/types';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const difficultyMap: Record<string, { label: string; color: string; sort: number }> = {
  beginner: { label: '入门', color: 'bg-[#F2F2F0] text-graphite', sort: 0 },
  intermediate: { label: '进阶', color: 'bg-[#F5EDE8] text-graphite', sort: 1 },
  advanced: { label: '高级', color: 'bg-[#E8E0E0] text-graphite', sort: 2 },
};

const statusMap: Record<string, { label: string; color: string; dot: string }> = {
  in_progress: { label: '进行中', color: 'bg-[#C8956C] text-white', dot: 'bg-[#C8956C]' },
  completed: { label: '已完成', color: 'bg-[#6B9E7C] text-white', dot: 'bg-[#6B9E7C]' },
  planned: { label: '计划中', color: 'bg-[#A0A0A0] text-white', dot: 'bg-[#A0A0A0]' },
};

function getProgress(path: Path) {
  const total = path.stages.length;
  const completed = path.stages.filter((s) => s.status === 'completed').length;
  return { completed, total, percent: total > 0 ? (completed / total) * 100 : 0 };
}

/* ------------------------------------------------------------------ */
/*  Page Guide Card                                                    */
/* ------------------------------------------------------------------ */

function PageGuide() {
  return (
    <motion.div
      className="bg-[#F5EDE8] rounded-xl p-4 md:p-5 mb-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.2 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center shrink-0 mt-0.5">
          <Compass size={16} strokeWidth={1.5} className="text-[#C8956C]" />
        </div>
        <div>
          <p className="text-[14px] font-sans font-medium text-graphite mb-1">
            谱系是可复刻的学习与构建路径
          </p>
          <p className="text-[13px] font-sans text-silver leading-relaxed">
            每条路径都标注了难度、预计时间、适合人群和前置条件。选择一条开始，按步骤逐步推进。对小白友好，从入门路径开始即可。
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Start Here Banner                                                  */
/* ------------------------------------------------------------------ */

function StartHereBanner({
  beginnerPaths,
}: {
  beginnerPaths: Path[];
}) {
  if (beginnerPaths.length === 0) return null;

  return (
    <motion.div
      className="bg-gradient-to-r from-[#FDF6F0] to-[#F5EDE8] rounded-xl p-5 md:p-6 mb-8 border border-[#F0E5DC]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
    >
      <div className="flex items-start gap-3 md:gap-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles size={18} strokeWidth={1.5} className="text-[#C8956C]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[15px] font-sans font-medium text-graphite mb-1.5">
                初次来访？从这里开始
              </h3>
              <p className="text-[13px] font-sans text-silver leading-relaxed mb-3">
                以下是为初学者准备的路径，无需前置知识，跟着步骤一步步来即可。
              </p>
              <div className="flex flex-wrap gap-2">
                {beginnerPaths.slice(0, 3).map((p) => (
                  <Link
                    key={p.id}
                    to={`/paths/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-[12px] font-sans text-graphite hover:shadow-sm transition-shadow duration-150 border border-[#E5E5E3]"
                  >
                    {p.title}
                    <ArrowRight size={11} strokeWidth={1.5} className="text-silver" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter bar                                                         */
/* ------------------------------------------------------------------ */

type StatusFilter = 'all' | 'in_progress' | 'completed' | 'planned';
type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';

interface FilterBarProps {
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  difficultyFilter: DifficultyFilter;
  setDifficultyFilter: (v: DifficultyFilter) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  statusCounts: Record<string, number>;
  diffCounts: Record<string, number>;
}

function FilterBar({
  statusFilter,
  setStatusFilter,
  difficultyFilter,
  setDifficultyFilter,
  searchQuery,
  setSearchQuery,
  statusCounts,
  diffCounts,
}: FilterBarProps) {
  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'in_progress', label: '进行中' },
    { key: 'completed', label: '已完成' },
    { key: 'planned', label: '计划中' },
  ];

  const diffOptions: { key: DifficultyFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'beginner', label: '入门' },
    { key: 'intermediate', label: '进阶' },
    { key: 'advanced', label: '高级' },
  ];

  return (
    <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E5E3]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-3.5 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          {/* Status filters */}
          <div className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {statusOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setStatusFilter(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-sans transition-colors duration-150 flex items-center gap-1.5 ${
                  statusFilter === opt.key
                    ? 'bg-[#F5EDE8] text-graphite'
                    : 'text-silver hover:text-graphite hover:bg-[#F2F2F0]'
                }`}
              >
                {opt.key !== 'all' && (
                  <span
                    className={`w-2 h-2 rounded-full ${statusMap[opt.key]?.dot || 'bg-silver'}`}
                  />
                )}
                {opt.label}
                <span className="text-[11px] text-light-silver ml-0.5">
                  {statusCounts[opt.key] || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Difficulty filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <span className="text-[12px] text-light-silver mr-1 shrink-0">难度</span>
            {diffOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setDifficultyFilter(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-sans transition-colors duration-150 ${
                  difficultyFilter === opt.key
                    ? 'bg-[#F5EDE8] text-graphite'
                    : 'text-silver hover:text-graphite hover:bg-[#F2F2F0]'
                }`}
              >
                {opt.label}
                <span className="text-[11px] text-light-silver ml-0.5">
                  {diffCounts[opt.key] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-light-silver" />
          <input
            type="text"
            placeholder="搜索路径..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 pr-8 rounded-lg border border-[#E5E5E3] bg-white text-[13px] font-sans text-graphite placeholder:text-light-silver focus:outline-none focus:border-[#C8C8C6] focus:shadow-[0_0_0_3px_rgba(200,200,200,0.12)] transition-all w-full md:w-[260px] focus:md:w-[320px] duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-light-silver hover:text-graphite"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Path grid card                                                     */
/* ------------------------------------------------------------------ */

function PathGridCard({ path, index }: { path: Path; index: number }) {
  const diff = difficultyMap[path.difficulty];
  const status = statusMap[path.status];
  const progress = getProgress(path);

  const whoFor = path.whoFor;
  const prerequisites = path.prerequisites ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: index * 0.08 }}
    >
      <Link
        to={`/paths/${path.id}`}
        className="group block bg-white border border-[#E5E5E3] rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#D0D0CE] transition-all duration-250"
      >
        {/* Row 1: Cover image + Status badge + Difficulty badge */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={path.cover}
            alt={path.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${diff?.color || ''}`}>
              {diff?.label}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${status?.color || ''}`}>
              {status?.label}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-250 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-250 text-white text-[13px] font-sans flex items-center gap-1 drop-shadow-lg">
              查看详情
              <ArrowRight size={13} strokeWidth={1.5} />
            </span>
          </div>
        </div>

        {/* Card body */}
        <div className="p-4 md:p-5">
          {/* Row 2: Title */}
          <h3 className="font-serif text-[18px] text-ink mb-1.5 leading-snug group-hover:text-favorite transition-colors duration-200">
            {path.title}
          </h3>

          {/* Row 3: Description */}
          <p className="text-[13px] text-silver leading-relaxed line-clamp-1 mb-3">
            {path.description}
          </p>

          {/* Row 4: 适合人群 */}
          {whoFor && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <Users size={12} strokeWidth={1.5} className="text-[#C8956C]" />
              <span className="text-[12px] text-graphite">
                适合：{whoFor}
              </span>
            </div>
          )}

          {/* Row 5: 前置条件 tags + 预计时间 */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {prerequisites.length > 0 && prerequisites.slice(0, 3).map((pre, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded bg-[#F2F2F0] text-silver"
              >
                {pre}
              </span>
            ))}
            <span className="flex items-center gap-1 text-[11px] text-silver ml-auto">
              <Clock size={11} strokeWidth={1.5} />
              {path.estimatedTime}
            </span>
          </div>

          {/* Row 6: Progress bar + X/Y 步骤已完成 */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-silver mb-1">
              <span className="flex items-center gap-1">
                <ListChecks size={11} strokeWidth={1.5} />
                {progress.completed}/{progress.total} 步骤已完成
              </span>
              <span>{Math.round(progress.percent)}%</span>
            </div>
            <div className="h-1.5 bg-[#E5E5E3] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  backgroundColor: progress.percent === 100 ? '#6B9E7C' : '#C8956C',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 0.8, ease: easeOut, delay: 0.2 + index * 0.05 }}
              />
            </div>
          </div>

          {/* Row 7: Tags */}
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-[#F0F0EE]">
            {path.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2 py-0.5 rounded bg-[#F5EDE8] text-graphite"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function PathsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter and sort paths
  const filteredPaths = useMemo(() => {
    let list = [...paths];

    if (statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (difficultyFilter !== 'all') {
      list = list.filter((p) => p.difficulty === difficultyFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Beginner-friendly sort: beginner first
    list.sort((a, b) => {
      const aSort = difficultyMap[a.difficulty]?.sort ?? 99;
      const bSort = difficultyMap[b.difficulty]?.sort ?? 99;
      if (aSort !== bSort) return aSort - bSort;
      // Secondary: in_progress first
      const statusOrder = { in_progress: 0, completed: 1, planned: 2 };
      return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
    });

    return list;
  }, [statusFilter, difficultyFilter, searchQuery]);

  // Compute counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: paths.length };
    for (const key of ['in_progress', 'completed', 'planned'] as const) {
      counts[key] = paths.filter((p) => p.status === key).length;
    }
    return counts;
  }, []);

  const diffCounts = useMemo(() => {
    const counts: Record<string, number> = { all: paths.length };
    for (const key of ['beginner', 'intermediate', 'advanced'] as const) {
      counts[key] = paths.filter((p) => p.difficulty === key).length;
    }
    return counts;
  }, []);

  // Check if user has started any path
  const hasStarted = paths.some((p) => p.status === 'in_progress' || p.status === 'completed');

  // Beginner paths for "Start Here" banner
  const beginnerPaths = paths.filter((p) => p.difficulty === 'beginner');

  // TODO: 接入后端后使用 <PageSkeleton type="cards" /> 替代

  // Error boundary
  if (!paths || !Array.isArray(paths)) {
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
      {/* ====== Page Header ====== */}
      <section
        className="pt-[96px] pb-6"
        style={{ background: 'linear-gradient(180deg, #FAF9F7 0%, #FFFFFF 60%)' }}
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-12">
          <motion.h1
            className="font-serif text-[36px] text-ink mb-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            谱系
          </motion.h1>
          <motion.p
            className="text-[15px] text-silver mb-4 max-w-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.15 }}
          >
            可复刻的学习路径与成长路线。每条谱系都是一段从起点到终点的完整旅程。
          </motion.p>

          {/* Page Guide */}
          <PageGuide />

          {/* Start Here Banner */}
          {!hasStarted && <StartHereBanner beginnerPaths={beginnerPaths} />}
        </div>
      </section>

      {/* ====== Filter Bar ====== */}
      <FilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusCounts={statusCounts}
        diffCounts={diffCounts}
      />

      {/* ====== All Paths Grid ====== */}
      <section className="py-10 pb-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-[20px] text-ink">
              {statusFilter === 'all' && difficultyFilter === 'all' && !searchQuery
                ? '全部路径'
                : '筛选结果'}
            </h2>
            <span className="text-[12px] text-silver">
              共找到 {filteredPaths.length} 条路径
            </span>
          </div>

          <AnimatePresence mode="wait">
            {filteredPaths.length > 0 ? (
              <motion.div
                key={`${statusFilter}-${difficultyFilter}-${searchQuery}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {filteredPaths.map((path, i) => (
                  <PathGridCard key={path.id} path={path} index={i} />
                ))}
              </motion.div>
            ) : (
              <LifecycleEmptyState
                key="empty"
                icon={Search}
                title="未找到匹配的路径"
                description="尝试调整筛选条件、切换难度等级，或清除搜索关键词"
                action={{
                  label: '清除全部筛选',
                  onClick: () => {
                    setStatusFilter('all');
                    setDifficultyFilter('all');
                    setSearchQuery('');
                  },
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ====== Philosophy Section ====== */}
      <motion.section
        className="bg-[#FAF9F7] py-12"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.4, ease: easeOut }}
      >
        <div className="max-w-[720px] mx-auto px-5 md:px-12 text-center">
          <h3 className="font-serif text-[20px] text-ink mb-4">关于谱系</h3>
          <p className="text-[14px] text-silver leading-[1.8] mb-4">
            每条谱系都是对某个领域学习路线的系统梳理。它们不是标准答案，而是我在实践中总结出的可行路径。你可以跟随一条谱系从头走到尾，也可以从中截取某个阶段深入学习。谱系会持续更新，反映最新的学习心得和资源发现。
          </p>
          <p className="text-[13px] text-light-silver leading-[1.7]">
            初学者建议从「入门」难度的路径开始，按顺序完成每个阶段。每完成一个阶段，你都会获得扎实的技能提升。
          </p>
        </div>
      </motion.section>
    </div>
  );
}
