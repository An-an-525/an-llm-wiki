import { runtimeConfig } from './runtime';

type UpdateArtifact = {
  version?: string;
  body?: string;
  date?: string;
  downloadAndInstall: (callback?: (event: unknown) => void) => Promise<void>;
};

export type DesktopUpdateStatus =
  | 'idle'
  | 'checking'
  | 'up-to-date'
  | 'available'
  | 'downloading'
  | 'restarting'
  | 'error';

export type DesktopUpdateSnapshot = {
  supported: boolean;
  status: DesktopUpdateStatus;
  version?: string;
  notes?: string;
  publishedAt?: string;
  progress?: number;
  message?: string;
  details?: string;
};

let pendingUpdate: UpdateArtifact | null = null;

export function isDesktopUpdaterSupported() {
  return runtimeConfig().platform === 'desktop';
}

function normalizeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.trim();
  }

  if (typeof error === 'string') {
    return error.trim();
  }

  return '';
}

function formatDesktopUpdateError(error: unknown): Pick<DesktopUpdateSnapshot, 'message' | 'details'> {
  const details = normalizeErrorMessage(error);
  const normalized = details.toLowerCase();

  if (!details) {
    return {
      message: '暂时没有读到远程版本。当前内容仍可继续使用。',
    };
  }

  if (normalized.includes('not allowed') || normalized.includes('permission')) {
    return {
      message: '桌面端更新权限没有放行，需要更新应用壳层后再试。',
      details,
    };
  }

  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return {
      message: '暂时没有连上版本服务。当前内容仍可继续使用。',
      details,
    };
  }

  if (normalized.includes('404') || normalized.includes('status code')) {
    return {
      message: '远程版本地址暂时不可用。当前安装版不受影响。',
      details,
    };
  }

  if (normalized.includes('json')) {
    return {
      message: '这次没有完成版本检查，当前版本仍可继续使用。',
      details,
    };
  }

  if (normalized.includes('signature')) {
    return {
      message: '这次没有完成版本检查，当前版本仍可继续使用。',
      details,
    };
  }

  return {
    message: '暂时没有读到远程版本。当前内容仍可继续使用。',
    details,
  };
}

export async function checkDesktopUpdate(): Promise<DesktopUpdateSnapshot> {
  if (!isDesktopUpdaterSupported()) {
    return { supported: false, status: 'idle' };
  }

  if (import.meta.env.DEV) {
    pendingUpdate = null;
    return {
      supported: true,
      status: 'idle',
      message: '当前是本地开发环境，应用内更新请在安装版里验证。',
    };
  }

  try {
    const { check } = await import('@tauri-apps/plugin-updater');
    const update = (await check()) as UpdateArtifact | null;

    if (!update) {
      pendingUpdate = null;
      return {
        supported: true,
        status: 'up-to-date',
        message: '当前已经是最新版本。',
      };
    }

    pendingUpdate = update;
    return {
      supported: true,
      status: 'available',
      version: update.version,
      notes: update.body,
      publishedAt: update.date,
      message: '检测到可用更新。',
    };
  } catch (error) {
    pendingUpdate = null;
    const formatted = formatDesktopUpdateError(error);
    return {
      supported: true,
      status: 'error',
      ...formatted,
    };
  }
}

export async function installPendingDesktopUpdate(
  onProgress?: (snapshot: DesktopUpdateSnapshot) => void,
): Promise<void> {
  if (!pendingUpdate) {
    throw new Error('No pending desktop update available.');
  }

  let downloaded = 0;
  let contentLength = 0;

  await pendingUpdate.downloadAndInstall((event) => {
    const payload = event as {
      event?: string;
      data?: { contentLength?: number; chunkLength?: number };
    };

    switch (payload.event) {
      case 'Started':
        contentLength = payload.data?.contentLength || 0;
        onProgress?.({
          supported: true,
          status: 'downloading',
          version: pendingUpdate?.version,
          progress: 0,
          message: '开始下载更新包。',
        });
        break;
      case 'Progress':
        downloaded += payload.data?.chunkLength || 0;
        onProgress?.({
          supported: true,
          status: 'downloading',
          version: pendingUpdate?.version,
          progress: contentLength > 0 ? downloaded / contentLength : undefined,
          message: '正在下载并安装更新。',
        });
        break;
      case 'Finished':
        onProgress?.({
          supported: true,
          status: 'restarting',
          version: pendingUpdate?.version,
          progress: 1,
          message: '更新已写入，正在重启应用。',
        });
        break;
      default:
        break;
    }
  });

  const { relaunch } = await import('@tauri-apps/plugin-process');
  await relaunch();
}

export function describeDesktopUpdateError(error: unknown) {
  return formatDesktopUpdateError(error);
}
