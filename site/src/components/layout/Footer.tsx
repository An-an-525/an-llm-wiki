import { Link } from "react-router-dom";
import { navModules } from "@/lib/modules";

export function Footer() {
  return (
    <footer className="w-full border-t border-border-color bg-cream">
      <div className="mx-auto max-w-[1200px] px-5 py-12 md:px-12">
        <div className="mb-8">
          <Link to="/" className="font-serif text-[18px] font-normal text-ink">
            藏馆
          </Link>
          <p className="mt-2 text-[13px] leading-relaxed text-silver">
            一座关于资料、路径、作品与成长的个人藏馆。
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2">
          {navModules.map((mod) => (
            <Link
              key={mod.id}
              to={mod.href}
              className="text-[13px] text-silver transition-colors duration-150 hover:text-ink"
            >
              {mod.name}
            </Link>
          ))}
          <a
            href="https://github.com/An-an-525/an-llm-wiki"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-silver transition-colors duration-150 hover:text-ink"
          >
            GitHub
          </a>
        </div>

        <div className="border-t border-border-color pt-6">
          <p className="text-[12px] text-light-silver">
            &copy; 2026 藏馆 · Public wiki only · No private raw data
          </p>
        </div>
      </div>
    </footer>
  );
}
