import { spawn } from 'node:child_process';
import net from 'node:net';

const host = process.env.AN_STUDY_ROOM_DEV_HOST || '127.0.0.1';
const port = Number(process.env.AN_STUDY_ROOM_DEV_PORT || 5173);
const baseUrl = `http://${host}:${port}`;
const manifestUrl = `${baseUrl}/manifest.webmanifest`;

function npmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function isPortOpen() {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.setTimeout(1000, () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function canReuseExistingServer() {
  try {
    const response = await fetch(manifestUrl, { redirect: 'manual' });
    if (!response.ok) {
      return false;
    }

    const text = await response.text();
    return text.includes('"name": "藏馆 · 个人资料库"') || text.includes('"short_name": "藏馆"');
  } catch {
    return false;
  }
}

function runSyncSiteData() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['scripts/sync-site-data.mjs'], {
      stdio: 'inherit',
      env: process.env,
      windowsHide: true,
      shell: false,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`sync-site-data exited with code ${code ?? 'unknown'}`));
    });
  });
}

async function main() {
  await runSyncSiteData();

  if (await canReuseExistingServer()) {
    console.log(`[tauri] reusing existing Vite dev server at ${baseUrl}`);
    return;
  }

  if (await isPortOpen()) {
    throw new Error(`${baseUrl} 已被别的服务占用，请先释放端口或换一个开发端口。`);
  }

  const child = spawn(
    npmCommand(),
    ['run', 'dev:raw', '--', '--host', host, '--port', String(port)],
    {
      stdio: 'inherit',
      env: process.env,
      windowsHide: true,
      shell: process.platform === 'win32',
    },
  );

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on('SIGINT', forwardSignal);
  process.on('SIGTERM', forwardSignal);

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });
}

await main();
