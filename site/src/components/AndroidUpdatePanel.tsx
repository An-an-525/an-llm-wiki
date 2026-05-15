import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, RefreshCw, Smartphone } from 'lucide-react';
import {
  isExternalHttpUrl,
  openExternalUrl,
  resolvePublicAssetUrl,
  resolveReleaseManifestUrl,
  runtimeConfig,
} from '@/lib/runtime';

type AndroidRelease = {
  status?: string;
  version?: string;
  versionCode?: number;
  delivery?: string;
  entry?: string;
  updateMode?: string;
  targets?: string[];
  releaseNotes?: string[];
};

type AndroidApkFile = {
  name?: string;
  path?: string;
  bytes?: number;
  sha256?: string;
  abi?: string;
  buildType?: string;
};

type ReleaseInfo = {
  version?: string;
  generatedAt?: string;
  clients?: {
    android?: AndroidRelease;
  };
  files?: {
    androidApk?: AndroidApkFile;
  };
};

type AndroidUpdateStatus = 'checking' | 'available' | 'current' | 'missing' | 'error';

type AndroidUpdateState = {
  status: AndroidUpdateStatus;
  message: string;
  release?: ReleaseInfo;
  details?: string;
};

function formatBytes(bytes: number | undefined) {
  if (!bytes) return '未知大小';
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeVersionPart(value: string | undefined) {
  return String(value || '')
    .trim()
    .replace(/^v/i, '')
    .split(/[.+-]/)
    .map((part) => Number.parseInt(part, 10))
    .filter((part) => Number.isFinite(part));
}

function compareVersions(left: string | undefined, right: string | undefined) {
  const a = normalizeVersionPart(left);
  const b = normalizeVersionPart(right);
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const nextA = a[index] || 0;
    const nextB = b[index] || 0;
    if (nextA > nextB) return 1;
    if (nextA < nextB) return -1;
  }

  return 0;
}

function formatGeneratedAt(value: string | undefined) {
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

function resolveAndroidApkUrl(release: ReleaseInfo | undefined) {
  const androidEntry = release?.clients?.android?.entry;
  if (androidEntry) {
    return resolvePublicAssetUrl(androidEntry);
  }

  return resolvePublicAssetUrl(release?.files?.androidApk?.path);
}

async function openDownload(url: string) {
  if (!url) return;
  if (isExternalHttpUrl(url)) {
    await openExternalUrl(url);
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

export default function AndroidUpdatePanel() {
  const config = runtimeConfig();
  const isAndroidRuntime = config.platform === 'android';
  const [state, setState] = useState<AndroidUpdateState>({
    status: 'checking',
    message: '正在读取 Android 版本清单。',
  });

  const checkAndroidRelease = useCallback(async () => {
    setState({ status: 'checking', message: '正在读取 Android 版本清单。' });
    try {
      const response = await fetch(resolveReleaseManifestUrl(), { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const release = (await response.json()) as ReleaseInfo;
      const android = release.clients?.android;
      const apkUrl = resolveAndroidApkUrl(release);

      if (!android || android.status !== 'active' || !apkUrl) {
        setState({
          status: 'missing',
          release,
          message: 'Android 安装包还没有进入公开分发。',
        });
        return;
      }

      const remoteVersion = android.version || release.version || '0.0.0';
      const hasNewVersion = compareVersions(remoteVersion, config.appVersion) > 0;
      setState({
        status: isAndroidRuntime && !hasNewVersion ? 'current' : 'available',
        release,
        message: isAndroidRuntime && !hasNewVersion
          ? '当前 Android 版本已经是最新。'
          : 'Android 安装包可以下载。',
      });
    } catch (error) {
      setState({
        status: 'error',
        message: '检查 Android 版本失败。',
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }, [config.appVersion, isAndroidRuntime]);

  useEffect(() => {
    void checkAndroidRelease();
  }, [checkAndroidRelease]);

  const android = state.release?.clients?.android;
  const apkFile = state.release?.files?.androidApk;
  const apkUrl = resolveAndroidApkUrl(state.release);
  const remoteVersion = android?.version || state.release?.version || '未发布';
  const releaseNotes = useMemo(() => android?.releaseNotes || [], [android?.releaseNotes]);
  const statusIcon = state.status === 'current' ? CheckCircle2 : state.status === 'error' ? AlertTriangle : Smartphone;
  const StatusIcon = statusIcon;
  const canDownload = state.status === 'available' || state.status === 'current';

  return (
    <div className="rounded-2xl border border-[#E8DDD4] bg-[#FBFAF7] p-5">
      <div className="flex items-center gap-3">
        <StatusIcon size={18} strokeWidth={1.6} className="text-[#9B6848]" />
        <h3 className="font-serif text-[17px] text-ink">Android 版本更新</h3>
      </div>
      <p className="mt-3 text-[13px] leading-[1.9] text-graphite">
        Android 读取公网版本清单。发现新版后打开 APK 下载页，由你确认安装。
      </p>

      <div className="mt-4 rounded-xl border border-[#E8DDD4] bg-white px-4 py-3">
        <p className="text-[12px] text-silver">当前状态</p>
        <p className="mt-1 text-[14px] text-ink">{state.message}</p>
        <div className="mt-3 grid gap-2 text-[12px] leading-[1.7] text-graphite">
          <p>{isAndroidRuntime ? `本机版本：${config.appVersion}` : '当前环境：网页预览'}</p>
          <p>远程版本：{remoteVersion}</p>
          <p>清单时间：{formatGeneratedAt(state.release?.generatedAt)}</p>
          <p>安装包：{apkFile?.name || '未提供'} · {formatBytes(apkFile?.bytes)}</p>
        </div>
        {apkFile?.sha256 ? (
          <p className="mt-2 break-all text-[11px] leading-[1.7] text-silver">SHA-256：{apkFile.sha256}</p>
        ) : null}
        {state.details ? (
          <p className="mt-2 break-all text-[11px] leading-[1.7] text-silver">{state.details}</p>
        ) : null}
      </div>

      {releaseNotes.length > 0 ? (
        <ul className="mt-3 space-y-2 text-[12px] leading-[1.8] text-graphite">
          {releaseNotes.slice(0, 3).map((note) => (
            <li key={note}>· {note}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={checkAndroidRelease}
          disabled={state.status === 'checking'}
          className="inline-flex items-center gap-2 rounded-full border border-[#D8C6B8] bg-white px-4 py-2 text-[12px] text-graphite disabled:opacity-60"
        >
          <RefreshCw size={14} strokeWidth={1.6} className={state.status === 'checking' ? 'animate-spin' : ''} />
          检查版本
        </button>
        {canDownload ? (
          <button
            type="button"
            onClick={() => void openDownload(apkUrl)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-[12px] text-white"
          >
            <Download size={14} strokeWidth={1.6} />
            下载 Android APK
          </button>
        ) : null}
      </div>
    </div>
  );
}
