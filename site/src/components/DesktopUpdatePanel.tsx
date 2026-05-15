import { useEffect, useState } from 'react';
import { Download, RefreshCw, Smartphone } from 'lucide-react';
import {
  checkDesktopUpdate,
  describeDesktopUpdateError,
  installPendingDesktopUpdate,
  isDesktopUpdaterSupported,
  type DesktopUpdateSnapshot,
} from '@/lib/desktopUpdater';

function formatDate(value: string | undefined) {
  if (!value) return '未提供';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DesktopUpdatePanel() {
  const [snapshot, setSnapshot] = useState<DesktopUpdateSnapshot>({
    supported: isDesktopUpdaterSupported(),
    status: 'idle',
  });

  useEffect(() => {
    if (!isDesktopUpdaterSupported()) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setSnapshot({ supported: true, status: 'checking', message: '正在检查桌面端更新。' });
      try {
        const next = await checkDesktopUpdate();
        if (!cancelled) {
          setSnapshot(next);
        }
      } catch (error) {
        if (!cancelled) {
          const formatted = describeDesktopUpdateError(error);
          setSnapshot({
            supported: true,
            status: 'error',
            ...formatted,
          });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!snapshot.supported) {
    return (
      <div className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
        <div className="flex items-center gap-3">
          <Smartphone size={18} strokeWidth={1.6} className="text-[#9B6848]" />
          <h3 className="font-serif text-[17px] text-ink">桌面版更新</h3>
        </div>
        <p className="mt-3 text-[13px] leading-[1.9] text-graphite">
          这个检查只在安装后的 Windows 版本里出现。网页直接刷新，Android 继续用安装包更新。
        </p>
      </div>
    );
  }

  const runCheck = async () => {
    setSnapshot({ supported: true, status: 'checking', message: '正在检查桌面端更新。' });
    try {
      setSnapshot(await checkDesktopUpdate());
    } catch (error) {
      const formatted = describeDesktopUpdateError(error);
      setSnapshot({
        supported: true,
        status: 'error',
        ...formatted,
      });
    }
  };

  const runInstall = async () => {
    try {
      await installPendingDesktopUpdate((next) => setSnapshot(next));
    } catch (error) {
      const formatted = describeDesktopUpdateError(error);
      setSnapshot({
        supported: true,
        status: 'error',
        message: (formatted.message || '暂时没有完成安装更新。当前版本仍可继续使用。').replace('检查更新', '安装更新'),
        details: formatted.details,
      });
    }
  };

  const isBusy = snapshot.status === 'checking' || snapshot.status === 'downloading' || snapshot.status === 'restarting';

  return (
    <div className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
      <div className="flex items-center gap-3">
        <Download size={18} strokeWidth={1.6} className="text-[#9B6848]" />
        <h3 className="font-serif text-[17px] text-ink">桌面版更新</h3>
      </div>
      <p className="mt-3 text-[13px] leading-[1.9] text-graphite">
        读到新版时可以在应用里下载。读不到也不用紧张，当前版本照常阅读。
      </p>

      <div className="mt-4 rounded-xl border border-[#E8DDD4] bg-white px-4 py-3">
        <p className="text-[12px] text-silver">检查结果</p>
        <p className="mt-1 text-[14px] text-ink">{snapshot.message || '等待检查'}</p>
        {snapshot.details ? (
          <details className="mt-2 text-[11px] leading-[1.7] text-silver">
            <summary className="cursor-pointer select-none text-[#9B7E68]">查看诊断信息</summary>
            <p className="mt-1 break-all">{snapshot.details}</p>
          </details>
        ) : null}
        {snapshot.version ? (
          <p className="mt-2 text-[12px] text-graphite">
            可更新到 {snapshot.version}
            {snapshot.publishedAt ? ` · ${formatDate(snapshot.publishedAt)}` : ''}
          </p>
        ) : null}
        {typeof snapshot.progress === 'number' ? (
          <div className="mt-3">
            <div className="h-2 rounded-full bg-[#EEE7E0]">
              <div
                className="h-2 rounded-full bg-[#9B6848] transition-[width] duration-200"
                style={{ width: `${Math.max(8, Math.round(snapshot.progress * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-[12px] text-silver">{Math.round(snapshot.progress * 100)}%</p>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={runCheck}
          disabled={isBusy}
          className="inline-flex items-center gap-2 rounded-full border border-[#D8C6B8] bg-white px-4 py-2 text-[12px] text-graphite disabled:opacity-60"
        >
          <RefreshCw size={14} strokeWidth={1.6} className={snapshot.status === 'checking' ? 'animate-spin' : ''} />
          重新检查
        </button>
        {snapshot.status === 'available' ? (
          <button
            type="button"
            onClick={runInstall}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[12px] text-white"
          >
            <Download size={14} strokeWidth={1.6} />
            立即更新
          </button>
        ) : null}
      </div>
    </div>
  );
}
