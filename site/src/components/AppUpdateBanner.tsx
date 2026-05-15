import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { APP_UPDATE_EVENT, requestServiceWorkerRefresh } from '@/registerServiceWorker';

type AppUpdateEventDetail = {
  hasWaitingWorker: boolean;
};

export default function AppUpdateBanner() {
  const [visible, setVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const detail = (event as CustomEvent<AppUpdateEventDetail>).detail;
      if (detail?.hasWaitingWorker) {
        setVisible(true);
      }
    };

    window.addEventListener(APP_UPDATE_EVENT, handleUpdate as EventListener);
    return () => {
      window.removeEventListener(APP_UPDATE_EVENT, handleUpdate as EventListener);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    requestServiceWorkerRefresh();
  };

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-[var(--xiaoan-floating-bottom)] left-4 right-4 z-[68] mx-auto max-w-[360px] rounded-2xl border border-[#E8DDD4] bg-white/96 px-4 py-3 shadow-[0_14px_34px_rgba(67,52,43,0.12)] backdrop-blur-md md:bottom-6 md:left-auto md:right-6"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#F5EDE8] text-[#9B6848]">
              <RefreshCw size={15} strokeWidth={1.6} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[#1E1E1E]">书房已有新版本</p>
              <p className="mt-1 text-[12px] leading-[1.75] text-[#6F6F6C]">
                刷新后才会看到最新内容和修复。
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1E1E1E] px-3.5 py-2 text-[12px] text-white transition-opacity hover:opacity-90"
                >
                  <RefreshCw size={14} strokeWidth={1.6} className={refreshing ? 'animate-spin' : ''} />
                  {refreshing ? '刷新中…' : '立即刷新'}
                </button>
                <button
                  type="button"
                  onClick={() => setVisible(false)}
                  className="inline-flex items-center rounded-full border border-[#D8C6B8] px-3.5 py-2 text-[12px] text-[#6F6F6C]"
                >
                  稍后再说
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setVisible(false)}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#8A8A88] transition-colors hover:bg-[#F2F2F0] hover:text-[#1E1E1E]"
              aria-label="关闭更新提示"
            >
              <X size={15} strokeWidth={1.6} />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
