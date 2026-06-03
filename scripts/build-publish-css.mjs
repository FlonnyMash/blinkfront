import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const input = path.join(root, "lib/deploy/publish.css");
const output = path.join(root, "lib/deploy/site.css");

execFileSync(
  "npx",
  ["@tailwindcss/cli", "-i", input, "-o", output],
  { cwd: root, stdio: "inherit", shell: true },
);

console.log(`Generated ${output}`);
