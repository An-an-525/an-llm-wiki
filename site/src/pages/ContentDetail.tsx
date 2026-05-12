import { useMemo, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  Share2,
  ChevronRight,
  Star,
  Github,
  Globe,
  Lock,
  CheckCircle2,
  Circle,
  PlayCircle,
  Clock,
  Tag,
  Calendar,
} from 'lucide-react';
import { libraryItems } from '@/data/mockLibrary';
import { paths } from '@/data/mockPaths';
import { works } from '@/data/mockWorks';
import { journalEntries } from '@/data/mockJournal';
import { feedItems } from '@/data/mockFeed';
import { timelineEvents } from '@/data/mockTimeline';
import type {
  LibraryItem,
  Path,
  Work,
  JournalEntry,
  FeedItem,
  TimelineEvent,
  PathStage,
} from '@/types';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ═══════════════════════════════════════════
   Unified Content Lookup
   ═══════════════════════════════════════════ */

type ContentType = 'resource' | 'path' | 'work' | 'journal' | 'feed' | 'timeline';

interface UnifiedContent {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  tags: string[];
  status: string;
  createdAt: string;
  updatedAt: string;
  cover?: string;
  body?: string;
  metadata: Record<string, unknown>;
  original: unknown;
}

function unifyContent(id: string): UnifiedContent | null {
  // 1. Library items (resource)
  const libItem = libraryItems.find((i) => i.id === id);
  if (libItem) {
    return unifyLibraryItem(libItem);
  }

  // 2. Paths
  const pathItem = paths.find((p) => p.id === id);
  if (pathItem) {
    return unifyPath(pathItem);
  }

  // 3. Works
  const workItem = works.find((w) => w.id === id);
  if (workItem) {
    return unifyWork(workItem);
  }

  // 4. Journal entries
  const journalItem = journalEntries.find((j) => j.id === id);
  if (journalItem) {
    return unifyJournal(journalItem);
  }

  // 5. Feed items
  const feedItem = feedItems.find((f) => f.id === id);
  if (feedItem) {
    return unifyFeed(feedItem);
  }

  // 6. Timeline events
  const eventItem = timelineEvents.find((e) => e.id === id);
  if (eventItem) {
    return unifyTimeline(eventItem);
  }

  return null;
}

function unifyLibraryItem(item: LibraryItem): UnifiedContent {
  const statusMap: Record<string, string> = {
    done: '亲测',
    doing: '持续更新',
    todo: '待验证',
  };
  return {
    id: item.id,
    type: 'resource',
    title: item.title,
    description: item.description,
    tags: item.tags,
    status: statusMap[item.status] || item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    metadata: {
      rating: item.rating,
      links: item.links,
      libraryType: item.type,
      status: item.status,
    },
    original: item,
  };
}

function unifyPath(item: Path): UnifiedContent {
  const statusMap: Record<string, string> = {
    in_progress: '进行中',
    completed: '已完成',
    planned: '计划中',
  };
  return {
    id: item.id,
    type: 'path',
    title: item.title,
    description: item.description,
    tags: item.tags,
    status: statusMap[item.status] || item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    cover: item.cover,
    metadata: {
      difficulty: item.difficulty,
      estimatedTime: item.estimatedTime,
      stages: item.stages,
      status: item.status,
    },
    original: item,
  };
}

function unifyWork(item: Work): UnifiedContent {
  const statusMap: Record<string, string> = {
    in_progress: '进行中',
    completed: '已完成',
    archived: '已归档',
  };
  return {
    id: item.id,
    type: 'work',
    title: item.title,
    description: item.description,
    tags: item.techStack,
    status: statusMap[item.status] || item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    cover: item.cover,
    metadata: {
      link: item.link,
      github: item.github,
      techStack: item.techStack,
      status: item.status,
    },
    original: item,
  };
}

function unifyJournal(item: JournalEntry): UnifiedContent {
  return {
    id: item.id,
    type: 'journal',
    title: item.title,
    description: item.excerpt,
    tags: item.tags,
    status: '已发布',
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    cover: item.cover,
    body: item.body,
    metadata: {
      date: item.date,
      wordCount: item.body?.length || 0,
    },
    original: item,
  };
}

