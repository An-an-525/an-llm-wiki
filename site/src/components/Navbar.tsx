import { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X } from 'lucide-react';
import { navItems } from '@/data/mockSiteConfig';

const SearchOverlay = lazy(() => import('./SearchOverlay'));

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 h-16 md:h-16 flex items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          borderBottom: scrolled ? '1px solid #E5E5E3' : '1px solid transparent',
          transition: 'background-color 200ms ease, border-bottom 150ms ease',
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-5 md:px-12 flex items-center justify-between">
          {/* Site name */}
          <Link
            to="/"
            className="font-serif text-[18px] font-normal text-ink tracking-tight"
          >
            藏馆
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
              className="p-2 text-silver hover:text-ink transition-colors duration-150"
              onClick={() => setSearchOpen(true)}
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
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              className="absolute top-4 right-5 p-2 text-silver hover:text-ink transition-colors"
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
                藏馆
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global search overlay */}
      <Suspense fallback={null}>
        <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </Suspense>
    </>
  );
}
