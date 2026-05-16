import { Link } from 'react-router';
import { navItems } from '@/data/mockSiteConfig';

export default function Footer() {
  return (
    <footer className="w-full bg-cream border-t border-border-color">
      <div className="max-w-[1200px] mx-auto px-5 md:px-12 py-12">
        {/* Top row: site name + description */}
        <div className="mb-8">
          <h3 className="font-serif text-[18px] font-normal text-ink mb-2">
            安的书房
          </h3>
          <p className="text-[13px] font-sans font-normal text-silver leading-relaxed">
            把 AI 学习、项目、工具、复盘和复刻路线整理成中文可读的公开展柜。
          </p>
        </div>

        {/* Middle row: nav links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-[13px] font-sans text-silver hover:text-ink transition-colors duration-150"
            >
              {item.label}
            </Link>
          ))}
        </div>


      </div>
    </footer>
  );
}