function unifyFeed(item: FeedItem): UnifiedContent {
  return {
    id: item.id,
    type: 'feed',
    title: item.title,
    description: item.content,
    tags: item.tags,
    status: '动态',
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    body: item.content,
    metadata: {
      feedType: item.type,
      link: item.link,
    },
    original: item,
  };
}

function unifyTimeline(item: TimelineEvent): UnifiedContent {
  return {
    id: item.id,
    type: 'timeline',
    title: item.title,
    description: item.description,
    tags: item.relatedLinks || [],
    status: item.importance === 'major' ? '重要' : item.importance === 'important' ? '精选' : '记录',
    createdAt: item.date,
    updatedAt: item.date,
    cover: item.cover,
    body: item.description,
    metadata: {
      category: item.category,
      importance: item.importance,
      date: item.date,
    },
    original: item,
  };
}

/* ═══════════════════════════════════════════
   Breadcrumb helpers
   ═══════════════════════════════════════════ */

function getBreadcrumb(content: UnifiedContent) {
  const map: Record<ContentType, { section: string; path: string }> = {
    resource: { section: '藏馆', path: '/library' },
    path: { section: '谱系', path: '/paths' },
    work: { section: '工坊', path: '/works' },
    journal: { section: '手记', path: '/journal' },
    feed: { section: '风信', path: '/feed' },
    timeline: { section: '年谱', path: '/timeline' },
  };
  return map[content.type] || { section: '藏馆', path: '/library' };
}

/* ═══════════════════════════════════════════
   Related content finder
   ═══════════════════════════════════════════ */

