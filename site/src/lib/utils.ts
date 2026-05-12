import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month] = dateStr.split("-");
  if (!year || !month) return dateStr;
  return `${year}年${month}月`;
}

export function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (diffDays < 1) return "今天";
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays} 天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} 周前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
  return `${Math.floor(diffDays / 365)} 年前`;
}

export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "草稿",
    public: "公开",
    featured: "精选",
    recommended: "推荐",
    verified: "已验证",
    pending: "待审核",
    archived: "已归档",
    outdated: "已过时",
  };
  return map[status] || status;
}

export function getDifficultyLabel(
  difficulty?: string
): string {
  const map: Record<string, string> = {
    low: "简单",
    medium: "中等",
    high: "困难",
    beginner: "入门",
    intermediate: "进阶",
    advanced: "高级",
  };
  return difficulty ? map[difficulty] || difficulty : "";
}

export function getSourceReliabilityLabel(reliability?: string): string {
  const map: Record<string, string> = {
    "verified-source": "精选来源",
    "source-backed": "有来源",
    "needs-review": "待补来源",
  };
  return reliability ? map[reliability] || reliability : "";
}

export function getPricingLabel(pricing?: string): string {
  const map: Record<string, string> = {
    free: "免费",
    paid: "付费",
    freemium: "免费增值",
    unknown: "未知",
  };
  return pricing ? map[pricing] || pricing : "";
}

export function getProjectStatusLabel(status?: string): string {
  const map: Record<string, string> = {
    idea: "构想中",
    building: "构建中",
    online: "已上线",
    maintaining: "维护中",
    paused: "已暂停",
    archived: "已归档",
  };
  return status ? map[status] || status : "";
}

export function getTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    source: "来源",
    tool: "工具",
    model: "模型",
    github: "开源项目",
    tutorial: "教程",
    website: "网站",
    article: "文章",
    video: "视频",
    api: "API",
    software: "软件",
    case: "案例",
  };
  return type ? map[type] || type : "";
}

export function getWorkTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    website: "网站",
    tool: "工具",
    video: "视频",
    "mini-app": "小程序",
    course: "课程",
    "open-source": "开源项目",
    prototype: "原型",
    experiment: "实验",
  };
  return type ? map[type] || type : "";
}

export function getJournalTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    daily: "日常",
    review: "复盘",
    devlog: "开发日志",
    learning: "学习笔记",
    thought: "思考",
    "stage-summary": "阶段总结",
    life: "生活",
  };
  return type ? map[type] || type : "";
}

export function getFeedCategoryLabel(category?: string): string {
  const map: Record<string, string> = {
    "ai-news": "AI 资讯",
    "model-release": "模型发布",
    "tool-update": "工具更新",
    "github-trending": "GitHub 趋势",
    industry: "行业动态",
    note: "本站动态",
  };
  return category ? map[category] || category : "";
}

export function getTimelineTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    project: "项目",
    learning: "学习",
    system: "系统",
    release: "发布",
    insight: "洞见",
    life: "生活",
    migration: "迁移",
  };
  return type ? map[type] || type : "";
}
