import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "lib/deploy/publish.css");
const output = path.join(root, "lib/deploy/site.css");
const tailwindCli = path.join(
  root,
  "node_modules/@tailwindcss/cli/dist/index.mjs",
);

execFileSync(process.execPath, [tailwindCli, "-i", input, "-o", output], {
  cwd: root,
  stdio: "inherit",
});

console.log(`Generated ${output}`);
