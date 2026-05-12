import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'an-llm-wiki-install-dismissed';

function isStandaloneDisplay() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator && window.navigator.standalone === true)
  );
}

function wasDismissed() {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function AppInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(wasDismissed);
  const [installed, setInstalled] = useState(isStandaloneDisplay);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const hide = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // Ignore storage failures; the prompt can simply appear again next session.
    }
  };

  const install = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setPromptEvent(null);
  };

  if (installed || dismissed || !promptEvent) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed left-4 right-4 bottom-[72px] z-[55] mx-auto max-w-[420px] rounded-xl border border-[#E5E5E3] bg-white/95 px-3 py-3 shadow-[0_12px_32px_rgba(30,30,30,0.12)] backdrop-blur-md md:bottom-6 md:left-auto md:right-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F5EDE8] text-[#1E1E1E]">
            <Download size={17} strokeWidth={1.6} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium leading-snug text-[#1E1E1E]">安装藏馆</p>
            <p className="mt-0.5 text-[11px] leading-snug text-[#8A8A88]">像 App 一样从桌面打开</p>
          </div>
          <button
            type="button"
            onClick={install}
            className="rounded-lg bg-[#1E1E1E] px-3 py-2 text-[12px] font-medium leading-none text-white transition-opacity hover:opacity-85"
          >
            安装
          </button>
          <button
            type="button"
            onClick={hide}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#8A8A88] transition-colors hover:bg-[#F2F2F0] hover:text-[#1E1E1E]"
            aria-label="关闭安装提示"
          >
            <X size={15} strokeWidth={1.6} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
