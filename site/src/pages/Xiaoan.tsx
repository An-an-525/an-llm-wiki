import { motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { resolveAssetUrl } from '@/lib/runtime';

const prompts = [
  '第一次来，先看哪三页？',
  '我想做一个可收费小作品，第一版怎么收窄？',
  '安公开做过哪些项目，哪一个适合复刻？',
];

export default function Xiaoan() {
  const openXiaoan = (question?: string) => {
    window.dispatchEvent(new CustomEvent('an-open-xiaoan'));
    if (question) {
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('an-open-xiaoan-question', { detail: { question } }));
      }, 80);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#FBFAF7] px-5 pb-16 pt-[calc(var(--app-nav-height)+32px)] md:px-12 md:pt-[calc(var(--app-nav-height)+56px)]">
      <section className="mx-auto grid max-w-[1080px] gap-8 md:grid-cols-[0.92fr_1.08fr] md:items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <p className="mb-4 text-[12px] tracking-[0.18em] text-silver">小安 · 数字生命体</p>
          <h1 className="font-serif text-[38px] leading-tight text-ink md:text-[56px]">
            让小安陪你读这间书房
          </h1>
          <p className="mt-5 max-w-[560px] text-[15px] leading-[1.9] text-graphite">
            小安不是客服，也不是万能答案机。它会根据安公开整理出的项目、路线、风信和年谱，先给判断，再讲依据，最后给你一个可以立刻执行的下一步。
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => openXiaoan()}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle size={17} strokeWidth={1.5} />
              开始问小安
            </button>
            <Link
              to="/works"
              className="inline-flex items-center gap-2 rounded-full border border-[#D8C6B8] bg-white px-5 py-3 text-[14px] text-graphite transition-colors hover:border-[#BFA58F] hover:text-ink"
            >
              先看工坊
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="rounded-2xl border border-[#E8DDD4] bg-white p-4 shadow-[0_18px_54px_rgba(67,52,43,0.10)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <div className="flex items-center gap-3 border-b border-[#F0E7DE] pb-4">
            <img
              src={resolveAssetUrl('/avatar-xiaoan.jpg')}
              alt="小安头像"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <h2 className="font-serif text-[20px] text-ink">小安</h2>
              <p className="text-[12px] text-silver">冷静、克制、只按公开书房回答</p>
            </div>
          </div>

          <div className="grid gap-2 py-4 md:pt-5">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => openXiaoan(prompt)}
                className="flex items-center gap-2 rounded-xl border border-[#E8DDD4] bg-white px-3 py-2 text-left text-[13px] text-graphite transition-colors hover:border-[#C8956C]"
              >
                <Sparkles size={14} strokeWidth={1.5} className="shrink-0 text-[#C8956C]" />
                {prompt}
              </button>
            ))}
          </div>

          <div className="space-y-3 border-t border-[#F0E7DE] pt-4">
            <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#E8DDD4] bg-[#FBFAF7] px-4 py-3 text-[13px] leading-[1.8] text-graphite">
              我会帮你少走弯路。先说清你想做什么，我会把问题收窄成一条能开始的小路。
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[13px] leading-[1.8] text-white">
              我第一次来，想复刻安的路线，第一步该看什么？
            </div>
            <div className="max-w-[88%] rounded-2xl rounded-bl-md border border-[#E8DDD4] bg-[#FBFAF7] px-4 py-3 text-[13px] leading-[1.8] text-graphite">
              先读首页认识安，再进工坊选一个最小项目，最后去谱系找步骤。不要先学一堆名词，先做出一个可打开的小结果。
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto mt-10 grid max-w-[1080px] gap-3 md:grid-cols-3">
        {[
          ['能问什么', '从哪里开始、项目怎么复刻、路线怎么收窄、第一次读该先看什么。'],
          ['不会答什么', '密钥、路径、原始聊天、私密材料和未公开上下文。'],
          ['怎样回答', '先判断，再依据，最后给一步行动；不确定的地方会直接说明。'],
        ].map(([title, text]) => (
          <div key={title} className="rounded-xl border border-[#E8DDD4] bg-white px-4 py-4">
            <div className="mb-2 flex items-center gap-2 text-[13px] font-medium text-ink">
              <ShieldCheck size={15} strokeWidth={1.5} className="text-[#9B6848]" />
              {title}
            </div>
            <p className="text-[13px] leading-[1.8] text-silver">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
