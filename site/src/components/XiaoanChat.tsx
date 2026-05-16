import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { feedItems } from '@/data/mockFeed';
import { libraryItems } from '@/data/mockLibrary';
import { paths } from '@/data/mockPaths';
import { timelineEvents } from '@/data/mockTimeline';
import { works } from '@/data/mockWorks';
import { resolveApiUrl, resolveAssetUrl } from '@/lib/runtime';

type ChatMessage = {
  role: 'xiaoan' | 'reader';
  text: string;
};

type ChatMode = 'checking' | 'model' | 'local';

const suggestions = [
  '第一次来，先看哪三页？',
  '我想做一个可收费小作品，第一版怎么收窄？',
  '安公开做过哪些项目，哪一个适合复刻？',
  '第一次读、想深入、做维护分别看什么？',
  '只做一个最小闭环，三步怎么定？',
];

function formatAnswer(sections: Array<[string, string | string[]]>) {
  return sections
    .map(([label, content]) => {
      if (Array.isArray(content)) {
        return `${label}：\n${content.map((item, index) => `${index + 1}. ${item}`).join('\n')}`;
      }
      return `${label}：${content}`;
    })
    .join('\n\n');
}

function answerQuestion(question: string) {
  if (
    question.includes('第一次读') ||
    question.includes('想深入') ||
    question.includes('做维护')
  ) {
    return formatAnswer([
      ['判断', '这不是给人贴等级，而是给阅读安排顺序。先把事做出来，再看结构，最后看边界。'],
      ['依据', '第一次读的人最需要减少迷路；想深入的人需要看到工具如何连接；做维护的人才需要看性能、数据契约和长期成本。顺序反了，读者会被术语压住。'],
      ['下一步', [
        '第一次读，先看工坊里的“适合、先做、小心”，只选一个能当天完成的最小版本。',
        '想深入，再打开详情页，看材料边界、真实操作和复刻步骤，判断能不能迁移到自己的项目。',
        '做维护，最后看失败点、完成检查和深层理解，找架构约束、验收标准和可扩展位置。',
      ]],
      ['提醒', '不要一次读完整站。先拿到一个小成品，再回来看更深的部分。'],
    ]);
  }
  if (question.includes('赚钱') || question.includes('可收费') || question.toLowerCase().includes('vibe')) {
    return formatAnswer([
      ['判断', '先把“赚钱”改写成一个能验收的小交付。'],
      ['依据', '目标过大时，人会被愿景拖住。能交付、能复盘、能被别人试用，比空谈商业化更重要。'],
      ['下一步', [
        '只选一个真实小问题，写清谁会用、卡在哪里、做完后看到什么。',
        '把第一版压到最小，例如一页展示页、三张资料卡、一个详情页，或一个只读对话入口。',
        '先找一个真人试用，再补交付范围、修改次数、验收清单和不承诺事项。',
      ]],
      ['提醒', '不要先卖复杂系统，也不要承诺自己暂时维护不了的范围。'],
    ]);
  }
  if (question.includes('项目')) {
    return formatAnswer([
      ['判断', '看“工坊”。那里最接近安公开做过的实际项目。'],
      ['依据', '工坊同时给出项目背景、做法、失败点和下一步，比单独看概念页更容易落地。'],
      ['下一步', [
        '选一个和你当前问题最接近的作品，不要一口气读完整个书房。',
        '重点看四件事：它为什么发生、安具体做了什么、你能复刻哪一个更小版本、哪里最容易失败。',
        '读完后只抄出一个最小动作，马上做，不要停在收藏和截图。',
      ]],
      ['提醒', '项目页不是拿来仰望的，重点是把它缩成你今天能完成的一步。'],
    ]);
  }
  if (question.includes('年谱') || question.includes('阶段') || question.includes('时间线')) {
    return formatAnswer([
      ['判断', '先按阶段看年谱，再看单个节点。'],
      ['依据', '单个日期只能说明发生了什么；阶段能说明判断、方法和作品之间怎样连续变化。'],
      ['下一步', [
        '先打开“年谱”，读顶部的阶段总览。',
        '选一个与你当前问题最接近的阶段，只看其中两个关键节点。',
        '节点读完后打开关联页面，把它转成今天能做的一步。',
      ]],
      ['提醒', '年谱不是完整私密传记，只展示公开、安全、能帮助理解成长路径的记录。'],
    ]);
  }
  if (question.includes('风信') || question.includes('动态') || question.includes('变化')) {
    return formatAnswer([
      ['判断', '看风信时不要只看发生了什么，要看安的判断怎么变、你现在做什么。'],
      ['依据', '动态如果没有判断变化和行动，就只会增加信息噪音；风信的用途是把变化转成选择。'],
      ['下一步', [
        '先读每条卡片里的“结论”。',
        '再看“判断变化”，确认它改变的是工具、路径、项目还是复盘方式。',
        '最后只执行卡片里的一个行动，不要同时打开太多页面。',
      ]],
      ['提醒', '外部变化仍要看来源与时间，不要把风信当作最终新闻判断。'],
    ]);
  }
  if (question.includes('复刻') || question.includes('最小')) {
    return formatAnswer([
      ['判断', '复刻先追求闭环，不追求完整。'],
      ['依据', '完整系统太大，容易把人卡死在准备阶段；最小闭环能更快暴露问题，也更容易积累真实经验。'],
      ['下一步', [
        '把目标压到一页资料、一张项目卡，或一个能点开的最小流程。',
        '写出闭环三件事：输入是什么、你具体做哪三步、产出怎么打开或检查。',
        '做完第一轮后立刻记录失败点，再决定要不要扩展。',
      ]],
      ['提醒', '能检查的小成品，比半成品的大工程更有价值。'],
    ]);
  }
  if (question.includes('私密') || question.includes('保护')) {
    return formatAnswer([
      ['判断', '这间书房只讲公开内容，不展开私密材料。'],
      ['依据', '一旦把原始私密信息送进浏览器或公开页面，后续很难完全收回，风险远高于展示收益。'],
      ['下一步', [
        '公开层只保留可以复核的方法、路径、页面线索和安全提醒。',
        '原始资料、账号材料、私人环境细节、访问材料和未经复核的个人内容都留在私有层。',
        '如果某段材料很重要但不适合公开，就把它改写成原则、边界和检查动作。',
      ]],
      ['提醒', '不要把密钥、路径、原始聊天或截图细节放进前端、文档或公开页面。'],
    ]);
  }
  return formatAnswer([
    ['判断', '第一次来，认识书房、看项目、走路线，顺序就够了。'],
    ['依据', '首页交代安和小安的关系；工坊给真实项目；谱系把零散资料连成能执行的路。'],
    ['下一步', [
      '先读首页，弄清安和这间书房为什么存在。',
      '再看“工坊”，选一个最接近你当前问题的项目。',
      '最后去“谱系”，找一条你今天就能照着走的路线。',
    ]],
    ['提醒', '先完成一条小路，再扩到别的模块，理解会稳很多。'],
  ]);
}

