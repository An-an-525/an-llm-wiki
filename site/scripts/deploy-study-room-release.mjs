import { access, readFile, rm } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawn } from 'node:child_process';
import { basename, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const distRoot = resolve(siteRoot, 'dist');

const releaseId = (process.env.AN_STUDY_ROOM_RELEASE_ID || new Date().toISOString())
  .replace(/[:]/g, '-')
  .replace(/\.\d{3}Z$/, 'Z');
const remoteRoot = String(process.env.AN_STUDY_ROOM_REMOTE_FRONTEND_ROOT || '/opt/an-study-room/frontend').trim().replace(/\/+$/, '');
const remoteReleaseDir = `${remoteRoot}/releases/${releaseId}`;
const remoteCurrentDir = `${remoteRoot}/current`;
const remoteTmpDir = `/tmp/an-study-room-${releaseId}`;
const sshHost = String(process.env.AN_STUDY_ROOM_DEPLOY_HOST || '').trim();
const sshUser = String(process.env.AN_STUDY_ROOM_DEPLOY_USER || 'root').trim();
const sshPort = String(process.env.AN_STUDY_ROOM_DEPLOY_PORT || '22').trim();
const sshKeyPath = String(process.env.AN_STUDY_ROOM_DEPLOY_KEY_PATH || '').trim();
const archivePath = resolve(tmpdir(), `an-study-room-dist-${releaseId}.tar.gz`);

async function ensureReadable(path) {
  await access(path, constants.R_OK);
}

async function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: siteRoot,
      stdio: 'inherit',
      shell: false,
      windowsHide: true,
      ...options,
    });

    child.on('error', rejectPromise);
    child.on('close', (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
    });
  });
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function collectDownloadFiles(releaseManifest) {
  const files = releaseManifest?.files || {};
  return Object.values(files)
    .map((file) => file?.path)
    .filter((filePath) => typeof filePath === 'string' && filePath.startsWith('/downloads/'))
    .map((filePath) => {
      const name = basename(filePath);
      return {
        name,
        localPath: resolve(distRoot, 'downloads', name),
        remoteTmpPath: `${remoteTmpDir}/${name}`,
      };
    });
}

if (!sshHost) {
  throw new Error('Missing AN_STUDY_ROOM_DEPLOY_HOST.');
}

await ensureReadable(resolve(distRoot, 'index.html'));
await ensureReadable(resolve(distRoot, 'downloads', 'release.json'));
await ensureReadable(resolve(distRoot, 'updates', 'latest.json'));
await ensureReadable(resolve(distRoot, 'site-data', 'adapter.json'));
const releaseManifest = JSON.parse(await readFile(resolve(distRoot, 'downloads', 'release.json'), 'utf8'));
const downloadFiles = collectDownloadFiles(releaseManifest);
for (const file of downloadFiles) {
  await ensureReadable(file.localPath);
}

const sshArgs = ['-p', sshPort];
if (sshKeyPath) {
  await ensureReadable(sshKeyPath);
  sshArgs.push('-i', sshKeyPath);
}

const scpArgsBase = ['-P', sshPort];
if (sshKeyPath) {
  scpArgsBase.push('-i', sshKeyPath);
}

await runCommand('tar', [
  '-C',
  distRoot,
  '--exclude=./downloads',
  '--exclude=./updates',
  '-czf',
  archivePath,
  '.',
]);

await runCommand('ssh', [...sshArgs, `${sshUser}@${sshHost}`, `mkdir -p ${shellQuote(remoteReleaseDir)} ${shellQuote(remoteTmpDir)}`]);
await runCommand('scp', [...scpArgsBase, archivePath, `${sshUser}@${sshHost}:${remoteTmpDir}/dist.tar.gz`]);
await runCommand('scp', [...scpArgsBase, resolve(distRoot, 'downloads', 'release.json'), `${sshUser}@${sshHost}:${remoteTmpDir}/release.json`]);
await runCommand('scp', [...scpArgsBase, resolve(distRoot, 'updates', 'latest.json'), `${sshUser}@${sshHost}:${remoteTmpDir}/latest.json`]);
await runCommand('scp', [...scpArgsBase, resolve(distRoot, 'site-data', 'adapter.json'), `${sshUser}@${sshHost}:${remoteTmpDir}/adapter.json`]);
for (const file of downloadFiles) {
  await runCommand('scp', [...scpArgsBase, file.localPath, `${sshUser}@${sshHost}:${file.remoteTmpPath}`]);
}

const copyDownloadCommands = downloadFiles.map((file) => {
  const target = `${remoteReleaseDir}/dist/downloads/${file.name}`;
  return `cp ${shellQuote(file.remoteTmpPath)} ${shellQuote(target)}`;
});

const remoteCommands = [
  `set -e`,
  `mkdir -p ${shellQuote(`${remoteReleaseDir}/dist`)}`,
  `tar -xzf ${shellQuote(`${remoteTmpDir}/dist.tar.gz`)} -C ${shellQuote(`${remoteReleaseDir}/dist`)}`,
  `if [ -d ${shellQuote(`${remoteCurrentDir}/dist/downloads`)} ]; then cp -a ${shellQuote(`${remoteCurrentDir}/dist/downloads`)} ${shellQuote(`${remoteReleaseDir}/dist/downloads`)}; else mkdir -p ${shellQuote(`${remoteReleaseDir}/dist/downloads`)}; fi`,
  `if [ -d ${shellQuote(`${remoteCurrentDir}/dist/updates`)} ]; then cp -a ${shellQuote(`${remoteCurrentDir}/dist/updates`)} ${shellQuote(`${remoteReleaseDir}/dist/updates`)}; else mkdir -p ${shellQuote(`${remoteReleaseDir}/dist/updates`)}; fi`,
  `cp ${shellQuote(`${remoteTmpDir}/release.json`)} ${shellQuote(`${remoteReleaseDir}/dist/downloads/release.json`)}`,
  `cp ${shellQuote(`${remoteTmpDir}/latest.json`)} ${shellQuote(`${remoteReleaseDir}/dist/updates/latest.json`)}`,
  ...copyDownloadCommands,
  `ln -sfn ${shellQuote(remoteReleaseDir)} ${shellQuote(remoteCurrentDir)}`,
  `mkdir -p /opt/an-study-room/backend/current/public/site-data`,
  `cp ${shellQuote(`${remoteTmpDir}/adapter.json`)} /opt/an-study-room/backend/current/public/site-data/adapter.json`,
  `systemctl restart an-study-room-xiaoan.service`,
  `rm -rf ${shellQuote(remoteTmpDir)}`,
  `test -f ${shellQuote(`${remoteCurrentDir}/dist/index.html`)}`,
  `test -f ${shellQuote(`${remoteCurrentDir}/dist/downloads/release.json`)}`,
  `test -f ${shellQuote(`${remoteCurrentDir}/dist/updates/latest.json`)}`,
].join(' && ');

await runCommand('ssh', [...sshArgs, `${sshUser}@${sshHost}`, remoteCommands]);
await rm(archivePath, { force: true });
console.log(`deployed study-room release ${releaseManifest.version} -> ${sshHost}:${remoteReleaseDir}`);
