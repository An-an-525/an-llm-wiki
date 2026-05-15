export type RuntimePlatform = 'web' | 'desktop' | 'android' | 'ios';

export type AppRuntimeConfig = {
  platform: RuntimePlatform;
  apiBaseUrl: string;
  appVersion: string;
  enableServiceWorker: boolean;
};

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    __AN_STUDY_ROOM_DESKTOP__?: {
      apiBaseUrl?: string;
      platform?: Exclude<RuntimePlatform, 'web'>;
      appVersion?: string;
    };
  }
}

function normalizeBaseUrl(value: string | undefined) {
  const raw = (value || '').trim();
  if (!raw) return '';
  return raw.replace(/\/+$/, '');
}

function inferWebBaseUrl() {
  if (typeof window === 'undefined') {
    return '';
  }

  const pathname = window.location.pathname || '/';
  if (pathname === '/' || !pathname.startsWith('/')) {
    return '';
  }

  const normalizedPath = pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
  if (!normalizedPath || normalizedPath === '/') {
    return '';
  }

  const lastSegment = normalizedPath.split('/').filter(Boolean).at(-1) || '';
  if (lastSegment.includes('.')) {
    const basePath = normalizedPath.slice(0, -(lastSegment.length + 1));
    return basePath === '/' ? '' : basePath;
  }

  return normalizedPath;
}

function readTauriPlatform() {
  const platform = typeof import.meta.env.TAURI_ENV_PLATFORM === 'string'
    ? import.meta.env.TAURI_ENV_PLATFORM.trim()
    : '';
  return platform;
}

function normalizePlatform(value: string | undefined): RuntimePlatform | null {
  switch ((value || '').trim()) {
    case 'desktop':
    case 'windows':
    case 'linux':
    case 'macos':
      return 'desktop';
    case 'android':
      return 'android';
    case 'ios':
      return 'ios';
    default:
      return null;
  }
}

export function detectRuntimePlatform(): RuntimePlatform {
  const envPlatform = normalizePlatform(readTauriPlatform());
  if (envPlatform) {
    return envPlatform;
  }

  if (typeof window !== 'undefined') {
    const windowPlatform = normalizePlatform(window.__AN_STUDY_ROOM_DESKTOP__?.platform);
    if (windowPlatform) {
      return windowPlatform;
    }

    const userAgent = navigator.userAgent || '';
    const isAndroidWebView = /Android/i.test(userAgent) && (/\bwv\b/i.test(userAgent) || window.location.hostname.includes('tauri'));
    if (isAndroidWebView) {
      return 'android';
    }

    if (window.__TAURI_INTERNALS__) {
      return 'desktop';
    }
  }

  return 'web';
}

export function detectDesktopPlatform() {
  return detectRuntimePlatform() === 'desktop';
}

export function runtimeConfig(): AppRuntimeConfig {
  const runtimePlatform = detectRuntimePlatform();
  const desktopBase = typeof window !== 'undefined'
    ? normalizeBaseUrl(window.__AN_STUDY_ROOM_DESKTOP__?.apiBaseUrl)
    : '';
  const envBase = normalizeBaseUrl(import.meta.env.VITE_XIAOAN_API_BASE_URL);
  const inferredWebBase = runtimePlatform === 'web' ? inferWebBaseUrl() : '';
  const apiBaseUrl = desktopBase || envBase || inferredWebBase;
  const windowVersion = typeof window !== 'undefined'
    ? window.__AN_STUDY_ROOM_DESKTOP__?.appVersion?.trim()
    : '';
  const appVersion = windowVersion || String(import.meta.env.VITE_APP_VERSION || '').trim() || '0.0.0';

  return {
    platform: runtimePlatform,
    apiBaseUrl,
    appVersion,
    enableServiceWorker: runtimePlatform === 'web',
  };
}

export function resolveApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const { apiBaseUrl } = runtimeConfig();
  if (!apiBaseUrl) {
    return normalizedPath;
  }
  return `${apiBaseUrl}${normalizedPath}`;
}

export function resolveSiteDataUrl() {
  const { apiBaseUrl, platform } = runtimeConfig();
  if (platform !== 'web' && apiBaseUrl) {
    return `${apiBaseUrl}/api/site-data/adapter.json`;
  }

  return './site-data/adapter.json';
}

export function resolveReleaseManifestUrl() {
  const { apiBaseUrl, platform } = runtimeConfig();
  if (platform !== 'web' && apiBaseUrl) {
    return `${apiBaseUrl}/downloads/release.json`;
  }

  return resolveAssetUrl('/downloads/release.json');
}

export function resolvePublicAssetUrl(path: string | undefined) {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (/^(?:https?:)?\/\//.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const { apiBaseUrl, platform } = runtimeConfig();
  if (platform !== 'web' && apiBaseUrl) {
    return `${apiBaseUrl}${normalizedPath}`;
  }

  return resolveAssetUrl(normalizedPath);
}

export function resolveAssetUrl(path: string | undefined) {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  if (/^(?:https?:)?\/\//.test(trimmed) || trimmed.startsWith('data:')) {
    return trimmed;
  }

  const normalized = trimmed.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
  if (base === './') {
    return `./${normalized}`;
  }
  return `${base.replace(/\/+$/, '/')}${normalized}`;
}

export function isExternalHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function openExternalUrl(url: string) {
  if (!isExternalHttpUrl(url)) {
    return;
  }

  if (detectRuntimePlatform() !== 'web') {
    const { openUrl } = await import('@tauri-apps/plugin-opener');
    await openUrl(url);
    return;
  }

  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
