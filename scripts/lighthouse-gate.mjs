#!/usr/bin/env node
// Real build gate, not just a report: exits non-zero if SEO or Accessibility
// drops below THRESHOLD on any of PAGES. Requires a prior `npm run build` --
// deliberately doesn't build itself, so a stale build can't silently mask a
// regression a CI step expects to be testing against fresh output.
import { execSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const PORT = process.env.LIGHTHOUSE_PORT ?? "4173";
const BASE_URL = `http://localhost:${PORT}`;
const THRESHOLD = 95;
const PAGES = [
  { name: "home", path: "/" },
  { name: "product/score", path: "/product/score" },
  { name: "pricing", path: "/pricing" },
];

// BUILD_ID specifically, not just the directory -- `next dev` also populates
// .next (with dev-mode artifacts, no BUILD_ID), so checking the directory
// alone doesn't actually prove a production build exists. Learned this the
// hard way: `next start` bound the port fine and returned a real HTTP
// response, just a 500 "no production build found" page, which the naive
// waitForServer(res.ok) check misread as "still starting up" until timeout.
if (!existsSync(join(process.cwd(), ".next", "BUILD_ID"))) {
  console.error("No production build found (.next/BUILD_ID missing). Run `npm run build` first -- this gate tests a production build, not the dev server.");
  process.exit(1);
}

function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) return resolve();
      } catch {
        // not up yet
      }
      if (Date.now() > deadline) return reject(new Error(`Server didn't respond at ${url} within ${timeoutMs}ms`));
      setTimeout(tick, 500);
    };
    tick();
  });
}

async function main() {
  const server = spawn("npx", ["next", "start", "-p", PORT], { stdio: "inherit" });
  const tmpDir = mkdtempSync(join(tmpdir(), "lighthouse-gate-"));
  let exitCode = 0;

  try {
    await waitForServer(BASE_URL);

    const results = [];
    for (const page of PAGES) {
      const outPath = join(tmpDir, `${page.name.replace(/\//g, "_")}.json`);
      execSync(
        `npx lighthouse "${BASE_URL}${page.path}" --only-categories=seo,accessibility --output=json --output-path="${outPath}" --chrome-flags="--headless" --quiet`,
        { stdio: ["ignore", "ignore", "inherit"] },
      );
      const report = JSON.parse(readFileSync(outPath, "utf8"));
      results.push({
        ...page,
        seo: Math.round(report.categories.seo.score * 100),
        a11y: Math.round(report.categories.accessibility.score * 100),
      });
    }

    console.log("\nLighthouse gate (threshold: %d)", THRESHOLD);
    console.log("%s | %s | %s", "Page".padEnd(20), "SEO".padEnd(5), "A11y".padEnd(5));
    for (const r of results) {
      const pass = r.seo >= THRESHOLD && r.a11y >= THRESHOLD;
      console.log("%s | %s | %s %s", r.name.padEnd(20), String(r.seo).padEnd(5), String(r.a11y).padEnd(5), pass ? "✓" : "✗ FAIL");
    }

    const failed = results.filter((r) => r.seo < THRESHOLD || r.a11y < THRESHOLD);
    if (failed.length > 0) {
      console.error(`\n${failed.length} page(s) below the ${THRESHOLD} threshold.`);
      exitCode = 1;
    } else {
      console.log("\nAll pages pass.");
    }
  } finally {
    server.kill();
    rmSync(tmpDir, { recursive: true, force: true });
  }

  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