function findRelated(content: UnifiedContent): UnifiedContent[] {
  const allContents: UnifiedContent[] = [
    ...libraryItems.map(unifyLibraryItem),
    ...paths.map(unifyPath),
    ...works.map(unifyWork),
    ...journalEntries.map(unifyJournal),
    ...feedItems.map(unifyFeed),
    ...timelineEvents.map(unifyTimeline),
  ];

  // Filter out self, then score by tag overlap
  const candidates = allContents
    .filter((c) => c.id !== content.id)
    .map((c) => {
      const overlap = c.tags.filter((t) => content.tags.includes(t)).length;
      return { content: c, score: overlap };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((c) => c.content);

  return candidates;
}

/* ═══════════════════════════════════════════
   Status badge color
   ═══════════════════════════════════════════ */

function getStatusColor(status: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    亲测: { bg: 'bg-[#C8956C]', text: 'text-white' },
    推荐: { bg: 'bg-[#6B9E7C]', text: 'text-white' },
    待验证: { bg: 'bg-[#A0A0A0]', text: 'text-white' },
    持续更新: { bg: 'bg-[#6B9E7C]', text: 'text-white' },
    已过期: { bg: 'bg-[#C8C8C6]', text: 'text-white' },
    精选: { bg: 'bg-[#C47D6E]', text: 'text-white' },
    进行中: { bg: 'bg-[#C8956C]', text: 'text-white' },
    已完成: { bg: 'bg-[#6B9E7C]', text: 'text-white' },
    计划中: { bg: 'bg-[#A0A0A0]', text: 'text-white' },
    已归档: { bg: 'bg-[#C8C8C6]', text: 'text-white' },
    已发布: { bg: 'bg-[#6B9E7C]', text: 'text-white' },
    动态: { bg: 'bg-[#8A9BB8]', text: 'text-white' },
    重要: { bg: 'bg-[#C47D6E]', text: 'text-white' },
    记录: { bg: 'bg-[#A0A0A0]', text: 'text-white' },
  };
  return map[status] || { bg: 'bg-[#A0A0A0]', text: 'text-white' };
}

/* ═══════════════════════════════════════════
   StarRating component
   ═══════════════════════════════════════════ */

function StarRating({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          strokeWidth={1.5}
          className={i < rating ? 'text-[#C8956C] fill-[#C8956C]' : 'text-light-silver'}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Format date
   ═══════════════════════════════════════════ */

function formatDetailDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* ═══════════════════════════════════════════
   Markdown Styles wrapper
   ═══════════════════════════════════════════ */

function MarkdownBody({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h2: ({ ...props }) => (
          <h2
            className="font-serif text-[24px] text-ink mt-12 mb-5 leading-tight"
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3
            className="font-serif text-[18px] font-medium text-ink mt-8 mb-3 leading-snug"
            {...props}
          />
        ),
        p: ({ ...props }) => (
          <p
            className="text-[15px] font-sans text-graphite leading-[1.85] mb-5"
            {...props}
          />
        ),
        blockquote: ({ ...props }) => (
          <blockquote
            className="border-l-[3px] border-light-pink pl-5 py-1 my-5 italic text-silver"
            {...props}
          />
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          return isInline ? (
            <code
              className="font-mono text-[13px] bg-light-gray px-1.5 py-0.5 rounded-sm"
              {...props}
            >
              {children}
            </code>
          ) : (
            <pre className="bg-[#F5F5F3] rounded-lg p-4 my-5 overflow-x-auto">
              <code className="font-mono text-[13px] text-graphite" {...props}>
                {children}
              </code>
            </pre>
          );
        },
        ul: ({ ...props }) => (
          <ul className="list-disc pl-6 my-5 space-y-1.5" {...props} />
        ),
        ol: ({ ...props }) => (
          <ol className="list-decimal pl-6 my-5 space-y-1.5" {...props} />
        ),
        li: ({ ...props }) => (
          <li
            className="text-[15px] font-sans text-graphite leading-[1.8]"
            {...props}
          />
        ),
        a: ({ ...props }) => (
          <a
            className="text-graphite underline hover:text-[#C47D6E] transition-colors duration-150"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        hr: () => <hr className="border-border-color my-8" />,
        table: ({ ...props }) => (
          <div className="overflow-x-auto my-5">
            <table
              className="w-full text-[14px] font-sans text-graphite border border-border-color"
              {...props}
            />
          </div>
        ),
        thead: ({ ...props }) => (
          <thead className="bg-cream" {...props} />
        ),
        th: ({ ...props }) => (
          <th
            className="text-left px-3 py-2 border-b border-border-color font-medium"
            {...props}
          />
        ),
        td: ({ ...props }) => (
          <td
            className="px-3 py-2 border-b border-border-color"
            {...props}
          />
        ),
        img: ({ ...props }) => (
          <img
            className="w-full rounded-lg shadow-sm my-3"
            {...props}
            alt={props.alt || ''}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

/* ═══════════════════════════════════════════
   Related Card
   ═══════════════════════════════════════════ */

function RelatedCard({ content }: { content: UnifiedContent }) {
  const breadcrumb = getBreadcrumb(content);
  return (
    <Link
      to={`/content/${content.id}`}
      className="group block bg-white border border-border-color rounded-xl p-5 hover:shadow-md hover:border-border-dark transition-all duration-250"
      style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
    >
      <span className="text-[11px] font-sans text-silver mb-2 block">
        {breadcrumb.section}
      </span>
      <h4 className="text-[15px] font-sans font-medium text-graphite group-hover:text-ink transition-colors duration-150 line-clamp-2 mb-2">
        {content.title}
      </h4>
      <p className="text-[13px] font-sans text-silver line-clamp-2">
        {content.description}
      </p>
    </Link>
  );
}

/* ═══════════════════════════════════════════
   Resource Detail Body
   ═══════════════════════════════════════════ */

function ResourceBody({ content }: { content: UnifiedContent }) {
  const item = content.original as LibraryItem;
  const statusColor = getStatusColor(content.status);
  const typeLabels: Record<string, string> = {
    article: '文章',
    video: '视频',
    book: '书籍',
    course: '教程',
    tool: '工具',
    doc: '文档',
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Link card */}
      {item.links?.map(
        (link) =>
          link.url !== '#' && (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-5 bg-white border border-border-color rounded-xl mb-6 hover:shadow-md hover:border-border-dark transition-all duration-250 group"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-light-pink flex items-center justify-center shrink-0">
                  <ExternalLink size={18} strokeWidth={1.5} className="text-silver" />
                </div>
                <div>
                  <div className="text-[14px] font-sans font-medium text-graphite group-hover:text-ink transition-colors">
                    {link.label}
                  </div>
                  <div className="text-[12px] font-sans text-silver truncate max-w-[300px] sm:max-w-[400px]">
                    {link.url}
                  </div>
                </div>
              </div>
              <ExternalLink
                size={16}
                strokeWidth={1.5}
                className="text-light-silver group-hover:text-graphite transition-colors shrink-0"
              />
            </a>
          )
      )}

      {/* Description */}
      <p className="text-[15px] font-sans text-graphite leading-[1.75] mb-6">
        {content.description}
      </p>

      {/* Metadata table */}
      <div className="bg-white border border-border-color rounded-xl overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="px-5 py-3.5 border-b sm:border-r border-border-color">
            <span className="text-[12px] font-sans text-silver block mb-1">类型</span>
            <span className="text-[14px] font-sans text-graphite">
              {typeLabels[item.type] || item.type}
            </span>
          </div>
          <div className="px-5 py-3.5 border-b border-border-color">
            <span className="text-[12px] font-sans text-silver block mb-1">标签</span>
            <div className="flex flex-wrap gap-1">
              {content.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-sans text-graphite bg-light-pink px-2 py-0.5 rounded-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="px-5 py-3.5 border-b sm:border-r border-border-color">
            <span className="text-[12px] font-sans text-silver block mb-1">评分</span>
            <StarRating rating={item.rating} />
          </div>
          <div className="px-5 py-3.5 border-b border-border-color">
            <span className="text-[12px] font-sans text-silver block mb-1">状态</span>
            <span
              className={`inline-block text-[12px] font-sans px-2.5 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}
            >
              {content.status}
            </span>
          </div>
          <div className="px-5 py-3.5 sm:border-r border-border-color">
            <span className="text-[12px] font-sans text-silver block mb-1">收藏时间</span>
            <span className="text-[14px] font-sans text-graphite">
              {formatDetailDate(content.createdAt)}
            </span>
          </div>
          <div className="px-5 py-3.5">
            <span className="text-[12px] font-sans text-silver block mb-1">更新时间</span>
            <span className="text-[14px] font-sans text-graphite">
              {formatDetailDate(content.updatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* My notes */}
      {item.description && (
        <div className="mt-8">
          <h3 className="font-serif text-[18px] font-medium text-ink mb-3">个人笔记</h3>
          <p className="text-[15px] font-sans text-graphite leading-[1.75] italic">
            {item.description}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Path Detail Body
   ═══════════════════════════════════════════ */

function PathStageItem({ stage, index }: { stage: PathStage; index: number }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcon = {
    locked: <Lock size={16} strokeWidth={1.5} className="text-light-silver" />,
    available: <Circle size={16} strokeWidth={1.5} className="text-silver" />,
    in_progress: <PlayCircle size={16} strokeWidth={1.5} className="text-[#C8956C]" />,
    completed: <CheckCircle2 size={16} strokeWidth={1.5} className="text-[#6B9E7C]" />,
  };

  const statusLabel = {
    locked: '未解锁',
    available: '可开始',
    in_progress: '进行中',
    completed: '已完成',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: easeOut }}
      className="border border-border-color rounded-xl bg-white overflow-hidden"
    >
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-cream/50 transition-colors duration-150"
      >
        <span className="w-7 h-7 rounded-full bg-light-pink flex items-center justify-center shrink-0">
          <span className="text-[12px] font-sans font-medium text-graphite">
            {stage.order}
          </span>
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-sans font-medium text-graphite">
            {stage.title}
          </div>
          <div className="text-[12px] font-sans text-silver mt-0.5">
            {stage.description}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {statusIcon[stage.status]}
          <span className="text-[11px] font-sans text-silver hidden sm:inline">
            {statusLabel[stage.status]}
          </span>
        </div>
      </button>

      {expanded && stage.resources.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25, ease: easeOut }}
          className="border-t border-border-color px-4 py-3"
        >
          <div className="space-y-2">
            {stage.resources.map((res) => (
              <a
                key={res.id}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-light-gray transition-colors duration-150 group"
              >
                <ExternalLink
                  size={13}
                  strokeWidth={1.5}
                  className="text-light-silver shrink-0"
                />
                <span className="text-[13px] font-sans text-graphite group-hover:text-ink transition-colors">
                  {res.title}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function PathBody({ content }: { content: UnifiedContent }) {
  const stages = (content.metadata.stages as PathStage[]) || [];
  const difficultyLabel: Record<string, string> = {
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
  };

  return (
    <div className="max-w-[800px] mx-auto">
      {/* Overview */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-[13px] font-sans text-silver">
          <Clock size={14} strokeWidth={1.5} />
          <span>{(content.metadata.estimatedTime as string) || '未知'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] font-sans text-silver">
          <Tag size={14} strokeWidth={1.5} />
          <span>{difficultyLabel[content.metadata.difficulty as string] || content.metadata.difficulty as string}</span>
        </div>
      </div>

      <p className="text-[15px] font-sans text-graphite leading-[1.75] mb-8">
        {content.description}
      </p>

      {/* Stages */}
      <h3 className="font-serif text-[18px] font-medium text-ink mb-4">学习阶段</h3>
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <PathStageItem key={stage.id} stage={stage} index={index} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Work Detail Body
   ═══════════════════════════════════════════ */

function WorkBody({ content }: { content: UnifiedContent }) {
  const work = content.original as Work;

  return (
    <div className="max-w-[1000px] mx-auto">
      {/* Cover image */}
      {content.cover && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
          className="mb-8"
        >
          <img
            src={content.cover}
            alt={content.title}
            className="w-full aspect-video object-cover rounded-xl shadow-md"
          />
        </motion.div>
      )}

      {/* Tech stack */}
      <div className="mb-6">
        <h3 className="text-[13px] font-sans text-silver mb-2">技术栈</h3>
        <div className="flex flex-wrap gap-2">
          {work.techStack.map((tech) => (
            <span
              key={tech}
              className="text-[13px] font-sans text-graphite bg-light-pink px-3 py-1 rounded-lg"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <p className="text-[15px] font-sans text-graphite leading-[1.75] mb-8">
        {content.description}
      </p>

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {work.github && (
          <a
            href={work.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-sans text-graphite bg-white border border-border-color rounded-lg hover:bg-light-gray transition-colors duration-150"
          >
            <Github size={16} strokeWidth={1.5} />
            GitHub
          </a>
        )}
        {work.link && (
          <a
            href={work.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-sans text-white bg-ink rounded-lg hover:opacity-85 transition-opacity duration-150"
          >
            <Globe size={16} strokeWidth={1.5} />
            访问网站
          </a>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Journal / Default Markdown Body
   ═══════════════════════════════════════════ */

function JournalBody({ content }: { content: UnifiedContent }) {
  return (
    <div className="max-w-[720px] mx-auto lg:mx-0 lg:ml-0">
      {content.body ? (
        <MarkdownBody>{content.body}</MarkdownBody>
      ) : (
        <p className="text-[15px] font-sans text-graphite leading-[1.75]">
          {content.description}
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Feed Detail Body
   ═══════════════════════════════════════════ */

function FeedBody({ content }: { content: UnifiedContent }) {
  const feed = content.original as FeedItem;

  return (
    <div className="max-w-[720px] mx-auto">
      <p className="text-[15px] font-sans text-graphite leading-[1.75] mb-6">
        {content.description}
      </p>

      {feed.link && feed.link !== '#' && (
        <Link
          to={feed.link}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-[14px] font-sans text-graphite bg-white border border-border-color rounded-lg hover:bg-light-gray transition-colors duration-150"
        >
          <ChevronRight size={16} strokeWidth={1.5} />
          查看相关页面
        </Link>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Timeline Detail Body
   ═══════════════════════════════════════════ */

function TimelineBody({ content }: { content: UnifiedContent }) {
  return (
    <div className="max-w-[720px] mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1.5 text-[13px] font-sans text-silver">
          <Calendar size={14} strokeWidth={1.5} />
          <span>{content.metadata.date as string}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[13px] font-sans text-silver">
          <Tag size={14} strokeWidth={1.5} />
          <span>{content.metadata.category as string}</span>
        </div>
      </div>

      <p className="text-[15px] font-sans text-graphite leading-[1.75]">
        {content.description}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main ContentDetail Page
   ═══════════════════════════════════════════ */

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const content = useMemo(() => {
    if (!id) return null;
    return unifyContent(id);
  }, [id]);

  const related = useMemo(() => {
    if (!content) return [];
    return findRelated(content);
  }, [content]);

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (!content) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="font-serif text-[24px] text-graphite mb-3">内容未找到</h1>
          <p className="text-[14px] text-silver mb-5">该内容可能已被删除或不存在</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-[14px] font-sans text-graphite bg-white border border-border-color rounded-lg hover:bg-light-gray transition-colors"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumb = getBreadcrumb(content);
  const statusColor = getStatusColor(content.status);

  return (
    <div className="min-h-[100dvh]">
      {/* ── Breadcrumb ── */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="pt-[96px] pb-4 px-5 md:px-12"
      >
        <div className="max-w-[1200px] mx-auto flex items-center gap-2 text-[12px] font-sans text-silver">
          <Link to="/" className="hover:text-ink hover:underline transition-colors duration-150">
            首页
          </Link>
          <ChevronRight size={12} strokeWidth={1.5} />
          <Link
            to={breadcrumb.path}
            className="hover:text-ink hover:underline transition-colors duration-150"
          >
            {breadcrumb.section}
          </Link>
          <ChevronRight size={12} strokeWidth={1.5} />
          <span className="text-graphite truncate max-w-[200px] sm:max-w-[300px]">
            {content.title}
          </span>
        </div>
      </motion.nav>

      {/* ── Content Header ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOut, delay: 0.05 }}
        className="px-5 md:px-12 pb-6"
      >
        <div
          className={`mx-auto ${
            content.type === 'journal' || content.type === 'feed' || content.type === 'timeline'
              ? 'max-w-[720px]'
              : 'max-w-[800px]'
          }`}
        >
          {/* Category tag */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="inline-block text-[12px] font-sans bg-light-pink text-graphite px-2.5 py-0.5 rounded-sm mb-3"
          >
            {breadcrumb.section}
          </motion.span>

          {/* Title */}
          <h1
            className={`font-serif text-ink mb-3 ${
              content.type === 'journal'
                ? 'text-[28px] md:text-[28px]'
                : 'text-[24px] md:text-[24px] font-medium'
            }`}
          >
            {content.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-[12px] font-sans text-silver">
              {formatDetailDate(content.updatedAt)}
            </span>
            <span
              className={`inline-block text-[11px] font-sans px-2.5 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}
            >
              {content.status}
            </span>
            {content.metadata.rating !== undefined && content.metadata.rating !== null && (
              <StarRating rating={content.metadata.rating as number} />
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-sans text-silver bg-light-gray px-2 py-0.5 rounded-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Cover image (for journal with cover) */}
          {content.cover && content.type === 'journal' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: easeOut, delay: 0.1 }}
              className="mb-4"
            >
              <img
                src={content.cover}
                alt={content.title}
                className="w-full aspect-[16/9] object-cover rounded-xl shadow-md"
              />
            </motion.div>
          )}

          {/* Separator */}
          <div className="border-b border-border-color" />
        </div>
      </motion.section>

      {/* ── Content Body ── */}
      <section className="px-5 md:px-12 py-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.15 }}
        >
          {content.type === 'resource' && <ResourceBody content={content} />}
          {content.type === 'path' && <PathBody content={content} />}
          {content.type === 'work' && <WorkBody content={content} />}
          {content.type === 'journal' && <JournalBody content={content} />}
          {content.type === 'feed' && <FeedBody content={content} />}
          {content.type === 'timeline' && <TimelineBody content={content} />}
        </motion.div>
      </section>

      {/* ── Bottom Actions ── */}
      <section className="px-5 md:px-12 pb-4">
        <div
          className={`mx-auto border-t border-border-color pt-5 ${
            content.type === 'journal' || content.type === 'feed' || content.type === 'timeline'
              ? 'max-w-[720px]'
              : 'max-w-[800px]'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-sans text-graphite bg-white border border-border-color rounded-lg hover:bg-light-gray transition-colors duration-150">
                <Bookmark size={14} strokeWidth={1.5} />
                收藏
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-sans text-graphite bg-white border border-border-color rounded-lg hover:bg-light-gray transition-colors duration-150">
                <Share2 size={14} strokeWidth={1.5} />
                分享
              </button>
            </div>
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-sans text-silver hover:text-graphite transition-colors duration-150"
            >
              <ArrowLeft size={14} strokeWidth={1.5} />
              返回
            </button>
          </div>
        </div>
      </section>

      {/* ── Related Content ── */}
      {related.length > 0 && (
        <section className="bg-cream px-5 md:px-12 py-12">
          <div className="max-w-[1200px] mx-auto">
            <h2 className="font-serif text-[22px] text-ink mb-6">相关推荐</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((item) => (
                <RelatedCard key={item.id} content={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
