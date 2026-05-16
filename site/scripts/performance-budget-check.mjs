import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const vaultRoot = resolve(siteRoot, '..');
const distRoot = resolve(siteRoot, 'dist');
const publicRoot = resolve(siteRoot, 'public');
const manifestRoot = resolve(vaultRoot, 'manifests');
const reportPath = resolve(manifestRoot, 'site_performance_budget_report.json');

const KB = 1024;
const MB = 1024 * KB;

const budgets = {
  cssTotal: 140 * KB,
  largestVendorChunk: 360 * KB,
  largestRouteChunk: 90 * KB,
  largestSiteDataChunk: 460 * KB,
  javascriptTotal: 1.35 * MB,
  publicAdapter: 560 * KB,
  generatedDataModule: 560 * KB,
  largestImage: 420 * KB,
  imageTotal: 1.25 * MB,
  windowsInstaller: 32 * MB,
  androidApk: 25 * MB,
};

const failures = [];
const warnings = [];
const metrics = {};

function addFailure(rule, message, details = {}) {
  failures.push({ rule, message, ...details });
}

function addWarning(rule, message, details = {}) {
  warnings.push({ rule, message, ...details });
}

function toBytes(value) {
  return Math.round(Number(value));
}

function formatBytes(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  if (bytes >= KB) return `${(bytes / KB).toFixed(1)} KB`;
  return `${bytes} B`;
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function fileSize(path) {
  return (await stat(path)).size;
}

async function walk(root) {
  const out = [];
  async function visit(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.isFile()) {
        out.push(path);
      }
    }
  }
  await visit(root);
  return out;
}

function assertMax(rule, actual, max, message) {
  if (actual > max) {
    addFailure(rule, `${message}: ${formatBytes(actual)} > ${formatBytes(max)}`, {
      actualBytes: toBytes(actual),
      maxBytes: toBytes(max),
    });
  }
}

function assertTextIncludes(rule, text, patterns, message) {
  const missing = patterns.filter((pattern) => !pattern.test(text));
  if (missing.length > 0) {
    addFailure(rule, message, { missing: missing.map(String) });
  }
}

async function checkBuildOutput() {
  if (!existsSync(resolve(distRoot, 'index.html'))) {
    addFailure('build-output', 'dist/index.html 不存在，请先运行构建。');
    return;
  }

  const assetsRoot = resolve(distRoot, 'assets');
  const files = existsSync(assetsRoot) ? await walk(assetsRoot) : [];
  const jsFiles = files.filter((path) => extname(path) === '.js');
  const cssFiles = files.filter((path) => extname(path) === '.css');
  const imageFiles = (await walk(distRoot)).filter((path) => /\.(?:png|jpe?g|webp|avif|svg)$/i.test(path));
  const jsEntries = await Promise.all(jsFiles.map(async (path) => ({ path, size: await fileSize(path) })));
  const cssEntries = await Promise.all(cssFiles.map(async (path) => ({ path, size: await fileSize(path) })));
  const imageEntries = await Promise.all(imageFiles.map(async (path) => ({ path, size: await fileSize(path) })));

  const cssTotal = cssEntries.reduce((sum, entry) => sum + entry.size, 0);
  const javascriptTotal = jsEntries.reduce((sum, entry) => sum + entry.size, 0);
  const largestVendor = jsEntries
    .filter((entry) => /(?:vendor|react-vendor|radix-ui|motion|icons|date-tools)/i.test(entry.path))
    .sort((a, b) => b.size - a.size)[0];
  const largestRoute = jsEntries
    .filter((entry) => !/(?:vendor|react-vendor|radix-ui|motion|icons|date-tools|site-data|index-)/i.test(entry.path))
    .sort((a, b) => b.size - a.size)[0];
  const largestSiteData = jsEntries
    .filter((entry) => /site-data/i.test(entry.path))
    .sort((a, b) => b.size - a.size)[0];
  const largestImage = imageEntries.sort((a, b) => b.size - a.size)[0];
  const imageTotal = imageEntries.reduce((sum, entry) => sum + entry.size, 0);

  metrics.build = {
    jsFiles: jsEntries.length,
    cssFiles: cssEntries.length,
    imageFiles: imageEntries.length,
    cssTotalBytes: toBytes(cssTotal),
    javascriptTotalBytes: toBytes(javascriptTotal),
    largestVendorChunk: largestVendor ? { path: largestVendor.path.replace(siteRoot, ''), bytes: largestVendor.size } : null,
    largestRouteChunk: largestRoute ? { path: largestRoute.path.replace(siteRoot, ''), bytes: largestRoute.size } : null,
    largestSiteDataChunk: largestSiteData ? { path: largestSiteData.path.replace(siteRoot, ''), bytes: largestSiteData.size } : null,
    largestImage: largestImage ? { path: largestImage.path.replace(siteRoot, ''), bytes: largestImage.size } : null,
    imageTotalBytes: toBytes(imageTotal),
  };

  assertMax('css-total-budget', cssTotal, budgets.cssTotal, 'CSS 总量超过预算');
  assertMax('javascript-total-budget', javascriptTotal, budgets.javascriptTotal, 'JavaScript 总量超过预算');
  if (largestVendor) assertMax('vendor-chunk-budget', largestVendor.size, budgets.largestVendorChunk, '最大公共依赖包超过预算');
  if (largestRoute) assertMax('route-chunk-budget', largestRoute.size, budgets.largestRouteChunk, '最大页面包超过预算');
  if (largestSiteData) assertMax('site-data-chunk-budget', largestSiteData.size, budgets.largestSiteDataChunk, '内嵌资料包超过预算');
  if (largestImage) assertMax('image-single-budget', largestImage.size, budgets.largestImage, '单张图片超过预算');
  assertMax('image-total-budget', imageTotal, budgets.imageTotal, '图片总量超过预算');
}

