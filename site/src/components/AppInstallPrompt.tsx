import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISS_KEY = 'an-study-room-install-dismissed';
const DISMISS_UNTIL_KEY = 'an-study-room-install-dismissed-until';
const INSTALLED_KEY = 'an-study-room-install-accepted';
const LEGACY_DISMISS_KEY = 'an-llm-wiki-install-dismissed';
const LEGACY_INSTALLED_KEY = 'an-llm-wiki-install-accepted';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const INSTALL_PROMPT_SEEN_KEY = 'an-study-room-install-prompt-seen';
const MAX_PROMPT_SHOWS = 2;

function matchesDisplayMode(mode: string) {
  return window.matchMedia(`(display-mode: ${mode})`).matches;
}

function isStandaloneDisplay() {
  return (
    matchesDisplayMode('window-controls-overlay') ||
    matchesDisplayMode('standalone') ||
    matchesDisplayMode('fullscreen') ||
    matchesDisplayMode('minimal-ui') ||
    ('standalone' in window.navigator && window.navigator.standalone === true)
  );
}

function wasAccepted() {
  try {
    return (
      window.localStorage.getItem(INSTALLED_KEY) === 'true' ||
      window.localStorage.getItem(LEGACY_INSTALLED_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

function wasDismissed() {
  try {
    const dismissedUntil = Number(window.localStorage.getItem(DISMISS_UNTIL_KEY) || '0');
    if (Number.isFinite(dismissedUntil) && dismissedUntil > Date.now()) {
      return true;
    }

    return (
      window.localStorage.getItem(DISMISS_KEY) === 'true' ||
      window.localStorage.getItem(LEGACY_DISMISS_KEY) === 'true'
    );
  } catch {
    return false;
  }
}

function promptSeenCount() {
  try {
    const raw = Number(window.localStorage.getItem(INSTALL_PROMPT_SEEN_KEY) || '0');
    return Number.isFinite(raw) ? raw : 0;
  } catch {
    return 0;
  }
}

function shouldSuppressInstallPrompt() {
  return wasAccepted() || wasDismissed() || isStandaloneDisplay() || promptSeenCount() >= MAX_PROMPT_SHOWS;
}

export default function AppInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(wasDismissed);
  const [installed, setInstalled] = useState(() => isStandaloneDisplay() || wasAccepted());

  useEffect(() => {
    if (isStandaloneDisplay()) {
      try {
        window.localStorage.setItem(INSTALLED_KEY, 'true');
        window.localStorage.removeItem(DISMISS_KEY);
        window.localStorage.removeItem(DISMISS_UNTIL_KEY);
        window.localStorage.removeItem(LEGACY_INSTALLED_KEY);
        window.localStorage.removeItem(LEGACY_DISMISS_KEY);
      } catch {
        // Ignore storage failures on browsers with restricted storage.
      }
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (shouldSuppressInstallPrompt()) {
        return;
      }
      setDismissed(false);
      setPromptEvent(event as BeforeInstallPromptEvent);
      try {
        window.localStorage.setItem(INSTALL_PROMPT_SEEN_KEY, String(promptSeenCount() + 1));
      } catch {
        // Ignore storage failures; the browser can still manage the native prompt.
      }
    };
    const handleInstalled = () => {
      setInstalled(true);
      setDismissed(false);
      setPromptEvent(null);
      try {
        window.localStorage.setItem(INSTALLED_KEY, 'true');
        window.localStorage.removeItem(DISMISS_KEY);
        window.localStorage.removeItem(DISMISS_UNTIL_KEY);
        window.localStorage.removeItem(LEGACY_INSTALLED_KEY);
        window.localStorage.removeItem(LEGACY_DISMISS_KEY);
        window.localStorage.removeItem(INSTALL_PROMPT_SEEN_KEY);
      } catch {
        // Ignore storage failures; the installed app still works.
      }
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
    setPromptEvent(null);
    try {
      window.localStorage.setItem(DISMISS_KEY, 'true');
      window.localStorage.removeItem(DISMISS_UNTIL_KEY);
      window.localStorage.removeItem(LEGACY_DISMISS_KEY);
    } catch {
      // Ignore storage failures; the prompt can simply appear again next session.
    }
  };

  const dismissTemporarily = () => {
    setDismissed(true);
    setPromptEvent(null);
    try {
      window.localStorage.setItem(DISMISS_UNTIL_KEY, String(Date.now() + DISMISS_COOLDOWN_MS));
      window.localStorage.removeItem(DISMISS_KEY);
      window.localStorage.removeItem(LEGACY_DISMISS_KEY);
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
      try {
        window.localStorage.setItem(INSTALLED_KEY, 'true');
        window.localStorage.removeItem(DISMISS_KEY);
        window.localStorage.removeItem(DISMISS_UNTIL_KEY);
        window.localStorage.removeItem(LEGACY_INSTALLED_KEY);
        window.localStorage.removeItem(LEGACY_DISMISS_KEY);
        window.localStorage.removeItem(INSTALL_PROMPT_SEEN_KEY);
      } catch {
        // Ignore storage failures; the prompt will simply rely on runtime state.
      }
    } else {
      dismissTemporarily();
    }
    setPromptEvent(null);
  };

  if (installed || dismissed || !promptEvent) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed left-4 right-4 bottom-[var(--xiaoan-floating-bottom)] z-[55] mx-auto max-w-[420px] rounded-xl border border-[#E5E5E3] bg-white/95 px-3 py-3 shadow-[0_12px_32px_rgba(30,30,30,0.12)] backdrop-blur-md md:bottom-6 md:left-auto md:right-6"
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
            <p className="text-[13px] font-medium leading-snug text-[#1E1E1E]">安装安的书房</p>
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
