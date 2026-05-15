import type { SiteConfig, NavItem } from '@/types';

/**
 * 核心导航：藏馆 · 风信 · 手记 · 书房
 *
 * 藏馆 — 资源收藏（资料、工具、教程）
 * 风信 — 信息、趋势与安的认知觉醒
 * 手记 — 日记和认知感悟
 * 书房 — 个人信息展示（年谱/时间线、关于安、个人标签）
 */

export const navItems: NavItem[] = [
  { label: '藏馆', path: '/library' },
  { label: '谱系', path: '/paths' },
  { label: '工坊', path: '/works' },
  { label: '风信', path: '/feed' },
  { label: '手记', path: '/journal' },
  { label: '年谱', path: '/timeline' },
  { label: '书房', path: '/about' },
];

export const siteConfig: SiteConfig = {
  title: '安的书房',
  subtitle: '一座关于资料、路径、作品与成长的个人书房',
  description: '安的书房是一个个人公开资料与路径系统，用于收藏资料、整理资源、梳理复刻路径、展示作品、记录成长，并沉淀信息趋势带来的认知变化。',
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
