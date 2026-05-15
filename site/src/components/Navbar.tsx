import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Download, MessageCircle } from 'lucide-react';
import { navItems } from '@/data/mockSiteConfig';

const SearchOverlay = lazy(() => import('./SearchOverlay'));

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchOriginPath, setSearchOriginPath] = useState(location.pathname);

  const openSearch = useCallback(() => {
    setSearchOriginPath(location.pathname);
    setSearchOpen(true);
  }, [location.pathname]);

  const openXiaoan = useCallback(() => {
    window.dispatchEvent(new CustomEvent('an-open-xiaoan'));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cmd+K / Ctrl+K 打开搜索
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (searchOpen) {
          setSearchOpen(false);
        } else {
          openSearch();
        }
      }
    };
    const handleOpenSearch = () => openSearch();
    document.addEventListener('keydown', handleKey);
    window.addEventListener('an-open-search', handleOpenSearch);
    return () => {
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('an-open-search', handleOpenSearch);
    };
  }, [openSearch, searchOpen]);

  return (
    <>
      <motion.nav
        className="fixed left-0 right-0 top-0 z-50 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid #E5E5E3' : '1px solid transparent',
          transition: 'background-color 200ms ease, border-bottom 150ms ease',
          height: 'var(--app-nav-height)',
          paddingTop: 'var(--app-safe-top)',
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-5 md:px-12 flex items-center justify-between">
          {/* Site name */}
          <Link
            to="/"
            className="font-serif text-[18px] font-normal text-ink tracking-tight"
          >
            安的书房
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-3 py-1.5 text-[14px] font-sans font-normal text-silver hover:text-ink transition-colors duration-150 group"
              >
                {item.label}
                <span
                  className="absolute bottom-0 left-3 right-3 h-[1px] bg-ink origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-200 ease-out"
                />
              </Link>
            ))}
          </div>

          {/* Right side: search + mobile menu */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openXiaoan}
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#E8DDD4] bg-[#FBF8F4] px-3 py-1.5 text-[12px] text-graphite transition-colors hover:border-[#C9AF96] hover:text-ink"
            >
              <MessageCircle size={14} strokeWidth={1.5} />
              问小安
            </button>
            <Link
              to="/install"
              className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#D8C6B8] bg-white/80 px-3 py-1.5 text-[12px] text-graphite transition-colors hover:border-[#BFA58F] hover:text-ink"
            >
              <Download size={14} strokeWidth={1.5} />
              安装
            </Link>
            <button
              className="p-2 text-silver hover:text-ink transition-colors duration-150"
              onClick={openSearch}
              aria-label="搜索 (Cmd+K)"
              title="搜索 (Cmd+K)"
            >
              <Search size={18} strokeWidth={1.5} />
            </button>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 text-silver hover:text-ink transition-colors duration-150"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="打开菜单"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center lg:hidden"
            style={{
              paddingTop: 'var(--app-safe-top)',
              paddingBottom: 'var(--app-safe-bottom)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              className="absolute right-5 p-2 text-silver hover:text-ink transition-colors"
              style={{ top: 'calc(var(--app-safe-top) + 1rem)' }}
              onClick={() => setMobileMenuOpen(false)}
              aria-label="关闭菜单"
            >
              <X size={24} strokeWidth={1.5} />
            </button>

            <motion.div
              className="flex flex-col items-center gap-5 overflow-y-auto max-h-[80vh] px-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: easeOut }}
            >
              <Link
                to="/"
                className="font-serif text-[24px] text-ink mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                安的书房
              </Link>

              {/* Primary nav items (also in bottom tab bar) */}
              <div className="flex flex-col items-center gap-4">
                {navItems.slice(0, 4).map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ delay: index * 0.05, duration: 0.3, ease: easeOut }}
                  >
                    <Link
                      to={item.path}
                      className="text-[18px] font-sans font-normal text-ink transition-colors"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Divider */}
              <div className="w-12 h-[1px] bg-border-color my-1" />

              {/* Secondary nav items (not in bottom tab bar: 手记·年谱·自序) */}
              <div className="flex flex-col items-center gap-4">
                {navItems.slice(4).map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ delay: 0.25 + index * 0.05, duration: 0.3, ease: easeOut }}
                  >
                    <Link
                      to={item.path}
                      className="text-[16px] font-sans font-normal text-silver hover:text-ink transition-colors duration-150"
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Link
                to="/install"
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#D8C6B8] bg-white px-4 py-2 text-[14px] text-graphite"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Download size={15} strokeWidth={1.5} />
                安装与版本
              </Link>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[#E8DDD4] bg-[#FBF8F4] px-4 py-2 text-[14px] text-graphite"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openXiaoan();
                }}
              >
                <MessageCircle size={15} strokeWidth={1.5} />
                问小安
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global search overlay */}
      <Suspense fallback={null}>
        <SearchOverlay
          isOpen={searchOpen && searchOriginPath === location.pathname}
          onClose={() => setSearchOpen(false)}
        />
      </Suspense>
    </>
  );
}
