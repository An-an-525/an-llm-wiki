import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight,
  BookOpen,
  Users,
  ListChecks,
  Target,
  Lightbulb,
  CheckSquare,
  Flag,
  Wrench,
} from 'lucide-react';
import { paths, pathDetails } from '@/data/mockPaths';
import { libraryItems } from '@/data/mockLibrary';
import { resolveAssetUrl } from '@/lib/runtime';
import type { Path, PathStage } from '@/types';
import type { PathDetail as PathDetailData } from '@/data/mockPaths';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const difficultyMap: Record<string, { label: string; badge: string }> = {
  beginner: { label: '入门', badge: 'bg-[#F2F2F0] text-graphite' },
  intermediate: { label: '进阶', badge: 'bg-[#F5EDE8] text-graphite' },
  advanced: { label: '高级', badge: 'bg-[#E8E0E0] text-graphite' },
};

const statusMap: Record<string, { label: string; badge: string }> = {
  in_progress: { label: '进行中', badge: 'bg-[#C8956C] text-white' },
  completed: { label: '已完成', badge: 'bg-[#6B9E7C] text-white' },
  planned: { label: '计划中', badge: 'bg-[#A0A0A0] text-white' },
};

function getProgress(path: Path) {
  const total = path.stages.length;
  const completed = path.stages.filter((s) => s.status === 'completed').length;
  const inProgress = path.stages.filter((s) => s.status === 'in_progress').length;
  const currentStage = inProgress > 0 ? completed + 1 : completed;
  return { completed, total, currentStage, percent: total > 0 ? (completed / total) * 100 : 0 };
}

