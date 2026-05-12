import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Library,
  GitBranch,
  Radio,
  Hammer,
  BookOpen,
  CalendarDays,
  User,
  Search,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Zap,
  GraduationCap,
  Clock,
} from 'lucide-react';
import paths from '@/data/mockPaths';
import feedItems from '@/data/mockFeed';
import works from '@/data/mockWorks';
import timelineEvents from '@/data/mockTimeline';
import { libraryItems } from '@/data/mockLibrary';
import { journalEntries } from '@/data/mockJournal';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const entryCards = [
  { name: '藏馆', icon: Library, desc: '资料收藏与整理', path: '/library' },
  { name: '谱系', icon: GitBranch, desc: '学习路径与复刻路线', path: '/paths' },
  { name: '风信', icon: Radio, desc: '最新动态与信息流', path: '/feed' },
  { name: '工坊', icon: Hammer, desc: '作品与项目展示', path: '/works' },
  { name: '手记', icon: BookOpen, desc: '随笔与思考记录', path: '/journal' },
  { name: '年谱', icon: CalendarDays, desc: '成长时间线', path: '/timeline' },
  { name: '自序', icon: User, desc: '关于我的自述', path: '/about' },
  { name: '搜索', icon: Search, desc: '全站内容搜索', path: '#' },
];

const feedTypeConfig: Record<string, { label: string; color: string }> = {
  resource: { label: '资源收藏', color: '#C8956C' },
  path_update: { label: '路径更新', color: '#6B9E7C' },
  work: { label: '新作品', color: '#C47D6E' },
  journal: { label: '手记', color: '#8A8A88' },
  milestone: { label: '里程碑', color: '#C8956C' },
};

const difficultyMap: Record<string, string> = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '进阶',
};

const difficultyColorMap: Record<string, string> = {
  beginner: '#6B9E7C',
  intermediate: '#C8956C',
  advanced: '#C47D6E',
};

const statusMap: Record<string, { label: string; bg: string; text: string }> = {
  in_progress: { label: '进行中', bg: 'bg-[#C8956C]', text: 'text-white' },
  completed: { label: '已完成', bg: 'bg-[#6B9E7C]', text: 'text-white' },
  planned: { label: '待开始', bg: 'bg-[#A0A0A0]', text: 'text-white' },
};

function SectionTitle({
  title,
  subtitle,
  linkTo,
  linkText,
}: {
  title: string;
  subtitle: string;
  linkTo: string;
  linkText: string;
}) {
  return (
    <div className="flex items-end justify-between mb-6 md:mb-8">
      <div>
        <h2 className="font-serif text-[22px] md:text-[28px] text-ink font-normal mb-1">
          {title}
        </h2>
        <p className="text-[13px] md:text-[14px] text-silver font-sans">{subtitle}</p>
      </div>
      <Link
        to={linkTo}
        className="text-[12px] md:text-[13px] text-silver hover:text-ink transition-colors duration-150 flex items-center gap-1 group shrink-0 ml-4"
      >
        {linkText}
        <ArrowRight
          size={14}
          strokeWidth={1.5}
          className="group-hover:translate-x-0.5 transition-transform duration-150"
        />
      </Link>
    </div>
  );
}

/* ============ HERO SECTION ============ */
function HeroSection() {
  const scrollToEntries = () => {
    const el = document.getElementById('core-entries');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[calc(85dvh-56px)] md:min-h-[calc(100dvh-64px)] flex flex-col items-center justify-center bg-gradient-to-b from-white to-cream border-b border-border-color">
      <motion.h1
        className="font-serif text-[32px] md:text-[56px] font-normal text-ink tracking-[-0.02em] text-center leading-[1.15]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.2 }}
      >
        藏馆
      </motion.h1>

      <motion.p
        className="mt-4 text-[14px] md:text-[16px] font-sans font-light text-silver text-center max-w-[480px] px-5 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.35 }}
      >
        一座关于资料、路径、作品与成长的个人藏馆。这里记录的每一条路、每一件工具，都经过真实使用与思考。
      </motion.p>

      <motion.button
        className="absolute bottom-8 text-silver hover:text-graphite transition-colors duration-150"
        onClick={scrollToEntries}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        aria-label="向下滚动"
      >
        <ChevronDown size={24} strokeWidth={1.5} className="animate-bounce-subtle" />
      </motion.button>
    </section>
  );
}

