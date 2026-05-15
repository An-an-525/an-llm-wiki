import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useInView } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Github,
  Archive,
  Route,
  Wind,
  Hammer,
  BookOpen,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { resolveAssetUrl } from '@/lib/runtime';

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
/*  Content data                                                       */
/* ------------------------------------------------------------------ */
const siteIntroMarkdown = `我是安。这里是我的个人书房，也是一个慢慢成形的公开资料库。

它不是普通博客，不是资料导航，也不是只展示结果的作品集。它更像一张摊开的书桌：一边放着做过的项目，一边放着工具、笔记、复盘、失败记录和可以复刻的小路。

我真正想留下的，不是“我用过很多工具”这件事，而是这些工具怎样改变了我的学习方式：怎样从散乱收藏走向整理，怎样从临时提问走向有边界的协作，怎样把一次混乱的尝试改写成别人也能照着走的小版本。

所以你会在这里看到藏馆、谱系、工坊、手记和年谱。每个房间都能单独打开，不要求读者被一张复杂关系网牵着走。`;

const whyMarkdown = `信息过载的时代，收藏不等于掌握，阅读不等于理解。

我需要一个地方，不只存放资料，还要记录我如何一步步走过来：哪些路走通了，哪些坑本来可以避开，什么工具在什么场景下真正好用，哪些看似高级的东西其实只是增加了负担。

这座书房也是一个心理上的整理动作。材料越多，人越容易焦虑；只有当材料被写成清楚的路径，经验才会重新变成力量。

它也有社会性：公开页面要给朋友、读者、协作者和未来的自己看。读者不该被内部术语挡在门外，也不该看到未经整理的私密材料。公开不是把门打开就完了，而是把路修到别人能走。`;

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
  { icon: Github, label: 'GitHub', href: 'https://github.com/An-an-525/an-llm-wiki', handle: 'An-an-525/an-llm-wiki' },
];

const entryGuide = [
  {
    label: '结论',
    text: '这是一间公开书房：先看方法和作品，不追逐零散资料。',
  },
  {
    label: '原因',
    text: '资料只有被整理成路径、项目和复盘，才会真正降低理解成本。',
  },
  {
    label: '下一步',
    text: '第一次来，先读书房说明，再选一个工坊项目，最后走一条谱系路线。',
  },
  {
    label: '边界',
    text: '这里不展示访问材料、原始私密记录和未公开细节，只保留可复核的公开线索。',
  },
];

/* ------------------------------------------------------------------ */
/*  Content Map Section                                                */
/* ------------------------------------------------------------------ */

function ContentMapSection() {
  return (
    <AnimatedSection delay={0} className="mt-10 md:mt-16 -mx-5 md:-mx-12 px-5 md:px-12 py-8 md:py-10 rounded-xl">
      <div className="bg-light-pink rounded-xl -mx-5 md:-mx-8 px-5 md:px-8 py-10">
        <SectionLabel text="内容如何组织" />
        <h2 className="font-serif text-[22px] md:text-[28px] text-ink leading-[1.4] mb-3">
          六个可以单独打开的房间
        </h2>
        <p className="text-[13px] font-sans text-silver mb-6 md:mb-8 leading-relaxed">
          项目、资料、复盘、失败记录和复刻小路，各自站住。
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

function EntryGuideSection() {
  return (
    <AnimatedSection delay={0} className="mb-10 md:mb-14">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {entryGuide.map((item) => (
          <div key={item.label} className="rounded-xl border border-border-color bg-[#FAF9F7] px-4 py-3">
            <p className="mb-1 text-[12px] font-sans text-silver">{item.label}</p>
            <p className="text-[14px] font-sans text-graphite leading-[1.75]">{item.text}</p>
          </div>
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
            认识安，从这间书房开始
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
        {/* ── Avatar Section ── */}
        <motion.section
          variants={avatarVariants}
          className="flex flex-col items-center mb-14"
        >
          <div className="mb-4 flex items-center justify-center gap-5">
            <motion.img
              src={resolveAssetUrl('/avatar-an.jpg')}
              alt="安的头像"
              className="w-[104px] h-[104px] md:w-[124px] md:h-[124px] rounded-full object-cover border-[3px] border-light-pink shadow-md"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.25, ease: easeOut }}
            />
            <div className="flex flex-col items-center gap-2">
              <motion.img
                src={resolveAssetUrl('/avatar-xiaoan.jpg')}
                alt="小安的头像"
                className="w-[72px] h-[72px] md:w-[84px] md:h-[84px] rounded-full object-cover border-[3px] border-white shadow-md"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.25, ease: easeOut }}
              />
              <span className="text-[12px] font-serif text-silver">小安 · 数字生命体</span>
            </div>
          </div>
          <motion.p
            className="font-serif text-[24px] font-normal text-ink mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: easeOut }}
          >
            安
          </motion.p>
          <motion.p
            className="text-[12px] font-sans text-silver tracking-[0.02em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5, ease: easeOut }}
          >
            资料库建造者 / 工具实践者 / 仍在路上的学习者
          </motion.p>
        </motion.section>

        <EntryGuideSection />

        {/* ── Site Introduction ── */}
        <AnimatedSection delay={0}>
          <SectionLabel text="关于本站" />
          <h2 className="font-serif text-[22px] md:text-[28px] text-ink leading-[1.4] mb-4 md:mb-6">
            一座关于资料、路径、作品与成长的个人书房
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
          <SectionLabel text="为什么建造这间书房" />
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {whyMarkdown}
          </ReactMarkdown>
        </AnimatedSection>

        {/* ── Content Map Section ── */}
        <ContentMapSection />

        {/* ── Contact Section ── */}
        <AnimatedSection delay={0} className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-border-color">
          <SectionLabel text="公开入口" />
          <h3 className="font-serif text-[22px] font-normal text-ink mb-6 leading-[1.5]">
            查看这间书房的公开仓库
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