function PathMarkdownBody({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => (
          <h1 className="font-serif text-[26px] text-ink mb-5 leading-tight" {...props} />
        ),
        h2: ({ ...props }) => (
          <h2 className="font-serif text-[22px] text-ink mt-9 mb-4 leading-tight" {...props} />
        ),
        h3: ({ ...props }) => (
          <h3 className="text-[16px] font-sans font-medium text-graphite mt-6 mb-2" {...props} />
        ),
        p: ({ ...props }) => (
          <p className="text-[15px] text-graphite leading-[1.85] mb-4" {...props} />
        ),
        ul: ({ ...props }) => (
          <ul className="list-disc pl-6 my-4 space-y-1.5" {...props} />
        ),
        ol: ({ ...props }) => (
          <ol className="list-decimal pl-6 my-4 space-y-1.5" {...props} />
        ),
        li: ({ ...props }) => (
          <li className="text-[15px] text-graphite leading-[1.8]" {...props} />
        ),
        table: ({ ...props }) => (
          <div className="my-5 overflow-x-auto">
            <table className="w-full border border-border-color text-[14px] text-graphite" {...props} />
          </div>
        ),
        th: ({ ...props }) => (
          <th className="border-b border-border-color bg-cream px-3 py-2 text-left font-medium" {...props} />
        ),
        td: ({ ...props }) => (
          <td className="border-b border-border-color px-3 py-2" {...props} />
        ),
        a: ({ ...props }) => (
          <a className="text-graphite underline transition-colors hover:text-[#C47D6E]" target="_blank" rel="noopener noreferrer" {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

const stageStatusMap: Record<string, { label: string; color: string }> = {
  locked: { label: '未解锁', color: 'bg-[#C8C8C6] text-white' },
  available: { label: '可开始', color: 'bg-[#A0A0A0] text-white' },
  in_progress: { label: '进行中', color: 'bg-[#C8956C] text-white' },
  completed: { label: '已完成', color: 'bg-[#6B9E7C] text-white' },
};

/* ------------------------------------------------------------------ */
/*  Info Bar                                                           */
/* ------------------------------------------------------------------ */

function InfoBar({ path, detail }: { path: Path; detail?: PathDetailData }) {
  const outcomes = detail?.outcomes ?? [];
  const whoFor = path.whoFor;
  const prerequisites = path.prerequisites ?? [];

  return (
    <motion.div
      className="bg-white border-b border-[#E5E5E3] py-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.3 }}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-sans text-silver">
          {whoFor && (
            <span className="flex items-center gap-1.5">
              <Users size={13} strokeWidth={1.5} className="text-[#C8956C]" />
              <span>适合人群：{whoFor}</span>
            </span>
          )}
          {prerequisites.length > 0 && (
            <span className="flex items-center gap-1.5">
              <ListChecks size={13} strokeWidth={1.5} className="text-[#C8956C]" />
              <span>前置条件：{prerequisites.slice(0, 2).join('、')}{prerequisites.length > 2 ? '…' : ''}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock size={13} strokeWidth={1.5} className="text-[#C8956C]" />
            <span>预计时间：{path.estimatedTime}</span>
          </span>
          {outcomes.length > 0 && (
            <span className="flex items-center gap-1.5">
              <Target size={13} strokeWidth={1.5} className="text-[#6B9E7C]" />
              <span>最终成果：{outcomes.length} 项</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PathGuide({ path, detail }: { path: Path; detail?: PathDetailData }) {
  const firstStage = path.stages[0];
  const firstPitfall = detail?.pitfalls?.[0]?.description;
  const nextStep = path.actionText || firstStage?.deliverable || '从第一阶段开始，完成一个可验收的小产出。';

  return (
    <motion.div
      className="mb-8 rounded-xl border border-[#E8DDD4] bg-[#FAF9F7] p-5 md:p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <h2 className="mb-4 font-serif text-[20px] text-ink">先读这四件事</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-white px-3 py-2.5">
          <p className="mb-1 text-[12px] text-silver">先看什么</p>
          <p className="text-[14px] text-graphite leading-[1.75]">{path.description}</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2.5">
          <p className="mb-1 text-[12px] text-silver">适合谁</p>
          <p className="text-[14px] text-graphite leading-[1.75]">
            {path.whoFor || '适合想照着路线做出一个最小成果的人。'}
          </p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2.5">
          <p className="mb-1 text-[12px] text-silver">下一步</p>
          <p className="text-[14px] text-graphite leading-[1.75]">{nextStep}</p>
        </div>
        <div className="rounded-lg bg-white px-3 py-2.5">
          <p className="mb-1 text-[12px] text-silver">风险</p>
          <p className="text-[14px] text-graphite leading-[1.75]">
            {firstPitfall || '不要跳过前置条件，也不要把路径当作保证结果的承诺。'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Before You Start (Prerequisites)                                   */
/* ------------------------------------------------------------------ */

function BeforeYouStart({ detail }: { detail?: PathDetailData }) {
  const prerequisites = detail?.prerequisites ?? [];
  if (prerequisites.length === 0) return null;

  return (
    <motion.div
      className="bg-[#F5EDE8] rounded-xl p-5 md:p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <h3 className="text-[15px] font-sans font-medium text-graphite mb-4 flex items-center gap-2">
        <Wrench size={15} strokeWidth={1.5} className="text-[#C8956C]" />
        开始之前 —— 前置条件
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {prerequisites.map((pre, i) => (
          <div key={i} className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3.5">
            <CheckSquare size={14} strokeWidth={1.5} className="text-[#C8C8C6] mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-graphite mb-0.5">{pre.title}</p>
              <p className="text-[11px] text-silver leading-relaxed">{pre.description}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Final Outcomes                                                     */
/* ------------------------------------------------------------------ */

function FinalOutcomes({ outcomes }: { outcomes: string[] }) {
  if (outcomes.length === 0) return null;

  return (
    <motion.div
      className="bg-[#F0F7F2] rounded-xl p-5 md:p-6 mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <h3 className="text-[15px] font-sans font-medium text-graphite mb-4 flex items-center gap-2">
        <Flag size={15} strokeWidth={1.5} className="text-[#6B9E7C]" />
        完成这条路径后，你将获得
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {outcomes.map((outcome, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-2.5 bg-white/70 rounded-lg p-3.5"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, ease: easeOut, delay: i * 0.08 }}
          >
            <CheckCircle2 size={14} strokeWidth={1.5} className="text-[#6B9E7C] mt-0.5 shrink-0" />
            <span className="text-[13px] text-graphite leading-relaxed">{outcome}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Common Pitfalls                                                    */
/* ------------------------------------------------------------------ */

function PitfallsSection({ detail }: { detail?: PathDetailData }) {
  const pitfalls = detail?.pitfalls ?? [];
  if (pitfalls.length === 0) return null;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <h3 className="text-[15px] font-sans font-medium text-graphite mb-4 flex items-center gap-2">
        <AlertTriangle size={15} strokeWidth={1.5} className="text-[#C47D6E]" />
        常见陷阱
      </h3>
      <div className="space-y-3">
        {pitfalls.map((pitfall, i) => (
          <motion.div
            key={i}
            className="bg-white border border-[#E5E5E3] rounded-xl p-4 md:p-5 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, ease: easeOut, delay: i * 0.06 }}
          >
            <h4 className="text-[14px] font-sans font-medium text-graphite mb-1.5 flex items-center gap-2">
              <AlertTriangle size={13} strokeWidth={1.5} className="text-[#C47D6E] shrink-0" />
              {pitfall.title}
            </h4>
            <p className="text-[13px] text-silver leading-relaxed pl-5">
              {pitfall.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Related Resources                                                  */
/* ------------------------------------------------------------------ */

function RelatedResources({ resourceIds }: { resourceIds: string[] }) {
  const resources = useMemo(() => {
    return libraryItems.filter((item) => resourceIds.includes(item.id));
  }, [resourceIds]);

  if (resources.length === 0) return null;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <h3 className="text-[15px] font-sans font-medium text-graphite mb-4 flex items-center gap-2">
        <BookOpen size={15} strokeWidth={1.5} className="text-[#C8956C]" />
        相关资源
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {resources.map((item) => (
          <a
            key={item.id}
            href={item.links?.[0]?.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 bg-white border border-[#E5E5E3] rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#D0D0CE] transition-all duration-250"
          >
            <div className="flex-1 min-w-0">
              <h4 className="text-[13px] font-sans font-medium text-graphite truncate mb-0.5">
                {item.title}
              </h4>
              <p className="text-[11px] text-silver line-clamp-2">{item.description}</p>
            </div>
            <ExternalLink size={12} strokeWidth={1.5} className="text-light-silver shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Next Steps                                                         */
/* ------------------------------------------------------------------ */

function NextSteps({ detail }: { detail?: PathDetailData }) {
  const directions = detail?.advancedDirections ?? [];
  if (directions.length === 0) return null;

  return (
    <motion.div
      className="mb-8"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, ease: easeOut }}
    >
      <h3 className="text-[15px] font-sans font-medium text-graphite mb-4 flex items-center gap-2">
        <ArrowRight size={15} strokeWidth={1.5} className="text-[#C8956C]" />
        进阶方向
      </h3>
      <div className="flex flex-wrap gap-2">
        {directions.map((dir, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FAF9F7] border border-[#E5E5E3] rounded-lg text-[13px] font-sans text-graphite hover:bg-[#F5EDE8] hover:border-[#D0D0CE] transition-colors duration-150 cursor-default"
          >
            {dir.title}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stage card (content)                                               */
/* ------------------------------------------------------------------ */

function StageCard({
  stage,
  expanded,
  setExpanded,
  status,
  isCompleted,
  isInProgress,
  isLocked,
}: {
  stage: PathStage;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  status: { label: string; color: string };
  isCompleted: boolean;
  isInProgress: boolean;
  isLocked: boolean;
}) {
  // Find related library items for this stage's resources
  const stageResources = useMemo(() => {
    return stage.resources.map((r) => {
      const libItem = libraryItems.find((li) =>
        li.title.toLowerCase().includes(r.title.toLowerCase().slice(0, 8))
      );
      return { ...r, libId: libItem?.id };
    });
  }, [stage.resources]);

  const checklist = stage.checklist ?? [];
  const deliverable = stage.deliverable;
  const tips = stage.tips;

  const canExpand = !isLocked && (stage.resources.length > 0 || checklist.length > 0 || tips);

  const resourceTypeIcon: Record<string, string> = {
    doc: '文档',
    article: '文章',
    book: '书籍',
    course: '课程',
    tool: '工具',
    video: '视频',
  };

  return (
    <div
      className={`bg-white border rounded-xl p-4 md:p-5 shadow-sm transition-all duration-250 card-tap ${
        isInProgress
          ? 'border-[#C8956C] shadow-soft'
          : isCompleted
          ? 'border-[#E5E5E3]'
          : 'border-[#E5E5E3] opacity-75'
      } hover:-translate-y-0.5 hover:shadow-md`}
    >
      {/* Header: Stage number + title + status badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[11px] text-silver font-mono">阶段 {stage.order}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${status.color}`}>
          {status.label}
        </span>
        {isInProgress && (
          <motion.span
            className="w-1.5 h-1.5 rounded-full bg-[#C8956C]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      <h4 className="text-[16px] font-sans font-medium text-graphite mb-1.5 leading-snug">
        {stage.title}
      </h4>
      <p className="text-[13px] text-silver leading-relaxed line-clamp-2 mb-3">
        {stage.description}
      </p>

      {/* Deliverable */}
      {deliverable && (
        <div className="flex items-center gap-1.5 text-[11px] text-[#6B9E7C] mb-3 bg-[#F0F7F2] rounded-lg px-2.5 py-1.5">
          <Target size={11} strokeWidth={1.5} />
          <span>产出物：{deliverable}</span>
        </div>
      )}

      {/* Estimated time */}
      <div className="flex items-center gap-1 text-[11px] text-silver mb-3">
        <Clock size={11} strokeWidth={1.5} />
        <span>本阶段只做一个可验收小产出</span>
      </div>

      {/* Expand toggle */}
      {canExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[12px] text-silver hover:text-graphite transition-colors duration-150 mb-2"
        >
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          {expanded ? '收起详情' : '查看详情'}
        </button>
      )}

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && canExpand && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-[#F0F0EE]">
              {/* Checklist */}
              {checklist.length > 0 && (
                <div className="mb-3">
                  <p className="text-[11px] text-silver mb-2 flex items-center gap-1">
                    <CheckSquare size={11} strokeWidth={1.5} />
                    完成检查清单
                  </p>
                  <div className="space-y-1.5">
                    {checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckSquare size={12} strokeWidth={1.5} className="text-[#C8C8C6] mt-0.5 shrink-0" />
                        <span className="text-[12px] text-graphite leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {stageResources.length > 0 && (
                <div className="mb-3">
                  <p className="text-[11px] text-silver mb-2 flex items-center gap-1">
                    <BookOpen size={11} strokeWidth={1.5} />
                    推荐资源
                  </p>
                  <div className="flex flex-col gap-1">
                    {stageResources.map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[12px] text-graphite hover:text-[#C8956C] transition-colors py-1 group"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F2F2F0] text-silver shrink-0">
                          {resourceTypeIcon[r.type] || r.type}
                        </span>
                        <span className="flex-1 truncate">{r.title}</span>
                        <ExternalLink size={10} strokeWidth={1.5} className="text-light-silver group-hover:text-[#C8956C]" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {tips && (
                <div className="bg-[#FEFBF5] rounded-lg p-3 border border-[#F5EDE8]">
                  <p className="text-[11px] text-[#C8956C] mb-1 flex items-center gap-1">
                    <Lightbulb size={11} strokeWidth={1.5} />
                    我的注疏
                  </p>
                  <p className="text-[12px] text-graphite leading-relaxed italic">{tips}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stage node on the route map                                        */
/* ------------------------------------------------------------------ */

function StageNode({ stage, index }: { stage: PathStage; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLeft = index % 2 === 0;
  const status = stageStatusMap[stage.status];
  const isCompleted = stage.status === 'completed';
  const isInProgress = stage.status === 'in_progress';
  const isLocked = stage.status === 'locked';

  return (
    <motion.div
      className="relative flex min-w-0 items-start"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: easeOut, delay: index * 0.1 }}
    >
      {/* Desktop: alternating layout */}
      <div className="hidden md:flex w-full items-start">
        <div className={`w-[calc(50%-24px)] ${isLeft ? '' : 'order-3'}`}>
          {isLeft && (
            <StageCard
              stage={stage}
              expanded={expanded}
              setExpanded={setExpanded}
              status={status}
              isCompleted={isCompleted}
              isInProgress={isInProgress}
              isLocked={isLocked}
            />
          )}
        </div>

        {/* Center node */}
        <div className="w-[48px] shrink-0 flex flex-col items-center order-2">
          <motion.div
            className={`relative flex items-center justify-center rounded-full border-2 transition-colors duration-200 ${
              isCompleted
                ? 'w-[18px] h-[18px] bg-[#6B9E7C] border-[#6B9E7C]'
                : isInProgress
                ? 'w-[18px] h-[18px] bg-[#C8956C] border-[#C8956C]'
                : isLocked
                ? 'w-[14px] h-[14px] bg-[#C8C8C6] border-[#C8C8C6]'
                : 'w-[14px] h-[14px] bg-white border-[#E5E5E3]'
            }`}
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easeSpring, delay: index * 0.1 }}
            style={
              isInProgress
                ? { boxShadow: '0 0 0 4px rgba(200,149,108,0.2)' }
                : undefined
            }
          >
            {isCompleted && (
              <CheckCircle2 size={10} strokeWidth={3} className="text-white" />
            )}
            {isLocked && <Lock size={7} strokeWidth={2} className="text-white" />}
          </motion.div>
        </div>

        <div className={`w-[calc(50%-24px)] ${isLeft ? 'order-3' : ''}`}>
          {!isLeft && (
            <StageCard
              stage={stage}
              expanded={expanded}
              setExpanded={setExpanded}
              status={status}
              isCompleted={isCompleted}
              isInProgress={isInProgress}
              isLocked={isLocked}
            />
          )}
        </div>
      </div>

      {/* Mobile: all on the right */}
      <div className="flex md:hidden w-full min-w-0 items-start">
        <div className="w-[36px] shrink-0 flex flex-col items-center">
          <motion.div
            className={`relative flex items-center justify-center rounded-full border-2 ${
              isCompleted
                ? 'w-[14px] h-[14px] bg-[#6B9E7C] border-[#6B9E7C]'
                : isInProgress
                ? 'w-[14px] h-[14px] bg-[#C8956C] border-[#C8956C]'
                : isLocked
                ? 'w-[12px] h-[12px] bg-[#C8C8C6] border-[#C8C8C6]'
                : 'w-[12px] h-[12px] bg-white border-[#E5E5E3]'
            }`}
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: easeSpring, delay: index * 0.08 }}
          >
            {isCompleted && <CheckCircle2 size={8} strokeWidth={3} className="text-white" />}
          </motion.div>
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <StageCard
            stage={stage}
            expanded={expanded}
            setExpanded={setExpanded}
            status={status}
            isCompleted={isCompleted}
            isInProgress={isInProgress}
            isLocked={isLocked}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Bottom Navigation                                                  */
/* ------------------------------------------------------------------ */

function BottomNav({ prev, next }: { prev: Path | null; next: Path | null }) {
  return (
    <div className="border-t border-[#E5E5E3] py-6">
      <div className="max-w-[800px] mx-auto px-5 md:px-12 flex items-center justify-between">
        {prev ? (
          <Link
            to={`/paths/${prev.id}`}
            className="flex items-center gap-2 text-[13px] text-silver hover:text-graphite transition-colors group"
          >
            <ArrowLeft size={14} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
            <div className="text-left">
              <span className="text-[11px] text-light-silver block">上一条</span>
              <span className="font-serif text-[14px]">{prev.title}</span>
            </div>
          </Link>
        ) : (
          <div />
        )}
        <Link
          to="/paths"
          className="text-[12px] text-silver hover:text-graphite transition-colors px-4 py-2 bg-[#F2F2F0] rounded-lg"
        >
          返回列表
        </Link>
        {next ? (
          <Link
            to={`/paths/${next.id}`}
            className="flex items-center gap-2 text-[13px] text-silver hover:text-graphite transition-colors group"
          >
            <div className="text-right">
              <span className="text-[11px] text-light-silver block">下一条</span>
              <span className="font-serif text-[14px]">{next.title}</span>
            </div>
            <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function PathDetail() {
  const { id } = useParams<{ id: string }>();

  const path = useMemo(() => paths.find((p) => p.id === id), [id]);
  const detail = useMemo(() => (id ? pathDetails[id] : undefined), [id]);
  const progress = useMemo(() => (path ? getProgress(path) : null), [path]);

  // Prev/next for bottom nav
  const currentIndex = useMemo(() => paths.findIndex((p) => p.id === id), [id]);
  const prevPath = currentIndex > 0 ? paths[currentIndex - 1] : null;
  const nextPath = currentIndex < paths.length - 1 ? paths[currentIndex + 1] : null;

  // Path-level outcomes (new field)
  const pathOutcomes = path?.outcomes ?? detail?.outcomes ?? [];

  if (!path || !progress) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-[calc(var(--app-nav-height)+16px)]">
        <div className="text-center">
          <h1 className="font-serif text-[36px] text-ink mb-4">谱系未找到</h1>
          <p className="text-silver text-[15px] mb-6">该路径不存在或已被移除</p>
          <Link
            to="/paths"
            className="inline-flex items-center gap-1 text-[14px] text-graphite hover:text-ink transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={1.5} />
            返回谱系列表
          </Link>
        </div>
      </div>
    );
  }

  const diff = difficultyMap[path.difficulty];
  const status = statusMap[path.status];

  return (
    <div className="min-h-[100dvh]">
      {/* ====== Hero Header ====== */}
      <section className="bg-[#FAF9F7] pt-[calc(var(--app-nav-height)+32px)] pb-8">
        <div className="max-w-[1200px] mx-auto px-5 md:px-12">
          {/* Breadcrumb + Back */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Link
              to="/paths"
              className="inline-flex items-center gap-1 text-[12px] text-silver hover:text-graphite transition-colors"
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              返回谱系列表
            </Link>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Left: info */}
            <div className="md:w-[55%] flex flex-col justify-between">
              <div>
                {/* Meta badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${diff?.badge || ''}`}>
                    {diff?.label}
                  </span>
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full ${status?.badge || ''}`}>
                    {status?.label}
                  </span>
                  <span className="flex items-center gap-1 text-[12px] text-silver">
                    <Clock size={12} strokeWidth={1.5} />
                    {path.estimatedTime}
                  </span>
                </div>

                <motion.h1
                  className="font-serif text-[26px] md:text-[32px] text-ink leading-tight mb-3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                >
                  {path.title}
                </motion.h1>

                <motion.p
                  className="text-[15px] text-graphite leading-relaxed mb-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
                >
                  {path.description}
                </motion.p>

                {/* Stats row */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-silver mb-5">
                  <span className="flex items-center gap-1">
                    <Layers size={13} strokeWidth={1.5} />
                    {path.stages.length} 个阶段
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={13} strokeWidth={1.5} />
                    已完成 {progress.completed}/{progress.total}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[12px] text-silver mb-1.5">
                  <span>总进度</span>
                  <span>{Math.round(progress.percent)}%</span>
                </div>
                <div className="h-1.5 bg-[#E5E5E3] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#C8956C] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percent}%` }}
                    transition={{ duration: 1, ease: easeOut, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>

            {/* Right: cover */}
            <motion.div
              className="md:w-[45%]"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: easeOut, delay: 0.15 }}
            >
              <div className="rounded-xl overflow-hidden shadow-lg aspect-[16/10]">
                <img
                  src={resolveAssetUrl(path.cover)}
                  alt={path.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <InfoBar path={path} detail={detail} />

      {/* ====== Main Content ====== */}
      <div className="max-w-[800px] mx-auto px-5 md:px-12 py-10">
        <PathGuide path={path} detail={detail} />

        {/* Before You Start */}
        <BeforeYouStart detail={detail} />

        {/* Long description */}
        {detail?.longDescription && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4, ease: easeOut }}
          >
            <PathMarkdownBody>{detail.longDescription}</PathMarkdownBody>
          </motion.div>
        )}

        {/* Tags */}
        <motion.div
          className="flex flex-wrap gap-2 mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: easeOut }}
        >
          {path.tags.map((tag) => (
            <span
              key={tag}
              className="text-[12px] px-3 py-1 rounded-full bg-[#F5EDE8] text-graphite"
            >
              {tag}
            </span>
          ))}
        </motion.div>

        {/* ====== Route Map ====== */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Layers size={16} strokeWidth={1.5} className="text-[#C8956C]" />
            <h2 className="font-serif text-[22px] text-ink">路线地图</h2>
            <span className="text-[12px] text-silver ml-1">
              {path.stages.length} 个阶段
            </span>
          </div>

          {/* Desktop timeline */}
          <div className="hidden md:block relative">
            {/* Central vertical line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-[#E5E5E3] -translate-x-1/2"
            />
            <div className="space-y-6 relative z-10">
              {path.stages.map((stage, index) => (
                <StageNode key={stage.id} stage={stage} index={index} />
              ))}
            </div>
          </div>

          {/* Mobile timeline */}
          <div className="md:hidden relative">
            {/* Left vertical line */}
            <div className="absolute left-[5px] top-0 bottom-0 w-[2px] bg-[#E5E5E3]" />
            <div className="space-y-6 relative z-10">
              {path.stages.map((stage, index) => (
                <StageNode key={stage.id} stage={stage} index={index} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Final Outcomes */}
        <FinalOutcomes outcomes={pathOutcomes} />

        {/* Common Pitfalls */}
        <PitfallsSection detail={detail} />

        {/* Related Resources */}
        <RelatedResources resourceIds={detail?.relatedResourceIds || []} />

        {/* Next Steps */}
        <NextSteps detail={detail} />
      </div>

      {/* ====== Bottom Navigation ====== */}
      <BottomNav prev={prevPath} next={nextPath} />
    </div>
  );
}
