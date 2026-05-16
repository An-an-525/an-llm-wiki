import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const tauriConfigPath = resolve(siteRoot, 'src-tauri', 'tauri.conf.json');
const publicRoot = resolve(siteRoot, 'public');
const distRoot = resolve(siteRoot, 'dist');

const tauriConfig = JSON.parse(await readFile(tauriConfigPath, 'utf8'));
const productName = String(tauriConfig.productName || 'an-study-room');
const version = String(tauriConfig.version || '0.0.0');
const sourceInstallerName = `${productName}_${version}_x64-setup.exe`;
const publicInstallerName = `an-study-room_${version}_x64-setup.exe`;
const publicBaseUrl = String(process.env.AN_STUDY_ROOM_PUBLIC_BASE_URL || 'https://an520.xin/study-room').trim().replace(/\/+$/, '');
const releaseNotes = String(process.env.AN_STUDY_ROOM_RELEASE_NOTES || '完善三端发布链路，补齐桌面端应用内更新基础设施。').trim();
const existingReleasePath = resolve(publicRoot, 'downloads', 'release.json');
let existingRelease = {};
try {
  existingRelease = JSON.parse(await readFile(existingReleasePath, 'utf8'));
} catch {
  existingRelease = {};
}
const existingAndroidClient = existingRelease?.clients?.android;
const existingAndroidApk = existingRelease?.files?.androidApk;
const sourceInstallerPath = resolve(
  siteRoot,
  'src-tauri',
  'target',
  'release',
  'bundle',
  'nsis',
  sourceInstallerName,
);
const sourceSignaturePath = `${sourceInstallerPath}.sig`;

if (!existsSync(sourceInstallerPath)) {
  throw new Error(`Missing installer: ${sourceInstallerPath}`);
}
if (!existsSync(sourceSignaturePath)) {
  throw new Error(`Missing updater signature: ${sourceSignaturePath}`);
}

const targetRoots = [publicRoot];
if (existsSync(distRoot)) {
  targetRoots.push(distRoot);
}

const primaryInstallerPath = resolve(publicRoot, 'downloads', publicInstallerName);
await mkdir(resolve(publicRoot, 'downloads'), { recursive: true });
await copyFile(sourceInstallerPath, primaryInstallerPath);

const fileStat = await stat(primaryInstallerPath);
const generatedAt = new Date().toISOString();
const signature = (await readFile(sourceSignaturePath, 'utf8')).trim();
const releaseMetadata = {
  productName,
  version,
  generatedAt,
  channel: 'stable',
  clients: {
    web: {
      status: 'active',
      delivery: '浏览器 / PWA',
      entry: `${publicBaseUrl}/#/`,
      updateMode: '刷新后获取最新内容与界面',
    },
    windows: {
      status: 'active',
      delivery: 'NSIS 安装包',
      entry: `${publicBaseUrl}/downloads/${publicInstallerName}`,
      updateMode: '应用内检查更新 + 远程下载安装',
      updateManifest: `${publicBaseUrl}/updates/latest.json`,
    },
    android: {
      ...(existingAndroidClient || {
        status: 'planned',
        delivery: 'Tauri Android（APK / AAB）',
        entry: '',
        updateMode: '内测走 APK，正式发布走 AAB / 应用市场',
        targets: ['aarch64', 'armv7'],
      }),
    },
  },
  files: {
    windowsInstaller: {
      name: publicInstallerName,
      path: `/downloads/${publicInstallerName}`,
      bytes: fileStat.size,
    },
    windowsSignature: {
      name: `${publicInstallerName}.sig`,
      path: `/downloads/${publicInstallerName}.sig`,
    },
    ...(existingAndroidApk ? { androidApk: existingAndroidApk } : {}),
  },
};
const updaterManifest = {
  version,
  notes: releaseNotes,
  pub_date: generatedAt,
  platforms: {
    'windows-x86_64': {
      signature,
      url: `${publicBaseUrl}/downloads/${publicInstallerName}`,
    },
  },
};

for (const targetRoot of targetRoots) {
  const downloadsDir = resolve(targetRoot, 'downloads');
  const updatesDir = resolve(targetRoot, 'updates');
  const installerPath = resolve(downloadsDir, publicInstallerName);
  const signaturePath = resolve(downloadsDir, `${publicInstallerName}.sig`);

  await mkdir(downloadsDir, { recursive: true });
  await mkdir(updatesDir, { recursive: true });
  await copyFile(sourceInstallerPath, installerPath);
  await copyFile(sourceSignaturePath, signaturePath);
  await writeFile(
    resolve(downloadsDir, 'release.json'),
    `${JSON.stringify(releaseMetadata, null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    resolve(updatesDir, 'latest.json'),
    `${JSON.stringify(updaterManifest, null, 2)}\n`,
    'utf8',
  );
}

console.log(`prepared desktop release: ${primaryInstallerPath}`);
