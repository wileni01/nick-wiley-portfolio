#!/usr/bin/env node
/**
 * Captures the portfolio's product and case-study images with headless
 * Chrome, then normalizes them with sharp.
 *
 * Two kinds of source:
 *   - live URLs: real screenshots of shipped products
 *   - scripts/mockups/*.html: representative recreations of internal
 *     government tools whose real screens can't be published. Each page is
 *     hand-built from the facts in the matching content/work/*.mdx file.
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs            # everything
 *   node scripts/capture-screenshots.mjs pulse adcc # only these ids
 *
 * Requires Google Chrome at the default macOS location (override with
 * CHROME_PATH). Output goes to public/images/projects/<id>.jpg at 1600px.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "images", "projects");
const MOCKUP_DIR = path.join(ROOT, "scripts", "mockups");
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

/** @type {Array<{id: string, url?: string, mockup?: string, width?: number, height?: number, wait?: number, optional?: boolean}>} */
const TARGETS = [
  // ── Live products ─────────────────────────────────────────────
  { id: "gettysburg-tours", url: "https://www.gettysburgtours.com", wait: 6000 },
  { id: "gettysburg-leadership", url: "https://www.gettysburgleadership.com", wait: 8000 },
  { id: "lli-vistage", url: "https://llivistage-vistage-site.vercel.app", wait: 6000, height: 900 },
  { id: "lli-purdue", url: "https://lli-purdue.vercel.app", wait: 6000 },
  // Protected by Vercel Authentication: pass a share link via LLI_ASSESSMENT_URL
  // (vercel.com → project → Share) when re-capturing.
  { id: "lli-assessment", url: process.env.LLI_ASSESSMENT_URL, wait: 7000, height: 900, optional: true },
  // The portfolio itself, captured from a local production build (`next start -p 3200`).
  { id: "portfolio-home", url: "http://localhost:3200/", wait: 6000, optional: true },

  // ── Representative recreations of internal tools ─────────────
  { id: "panel-wizard", mockup: "panel-wizard.html" },
  { id: "proposal-triage", mockup: "proposal-triage.html" },
  { id: "adcc", mockup: "adcc.html", height: 900 },
  { id: "robora", mockup: "robora.html" },
  { id: "telemetry", mockup: "telemetry.html" },
  { id: "researcher-lineage", mockup: "researcher-lineage.html" },
  { id: "usda-organic", mockup: "usda-organic.html", wait: 5000 },
  { id: "recovery-oversight", mockup: "recovery-oversight.html", wait: 7000 },
  { id: "study-halls", mockup: "study-halls.html" },
  { id: "golden-record", mockup: "golden-record.html", height: 900 },
  { id: "casekit", mockup: "casekit.html" },
  { id: "tour-app", mockup: "tour-app.html" },
];

function captureWithChrome(url, pngPath, { width = 1600, height = 1000, wait = 3000 } = {}) {
  return new Promise((resolve, reject) => {
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "nw-shot-"));
    const args = [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      "--disable-sync",
      "--force-device-scale-factor=1",
      `--window-size=${width},${height}`,
      `--timeout=${wait}`,
      `--user-data-dir=${profile}`,
      `--screenshot=${pngPath}`,
      url,
    ];
    const child = spawn(CHROME, args, { stdio: "ignore" });
    // Chrome sometimes lingers after writing the file; don't wait on it.
    const killer = setTimeout(() => child.kill("SIGKILL"), wait + 20000);
    const poll = setInterval(() => {
      if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 0) {
        // Give Chrome a moment to finish flushing, then stop it.
        setTimeout(() => {
          clearInterval(poll);
          clearTimeout(killer);
          child.kill("SIGKILL");
          fs.rmSync(profile, { recursive: true, force: true });
          resolve(pngPath);
        }, 500);
      }
    }, 250);
    child.on("exit", () => {
      clearInterval(poll);
      clearTimeout(killer);
      fs.rmSync(profile, { recursive: true, force: true });
      if (fs.existsSync(pngPath)) resolve(pngPath);
      else reject(new Error(`Chrome exited without writing ${pngPath}`));
    });
  });
}

async function run() {
  const only = process.argv.slice(2);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "nw-capture-"));

  for (const t of TARGETS) {
    if (only.length && !only.includes(t.id)) continue;
    if (t.optional && !t.url) { console.log(`${t.id.padEnd(24)} skipped (no URL configured)`); continue; }
    if (t.optional && !only.includes(t.id)) continue; // optional targets run only when named
    const url = t.url ?? pathToFileURL(path.join(MOCKUP_DIR, t.mockup)).href;
    const png = path.join(tmp, `${t.id}.png`);
    const out = path.join(OUT_DIR, `${t.id}.jpg`);
    process.stdout.write(`${t.id.padEnd(24)} ${t.url ? "live   " : "mockup "} `);
    try {
      await captureWithChrome(url, png, { width: t.width, height: t.height, wait: t.wait });
      const buf = await sharp(png)
        .resize({ width: 1600, withoutEnlargement: true })
        .jpeg({ quality: 86, mozjpeg: true })
        .toBuffer();
      fs.writeFileSync(out, buf);
      console.log(`→ ${path.relative(ROOT, out)} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      process.exitCode = 1;
    }
  }
  fs.rmSync(tmp, { recursive: true, force: true });
}

run();
