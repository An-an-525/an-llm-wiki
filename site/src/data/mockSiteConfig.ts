import type { SiteConfig, NavItem } from '@/types';

/**
 * 核心导航按读者任务排序：新手路径 · 项目 · 资料 · 手记 · 近况 · 认识安
 *
 * 谱系 — 给新手照着走的学习路径
 * 工坊 — 项目、作品和复刻记录
 * 藏馆 — 资料、工具和教程
 * 手记 — 笔记、复盘和感受
 * 风信 — 近况、信息与判断
 * 年谱/书房 — 认识安和这间书房
 */

export const navItems: NavItem[] = [
  { label: '谱系', path: '/paths' },
  { label: '工坊', path: '/works' },
  { label: '藏馆', path: '/library' },
  { label: '手记', path: '/journal' },
  { label: '风信', path: '/feed' },
  { label: '年谱', path: '/timeline' },
  { label: '书房', path: '/about' },
];

export const siteConfig: SiteConfig = {
  title: '安的书房',
  subtitle: '把 AI 学习路整理给后来的人看',
  description: '安的书房是一间公开的个人书房，收着安的项目、资料、学习路径、手记和时间线。它面向第一次来的读者，尽量少用术语，把从哪里开始、下一步读什么说清楚。',
  navItems,
  modules: {
    library: { enabled: true, label: '藏馆' },
    paths: { enabled: true, label: '谱系' },
    feed: { enabled: true, label: '风信' },
    works: { enabled: true, label: '工坊' },
    journal: { enabled: true, label: '手记' },
    timeline: { enabled: true, label: '年谱' },
    about: { enabled: true, label: '书房' },
  },
};

export default siteConfig;
