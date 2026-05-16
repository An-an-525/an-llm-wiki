import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Library,
  Radio,
  Hammer,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ArrowRight,
  Route,
  Zap,
  Sparkles,
  Search,
} from 'lucide-react';
import works from '@/data/mockWorks';
import { resolveAssetUrl } from '@/lib/runtime';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const roomCards = [
  { name: '先看成品', module: '工坊', icon: Hammer, desc: '项目、作品和复刻记录', path: '/works', kind: 'link' as const },
  { name: '找资料', module: '藏馆', icon: Library, desc: '工具、教程和资料卡', path: '/library', kind: 'link' as const },
  { name: '照着走', module: '谱系', icon: Route, desc: '给第一次来的学习路径', path: '/paths', kind: 'link' as const },
  { name: '读手记', module: '手记', icon: BookOpen, desc: '笔记、复盘和感受', path: '/journal', kind: 'link' as const },
  { name: '认识安', module: '年谱', icon: CalendarDays, desc: '时间线和个人来路', path: '/timeline', kind: 'link' as const },
  { name: '看近况', module: '风信', icon: Radio, desc: '趋势、信息和判断', path: '/feed', kind: 'link' as const },
  { name: '问小安', module: '小安', icon: Zap, desc: '把问题说给书房听', path: '#', kind: 'dialog' as const },
];

const firstSteps = [
  {
    title: '个人资料库展示前端',
    displayTitle: '先看这座书房怎么搭起来',
    label: '第一步',
    desc: '先看这个站是怎样搭起来的：页面、卡片、搜索和手机端阅读顺序。',
  },
  {
    title: '个人资料库平台复刻学习包',
    displayTitle: '再看资料怎样变成书页',
    label: '第二步',
    desc: '再看资料怎样被收拢、筛选、整理成读者能打开的书页。',
  },
  {
    title: 'Coze 风格 Agent 搭建器研究',
    displayTitle: '最后看智能体怎样分工',
    label: '第三步',
    desc: '最后看智能体怎样被拆成节点、边界和验收，而不是只追一个漂亮画布。',
  },
];

const growthMoments = [
  {
    title: '从好奇开始',
    desc: '2026 年 3 月之后，AI 不再只是聊天窗口，而变成每天会用到的工具。',
  },
  {
    title: '把过程写下来',
    desc: '提示词、工具、失败和验收被写成记录，后来的人可以少绕一点路。',
  },
  {
    title: '整理成书房',
    desc: '散落的经历被收束成公开书页，读者看到的是被取舍过的内容。',
  },
  {
    title: '继续往前走',
    desc: '书房会继续承担阅读、更新、对话和长期维护。',
  },
];

const doorNotes = [
  '安从 2026 年 3 月之后开始认真使用 AI，把工具、项目、失败和复盘一点点收成书页。',
  '这里给后来的人看，也给未来的自己看：不靠术语压人，只留下能复刻的路径。',
  '私密材料、密钥、原始聊天和私人环境细节不在公开书房里；能公开的，是方法、判断和可检查的下一步。',
];

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
    <div className="mb-6 flex items-end justify-between md:mb-8">
      <div>
        <h2 className="font-serif text-[22px] text-ink md:text-[28px]">{title}</h2>
        <p className="text-[13px] text-silver md:text-[14px]">{subtitle}</p>
      </div>
      <Link
        to={linkTo}
        className="group ml-4 flex shrink-0 items-center gap-1 text-[12px] text-silver transition-colors duration-150 hover:text-ink md:text-[13px]"
      >
        {linkText}
        <ArrowRight
          size={14}
          strokeWidth={1.5}
          className="transition-transform duration-150 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  );
}

