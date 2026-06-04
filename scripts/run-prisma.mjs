import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Next.js uses .env.local; Prisma CLI only reads .env by default.
config({ path: path.join(root, ".env") });
config({ path: path.join(root, ".env.local"), override: true });

const prismaArgs = process.argv.slice(2);
if (prismaArgs.length === 0) {
  console.error("Usage: node scripts/run-prisma.mjs <prisma-args...>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Add it to .env.local (or .env) and try again.",
  );
  process.exit(1);
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";

execFileSync(npx, ["prisma", ...prismaArgs], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: process.platform === "win32",
});
