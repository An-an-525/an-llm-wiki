/**
 * 生命周期组件库
 * 覆盖页面从加载到展示的完整生命周期状态
 * 用法：import { PageSkeleton, EmptyState, ErrorState, NetworkStatus, ImagePlaceholder } from '@/components/ui/lifecycle'
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox,
  AlertCircle,
  RefreshCw,
  WifiOff,
  ImageOff,
  Search,
  FileText,
  Grid3X3,
  Newspaper,
  type LucideIcon,
} from 'lucide-react';
import { Skeleton } from './skeleton';
import { Button } from './button';

// ─── 类型定义 ──────────────────────────────────────

interface PageSkeletonProps {
  type: 'grid' | 'list' | 'detail' | 'cards' | 'feed';
  count?: number;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

interface ImagePlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain';
}

// ─── PageSkeleton — 页面骨架屏 ────────────────────

export function PageSkeleton({ type, count = 6 }: PageSkeletonProps) {
  const layouts = {
    grid: <GridSkeleton count={count} />,
    list: <ListSkeleton count={count} />,
    detail: <DetailSkeleton />,
    cards: <CardsSkeleton count={count} />,
    feed: <FeedSkeleton count={count} />,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {/* Header skeleton */}
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      {layouts[type]}
    </motion.div>
  );
}

function GridSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 p-4 border rounded-xl">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-4 p-4 border rounded-xl">
          <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
    </div>
  );
}

function CardsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-xl overflow-hidden">
          <Skeleton className="h-40 w-full" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FeedSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-xl">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── EmptyState — 空状态（带 CTA）─────────────────

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-[#F2F2F0] flex items-center justify-center mb-5">
        <Icon size={28} strokeWidth={1.2} className="text-[#B8B8B6]" />
      </div>
      <h3 className="font-serif text-lg text-[#1E1E1E] mb-2">{title}</h3>
      <p className="text-sm text-[#8A8A88] max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action.href ? (
            <a
              href={action.href}
              className="inline-flex items-center px-5 py-2.5 border border-[#E5E5E3] rounded-lg text-sm text-[#1E1E1E] hover:bg-[#FAF9F7] transition-colors"
            >
              {action.label}
            </a>
          ) : (
            <Button
              variant="outline"
              onClick={action.onClick}
              className="text-sm"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="text-sm text-[#8A8A88] hover:text-[#1E1E1E] transition-colors"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── ErrorState — 错误状态（带重试）────────────────

export function ErrorState({
  title = '出错了',
  description = '加载失败，请检查网络后重试',
  onRetry,
}: ErrorStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = useCallback(() => {
    if (!onRetry) return;
    setIsRetrying(true);
    onRetry();
    setTimeout(() => setIsRetrying(false), 1000);
  }, [onRetry]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
        <AlertCircle size={28} strokeWidth={1.2} className="text-red-400" />
      </div>
      <h3 className="font-serif text-lg text-[#1E1E1E] mb-2">{title}</h3>
      <p className="text-sm text-[#8A8A88] max-w-xs mb-6 leading-relaxed">
        {description}
      </p>
      {onRetry ? (
        <Button
          variant="outline"
          onClick={handleRetry}
          disabled={isRetrying}
          className="text-sm gap-2"
        >
          <RefreshCw
            size={14}
            className={isRetrying ? 'animate-spin' : ''}
          />
          {isRetrying ? '重试中...' : '重新加载'}
        </Button>
      ) : (
        <a
          href="/"
          className="text-sm text-[#8A8A88] hover:text-[#1E1E1E] transition-colors"
        >
          返回首页
        </a>
      )}
    </motion.div>
  );
}

// ─── NetworkStatus — 断网提示条 ───────────────────

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setDismissed(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="fixed top-0 left-0 right-0 z-[70] bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-center gap-2 text-sm text-amber-800"
    >
      <WifiOff size={14} strokeWidth={1.5} />
      <span>网络已断开，部分功能可能不可用</span>
      <button
        onClick={() => setDismissed(true)}
        className="ml-2 text-amber-600 hover:text-amber-900 text-xs underline underline-offset-2"
      >
        知道了
      </button>
    </motion.div>
  );
}

// ─── ImagePlaceholder — 图片加载占位 ──────────────

type ImageState = 'loading' | 'loaded' | 'error';

export function ImagePlaceholder({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
  objectFit = 'cover',
}: ImagePlaceholderProps) {
  return (
    <ImagePlaceholderFrame
      key={src}
      src={src}
      alt={alt}
      className={className}
      aspectRatio={aspectRatio}
      objectFit={objectFit}
    />
  );
}

function ImagePlaceholderFrame({
  src,
  alt,
  className = '',
  aspectRatio = '16/9',
  objectFit = 'cover',
}: ImagePlaceholderProps) {
  const [state, setState] = useState<ImageState>('loading');

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (!cancelled) setState('loaded');
    };
    img.onerror = () => {
      if (!cancelled) setState('error');
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-[#F2F2F0] ${className}`}
      style={{ aspectRatio }}
    >
      <AnimatePresence mode="wait">
        {state === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            <Skeleton className="w-full h-full" />
          </motion.div>
        )}
        {state === 'loaded' && (
          <motion.img
            key="loaded"
            src={src}
            alt={alt}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
            style={{ objectFit }}
          />
        )}
        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center text-[#B8B8B6]"
          >
            <ImageOff size={32} strokeWidth={1.2} />
            <span className="text-xs mt-2">图片加载失败</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 便捷导出：按场景预设的空状态 ─────────────────

export function EmptySearch() {
  return (
    <EmptyState
      icon={Search}
      title="没有找到相关内容"
      description="试试其他关键词，或者换个筛选条件"
      action={{ label: '清除筛选', onClick: () => window.location.reload() }}
    />
  );
}

export function EmptyLibrary() {
  return (
    <EmptyState
      icon={Grid3X3}
      title="藏馆还是空的"
      description="这里会收录你整理的工具、教程和资源"
      action={{ label: '去逛逛', href: '/library' }}
    />
  );
}

export function EmptyFeed() {
  return (
    <EmptyState
      icon={Newspaper}
      title="暂无动态"
      description="关注更多圈子，获取最新资讯"
      action={{ label: '发现圈子', href: '/circles' }}
    />
  );
}

export function EmptyJournal() {
  return (
    <EmptyState
      icon={FileText}
      title="还没有手记"
      description="记录你的学习过程、思考碎片与复盘总结"
      action={{ label: '写手记', onClick: () => {} }}
    />
  );
}
