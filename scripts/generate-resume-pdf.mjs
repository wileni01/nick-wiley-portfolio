import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const url = new URL("/resume", process.argv[2] ?? "http://localhost:3000");
const html = await fetch(url);
if (!html.ok || !(await html.text()).includes("Lead IT Architect")) {
  throw new Error(`An updated résumé must be running at ${url}`);
}

const profile = mkdtempSync(join(tmpdir(), "nick-wiley-resume-"));
const output = fileURLToPath(new URL("../public/resume/nick-wiley-resume.pdf", import.meta.url));
const pending = output + ".tmp";
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

try {
  const result = spawnSync(chrome, [
    "--headless=new",
    "--disable-gpu",
    "--no-pdf-header-footer",
    `--user-data-dir=${profile}`,
    `--print-to-pdf=${pending}`,
    url.href,
  ], { encoding: "utf-8", timeout: 30000 });

  if (result.error) throw result.error;
  if (result.status !== 0 || !readFileSync(pending).subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new Error(result.stderr || "Chrome did not create a PDF.");
  }

  renameSync(pending, output);
  console.log(`Saved ${output}`);
} finally {
  rmSync(profile, { recursive: true, force: true });
  rmSync(pending, { force: true });
}
