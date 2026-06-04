import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "lib/deploy/publish.css");
const output = path.join(root, "lib/deploy/site.css");

function resolveTailwindCli() {
  const bundledCli = path.join(
    root,
    "node_modules/@tailwindcss/cli/dist/index.mjs",
  );

  if (fs.existsSync(bundledCli)) {
    return [process.execPath, [bundledCli, "-i", input, "-o", output]];
  }

  return ["npx", ["@tailwindcss/cli", "-i", input, "-o", output]];
}

const [command, args] = resolveTailwindCli();

execFileSync(command, args, {
  cwd: root,
  stdio: "inherit",
  shell: command === "npx",
});

console.log(`Generated ${output}`);
