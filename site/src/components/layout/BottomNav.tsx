import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Library, Route, Rss, Wrench } from "lucide-react";

const tabs = [
  { label: "藏馆", icon: Library, to: "/library" },
  { label: "谱系", icon: Route, to: "/paths" },
  { label: "首页", icon: Home, to: "/" },
  { label: "风信", icon: Rss, to: "/feed" },
  { label: "工坊", icon: Wrench, to: "/works" },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-color bg-white/90 backdrop-blur-[12px] md:hidden"
      style={{
        height: "calc(56px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="底部导航"
    >
      <div className="flex h-[56px] items-center justify-around">
        {tabs.map((tab) => {
          const isActive = tab.to === "/" ? location.pathname === "/" : location.pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className="flex h-full w-16 select-none flex-col items-center justify-center gap-0.5"
              aria-label={tab.label}
            >
              <div className="relative flex h-7 w-7 items-center justify-center">
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className={isActive ? "text-ink" : "text-silver"}
                  style={{ transition: "color 150ms ease" }}
                />
                {isActive && (
                  <motion.div
                    className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-ink"
                    layoutId="mobileNavIndicator"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </div>
              <span
                className="text-[10px] leading-none"
                style={{
                  color: isActive ? "#1E1E1E" : "#8A8A88",
                  transition: "color 150ms ease",
                  fontWeight: isActive ? 500 : 400,
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