/* ============ STAT BAR SECTION ============ */
function StatBarSection() {
  const stats = [
    { value: libraryItems.length, label: '条资源', icon: Library },
    { value: paths.length, label: '条路径', icon: GitBranch },
    { value: works.length, label: '件作品', icon: Hammer },
    { value: journalEntries.length, label: '篇手记', icon: BookOpen },
  ];

  return (
    <section className="bg-cream border-b border-border-color py-4">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        <motion.div
          className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut, delay: 0.5 }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <Icon size={15} strokeWidth={1.5} className="text-silver" />
                <span className="text-[16px] font-sans font-medium text-ink">
                  {stat.value}
                </span>
                <span className="text-[13px] font-sans text-silver">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============ CORE ENTRIES SECTION ============ */
function CoreEntriesSection() {
  return (
    <section id="core-entries" className="bg-cream py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{
            visible: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {entryCards.map((card) => {
            const Icon = card.icon;
            const isSearch = card.name === '搜索';
            return (
              <motion.div
                key={card.name}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
                }}
              >
                {isSearch ? (
                  <button className="w-full text-left bg-white border border-border-color rounded-xl px-4 md:px-5 py-5 md:py-7 hover:-translate-y-[3px] hover:shadow-md hover:border-border-dark transition-all duration-250 group card-tap">
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="text-silver group-hover:text-status-active transition-colors duration-250 mb-2 md:mb-3"
                    />
                    <div className="text-[14px] md:text-[15px] font-sans font-medium text-graphite">
                      {card.name}
                    </div>
                    <div className="text-[11px] md:text-[12px] text-silver mt-1 truncate">{card.desc}</div>
                  </button>
                ) : (
                  <Link
                    to={card.path}
                    className="block w-full text-left bg-white border border-border-color rounded-xl px-4 md:px-5 py-5 md:py-7 hover:-translate-y-[3px] hover:shadow-md hover:border-border-dark transition-all duration-250 group card-tap"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="text-silver group-hover:text-status-active transition-colors duration-250 mb-2 md:mb-3"
                    />
                    <div className="text-[14px] md:text-[15px] font-sans font-medium text-graphite">
                      {card.name}
                    </div>
                    <div className="text-[11px] md:text-[12px] text-silver mt-1 truncate">{card.desc}</div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

/* ============ QUICK START SECTION ============ */
function QuickStartSection() {
  const quickPaths = paths.filter((p) => p.difficulty === 'beginner').slice(0, 3);
  const quickResources = libraryItems.filter((i) => i.isRecommended && i.difficulty === 'easy').slice(0, 3);

  return (
    <section className="bg-white py-12 md:py-20 border-b border-border-color">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={20} strokeWidth={1.5} className="text-[#C8956C]" />
            <h2 className="font-serif text-[22px] md:text-[28px] text-ink font-normal">
              新手从这里开始
            </h2>
          </div>
          <p className="text-[13px] md:text-[14px] text-silver font-sans">
            不知道从哪里入手？这些路径和资源是我为初学者精心挑选的
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Recommended paths for beginners */}
          {quickPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, ease: easeOut, delay: index * 0.1 }}
            >
              <Link
                to={`/paths/${path.id}`}
                className="group block bg-cream border border-border-color rounded-xl p-5 hover:shadow-md hover:border-border-dark transition-all duration-250 card-tap h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: difficultyColorMap[path.difficulty] + '18',
                      color: difficultyColorMap[path.difficulty],
                    }}
                  >
                    {difficultyMap[path.difficulty]}
                  </span>
                  <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#F5EDE8] text-[#C8956C]">
                    新手推荐
                  </span>
                </div>
                <h3 className="text-[15px] font-sans font-medium text-graphite group-hover:text-ink transition-colors duration-150 mb-1.5">
                  {path.title}
                </h3>
                <p className="text-[12px] font-sans text-silver leading-relaxed line-clamp-2 mb-3">
                  {path.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-sans text-light-silver">
                  <Clock size={11} strokeWidth={1.5} />
                  <span>{path.estimatedTime}</span>
                  <span className="text-border-color">|</span>
                  <span>{path.stages.length} 个阶段</span>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Quick resources */}
          {quickResources.slice(0, 3 - quickPaths.length).map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, ease: easeOut, delay: (quickPaths.length + index) * 0.1 }}
            >
              <Link
                to={`/content/${resource.id}`}
                className="group block bg-cream border border-border-color rounded-xl p-5 hover:shadow-md hover:border-border-dark transition-all duration-250 card-tap h-full"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#6B9E7C]/10 text-[#6B9E7C] border border-[#6B9E7C]/30">
                    简单
                  </span>
                  <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-[#F5EDE8] text-[#C8956C]">
                    新手推荐
                  </span>
                </div>
                <h3 className="text-[15px] font-sans font-medium text-graphite group-hover:text-ink transition-colors duration-150 mb-1.5">
                  {resource.title}
                </h3>
                <p className="text-[12px] font-sans text-silver leading-relaxed line-clamp-2 mb-3">
                  {resource.description}
                </p>
                <div className="flex items-center gap-2 text-[11px] font-sans text-light-silver">
                  <Clock size={11} strokeWidth={1.5} />
                  <span>{resource.timeToLearn}</span>
                  <span className="text-border-color">|</span>
                  <Sparkles size={11} strokeWidth={1.5} className="text-[#C8956C]" />
                  <span className="text-[#C8956C]">{resource.recommendedFor}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ FEATURED PATHS SECTION ============ */
function FeaturedPathsSection() {
  const featuredPaths = paths.slice(0, 3);

  return (
    <section className="bg-cream py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <SectionTitle
            title="推荐谱系"
            subtitle="可复刻的学习与成长路径，每条都有详细的学习指南"
            linkTo="/paths"
            linkText="查看全部"
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featuredPaths.map((path, index) => (
            <motion.div
              key={path.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: easeOut, delay: index * 0.1 }}
            >
              <Link
                to={`/paths/${path.id}`}
                className="group block bg-white border border-border-color rounded-xl overflow-hidden hover:-translate-y-[2px] hover:shadow-md transition-all duration-250"
              >
                {path.cover && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={path.cover}
                      alt={path.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block text-[12px] font-sans font-normal rounded-full px-2.5 py-0.5"
                      style={{
                        backgroundColor: difficultyColorMap[path.difficulty] + '18',
                        color: difficultyColorMap[path.difficulty],
                      }}
                    >
                      {difficultyMap[path.difficulty] || path.difficulty}
                    </span>
                    <span
                      className={`text-[12px] font-sans font-normal rounded-full px-2.5 py-0.5 ${statusMap[path.status]?.bg ?? 'bg-light-gray'} ${statusMap[path.status]?.text ?? 'text-graphite'}`}
                    >
                      {statusMap[path.status]?.label ?? path.status}
                    </span>
                  </div>
                  <h3 className="font-serif text-[20px] text-ink font-normal mb-1 leading-tight">
                    {path.title}
                  </h3>
                  <p className="text-[13px] text-silver leading-relaxed line-clamp-2 mb-3">
                    {path.description}
                  </p>
                  <div className="flex items-center gap-2 text-[12px] text-silver">
                    <Clock size={12} strokeWidth={1.5} />
                    <span>{path.estimatedTime}</span>
                    <span className="text-border-color">|</span>
                    <span>{path.stages.length} 个阶段</span>
                  </div>
                  {/* Who for */}
                  <div className="mt-3 pt-3 border-t border-[#F0F0EE]">
                    <p className="text-[11px] font-sans text-light-silver">
                      <span className="text-silver">适合：</span>
                      {path.whoFor}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ RECENT FEEDS SECTION ============ */
function RecentFeedsSection() {
  const recentFeeds = feedItems.slice(0, 5);

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-[800px] mx-auto px-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <SectionTitle
            title="风信"
            subtitle="最近的更新、收藏、发布与动态"
            linkTo="/feed"
            linkText="查看全部"
          />
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-2 bottom-2 w-[2px] bg-border-color" />

          <div className="space-y-0">
            {recentFeeds.map((feed, index) => {
              const config = feedTypeConfig[feed.type] || {
                label: feed.type,
                color: '#8A8A88',
              };
              const isCritical = feed.importanceLevel === 'critical';
              return (
                <motion.div
                  key={feed.id}
                  className="relative pl-8 pb-5"
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, ease: easeOut, delay: index * 0.08 }}
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-[6px] top-[9px] w-[12px] h-[12px] rounded-full border-2 border-white ${isCritical ? 'ring-2 ring-[#C47D6E]/30' : ''}`}
                    style={{ backgroundColor: isCritical ? '#C47D6E' : config.color }}
                  />

                  <Link to={feed.link || '#'} className="group block">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block text-[11px] text-silver bg-light-pink rounded px-2 py-0.5">
                        {config.label}
                      </span>
                      {/* Source */}
                      <span className="text-[11px] font-sans text-light-silver">
                        {feed.source}
                      </span>
                      {isCritical && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-sans text-[#C47D6E] bg-[#C47D6E]/10 px-1.5 py-0.5 rounded">
                          <Zap size={9} strokeWidth={2} />
                          重要
                        </span>
                      )}
                    </div>
                    <h4 className="text-[15px] font-sans font-medium text-graphite group-hover:text-status-active transition-colors duration-200 leading-snug">
                      {feed.title}
                    </h4>
                    <p className="text-[13px] text-silver leading-relaxed truncate mt-0.5">
                      {feed.content}
                    </p>
                    <span className="text-[11px] text-light-silver mt-1 block">
                      {new Date(feed.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ FEATURED WORKS SECTION ============ */
function FeaturedWorksSection() {
  const featuredWorks = works.slice(0, 3);
  const mainWork = featuredWorks[0];
  const sideWorks = featuredWorks.slice(1);

  return (
    <section className="bg-cream py-12 md:py-20">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <SectionTitle
            title="工坊"
            subtitle="作品与项目，每件都记录了真实的开发历程"
            linkTo="/works"
            linkText="查看全部"
          />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Main large card */}
          {mainWork && (
            <motion.div
              className="lg:w-2/3"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <Link
                to={`/works`}
                className="group block bg-white border border-border-color rounded-xl overflow-hidden hover:-translate-y-[2px] hover:shadow-md transition-all duration-250"
              >
                {mainWork.cover && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={mainWork.cover}
                      alt={mainWork.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-serif text-[22px] text-ink font-normal mb-1">
                    {mainWork.title}
                  </h3>
                  <p className="text-[13px] text-silver leading-relaxed line-clamp-2 mb-3">
                    {mainWork.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {mainWork.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[11px] text-silver bg-light-gray rounded px-2 py-0.5"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-sans text-light-silver pt-3 border-t border-[#F0F0EE]">
                    <span>{mainWork.duration}</span>
                    <span className="text-border-color">|</span>
                    <span>{mainWork.teamSize}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Side cards */}
          <div className="lg:w-1/3 flex flex-col gap-5">
            {sideWorks.map((work, index) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, ease: easeOut, delay: (index + 1) * 0.12 }}
              >
                <Link
                  to={`/works`}
                  className="group flex flex-row bg-white border border-border-color rounded-xl overflow-hidden hover:-translate-y-[2px] hover:shadow-md transition-all duration-250 h-full"
                >
                  {work.cover && (
                    <div className="w-2/5 overflow-hidden">
                      <img
                        src={work.cover}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="w-3/5 p-4 flex flex-col justify-center">
                    <h4 className="font-serif text-[16px] text-ink font-normal mb-1 leading-tight">
                      {work.title}
                    </h4>
                    <p className="text-[12px] text-silver leading-relaxed line-clamp-1 mb-2">
                      {work.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {work.techStack.slice(0, 2).map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] text-silver bg-light-gray rounded px-1.5 py-0.5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-[10px] font-sans text-light-silver">
                      <Clock size={9} strokeWidth={1.5} />
                      <span>{work.duration}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ TIMELINE PREVIEW SECTION ============ */
function TimelinePreviewSection() {
  const previewEvents = timelineEvents.slice(0, 4);

  const importanceColor: Record<string, { dot: string; ring?: string }> = {
    normal: { dot: '#C8C8C6' },
    important: { dot: '#C8956C' },
    major: { dot: '#C47D6E', ring: 'rgba(196,125,110,0.2)' },
  };

  return (
    <section className="bg-white py-12 md:py-20 pb-16 md:pb-24">
      <div className="max-w-[800px] mx-auto px-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <SectionTitle
            title="年谱"
            subtitle="成长的重要节点与反思"
            linkTo="/timeline"
            linkText="查看全部"
          />
        </motion.div>

        <div className="relative">
          {/* Center vertical line */}
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-border-color -translate-x-1/2 origin-top hidden md:block"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut }}
          />
          {/* Mobile line */}
          <motion.div
            className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-border-color origin-top md:hidden"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: easeOut }}
          />

          <div className="space-y-6">
            {previewEvents.map((event, index) => {
              const imp = importanceColor[event.importance] || importanceColor.normal;
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={event.id}
                  className={`relative flex items-center ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  } flex-row`}
                >
                  {/* Content card */}
                  <motion.div
                    className={`w-full md:w-1/2 ${isLeft ? 'md:pr-10' : 'md:pl-10'} pl-10 md:pl-0`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number], delay: index * 0.15 }}
                  >
                    <Link
                      to="/timeline"
                      className="block bg-white border border-border-color rounded-xl p-4 md:p-5 hover:shadow-md transition-shadow duration-200"
                    >
                      <span className="text-[12px] text-silver block mb-1">
                        {event.date}
                      </span>
                      <h4 className="text-[15px] font-sans font-medium text-graphite mb-1">
                        {event.title}
                      </h4>
                      <p className="text-[13px] text-silver leading-relaxed line-clamp-2">
                        {event.description}
                      </p>
                      {/* Achievements */}
                      {event.achievements && event.achievements.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-[#F0F0EE]">
                          <div className="flex flex-wrap gap-1">
                            {event.achievements.slice(0, 2).map((achievement) => (
                              <span
                                key={achievement}
                                className="text-[10px] font-sans text-silver bg-light-pink rounded px-2 py-0.5"
                              >
                                {achievement}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </Link>
                  </motion.div>

                  {/* Center dot */}
                  <motion.div
                    className="absolute left-[9px] md:left-1/2 md:-translate-x-1/2 z-10"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number], delay: index * 0.15 }}
                  >
                    <div
                      className="w-[10px] h-[10px] rounded-full"
                      style={{
                        backgroundColor: imp.dot,
                        boxShadow: imp.ring ? `0 0 0 3px ${imp.ring}` : 'none',
                      }}
                    />
                  </motion.div>

                  {/* Empty spacer for alternating layout on desktop */}
                  <div className="hidden md:block w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============ HOME PAGE ============ */
export default function Home() {
  return (
    <div>
      <HeroSection />
      <StatBarSection />
      <CoreEntriesSection />
      <QuickStartSection />
      <FeaturedPathsSection />
      <RecentFeedsSection />
      <FeaturedWorksSection />
      <TimelinePreviewSection />

      {/* Bottom transition to footer */}
      <div className="bg-white pb-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-12">
          <div className="border-t border-border-color" />
        </div>
      </div>
    </div>
  );
}
