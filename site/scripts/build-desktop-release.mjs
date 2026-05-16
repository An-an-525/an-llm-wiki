import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, '..');
const defaultPrivateKeyPath = resolve(homedir(), '.tauri', 'an-study-room-updater.key');

async function tryReadKeyFile(candidatePath) {
  if (!candidatePath || !candidatePath.trim()) {
    return null;
  }

  const normalizedPath = candidatePath.trim();
  try {
    await access(normalizedPath, constants.R_OK);
  } catch {
    return null;
  }

  return {
    keyContent: (await readFile(normalizedPath, 'utf8')).trim(),
    keyPath: normalizedPath,
  };
}

async function resolveSigningKey() {
  const directKeyInput = process.env.TAURI_SIGNING_PRIVATE_KEY?.trim();
  const configuredKeyPath = process.env.TAURI_SIGNING_PRIVATE_KEY_PATH?.trim();

  if (directKeyInput) {
    const fileBackedKey = await tryReadKeyFile(directKeyInput);
    if (fileBackedKey) {
      return fileBackedKey;
    }

    return {
      keyContent: directKeyInput,
      keyPath: '',
    };
  }

  const configuredFileKey = await tryReadKeyFile(configuredKeyPath);
  if (configuredFileKey) {
    return configuredFileKey;
  }

  const defaultFileKey = await tryReadKeyFile(defaultPrivateKeyPath);
  if (defaultFileKey) {
    return defaultFileKey;
  }

  throw new Error(
    [
      'Missing updater signing key.',
      'Provide TAURI_SIGNING_PRIVATE_KEY as key content or a readable file path,',
      'or set TAURI_SIGNING_PRIVATE_KEY_PATH,',
      `or place the key at ${defaultPrivateKeyPath}.`,
    ].join(' '),
  );
}

const signingKey = await resolveSigningKey();
const sharedEnv = {
  ...process.env,
  TAURI_SIGNING_PRIVATE_KEY: signingKey.keyContent,
  AN_STUDY_ROOM_PUBLIC_BASE_URL: process.env.AN_STUDY_ROOM_PUBLIC_BASE_URL || 'https://an520.xin/study-room',
  TAURI_SIGNING_PRIVATE_KEY_PASSWORD: process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD ?? '',
};

if (signingKey.keyPath) {
  sharedEnv.TAURI_SIGNING_PRIVATE_KEY_PATH = signingKey.keyPath;
} else {
  delete sharedEnv.TAURI_SIGNING_PRIVATE_KEY_PATH;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: siteRoot,
      env: sharedEnv,
      stdio: 'inherit',
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

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

await runCommand(npmCommand, ['exec', 'tauri', 'build'], {
  shell: process.platform === 'win32',
});
await runCommand(process.execPath, [resolve(scriptDir, 'prepare-desktop-release.mjs')], {
  shell: false,
});
