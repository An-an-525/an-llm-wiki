import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Github,
  Mail,
  Twitter,
  Archive,
  Route,
  Wind,
  Hammer,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Easing                                                             */
/* ------------------------------------------------------------------ */
const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const avatarVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

/* ------------------------------------------------------------------ */
/*  Section Wrapper                                                    */
/* ------------------------------------------------------------------ */
function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: easeOut, delay },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section Label                                                      */
/* ------------------------------------------------------------------ */
function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[12px] font-sans font-normal text-silver uppercase tracking-[0.12em] mb-3">
      {text}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Guide                                                         */
/* ------------------------------------------------------------------ */
function PageGuide() {
  return (
    <motion.div
      className="bg-[#F5EDE8] rounded-xl p-4 md:p-5 mb-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: easeOut, delay: 0.15 }}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles size={16} strokeWidth={1.5} className="text-[#C8956C]" />
        </div>
        <p className="text-[13px] font-sans text-silver leading-relaxed">
          你好，欢迎来到我的藏馆。这里是我整理知识、记录成长的地方。以下是对这座藏馆的全方位介绍，帮助你快速了解它的结构与使用方法。
        </p>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Content data                                                       */
/* ------------------------------------------------------------------ */
const siteIntroMarkdown = `这里是我的公开藏馆。

它不是博客，不是导航站，也不是作品集。它是所有这些的集合，但又不是简单拼凑——而是一个有机生长的知识空间。

藏馆收录我整理的资料与工具，谱系记录我的学习路径与复刻路线，风信聚合值得关注的信息，工坊展示我的作品与实验，手记留存我的思考与成长，年谱勾勒时间线上的关键节点。

这些内容彼此关联：一条谱系可能引用藏馆中的多个资源，一篇手记可能记录某个作品的开发过程，年谱上的节点可能是某条路径的起点。`;

const whyMarkdown = `信息过载的时代，收藏不等于掌握，阅读不等于理解。

我需要一个地方，不仅要存放资料，还要记录我是如何一步步走过来的——哪些路走通了，哪些坑其实可以避开，什么工具在什么场景下真正好用。

这座藏馆是我对自己学习历程的诚实记录，也是对同样在路上的人的参考。`;

const modules = [
  {
    number: '01',
    name: '藏馆',
    desc: '资料、工具、资源的收藏',
    icon: Archive,
    link: '/library',
  },
  {
    number: '02',
    name: '谱系',
    desc: '可复刻的学习与构建路径',
    icon: Route,
    link: '/paths',
  },
  {
    number: '03',
    name: '风信',
    desc: '值得关注的动态与资讯',
    icon: Wind,
    link: '/feed',
  },
  {
    number: '04',
    name: '工坊',
    desc: '作品、项目、实验',
    icon: Hammer,
    link: '/works',
  },
  {
    number: '05',
    name: '手记',
    desc: '日记、复盘、思考',
    icon: BookOpen,
    link: '/journal',
  },
  {
    number: '06',
    name: '年谱',
    desc: '成长时间线与关键节点',
    icon: Clock,
    link: '/timeline',
  },
];

const socialLinks = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/yourname', handle: 'github.com/yourname' },
  { icon: Mail, label: 'Email', href: 'mailto:yourname@example.com', handle: 'yourname@example.com' },
  { icon: Twitter, label: 'Twitter / X', href: 'https://twitter.com/yourname', handle: '@yourname' },
];

/* ------------------------------------------------------------------ */
/*  FAQ data                                                           */
/* ------------------------------------------------------------------ */

const faqItems = [
  {
    question: '藏馆是做什么的？',
    answer: '藏馆是我的个人公开知识管理系统。它集资料收藏、学习路径、作品展示、思考记录和成长追踪于一体。不同于普通博客，藏馆强调知识之间的关联性——资料、路径、作品、手记、年谱彼此链接，形成一个有机的整体。',
  },
  {
    question: '谱系是什么意思？',
    answer: '谱系是可复刻的学习与构建路径。每条谱系都标注了难度等级、预计完成时间、适合人群和前置条件，按阶段组织，每个阶段都有明确的学习目标和推荐资源。你可以跟随一条谱系从头走到尾，也可以从中截取某个阶段深入学习。',
  },
  {
    question: '这些资源都是免费的吗？',
    answer: '藏馆中大部分资源都是免费获取的（如开源文档、公开文章等）。少数推荐的书籍或课程可能需要付费购买，但通常会注明免费替代品。谱系中的路径设计也尽量使用免费资源，降低学习门槛。',
  },
  {
    question: '内容会更新吗？',
    answer: '会持续更新。谱系会根据我的最新学习心得进行调整，藏馆会随着我发现新的优质资源而扩充，工坊会在完成新项目后添加作品，手记会不定期记录新的思考，年谱则随着时间推移自然生长。',
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                 */
/* ------------------------------------------------------------------ */

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <motion.div
      className="border border-[#E5E5E3] rounded-xl overflow-hidden bg-white"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: easeOut, delay: index * 0.06 }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 md:p-5 text-left hover:bg-[#FAF9F7] transition-colors duration-150"
      >
        <span className="text-[14px] font-sans font-medium text-graphite pr-4">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown size={16} strokeWidth={1.5} className="text-silver" />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-[#F0F0EE] pt-3">
              <p className="text-[13px] font-sans text-silver leading-[1.8]">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Content Map Section                                                */
/* ------------------------------------------------------------------ */

function ContentMapSection() {
  return (
    <AnimatedSection delay={0} className="mt-10 md:mt-16 -mx-5 md:-mx-12 px-5 md:px-12 py-8 md:py-10 rounded-xl">
      <div className="bg-light-pink rounded-xl -mx-5 md:-mx-8 px-5 md:px-8 py-10">
        <SectionLabel text="内容如何组织" />
        <h2 className="font-serif text-[22px] md:text-[28px] text-ink leading-[1.4] mb-3">
          六个互相关联的板块
        </h2>
        <p className="text-[13px] font-sans text-silver mb-6 md:mb-8 leading-relaxed">
          每个板块都有自己的定位，但它们之间通过链接相互关联，形成一个完整的知识网络。
        </p>
        <motion.div
          className="space-y-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.number}
                variants={staggerItem}
              >
                <Link
                  to={mod.link}
                  className="flex items-center gap-4 bg-white rounded-lg border border-border-color px-5 py-4 transition-all duration-200 hover:shadow-md hover:border-border-dark"
                >
                  <span className="text-[11px] font-mono text-light-silver w-5 flex-shrink-0">
                    {mod.number}
                  </span>
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-light-pink flex-shrink-0">
                    <Icon size={16} strokeWidth={1.5} className="text-graphite" />
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-serif text-[16px] font-normal text-ink flex-shrink-0">
                      {mod.name}
                    </span>
                    <ChevronRight size={12} strokeWidth={1.5} className="text-light-silver flex-shrink-0" />
                    <span className="text-[13px] font-sans text-silver truncate">
                      {mod.desc}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ Section                                                        */
/* ------------------------------------------------------------------ */

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <AnimatedSection delay={0} className="mt-10 md:mt-16">
      <SectionLabel text="常见问题" />
      <h2 className="font-serif text-[22px] md:text-[28px] text-ink leading-[1.4] mb-3">
        你可能想知道的
      </h2>
      <p className="text-[13px] font-sans text-silver mb-6 leading-relaxed">
        如果你是第一次来，这些问题可能会帮到你。
      </p>
      <div className="space-y-3">
        {faqItems.map((faq, i) => (
          <FAQItem
            key={i}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            index={i}
          />
        ))}
      </div>
    </AnimatedSection>
  );
}

/* ------------------------------------------------------------------ */
/*  Markdown components                                                */
/* ------------------------------------------------------------------ */
const markdownComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[15px] font-sans font-normal text-graphite leading-[1.8] mb-5 tracking-[0.01em]">
      {children}
    </p>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="font-serif text-[24px] font-normal text-ink mt-12 mb-4 leading-[1.4]">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="font-serif text-[18px] font-medium text-ink mt-8 mb-3 leading-[1.5]">
      {children}
    </h3>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-none pl-0 my-5 space-y-2">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex items-start gap-3 text-[15px] font-sans font-normal text-graphite leading-[1.8] tracking-[0.01em]">
      <span className="mt-[0.6em] w-1.5 h-1.5 rounded-full bg-light-silver flex-shrink-0" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-medium text-ink">{children}</strong>
  ),
  a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
    <a
      href={href}
      className="text-graphite underline underline-offset-2 hover:text-favorite transition-colors duration-150"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-[3px] border-light-pink pl-5 pr-4 py-3 my-6 font-serif italic text-silver">
      {children}
    </blockquote>
  ),
};

/* ------------------------------------------------------------------ */
/*  Main Page Component                                                */
/* ------------------------------------------------------------------ */
export default function About() {
  return (
    <div className="min-h-[100dvh]">
      {/* ── Hero Quote ── */}
      <section className="bg-[linear-gradient(180deg,#FAF9F7_0%,#FFFFFF_100%)] pt-[calc(72px+56px)] md:pt-[calc(96px+56px)] pb-8 md:pb-10">
        <div className="max-w-[720px] mx-auto px-5 md:px-12 text-center">
          <motion.p
            className="font-serif text-[16px] italic text-silver"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            认识一个人，从他说的话开始
          </motion.p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <motion.div
        className="max-w-[720px] mx-auto px-5 md:px-12 pb-16"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* ── Page Guide ── */}
        <motion.div variants={staggerItem}>
          <PageGuide />
        </motion.div>

        {/* ── Avatar Section ── */}
        <motion.section
          variants={avatarVariants}
          className="flex flex-col items-center mb-14"
        >
          <motion.img
            src="/avatar.jpg"
            alt="头像"
            className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full object-cover border-[3px] border-light-pink shadow-md mb-4"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.25, ease: easeOut }}
          />
          <motion.p
            className="font-serif text-[24px] font-normal text-ink mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: easeOut }}
          >
            {' '}
          </motion.p>
          <motion.p
            className="text-[12px] font-sans text-silver tracking-[0.02em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: easeOut }}
          >
            独立开发者 / 设计师 / 学习者
          </motion.p>
        </motion.section>

        {/* ── Site Introduction ── */}
        <AnimatedSection delay={0}>
          <SectionLabel text="关于本站" />
          <h2 className="font-serif text-[22px] md:text-[28px] text-ink leading-[1.4] mb-4 md:mb-6">
            一座关于资料、路径、作品与成长的个人藏馆
          </h2>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {siteIntroMarkdown}
          </ReactMarkdown>
        </AnimatedSection>

        {/* ── Why This Site ── */}
        <AnimatedSection delay={0} className="mt-10 md:mt-16">
          <SectionLabel text="为什么建造这座藏馆" />
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {whyMarkdown}
          </ReactMarkdown>
        </AnimatedSection>

        {/* ── Content Map Section ── */}
        <ContentMapSection />

        {/* ── FAQ Section ── */}
        <FAQSection />

        {/* ── Contact Section ── */}
        <AnimatedSection delay={0} className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-border-color">
          <SectionLabel text="联系方式" />
          <h3 className="font-serif text-[22px] font-normal text-ink mb-6 leading-[1.5]">
            找到我
          </h3>
          <motion.div
            className="flex flex-wrap gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } },
            }}
          >
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  variants={staggerItem}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-[14px] font-sans text-graphite hover:text-favorite transition-colors duration-150"
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{link.handle}</span>
                </motion.a>
              );
            })}
          </motion.div>
        </AnimatedSection>

        {/* ── Closing Quote ── */}
        <AnimatedSection delay={0} className="mt-14 md:mt-20 pb-8 text-center">
          <motion.p
            className="font-serif text-[16px] italic text-silver"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            建造是一种思考方式
          </motion.p>
        </AnimatedSection>
      </motion.div>
    </div>
  );
}
