import { useLocation } from 'react-router';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Home, Library, Route, Hammer, MessageCircle } from 'lucide-react';

type MobileTab =
  | { label: string; icon: LucideIcon; path: string }
  | { label: string; icon: LucideIcon; action: 'xiaoan' };

const tabs: MobileTab[] = [
  { label: '首页', icon: Home, path: '/' },
  { label: '谱系', icon: Route, path: '/paths' },
  { label: '工坊', icon: Hammer, path: '/works' },
  { label: '藏馆', icon: Library, path: '/library' },
  { label: '小安', icon: MessageCircle, action: 'xiaoan' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-[12px] border-t border-[#E5E5E3] md:hidden"
      style={{
        height: 'var(--mobile-nav-height)',
        paddingBottom: 'var(--app-safe-bottom)',
        boxSizing: 'border-box',
      }}
      aria-label="底部导航"
    >
      <div className="flex items-center justify-around h-[56px]">
        {tabs.map((tab) => {
          const path = 'path' in tab ? tab.path : '';
          const isActive =
            !path
              ? false
              : path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(path);
          const Icon = tab.icon;
          const handleTap = () => {
            if ('action' in tab && tab.action === 'xiaoan') {
              window.dispatchEvent(new CustomEvent('an-open-xiaoan'));
            }
          };
          const content = (
            <>
              <div className="relative flex items-center justify-center w-7 h-7">
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className={
                    isActive ? 'text-[#1E1E1E]' : 'text-[#8A8A88]'
                  }
                  style={{
                    transition: 'color 150ms ease',
                  }}
                />
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#1E1E1E]"
                    layoutId="mobileNavIndicator"
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
              </div>
              <span
                className="text-[10px] font-sans leading-none"
                style={{
                  color: isActive ? '#1E1E1E' : '#8A8A88',
                  transition: 'color 150ms ease',
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {tab.label}
              </span>
            </>
          );

          if ('action' in tab) {
            return (
              <button
                key={tab.label}
                type="button"
                onClick={handleTap}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 select-none"
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
                aria-label="问小安"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={path}
              to={path}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-0.5 select-none"
              style={{
                WebkitTapHighlightColor: 'transparent',
              }}
              aria-label={tab.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
