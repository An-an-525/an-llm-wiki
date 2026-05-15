import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const currentTauriConfigPath = path.join(root, 'src-tauri', 'tauri.conf.json');
const androidAssetsDir = path.join(root, 'src-tauri', 'gen', 'android', 'app', 'src', 'main', 'assets');
const tauriConfigPath = path.join(androidAssetsDir, 'tauri.conf.json');

const excludedTopLevel = new Set([
  'downloads',
  'updates',
]);

async function exists(target) {
  try {
    await readdir(target);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(distDir))) {
    throw new Error(`Missing dist directory: ${distDir}. Run npm run build first.`);
  }

  await mkdir(androidAssetsDir, { recursive: true });

  let tauriConfig = '';
  try {
    tauriConfig = await readFile(currentTauriConfigPath, 'utf8');
  } catch {
    tauriConfig = '';
  }

  await rm(androidAssetsDir, { recursive: true, force: true });
  await mkdir(androidAssetsDir, { recursive: true });

  const entries = await readdir(distDir, { withFileTypes: true });
  for (const entry of entries) {
    if (excludedTopLevel.has(entry.name)) continue;
    const source = path.join(distDir, entry.name);
    const target = path.join(androidAssetsDir, entry.name);
    await cp(source, target, { recursive: true, force: true });
  }

  if (tauriConfig) {
    await writeFile(tauriConfigPath, tauriConfig, 'utf8');
  }

  console.log(`Prepared Android assets at ${androidAssetsDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