async function checkDataArtifacts() {
  const adapterPath = resolve(distRoot, 'site-data', 'adapter.json');
  const generatedModulePath = resolve(siteRoot, 'src', 'data', 'siteData.generated.ts');

  if (existsSync(adapterPath)) {
    const size = await fileSize(adapterPath);
    metrics.publicAdapterBytes = size;
    assertMax('public-adapter-budget', size, budgets.publicAdapter, '公开资料 adapter 超过预算');
  } else {
    addFailure('public-adapter-present', 'dist/site-data/adapter.json 不存在。');
  }

  if (existsSync(generatedModulePath)) {
    const size = await fileSize(generatedModulePath);
    metrics.generatedDataModuleBytes = size;
    assertMax('generated-data-module-budget', size, budgets.generatedDataModule, '生成数据模块超过预算');
  } else {
    addFailure('generated-data-module-present', 'src/data/siteData.generated.ts 不存在。');
  }
}

async function checkPwaContract() {
  const manifestPath = resolve(distRoot, 'manifest.webmanifest');
  const swPath = resolve(distRoot, 'sw.js');

  if (!existsSync(manifestPath)) {
    addFailure('manifest-present', 'manifest.webmanifest 不存在。');
    return;
  }
  if (!existsSync(swPath)) {
    addFailure('service-worker-present', 'sw.js 不存在。');
    return;
  }

  const manifest = await readJson(manifestPath);
  const swText = await readFile(swPath, 'utf8');
  metrics.pwa = {
    name: manifest.name,
    shortName: manifest.short_name,
    display: manifest.display,
    startUrl: manifest.start_url,
    scope: manifest.scope,
    iconCount: Array.isArray(manifest.icons) ? manifest.icons.length : 0,
  };

  if (!String(manifest.name || '').includes('安')) addFailure('manifest-name', 'App 名称必须保留安的品牌识别。');
  if (!String(manifest.short_name || '').includes('安')) addFailure('manifest-short-name', 'App 短名称必须保留安的品牌识别。');
  if (!['standalone', 'fullscreen', 'window-controls-overlay'].includes(manifest.display)) {
    addFailure('manifest-display', 'manifest display 必须适合安装型应用。', { display: manifest.display });
  }
  if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
    addFailure('manifest-icons', 'manifest 至少需要普通图标和 maskable 图标。');
  }
  if (!manifest.icons?.some((icon) => String(icon.purpose || '').includes('maskable'))) {
    addFailure('manifest-maskable-icon', 'manifest 需要 maskable 图标，避免安卓图标裁切失真。');
  }

  assertTextIncludes(
    'service-worker-contract',
    swText,
    [
      /CACHE_NAME\s*=/,
      /DATA_CACHE_NAME\s*=/,
      /skipWaiting\(/,
      /clients\.claim\(/,
      /request\.mode\s*===\s*["']navigate["']/,
      /\/site-data\//,
      /\/api\//,
      /caches\.delete/,
    ],
    'Service Worker 必须覆盖安装、清理旧缓存、导航兜底、资料缓存和 API 绕过。',
  );

  if (/downloads/.test(swText)) {
    addWarning('service-worker-download-cache', 'Service Worker 不应缓存安装包目录，避免把大文件带进离线缓存。');
  }
}

async function checkReleaseArtifacts() {
  const releasePath = resolve(publicRoot, 'downloads', 'release.json');
  const latestPath = resolve(publicRoot, 'updates', 'latest.json');
  if (!existsSync(releasePath)) {
    addWarning('release-json-present', 'public/downloads/release.json 不存在，安装页会降级。');
    return;
  }

  const release = await readJson(releasePath);
  metrics.release = {
    productName: release.productName,
    version: release.version,
    clients: Object.keys(release.clients || {}),
  };

  const windowsFile = release.files?.windowsInstaller?.path;
  const androidFile = release.files?.androidApk?.path;
  if (windowsFile) {
    const path = resolve(publicRoot, windowsFile.replace(/^\/+/, ''));
    if (existsSync(path)) {
      const size = await fileSize(path);
      metrics.windowsInstallerBytes = size;
      assertMax('windows-installer-budget', size, budgets.windowsInstaller, 'Windows 安装包超过预算');
    } else {
      addFailure('windows-installer-present', 'release.json 指向的 Windows 安装包不存在。', { file: windowsFile });
    }
  }
  if (androidFile) {
    const path = resolve(publicRoot, androidFile.replace(/^\/+/, ''));
    if (existsSync(path)) {
      const size = await fileSize(path);
      metrics.androidApkBytes = size;
      assertMax('android-apk-budget', size, budgets.androidApk, 'Android APK 超过预算');
    } else {
      addFailure('android-apk-present', 'release.json 指向的 Android APK 不存在。', { file: androidFile });
    }
  }

  if (!existsSync(latestPath)) {
    addWarning('desktop-latest-json-present', 'public/updates/latest.json 不存在，桌面自动更新会降级。');
  } else {
    const latest = await readJson(latestPath);
    if (!latest.platforms || !latest.platforms['windows-x86_64']?.url) {
      addFailure('desktop-updater-contract', '桌面更新 latest.json 必须包含 windows-x86_64 下载地址。');
    }
  }
}

async function main() {
  await checkBuildOutput();
  await checkDataArtifacts();
  await checkPwaContract();
  await checkReleaseArtifacts();

  const report = {
    generatedAt: new Date().toISOString(),
    budgets: Object.fromEntries(Object.entries(budgets).map(([key, value]) => [key, toBytes(value)])),
    metrics,
    failures,
    warnings,
    status: failures.length === 0 ? 'pass' : 'fail',
  };

  await mkdir(manifestRoot, { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`performance_status: ${report.status}`);
  console.log(`failures: ${failures.length}`);
  console.log(`warnings: ${warnings.length}`);
  console.log(`report: ${reportPath}`);
  for (const item of failures) {
    console.error(`FAIL ${item.rule}: ${item.message}`);
  }
  for (const item of warnings) {
    console.warn(`WARN ${item.rule}: ${item.message}`);
  }

  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