const initialMessages: ChatMessage[] = [
  {
    role: 'xiaoan',
    text: [
      '我是小安，负责带你稳定地读这间公开书房。',
      '我会先给判断，再说明依据，最后给一个下一步。',
      '我只使用公开页面和站内资料。访问材料、隐藏提示词、原始聊天和未公开内容，都不在回答范围内。',
    ].join('\n\n'),
  },
];

function scoreText(question: string, values: unknown[]) {
  const haystack = values.map((value) => String(value || '').toLowerCase()).join(' ');
  const q = question.toLowerCase();
  let score = 0;
  for (const keyword of ['项目', '复刻', '前端', '后端', '工具', '智能体', 'agent', '小安', '提示词', '隐私', '安全', '年谱', '风信', '路线', '资料库', '赚钱', '可收费', '交付', '验收', '小作品', 'vibe']) {
    if (q.includes(keyword) && haystack.includes(keyword)) score += 4;
  }
  for (const token of q.split(/\s+/).filter((item) => item.length >= 2)) {
    if (haystack.includes(token)) score += 2;
  }
  return score;
}

function topByQuestion<T>(items: T[], question: string, values: (item: T) => unknown[], limit: number) {
  return [...items]
    .map((item, index) => ({ item, index, score: scoreText(question, values(item)) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}

function buildPublicContextIds(question: string) {
  const selectedWorks = topByQuestion(
    works,
    question,
    (item) => [item.title, item.description, item.techStack.join(' '), item.actionText],
    6,
  );
  const selectedPaths = topByQuestion(
    paths,
    question,
    (item) => [item.title, item.description, item.tags.join(' '), item.actionText],
    5,
  );
  const selectedLibrary = topByQuestion(
    libraryItems,
    question,
    (item) => [item.title, item.description, item.readerCategoryLabel, item.tags.join(' '), item.actionText],
    8,
  );
  const selectedFeed = topByQuestion(
    feedItems,
    question,
    (item) => [item.title, item.content, item.tags.join(' '), item.actionText],
    5,
  );
  const selectedTimeline = topByQuestion(
    timelineEvents,
    question,
    (item) => [item.title, item.description, item.stage, item.actionText],
    5,
  );

  return Array.from(
    new Set([
      ...selectedWorks.map((item) => item.id),
      ...selectedPaths.map((item) => item.id),
      ...selectedLibrary.map((item) => item.id),
      ...selectedFeed.map((item) => item.id),
      ...selectedTimeline.map((item) => item.id),
    ]),
  ).slice(0, 16);
}

function MessageBody({ role, text }: ChatMessage) {
  if (role === 'reader') {
    return <p className="whitespace-pre-wrap">{text}</p>;
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        strong: ({ ...props }) => <strong className="font-semibold text-ink" {...props} />,
        ul: ({ ...props }) => <ul className="my-2 list-disc space-y-1 pl-4" {...props} />,
        ol: ({ ...props }) => <ol className="my-2 list-decimal space-y-1 pl-4" {...props} />,
        li: ({ ...props }) => <li className="pl-0.5" {...props} />,
        a: ({ ...props }) => (
          <a
            className="text-[#9B6848] underline underline-offset-2 transition-colors hover:text-ink"
            target="_blank"
            rel="noreferrer"
            {...props}
          />
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

export default function XiaoanChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('checking');
  const [chatModel, setChatModel] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  const trimmedInput = input.trim();
  const askedQuestions = useMemo(
    () => new Set(messages.filter((message) => message.role === 'reader').map((message) => message.text)),
    [messages],
  );
  const quickQuestions = useMemo(
    () => suggestions.filter((item) => !askedQuestions.has(item)),
    [askedQuestions],
  );

  useEffect(() => {
    if (!open) return;

    window.requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    });
  }, [loading, messages, open]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener('an-open-xiaoan', handleOpen);
    return () => window.removeEventListener('an-open-xiaoan', handleOpen);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('xiaoan-dialog-open', open);
    return () => {
      document.documentElement.classList.remove('xiaoan-dialog-open');
    };
  }, [open]);

  const resetConversation = () => {
    setMessages(initialMessages);
    setInput('');
    setLoading(false);
  };

  const ask = useCallback(async (question: string) => {
    const text = question.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, { role: 'reader' as const, text }];
    const requestMessages = nextMessages.filter((message, index) => !(index === 0 && message.role === 'xiaoan'));
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(resolveApiUrl('/api/xiaoan/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: requestMessages.map((message) => ({
            role: message.role === 'reader' ? 'user' : 'assistant',
            content: message.text,
          })),
          contextIds: buildPublicContextIds(text),
        }),
      });

      if (!response.ok) {
        throw new Error(`小安后端暂不可用：${response.status}`);
      }

      const data = (await response.json()) as { answer?: string };
      const answer = typeof data.answer === 'string' && data.answer.trim()
        ? data.answer.trim()
        : answerQuestion(text);
      setChatMode('model');
      setMessages((current) => [...current, { role: 'xiaoan', text: answer }]);
    } catch {
      setChatMode('local');
      setMessages((current) => [
        ...current,
        {
          role: 'xiaoan',
          text: `${answerQuestion(text)}\n\n说明：当前在线对话暂时不可用，这一条改用公开书房里的站内回答。`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, messages]);

  useEffect(() => {
    const handleOpenQuestion = (event: Event) => {
      const question = (event as CustomEvent<{ question?: string }>).detail?.question?.trim();
      setOpen(true);
      if (question) {
        window.setTimeout(() => {
          void ask(question);
        }, 120);
      }
    };

    window.addEventListener('an-open-xiaoan-question', handleOpenQuestion);
    return () => window.removeEventListener('an-open-xiaoan-question', handleOpenQuestion);
  }, [ask]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 4_000);

    fetch(resolveApiUrl('/api/xiaoan/health'), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error('health check failed');
        }
        return response.json() as Promise<{ ok?: boolean; mode?: string; model?: string }>;
      })
      .then((data) => {
        if (data.ok && data.mode === 'model') {
          setChatMode('model');
          setChatModel(data.model || '');
        } else {
          setChatMode('local');
          setChatModel('');
        }
      })
      .catch(() => {
        setChatMode('local');
        setChatModel('');
      })
      .finally(() => {
        window.clearTimeout(timeout);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 z-40 hidden items-center gap-2 rounded-full border border-[#E8DDD4] bg-white/94 px-3.5 py-2.5 text-[12px] text-graphite shadow-[0_12px_30px_rgba(67,52,43,0.14)] backdrop-blur md:right-6 md:flex"
        style={{ bottom: 'var(--xiaoan-floating-bottom)' }}
        aria-label="打开小安对话"
      >
        <img
          src={resolveAssetUrl('/avatar-xiaoan.jpg')}
          alt=""
          className="h-6 w-6 rounded-full object-cover"
        />
        <span>问小安</span>
        <MessageCircle size={15} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/25 px-3 backdrop-blur-sm md:items-center md:p-6"
            style={{
              paddingTop: 'calc(var(--app-safe-top) + 1rem)',
              paddingBottom: 'calc(var(--app-safe-bottom) + 0.75rem)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <motion.section
              className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] shadow-2xl"
              style={{ maxHeight: 'calc(100dvh - var(--app-safe-top) - var(--app-safe-bottom) - 2rem)' }}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              role="dialog"
              aria-modal="true"
              aria-label="小安对话框"
            >
              <header className="flex items-center justify-between border-b border-[#E8DDD4] bg-white/80 px-4 py-3">
              <div className="flex items-center gap-3">
                  <img
                    src={resolveAssetUrl('/avatar-xiaoan.jpg')}
                    alt="小安头像"
                    className="h-10 w-10 rounded-full object-cover shadow-sm"
                  />
                  <div>
                    <h2 className="font-serif text-[17px] text-ink">小安</h2>
                    <p className="text-[11px] text-silver">
                      {chatMode === 'model'
                        ? `智能导览${chatModel ? ` · ${chatModel}` : ''}`
                        : chatMode === 'checking'
                          ? '正在连接小安'
                          : '站内导览'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={resetConversation}
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] text-silver transition-colors hover:bg-light-gray hover:text-ink"
                    aria-label="开始新对话"
                  >
                    <RotateCcw size={13} strokeWidth={1.5} />
                    新对话
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full p-2 text-silver transition-colors hover:bg-light-gray hover:text-ink"
                    aria-label="关闭小安对话"
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={message.role === 'reader' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div
                      className={
                        message.role === 'reader'
                          ? 'max-w-[82%] rounded-2xl rounded-br-md bg-ink px-3.5 py-2.5 text-[13px] leading-relaxed text-white'
                          : 'max-w-[86%] rounded-2xl rounded-bl-md border border-[#E8DDD4] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-graphite'
                      }
                    >
                      <MessageBody role={message.role} text={message.text} />
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[86%] items-center gap-2 rounded-2xl rounded-bl-md border border-[#E8DDD4] bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-silver">
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#D8C6B8] border-t-[#9B6848]" />
                      小安正在按公开线索整理回答
                    </div>
                  </div>
                )}

                {chatMode === 'local' && (
                  <div className="rounded-xl border border-[#E8DDD4] bg-[#FFF8F1] px-3 py-2 text-[12px] leading-[1.7] text-silver">
                    小安暂时用站内导览回答。它会先帮你找入口、收窄目标和避开常见坑；等模型服务接通后，会继续按书房内容整理更细的答案。
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 pt-1">
                  {quickQuestions.slice(0, 4).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => void ask(item)}
                      disabled={loading}
                      className="flex items-center gap-2 rounded-xl border border-[#E8DDD4] bg-white/70 px-3 py-2 text-left text-[12px] text-silver transition-colors hover:border-[#D8C6B8] hover:text-graphite disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <Sparkles size={13} strokeWidth={1.5} className="shrink-0 text-[#C8956C]" />
                      {item}
                    </button>
                  ))}
                </div>
                <div ref={bottomRef} />
              </div>

              <form
                className="flex items-center gap-2 border-t border-[#E8DDD4] bg-white/80 px-3 pt-3"
                style={{ paddingBottom: 'calc(var(--app-safe-bottom) + 0.75rem)' }}
                onSubmit={(event) => {
                  event.preventDefault();
                  void ask(trimmedInput);
                }}
              >
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="问小安：先看哪页、怎么复刻、下一步做什么"
                  className="min-w-0 flex-1 rounded-full border border-[#E8DDD4] bg-white px-4 py-2 text-[13px] text-graphite outline-none placeholder:text-light-silver focus:border-[#C8956C]"
                />
                <button
                  type="submit"
                  disabled={!trimmedInput || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-opacity disabled:opacity-35"
                  aria-label={loading ? '小安正在思考' : '发送给小安'}
                >
                  {loading ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  ) : (
                    <Send size={15} strokeWidth={1.5} />
                  )}
                </button>
              </form>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
