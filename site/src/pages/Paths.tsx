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
} from 'lucide-react';
import { paths } from '@/data/mockPaths';
import { resolveAssetUrl } from '@/lib/runtime';
import type { Path } from '@/types';
import { EmptyState as LifecycleEmptyState, ErrorState } from '@/components/ui/lifecycle';
import { audienceConfig, getAudienceTierFromPathDifficulty } from '@/lib/audience';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const difficultyMap: Record<string, { label: string; color: string; sort: number }> = {
  beginner: {
    label: audienceConfig.beginner.label,
    color: 'bg-[#6B9E7C]/10 text-[#6B9E7C] border border-[#6B9E7C]/20',
    sort: 0,
  },
  intermediate: {
    label: audienceConfig.geek.label,
    color: 'bg-[#C8956C]/10 text-[#C8956C] border border-[#C8956C]/20',
    sort: 1,
  },
  advanced: {
    label: audienceConfig.master.label,
    color: 'bg-[#C47D6E]/10 text-[#C47D6E] border border-[#C47D6E]/20',
    sort: 2,
  },
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
    { key: 'beginner', label: audienceConfig.beginner.label },
    { key: 'intermediate', label: audienceConfig.geek.label },
    { key: 'advanced', label: audienceConfig.master.label },
  ];

  return (
    <div className="sticky top-[var(--app-nav-height)] z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E5E3]">
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

          {/* Path level filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <span className="text-[12px] text-light-silver mr-1 shrink-0">路径层级</span>
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
  const audienceTier = getAudienceTierFromPathDifficulty(path.difficulty);
  const audienceHint = audienceConfig[audienceTier].hint;

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
            src={resolveAssetUrl(path.cover)}
            alt={path.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full ${diff?.color || ''}`}
              title={audienceHint}
            >
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

          {/* Row 4: audience */}
          {whoFor && (
            <div className="flex items-center gap-1.5 mb-2.5">
              <Users size={12} strokeWidth={1.5} className="text-[#C8956C]" />
              <span className="text-[12px] text-graphite">
                {whoFor}
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

  // 数据源固定后，这里直接渲染内容；后端接入时可切换为统一生命周期骨架

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
            一条路径只负责一件事：从哪里开始，怎样做出一个小成果。
          </motion.p>
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
                description="换一个筛选，或清空搜索词。"
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

    </div>
  );
}