function HeroSection() {
  const scrollToEntries = () => {
    const el = document.getElementById('start-here');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openXiaoan = () => {
    window.dispatchEvent(new CustomEvent('an-open-xiaoan'));
  };

  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('an-open-search'));
  };

  return (
    <section className="relative flex min-h-[calc(92dvh-56px)] flex-col justify-center overflow-hidden border-b border-border-color bg-[#fbfaf7] pt-[calc(var(--app-nav-height)+12px)] md:min-h-[calc(96dvh-64px)] md:pt-[calc(var(--app-nav-height)+24px)]">
      <div
        className="absolute inset-0 opacity-[0.55]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(90deg, rgba(216,198,184,0.22) 1px, transparent 1px), linear-gradient(180deg, rgba(232,221,212,0.32) 1px, transparent 1px)',
          backgroundSize: '88px 88px, 88px 88px',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 16%, black 72%, transparent 100%)',
        }}
      />
      <div className="absolute left-6 top-[18%] hidden h-[52%] w-px bg-[#D8C6B8]/80 md:block" aria-hidden="true" />
      <div className="absolute right-6 top-[18%] hidden h-[52%] w-px bg-[#D8C6B8]/80 md:block" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-[1200px] gap-5 px-5 pb-16 md:grid-cols-[minmax(0,1fr)_360px] md:gap-8 md:px-12 md:pb-24">
        <div className="flex min-w-0 flex-col justify-center">
          <motion.p
            className="text-[12px] text-[#9B7E68] md:text-[13px]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.12 }}
          >
            给第一次来的人：这里先说人，再给路。
          </motion.p>

          <motion.h1
            className="mt-3 max-w-[720px] font-serif text-[34px] leading-[1.16] text-ink md:mt-4 md:text-[62px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.18 }}
          >
            安的书房：把 AI 学习路，整理给后来的人看。
          </motion.h1>

          <motion.p
            className="mt-4 max-w-[680px] text-[14px] font-light leading-[1.9] text-silver md:mt-5 md:text-[16px] md:leading-[2]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.3 }}
          >
            安是这间书房的主人。这里不堆术语，也不炫工具，只把项目、资料、失败、复盘和下一步，收成第一次来的人也能顺着读的路径。
          </motion.p>

          <motion.div
            className="mt-5 flex flex-wrap items-center gap-3 md:mt-7"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.48 }}
          >
            <button
              type="button"
              onClick={scrollToEntries}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] text-white shadow-[0_10px_24px_rgba(47,43,38,0.12)] transition-transform duration-150 hover:-translate-y-0.5"
            >
              从这里开始
              <ArrowRight size={15} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={openXiaoan}
              className="inline-flex items-center gap-2 rounded-full border border-[#E6D8CD] bg-[#F8F3EE]/90 px-5 py-2.5 text-[13px] text-graphite transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#CDAE95]"
            >
              <Sparkles size={15} strokeWidth={1.5} />
              不知道读哪，问小安
            </button>
            <button
              type="button"
              onClick={openSearch}
              className="inline-flex items-center gap-2 rounded-full border border-[#D8C6B8] bg-white/72 px-5 py-2.5 text-[13px] text-silver transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#BFA58F] hover:text-graphite"
            >
              <Search size={15} strokeWidth={1.5} />
              搜资料
            </button>
          </motion.div>
        </div>

        <motion.aside
          className="self-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: easeOut, delay: 0.38 }}
          aria-label="书房短札"
        >
          <div className="rounded-2xl border border-[#E6D8CD] bg-white/78 p-5 shadow-[0_18px_48px_rgba(67,52,43,0.08)] md:p-6">
            <div className="flex items-center gap-4">
              <img
                src={resolveAssetUrl('/avatar-an.jpg')}
                alt="安的头像"
                className="h-16 w-16 rounded-full border-[3px] border-white object-cover shadow-[0_10px_22px_rgba(67,52,43,0.12)]"
              />
              <div>
                <div className="font-serif text-[22px] text-ink">安</div>
                <p className="mt-1 text-[12px] leading-[1.7] text-[#9B7E68]">
                  这间书房的主人，也是一路学习的记录者。
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3 border-t border-[#EDE4DC] pt-5">
              {doorNotes.map((note) => (
                <p key={note} className="flex gap-3 text-[13px] leading-[1.85] text-graphite">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8956C]" />
                  <span>{note}</span>
                </p>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>

      <motion.button
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-silver transition-colors duration-150 hover:text-graphite"
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

function CoreEntriesSection() {
  const openXiaoan = () => {
    window.dispatchEvent(new CustomEvent('an-open-xiaoan'));
  };

  return (
    <section id="start-here" className="bg-cream py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <motion.div
          className="mb-8 md:mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <h2 className="font-serif text-[24px] leading-[1.35] text-ink md:text-[32px]">
            先选你今天要做的事
          </h2>
          <p className="mt-3 max-w-[760px] text-[13px] leading-[1.9] text-silver md:text-[14px]">
            不必一次看完。想看结果、找资料、照着学、认识安，都有各自的门。
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {roomCards.slice(0, 3).map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.name}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
                }}
              >
                {card.kind === 'dialog' ? (
                  <button
                    type="button"
                    onClick={openXiaoan}
                    className="card-tap group block w-full rounded-lg border border-border-color bg-white px-4 py-5 text-left transition-all duration-250 hover:-translate-y-[3px] hover:border-border-dark hover:shadow-md md:px-5 md:py-7"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="mb-2 text-silver transition-colors duration-250 group-hover:text-status-active md:mb-3"
                    />
                    <div className="text-[14px] font-medium text-graphite md:text-[15px]">
                      {card.name}
                      <span className="ml-1 text-[12px] font-normal text-light-silver">｜{card.module}</span>
                    </div>
                    <div className="mt-1 text-[11px] leading-relaxed text-silver md:text-[12px]">{card.desc}</div>
                  </button>
                ) : (
                  <Link
                    to={card.path}
                    className="card-tap group block w-full rounded-lg border border-border-color bg-white px-4 py-5 text-left transition-all duration-250 hover:-translate-y-[3px] hover:border-border-dark hover:shadow-md md:px-5 md:py-7"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="mb-2 text-silver transition-colors duration-250 group-hover:text-status-active md:mb-3"
                    />
                    <div className="text-[14px] font-medium text-graphite md:text-[15px]">
                      {card.name}
                      <span className="ml-1 text-[12px] font-normal text-light-silver">｜{card.module}</span>
                    </div>
                    <div className="mt-1 text-[11px] leading-relaxed text-silver md:text-[12px]">{card.desc}</div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-5 flex flex-wrap gap-2">
          {roomCards.slice(3).map((card) => {
            const Icon = card.icon;
            if (card.kind === 'dialog') {
              return (
                <button
                  key={card.name}
                  type="button"
                  onClick={openXiaoan}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DDD4] bg-white px-3.5 py-2 text-[12px] text-silver transition-colors hover:border-[#CDAE95] hover:text-graphite"
                >
                  <Icon size={14} strokeWidth={1.5} />
                  {card.name}
                  <span className="text-light-silver">｜{card.module}</span>
                </button>
              );
            }
            return (
              <Link
                key={card.name}
                to={card.path}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E8DDD4] bg-white px-3.5 py-2 text-[12px] text-silver transition-colors hover:border-[#CDAE95] hover:text-graphite"
              >
                <Icon size={14} strokeWidth={1.5} />
                {card.name}
                <span className="text-light-silver">｜{card.module}</span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}

function FeaturedPacketsSection() {
  const featuredPackets = firstSteps.flatMap((blueprint) => {
    const work = works.find((item) => item.title === blueprint.title);
    return work ? [{ ...blueprint, work }] : [];
  });

  return (
    <section className="border-b border-border-color bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <SectionTitle title="第一次来，先读三步" subtitle="如果你不知道先读哪里，就照这个顺序打开。" linkTo="/works" linkText="看全部项目" />
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {featuredPackets.map(({ label, desc, displayTitle, work }, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, ease: easeOut, delay: index * 0.06 }}
            >
              <Link
                to={`/content/${work.id}`}
                className="group block h-full rounded-lg border border-[#E6D8CD] bg-[#FCFAF7] px-5 py-5 transition-all duration-250 hover:-translate-y-[2px] hover:border-[#CDAE95] hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[11px] text-[#9B7E68]">
                    {label}
                  </span>
                  <ArrowRight
                    size={16}
                    strokeWidth={1.5}
                    className="text-silver transition-transform duration-150 group-hover:translate-x-0.5"
                  />
                </div>
                <h3 className="mt-4 font-serif text-[20px] leading-[1.45] text-ink">{displayTitle}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-light-silver">对应资料包：{work.title}</p>
                <p className="mt-3 text-[13px] leading-[1.85] text-silver">{desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GrowthArcSection() {
  return (
    <section className="border-b border-border-color bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <SectionTitle
            title="安为什么要建这间书房"
            subtitle="不是为了把一切讲满，而是把走过的路留下来。"
            linkTo="/timeline"
            linkText="看完整时间线"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {growthMoments.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, ease: easeOut, delay: index * 0.06 }}
              className="rounded-lg border border-border-color bg-cream px-4 py-5"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] text-[#9B7E68]">
                {index + 1}
              </span>
              <h3 className="mt-3 font-serif text-[18px] leading-[1.45] text-ink">{item.title}</h3>
              <p className="mt-2 text-[12px] leading-[1.85] text-silver">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSection />
      <CoreEntriesSection />
      <FeaturedPacketsSection />
      <GrowthArcSection />

      <div className="bg-white pb-16">
        <div className="mx-auto max-w-[1200px] px-5 md:px-12">
          <div className="border-t border-border-color" />
        </div>
      </div>
    </div>
  );
}
