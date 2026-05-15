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
} from 'lucide-react';
import works from '@/data/mockWorks';
import { resolveAssetUrl } from '@/lib/runtime';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

const roomCards = [
  { name: '工坊', icon: Hammer, desc: '项目和复刻记录', path: '/works', kind: 'link' as const },
  { name: '藏馆', icon: Library, desc: '工具和资料卡', path: '/library', kind: 'link' as const },
  { name: '谱系', icon: Route, desc: '可以复刻的小路', path: '/paths', kind: 'link' as const },
  { name: '手记', icon: BookOpen, desc: '笔记和复盘', path: '/journal', kind: 'link' as const },
  { name: '年谱', icon: CalendarDays, desc: '真实时间线', path: '/timeline', kind: 'link' as const },
  { name: '风信', icon: Radio, desc: '趋势和判断', path: '/feed', kind: 'link' as const },
  { name: '小安', icon: Zap, desc: '在书页旁回答问题', path: '#', kind: 'dialog' as const },
];

const starterBlueprints = [
  {
    title: '个人资料库展示前端',
    label: '前端',
    desc: '展示站的骨架：首屏、卡片、详情页、搜索和移动端阅读秩序。',
  },
  {
    title: '个人资料库平台复刻学习包',
    label: '资料层',
    desc: '把资料整理成公开数据，让前端只呈现经过取舍的内容。',
  },
  {
    title: 'Coze Agent Builder 复刻学习包',
    label: '智能体',
    desc: '把资料、前端和小安对话连成一条可检查的工作流。',
  },
];

