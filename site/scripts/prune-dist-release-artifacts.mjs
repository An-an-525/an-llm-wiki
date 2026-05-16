import { rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distRoot = resolve(siteRoot, 'dist');
const releaseArtifactDirs = ['downloads', 'updates'];

for (const dir of releaseArtifactDirs) {
  await rm(resolve(distRoot, dir), { recursive: true, force: true });
}

console.log('pruned release artifacts from embedded dist: downloads, updates');
