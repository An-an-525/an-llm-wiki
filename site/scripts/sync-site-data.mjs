import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const vaultRoot = resolve(siteRoot, "..");
const source = resolve(vaultRoot, "site-data");
const target = resolve(siteRoot, "public", "site-data");

if (!existsSync(source)) {
  throw new Error(
    "Missing ../site-data. Run `python scripts/build_site_data.py .` from the vault root first.",
  );
}

await mkdir(resolve(siteRoot, "public"), { recursive: true });
await rm(target, { recursive: true, force: true });
await cp(source, target, { recursive: true });

console.log(`synced site-data: ${source} -> ${target}`);
