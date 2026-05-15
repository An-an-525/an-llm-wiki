import { createHash } from 'node:crypto';
import { createReadStream, existsSync } from 'node:fs';
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const tauriConfigPath = resolve(siteRoot, 'src-tauri', 'tauri.conf.json');
const androidPropertiesPath = resolve(
  siteRoot,
  'src-tauri',
  'gen',
  'android',
  'app',
  'tauri.properties',
);
const publicRoot = resolve(siteRoot, 'public');
const distRoot = resolve(siteRoot, 'dist');
const publicDownloadsDir = resolve(publicRoot, 'downloads');
const publicBaseUrl = String(process.env.AN_STUDY_ROOM_PUBLIC_BASE_URL || 'https://an520.xin/study-room')
  .trim()
  .replace(/\/+$/, '');
const releaseNotes = String(
  process.env.AN_STUDY_ROOM_ANDROID_RELEASE_NOTES ||
    '接入远程内容更新、线上小安对话和 Android 版本检查。',
)
  .split('|')
  .map((item) => item.trim())
  .filter(Boolean);

function parseProperties(value) {
  return Object.fromEntries(
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
      }),
  );
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}

async function sha256File(path) {
  const hash = createHash('sha256');
  await new Promise((resolvePromise, rejectPromise) => {
    const stream = createReadStream(path);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', rejectPromise);
    stream.on('end', resolvePromise);
  });
  return hash.digest('hex');
}

async function findDefaultApk() {
  const explicit = String(process.env.AN_STUDY_ROOM_ANDROID_APK || '').trim();
  if (explicit) {
    return isAbsolute(explicit) ? explicit : resolve(siteRoot, explicit);
  }

  const preferred = [
    'an-study-room-arm64-remote-content-sync-debug.apk',
    'an-study-room-arm64-current-debug.apk',
  ];
  for (const name of preferred) {
    const candidate = resolve(publicDownloadsDir, name);
    if (existsSync(candidate)) return candidate;
  }

  const entries = await readdir(publicDownloadsDir, { withFileTypes: true });
  const apkEntries = [];
  for (const entry of entries) {
    if (!entry.isFile() || !/^an-study-room-arm64-.*\.apk$/i.test(entry.name)) continue;
    const fullPath = resolve(publicDownloadsDir, entry.name);
    apkEntries.push({ path: fullPath, mtimeMs: (await stat(fullPath)).mtimeMs });
  }

  apkEntries.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return apkEntries[0]?.path || '';
}

async function copyIfNeeded(source, target) {
  if (resolve(source) === resolve(target)) return;
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}

async function writeReleaseMetadata(targetRoot, releaseMetadata, apkSourcePath, apkName) {
  if (!existsSync(targetRoot)) return;
  const downloadsDir = resolve(targetRoot, 'downloads');
  await mkdir(downloadsDir, { recursive: true });
  await copyIfNeeded(apkSourcePath, resolve(downloadsDir, apkName));
  await writeFile(
    resolve(downloadsDir, 'release.json'),
    `${JSON.stringify(releaseMetadata, null, 2)}\n`,
    'utf8',
  );
}

const tauriConfig = await readJson(tauriConfigPath, {});
const androidProperties = parseProperties(await readFile(androidPropertiesPath, 'utf8').catch(() => ''));
const productName = String(tauriConfig.productName || '安的书房');
const androidVersion = String(
  process.env.AN_STUDY_ROOM_ANDROID_VERSION ||
    androidProperties['tauri.android.versionName'] ||
    tauriConfig.version ||
    '0.0.0',
);
const androidVersionCode = Number.parseInt(
  String(process.env.AN_STUDY_ROOM_ANDROID_VERSION_CODE || androidProperties['tauri.android.versionCode'] || '1'),
  10,
);
const sourceApkPath = await findDefaultApk();

if (!sourceApkPath || !existsSync(sourceApkPath)) {
  throw new Error('Missing Android APK. Set AN_STUDY_ROOM_ANDROID_APK or place an arm64 APK in public/downloads.');
}

const publicApkName = String(process.env.AN_STUDY_ROOM_ANDROID_PUBLIC_APK_NAME || basename(sourceApkPath)).trim();
const publicApkPath = resolve(publicDownloadsDir, publicApkName);
await copyIfNeeded(sourceApkPath, publicApkPath);

const apkStat = await stat(publicApkPath);
const apkSha256 = await sha256File(publicApkPath);
const generatedAt = new Date().toISOString();
const existingReleasePath = resolve(publicDownloadsDir, 'release.json');
const existingRelease = await readJson(existingReleasePath, {
  productName,
  version: androidVersion,
  channel: 'stable',
  clients: {},
  files: {},
});

const releaseMetadata = {
  ...existingRelease,
  productName,
  generatedAt,
  clients: {
    ...(existingRelease.clients || {}),
    android: {
      status: 'active',
      version: androidVersion,
      versionCode: Number.isFinite(androidVersionCode) ? androidVersionCode : 1,
      delivery: 'Android APK 内测安装包',
      entry: `${publicBaseUrl}/downloads/${publicApkName}`,
      updateMode: '应用内检查版本清单，手动下载新版 APK 后确认安装',
      targets: ['arm64-v8a'],
      releaseNotes,
    },
  },
  files: {
    ...(existingRelease.files || {}),
    androidApk: {
      name: publicApkName,
      path: `/downloads/${publicApkName}`,
      bytes: apkStat.size,
      sha256: apkSha256,
      abi: 'arm64-v8a',
      buildType: publicApkName.includes('debug') ? 'debug' : 'release',
    },
  },
};

await writeReleaseMetadata(publicRoot, releaseMetadata, publicApkPath, publicApkName);
await writeReleaseMetadata(distRoot, releaseMetadata, publicApkPath, publicApkName);

console.log(`prepared Android release metadata: ${publicApkName} (${androidVersion})`);
