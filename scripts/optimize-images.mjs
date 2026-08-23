#!/usr/bin/env node
/**
 * Re-encodes oversized raster images under public/images so the repo and
 * deployments stay small. next/image still resizes at request time; this
 * only fixes the *source* files (an 8K photo or a 3 MB PNG illustration is
 * slow for the optimizer to fetch and pointless to ship).
 *
 * Rules:
 *   - Opaque PNG/JPEG wider than MAX_WIDTH or larger than MAX_BYTES is
 *     resized to MAX_WIDTH and re-encoded as JPEG (mozjpeg, QUALITY).
 *   - Images with an alpha channel (UI screenshots, logos) are left alone.
 *   - When the extension changes (.png → .jpg) every reference in app/,
 *     components/, content/, and lib/ is rewritten.
 *
 * Usage:
 *   node scripts/optimize-images.mjs          # dry run
 *   node scripts/optimize-images.mjs --write  # apply
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const REFERENCE_DIRS = ["app", "components", "content", "lib"].map((d) =>
  path.join(ROOT, d)
);
const MAX_WIDTH = 1600;
const MAX_BYTES = 400 * 1024;
const QUALITY = 82;
const WRITE = process.argv.includes("--write");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function rewriteReferences(fromPublicPath, toPublicPath) {
  let touched = 0;
  for (const dir of REFERENCE_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const file of walk(dir)) {
      if (!/\.(tsx?|mdx?|jsx?|css)$/.test(file)) continue;
      const src = fs.readFileSync(file, "utf8");
      if (!src.includes(fromPublicPath)) continue;
      fs.writeFileSync(file, src.split(fromPublicPath).join(toPublicPath));
      touched++;
    }
  }
  return touched;
}

const fmt = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

let before = 0;
let after = 0;

for (const file of walk(IMAGES_DIR)) {
  if (!/\.(png|jpe?g)$/i.test(file)) continue;
  const stat = fs.statSync(file);
  const meta = await sharp(file).metadata();
  const tooWide = (meta.width ?? 0) > MAX_WIDTH;
  const tooBig = stat.size > MAX_BYTES;
  if (!tooWide && !tooBig) continue;
  if (meta.hasAlpha) {
    console.log(`skip (alpha)  ${path.relative(ROOT, file)} ${fmt(stat.size)}`);
    continue;
  }

  const target = file.replace(/\.(png|jpe?g)$/i, ".jpg");
  const buffer = await sharp(file)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toBuffer();

  before += stat.size;
  after += buffer.length;
  console.log(
    `${WRITE ? "write" : "would"}  ${path.relative(ROOT, file)} ${meta.width}x${meta.height} ${fmt(stat.size)} → ${path.basename(target)} ${fmt(buffer.length)}`
  );

  if (!WRITE) continue;
  fs.writeFileSync(target, buffer);
  if (target !== file) {
    fs.unlinkSync(file);
    const fromRef = "/" + path.relative(path.join(ROOT, "public"), file);
    const toRef = "/" + path.relative(path.join(ROOT, "public"), target);
    const touched = rewriteReferences(fromRef, toRef);
    console.log(`        references updated in ${touched} file(s)`);
  }
}

console.log(
  `\n${WRITE ? "Saved" : "Would save"} ${fmt(before - after)} (${fmt(before)} → ${fmt(after)})${WRITE ? "" : ". Re-run with --write to apply."}`
);
