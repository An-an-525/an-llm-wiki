import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import AppUpdateBanner from './AppUpdateBanner';
import AppInstallPrompt from './AppInstallPrompt';
import XiaoanChat from './XiaoanChat';
import { NetworkStatus } from './ui/lifecycle';
import { refreshSiteData } from '@/data/siteData.generated';
import { isExternalHttpUrl, openExternalUrl, runtimeConfig } from '@/lib/runtime';

const routeTitles: Array<[RegExp, string]> = [
  [/^\/$/, '首页'],
  [/^\/library/, '藏馆'],
  [/^\/paths\/[^/]+/, '路径详情'],
  [/^\/paths/, '谱系'],
  [/^\/feed/, '风信'],
  [/^\/works/, '工坊'],
  [/^\/journal/, '手记'],
  [/^\/timeline/, '年谱'],
  [/^\/about/, '书房'],
  [/^\/xiaoan/, '小安'],
  [/^\/install/, '安装与版本'],
  [/^\/content\/[^/]+/, '内容详情'],
];

function getDocumentTitle(pathname: string) {
  const match = routeTitles.find(([pattern]) => pattern.test(pathname));
  const pageTitle = match?.[1] ?? '藏馆';
  return `${pageTitle} · 安的书房`;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [dataRevision, setDataRevision] = useState(0);
  const lastDataSignature = useRef<string | null>(null);
  const location = useLocation();
  const { platform } = runtimeConfig();

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    document.title = getDocumentTitle(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (platform === 'web') {
      return;
    }

    const handleExternalNavigation = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const rawHref = anchor.getAttribute('href')?.trim();
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('/')) {
        return;
      }

      if (!isExternalHttpUrl(rawHref)) {
        return;
      }

      event.preventDefault();
      void openExternalUrl(rawHref);
    };

    document.addEventListener('click', handleExternalNavigation, true);
    return () => {
      document.removeEventListener('click', handleExternalNavigation, true);
    };
  }, [platform]);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const syncData = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const data = await refreshSiteData();
        const nextSignature = data.generatedAt || data.sourceGeneratedAt || null;
        if (!cancelled) {
          if (nextSignature && nextSignature !== lastDataSignature.current) {
            lastDataSignature.current = nextSignature;
            setDataRevision((value) => value + 1);
          }
        }
      } catch (error) {
        console.info('Using bundled site data fallback.', error);
      } finally {
        inFlight = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void syncData();
      }
    };

    void syncData();
    const interval = window.setInterval(syncData, 60_000);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <NetworkStatus />
      <AppUpdateBanner />
      <AppInstallPrompt />
      <Navbar />
      <main className="flex-1 pb-[calc(var(--mobile-nav-height)+1rem)] md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${location.pathname}:${dataRevision}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />
      <XiaoanChat />

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            className="fixed bottom-6 right-6 z-40 hidden h-10 w-10 items-center justify-center rounded-full border border-border-color bg-white text-silver shadow-md transition-colors duration-150 hover:bg-light-gray hover:text-ink md:flex"
            onClick={scrollToTop}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            aria-label="返回顶部"
          >
            <ArrowUp size={18} strokeWidth={1.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