const growthMoments = [
  {
    title: '2026 年 3 月之后，AI 从好奇变成实践',
    desc: '工具不再只是聊天窗口，而开始进入项目、资料和复盘。',
  },
  {
    title: '从零散使用，走向有记录的工作流',
    desc: '提示词、工具、失败和验收开始被写成可以复看的材料。',
  },
  {
    title: '从本地材料，走向公开书房',
    desc: '读者看到的是被整理后的书页，不是后台仓库和原始碎片。',
  },
  {
    title: '从网页预览，走向可安装的应用',
    desc: '书房开始承担阅读、更新、对话和长期维护。',
  },
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
    const el = document.getElementById('core-entries');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openXiaoan = () => {
    window.dispatchEvent(new CustomEvent('an-open-xiaoan'));
  };

  return (
    <section className="relative flex min-h-[calc(88dvh-56px)] flex-col items-center justify-center overflow-hidden border-b border-border-color bg-[#fbfaf7] md:min-h-[calc(100dvh-64px)]">
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

      <motion.div
        className="relative mb-6 flex items-center justify-center gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: easeOut, delay: 0.12 }}
      >
        <div className="flex flex-col items-center gap-1.5">
          <img
            src={resolveAssetUrl('/avatar-an.jpg')}
            alt="安的头像"
            className="h-16 w-16 rounded-full border-[3px] border-white object-cover shadow-[0_12px_28px_rgba(67,52,43,0.12)] md:h-20 md:w-20"
          />
          <span className="font-serif text-[13px] text-graphite">安</span>
        </div>
        <div className="mt-5 h-px w-10 bg-[#D8C6B8]" aria-hidden="true" />
        <div className="flex flex-col items-center gap-1.5">
          <img
            src={resolveAssetUrl('/avatar-xiaoan.jpg')}
            alt="小安的头像"
            className="h-16 w-16 rounded-full border-[3px] border-white object-cover shadow-[0_12px_28px_rgba(67,52,43,0.12)] md:h-20 md:w-20"
          />
          <span className="font-serif text-[13px] text-graphite">小安</span>
          <span className="-mt-1 text-[10px] text-light-silver">数字生命体</span>
        </div>
      </motion.div>

      <motion.p
        className="relative text-[11px] uppercase tracking-[0.08em] text-[#9B7E68] md:text-[12px]"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut, delay: 0.16 }}
      >
        安的学习档案与公开书房
      </motion.p>

      <motion.h1
        className="relative mt-3 text-center font-serif text-[38px] leading-[1.14] text-ink md:text-[64px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.2 }}
      >
        安的个人书房
      </motion.h1>

      <motion.p
        className="relative mt-5 max-w-[760px] px-5 text-center text-[14px] font-light leading-[2.05] text-silver md:text-[16px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOut, delay: 0.35 }}
      >
        这里存放安的项目、工具、笔记、复盘和失败记录。它不替读者做判断，只把一段路修到可以被看见。
      </motion.p>

      <motion.div
        className="relative mt-9 flex flex-wrap items-center justify-center gap-3 px-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOut, delay: 0.65 }}
      >
        <button
          type="button"
          onClick={scrollToEntries}
          className="rounded-full bg-ink px-5 py-2.5 text-[13px] text-white shadow-[0_10px_24px_rgba(47,43,38,0.12)] transition-transform duration-150 hover:-translate-y-0.5"
        >
          进入书房
        </button>
        <Link
          to="/works"
          className="rounded-full border border-[#D8C6B8] bg-white/72 px-5 py-2.5 text-[13px] text-graphite transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#BFA58F]"
        >
          看工坊
        </Link>
        <button
          type="button"
          onClick={openXiaoan}
          className="rounded-full border border-[#E6D8CD] bg-[#F8F3EE]/90 px-5 py-2.5 text-[13px] text-silver transition-transform duration-150 hover:-translate-y-0.5 hover:border-[#CDAE95] hover:text-graphite"
        >
          叫醒小安
        </button>
      </motion.div>

      <motion.button
        className="absolute bottom-8 text-silver transition-colors duration-150 hover:text-graphite"
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
    <section id="core-entries" className="bg-cream py-12 md:py-20">
      <div className="mx-auto max-w-[1200px] px-5 md:px-12">
        <motion.div
          className="mb-8 md:mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <h2 className="font-serif text-[24px] leading-[1.35] text-ink md:text-[32px]">
            书房入口
          </h2>
          <p className="mt-3 max-w-[760px] text-[13px] leading-[1.9] text-silver md:text-[14px]">
            每个入口只负责一件事，打开需要的那一处就好。
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 xl:grid-cols-7"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          {roomCards.map((card) => {
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
                    className="card-tap group block w-full rounded-xl border border-border-color bg-white px-4 py-5 text-left transition-all duration-250 hover:-translate-y-[3px] hover:border-border-dark hover:shadow-md md:px-5 md:py-7"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="mb-2 text-silver transition-colors duration-250 group-hover:text-status-active md:mb-3"
                    />
                    <div className="text-[14px] font-medium text-graphite md:text-[15px]">{card.name}</div>
                    <div className="mt-1 text-[11px] leading-relaxed text-silver md:text-[12px]">{card.desc}</div>
                  </button>
                ) : (
                  <Link
                    to={card.path}
                    className="card-tap group block w-full rounded-xl border border-border-color bg-white px-4 py-5 text-left transition-all duration-250 hover:-translate-y-[3px] hover:border-border-dark hover:shadow-md md:px-5 md:py-7"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      className="mb-2 text-silver transition-colors duration-250 group-hover:text-status-active md:mb-3"
                    />
                    <div className="text-[14px] font-medium text-graphite md:text-[15px]">{card.name}</div>
                    <div className="mt-1 text-[11px] leading-relaxed text-silver md:text-[12px]">{card.desc}</div>
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

function FeaturedPacketsSection() {
  const featuredPackets = starterBlueprints.flatMap((blueprint) => {
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
          <SectionTitle title="三份主档案" subtitle="当前最值得打开的项目档案。" linkTo="/works" linkText="进入工坊" />
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {featuredPackets.map(({ label, desc, work }, index) => (
            <motion.div
              key={work.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.4, ease: easeOut, delay: index * 0.06 }}
            >
              <Link
                to={`/content/${work.id}`}
                className="group block h-full rounded-xl border border-[#E6D8CD] bg-[#FCFAF7] px-5 py-5 transition-all duration-250 hover:-translate-y-[2px] hover:border-[#CDAE95] hover:shadow-md"
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
                <h3 className="mt-4 font-serif text-[20px] leading-[1.45] text-ink">{work.title}</h3>
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
            title="安的主线"
            subtitle="从 2026 年 3 月之后，AI 学习逐渐变成一套可复看的方法。"
            linkTo="/timeline"
            linkText="查看年谱"
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
              className="rounded-xl border border-border-color bg-cream px-4 py-5"
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
