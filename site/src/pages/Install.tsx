import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  Download,
  Globe,
  Laptop,
  MonitorSmartphone,
  Sparkles,
  RefreshCw,
  PackageOpen,
  ArrowRight,
} from 'lucide-react';
import AndroidUpdatePanel from '@/components/AndroidUpdatePanel';
import DesktopUpdatePanel from '@/components/DesktopUpdatePanel';
import { resolveAssetUrl, resolvePublicAssetUrl, resolveReleaseManifestUrl } from '@/lib/runtime';

const easeOut = [0, 0, 0.2, 1] as [number, number, number, number];

type ReleaseInfo = {
  productName: string;
  version: string;
  generatedAt: string;
  channel: string;
  clients?: {
    web?: {
      status: string;
      delivery: string;
      entry: string;
      updateMode: string;
    };
    windows?: {
      status: string;
      delivery: string;
      entry: string;
      updateMode: string;
      updateManifest?: string;
    };
    android?: {
      status: string;
      delivery: string;
      entry?: string;
      updateMode: string;
      version?: string;
      targets?: string[];
    };
  };
  files?: {
    windowsInstaller?: {
      name: string;
      path: string;
      bytes: number;
    };
    androidApk?: {
      name: string;
      path: string;
      bytes: number;
      sha256?: string;
      abi?: string;
      buildType?: string;
    };
  };
};

