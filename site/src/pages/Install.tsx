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
} from 'lucide-react';
import AndroidUpdatePanel from '@/components/AndroidUpdatePanel';
import DesktopUpdatePanel from '@/components/DesktopUpdatePanel';
import { resolveAssetUrl, resolveReleaseManifestUrl } from '@/lib/runtime';

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

  const installCards = useMemo(
    () => [
      {
        title: '网页直接阅读',
        icon: Globe,
        summary: '预览、试读、分享和下载入口。',
      },
      {
        title: 'Windows 桌面安装版',
        icon: Laptop,
        summary: '独立窗口、应用内检查更新、长期阅读。',
      },
      {
        title: 'Android 安装版',
        icon: MonitorSmartphone,
        summary: '手机端阅读与小安对话，后续按移动端规范分发。',
      },
    ],
    [],
  );

  const clientRows = useMemo(
    () => [
      {
        label: '网页预览',
        status: release?.clients?.web?.status || 'active',
        delivery: '浏览器预览 / 下载入口',
        updateMode: '刷新获取最新内容',
      },
      {
        label: 'Windows 桌面',
        status: release?.clients?.windows?.status || 'active',
        delivery: release?.clients?.windows?.delivery || 'NSIS 安装包',
        updateMode: release?.clients?.windows?.updateMode || '应用内更新',
      },
      {
        label: 'Android',
        status: release?.clients?.android?.status || 'planned',
        delivery: release?.clients?.android?.delivery || 'APK / AAB',
        updateMode: release?.clients?.android?.updateMode || '移动端独立分发',
      },
    ],
    [release],
  );

  return (
    <div className="min-h-[100dvh] bg-[#FAF9F7] pt-[calc(72px+40px)] pb-16">
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
            安的书房安装与版本
          </h1>
          <p className="mt-4 max-w-[780px] text-[14px] leading-[2] text-silver md:text-[15px]">
            网页、Windows 和 Android 共用同一套公开内容。这里负责下载、版本和更新状态。
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {installCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#9B6848] shadow-sm">
                    <Icon size={18} strokeWidth={1.6} />
                  </div>
                  <h2 className="mt-4 font-serif text-[18px] text-ink">{card.title}</h2>
                  <p className="mt-2 text-[13px] leading-[1.9] text-silver">{card.summary}</p>
                </div>
              );
            })}
          </div>
        </motion.section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[22px] border border-[#E8DDD4] bg-white p-6 md:p-7">
            <div className="flex items-center gap-3">
              <PackageOpen size={18} strokeWidth={1.6} className="text-[#9B6848]" />
              <h2 className="font-serif text-[22px] text-ink">当前桌面版</h2>
            </div>

            <div className="mt-5 rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] text-silver">版本号</p>
                  <p className="mt-1 text-[20px] text-ink">{release?.version || '0.1.0'}</p>
                </div>
                <div>
                  <p className="text-[12px] text-silver">发布时间</p>
                  <p className="mt-1 text-[14px] text-graphite">{formatDate(release?.generatedAt)}</p>
                </div>
                <div>
                  <p className="text-[12px] text-silver">安装包大小</p>
                  <p className="mt-1 text-[14px] text-graphite">{formatBytes(windowsInstaller?.bytes)}</p>
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
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
                <h3 className="font-serif text-[17px] text-ink">装好之后能做什么</h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-[1.8] text-graphite">
                  <li>稳定打开首页、藏馆、谱系、工坊、手记和年谱。</li>
                  <li>像独立软件一样阅读。</li>
                  <li>通过线上小安服务对话。</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
                <h3 className="font-serif text-[17px] text-ink">当前边界</h3>
                <ul className="mt-3 space-y-2 text-[13px] leading-[1.8] text-graphite">
                  <li>桌面版不打包原始材料。</li>
                  <li>访问材料只留在服务端，安装包里没有令牌。</li>
                  <li>Android 按移动端分发规则单独交付，不和桌面更新机制混用。</li>
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
                <h2 className="font-serif text-[22px] text-ink">双端互通标准</h2>
              </div>
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
