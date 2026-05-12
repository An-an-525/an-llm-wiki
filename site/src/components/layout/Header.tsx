import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { navModules } from "@/lib/modules";
import { cn } from "@/lib/utils";

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

export function Header() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: easeOut }}
        style={{
          backgroundColor: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid #E5E5E3" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-5 md:px-12">
          <Link to="/" className="font-serif text-[18px] font-normal tracking-normal text-ink">
            藏馆
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="主导航">
            {navModules.map((mod) => (
              <Link
                key={mod.id}
                to={mod.href}
                className={cn(
                  "group relative px-3 py-1.5 text-[14px] font-normal text-silver transition-colors duration-150 hover:text-ink",
                  isActive(mod.href) && "text-ink",
                )}
              >
                {mod.name}
                <span
                  className={cn(
                    "absolute bottom-0 left-3 right-3 h-px origin-left bg-ink transition-transform duration-200",
                    isActive(mod.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/library"
              className="p-2 text-silver transition-colors duration-150 hover:text-ink"
              aria-label="搜索资料"
            >
              <Search size={18} strokeWidth={1.5} />
            </Link>
            <button
              className="p-2 text-silver transition-colors duration-150 hover:text-ink lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="打开菜单"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white lg:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <button
              className="absolute right-5 top-4 p-2 text-silver transition-colors hover:text-ink"
              onClick={() => setMobileOpen(false)}
              aria-label="关闭菜单"
            >
              <X size={24} strokeWidth={1.5} />
            </button>

            <motion.div
              className="flex max-h-[80vh] flex-col items-center gap-5 overflow-y-auto px-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: easeOut }}
            >
              <Link to="/" className="mb-2 font-serif text-[24px] text-ink" onClick={() => setMobileOpen(false)}>
                藏馆
              </Link>

              <div className="flex flex-col items-center gap-4">
                {navModules.slice(0, 4).map((mod, index) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3, ease: easeOut }}
                  >
                    <Link to={mod.href} className="text-[18px] font-normal text-ink" onClick={() => setMobileOpen(false)}>
                      {mod.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="my-1 h-px w-12 bg-border-color" />

              <div className="flex flex-col items-center gap-4">
                {navModules.slice(4).map((mod, index) => (
                  <motion.div
                    key={mod.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.05, duration: 0.3, ease: easeOut }}
                  >
                    <Link
                      to={mod.href}
                      className="text-[16px] font-normal text-silver transition-colors hover:text-ink"
                      onClick={() => setMobileOpen(false)}
                    >
                      {mod.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