function formatBytes(bytes: number | undefined) {
  if (!bytes) return '未知大小';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function formatDate(value: string | undefined) {
  if (!value) return '未生成';
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

export default function Install() {
  const [release, setRelease] = useState<ReleaseInfo | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(resolveReleaseManifestUrl(), { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<ReleaseInfo>;
      })
      .then((data) => {
        if (!cancelled) {
          setRelease(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRelease(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const windowsInstaller = release?.files?.windowsInstaller;
  const installerHref = windowsInstaller ? resolveAssetUrl(windowsInstaller.path) : '';
  const androidApk = release?.files?.androidApk;
  const androidHref = resolvePublicAssetUrl(release?.clients?.android?.entry || androidApk?.path);

  const installCards = useMemo(
    () => [
      {
        title: '网页直接阅读',
        label: '最轻量',
        icon: Globe,
        summary: '不用安装，打开就能读。适合第一次来、分享给朋友、确认最新内容。',
        action: '打开网页版',
        href: '/',
      },
      {
        title: 'Windows 桌面安装版',
        label: release?.version ? `v${release.version}` : '可下载',
        icon: Laptop,
        summary: '像普通软件一样打开。适合长期放在电脑里，慢慢读工坊、谱系和小安。',
        action: installerHref ? '下载 Windows' : '安装包整理中',
        href: installerHref,
      },
      {
        title: 'Android 安装版',
        label: release?.clients?.android?.version ? `v${release.clients.android.version}` : '内测',
        icon: MonitorSmartphone,
        summary: '手机上随时阅读，也能问小安。当前先用 APK 内测包，由你手动确认安装。',
        action: androidHref ? '下载 Android APK' : 'APK 整理中',
        href: androidHref,
      },
    ],
    [androidHref, installerHref, release],
  );

  const clientRows = useMemo(
    () => [
      {
        label: '网页预览',
        status: release?.clients?.web?.status || 'active',
        delivery: '直接用浏览器打开',
        updateMode: '刷新页面就能看到新内容',
      },
      {
        label: 'Windows 桌面',
        status: release?.clients?.windows?.status || 'active',
        delivery: 'Windows 安装包',
        updateMode: '安装版里手动检查新版',
      },
      {
        label: 'Android',
        status: release?.clients?.android?.status || 'planned',
        delivery: 'Android APK',
        updateMode: '下载新版安装包后手动安装',
      },
    ],
    [release],
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAF9F7] pt-[calc(var(--app-nav-height)+32px)] pb-16">
      <div className="mx-auto max-w-[1120px] px-5 md:px-12">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: easeOut }}
          className="rounded-[24px] border border-[#E8DDD4] bg-white/92 px-6 py-8 shadow-[0_18px_50px_rgba(67,52,43,0.08)] md:px-8 md:py-10"
        >
          <div className="flex flex-wrap items-center gap-3 text-[#9B6848]">
            <Sparkles size={17} strokeWidth={1.6} />
            <span className="text-[12px] tracking-[0.08em]">安装与版本</span>
          </div>
          <h1 className="mt-3 font-serif text-[30px] leading-[1.3] text-ink md:text-[42px]">
            选择你要打开书房的方式
          </h1>
          <p className="mt-4 max-w-[780px] text-[14px] leading-[2] text-silver md:text-[15px]">
            网页、Windows 和 Android 都读同一间公开书房。先选你手边的设备，能打开、能阅读、能问小安，比形式复杂更重要。
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {installCards.map((card) => {
              const Icon = card.icon;
              const inner = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#9B6848] shadow-sm">
                      <Icon size={18} strokeWidth={1.6} />
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] text-silver">
                      {card.label}
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-[18px] text-ink">{card.title}</h2>
                  <p className="mt-2 min-h-[52px] text-[13px] leading-[1.9] text-silver">{card.summary}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-graphite">
                    {card.action}
                    <ArrowRight size={13} strokeWidth={1.6} />
                  </span>
                </>
              );

              if (card.href === '/') {
                return (
                  <Link
                    key={card.title}
                    to="/"
                    className="group rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5 transition-colors hover:border-[#C9AF96] hover:bg-white"
                  >
                    {inner}
                  </Link>
                );
              }

              if (card.href) {
                return (
                  <a
                    key={card.title}
                    href={card.href}
                    className="group rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5 transition-colors hover:border-[#C9AF96] hover:bg-white"
                  >
                    {inner}
                  </a>
                );
              }

              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5 opacity-75"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </motion.section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[22px] border border-[#E8DDD4] bg-white p-6 md:p-7">
            <div className="flex items-center gap-3">
              <PackageOpen size={18} strokeWidth={1.6} className="text-[#9B6848]" />
              <h2 className="font-serif text-[22px] text-ink">现在能下载什么</h2>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-[12px] text-silver">Windows</p>
                  <p className="mt-1 text-[20px] text-ink">{release?.version || '0.1.0'}</p>
                  <p className="mt-1 text-[12px] text-silver">{formatBytes(windowsInstaller?.bytes)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-silver">Android</p>
                  <p className="mt-1 text-[20px] text-ink">{release?.clients?.android?.version || '内测'}</p>
                  <p className="mt-1 text-[12px] text-silver">{formatBytes(androidApk?.bytes)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-silver">清单时间</p>
                  <p className="mt-1 text-[14px] leading-[1.7] text-graphite">{formatDate(release?.generatedAt)}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {installerHref ? (
                  <a
                    href={installerHref}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-[13px] text-white transition-opacity hover:opacity-90"
                  >
                    <Download size={16} strokeWidth={1.6} />
                    下载 Windows 安装版
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#E8DDD4] px-5 py-3 text-[13px] text-graphite">
                    <RefreshCw size={16} strokeWidth={1.6} />
                    桌面安装包整理中
                  </span>
                )}
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full border border-[#D8C6B8] bg-white px-5 py-3 text-[13px] text-graphite"
                >
                  <Globe size={16} strokeWidth={1.6} />
                  直接打开网页版
                </Link>
                {androidHref ? (
                  <a
                    href={androidHref}
                    className="inline-flex items-center gap-2 rounded-full border border-[#D8C6B8] bg-white px-5 py-3 text-[13px] text-graphite"
                  >
                    <MonitorSmartphone size={16} strokeWidth={1.6} />
                    下载 Android APK
                  </a>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
                <h3 className="font-serif text-[17px] text-ink">装好之后能做什么</h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-[1.8] text-graphite">
                  <li>打开首页、藏馆、谱系、工坊、手记和年谱。</li>
                  <li>像独立软件一样阅读。</li>
                  <li>进入小安页面或弹窗，按书房里的公开内容提问。</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
                <h3 className="font-serif text-[17px] text-ink">需要知道的边界</h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-[1.8] text-graphite">
                  <li>安装包只放公开书房，不放安的私人材料。</li>
                  <li>小安的在线回答由后端提供，页面里不保存访问密钥。</li>
                  <li>Android 新版需要你自己确认安装，不会偷偷替换。</li>
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <DesktopUpdatePanel />
            </div>
            <div className="mt-4">
              <AndroidUpdatePanel />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[22px] border border-[#E8DDD4] bg-white p-6">
              <div className="flex items-center gap-3">
                <MonitorSmartphone size={18} strokeWidth={1.6} className="text-[#9B6848]" />
                <h2 className="font-serif text-[22px] text-ink">内容怎样同步</h2>
              </div>
              <p className="mt-3 text-[13px] leading-[1.9] text-silver">
                内容更新和软件更新分开。内容可以更快刷新，软件版本慢一点也没关系；这样更稳，也不影响读者继续阅读。
              </p>
              <div className="mt-4 space-y-3">
                {clientRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-medium text-ink">{row.label}</p>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] text-silver">
                        {row.status === 'active' ? '已接入' : '待接入'}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-[1.8] text-graphite">交付方式：{row.delivery}</p>
                    <p className="mt-1 text-[12px] leading-[1.8] text-graphite">更新方式：{row.updateMode}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
