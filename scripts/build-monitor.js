#!/usr/bin/env node
/**
 * Build monitor
 * Runs the production build, times it, measures the output, and writes
 * build-report.json. Enforces the build-duration budget and the bundle
 * budgets from performance.config.js.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = require('../performance.config.js');
const { checkBundleSize, formatBytes, collectFiles, sum } = require('./check-bundle-size.js');

const ROOT = path.join(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'build-report.json');

function formatDuration(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(2)}s`;
}

/** Total bytes of every file under `dir`. */
function dirSize(dir) {
  return sum(collectFiles(dir, () => true));
}

function runBuild() {
  console.log('▶ Running production build (npm run build:fast)...\n');

  const result = spawnSync('npm', ['run', 'build:fast'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    return { success: false, error: result.error.message };
  }
  if (result.status !== 0) {
    return { success: false, error: 'Command failed: npm run build:fast' };
  }
  return { success: true, error: null };
}

function main() {
  const startTime = Date.now();
  const errors = [];
  const warnings = [];

  const build = runBuild();
  const endTime = Date.now();
  const duration = endTime - startTime;

  if (!build.success) errors.push(build.error);

  // Budget: build duration
  const maxDuration = config.budgets.build.maxDuration;
  if (duration > maxDuration) {
    warnings.push(
      `Build took ${formatDuration(duration)}, over the ${formatDuration(maxDuration)} budget.`
    );
  }

  // Measure output (only meaningful when the build succeeded)
  let bundleSize = null;
  if (build.success) {
    const check = checkBundleSize();
    bundleSize = check.totalJs;
    for (const r of check.results) {
      if (r.status === 'over') {
        errors.push(`${r.name} ${formatBytes(r.size)} exceeds budget ${formatBytes(r.budget)}.`);
      } else if (r.status === 'warn') {
        warnings.push(`${r.name} at ${r.pct.toFixed(0)}% of its budget.`);
      }
    }
  }

  const staticAssetsSize = dirSize(path.join(ROOT, 'public')) + dirSize(path.join(ROOT, '.next', 'static'));

  const report = {
    startTime,
    endTime,
    duration,
    success: build.success && errors.length === 0,
    bundleSize,
    errors,
    warnings,
    performance: { staticAssetsSize },
    durationFormatted: formatDuration(duration),
    timestamp: new Date(endTime).toISOString(),
  };

  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`);

  console.log('\n─── Build report ───');
  console.log(`  status          ${report.success ? '✓ pass' : '✗ fail'}`);
  console.log(`  duration        ${report.durationFormatted}`);
  console.log(`  bundle (JS)     ${bundleSize === null ? 'n/a' : formatBytes(bundleSize)}`);
  console.log(`  static assets   ${formatBytes(staticAssetsSize)}`);
  if (warnings.length) {
    console.log('  warnings:');
    warnings.forEach((w) => console.log(`    ! ${w}`));
  }
  if (errors.length) {
    console.log('  errors:');
    errors.forEach((e) => console.log(`    ✗ ${e}`));
  }
  console.log(`  written to      build-report.json\n`);

  process.exit(report.success ? 0 : 1);
}

main();
