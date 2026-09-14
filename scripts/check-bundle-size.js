#!/usr/bin/env node
/**
 * Bundle size checker
 * Measures the built client bundle and compares it against the budgets in
 * performance.config.js. Exits non-zero when a budget is exceeded so it can
 * gate CI; warns at the configured warning threshold.
 */

const fs = require('fs');
const path = require('path');

const config = require('../performance.config.js');

const ROOT = path.join(__dirname, '..');
const STATIC_DIR = path.join(ROOT, '.next', 'static');

const { warning: WARN_PCT, error: ERROR_PCT } = config.monitoring.reportThresholds;

/** Recursively collect files under `dir` matching `filter`. */
function collectFiles(dir, filter, acc = []) {
  if (!fs.existsSync(dir)) return acc;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, filter, acc);
    } else if (filter(full)) {
      acc.push({ path: full, size: fs.statSync(full).size });
    }
  }
  return acc;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function sum(files) {
  return files.reduce((total, file) => total + file.size, 0);
}

/**
 * Compare one measurement against its budget.
 * @returns {{name: string, size: number, budget: number, pct: number, status: 'ok'|'warn'|'over'}}
 */
function evaluate(name, size, budget) {
  const pct = budget > 0 ? (size / budget) * 100 : 0;
  let status = 'ok';
  if (pct >= ERROR_PCT) status = 'over';
  else if (pct >= WARN_PCT) status = 'warn';
  return { name, size, budget, pct, status };
}

function checkBundleSize() {
  if (!fs.existsSync(STATIC_DIR)) {
    console.error('✗ No build output found at .next/static — run `npm run build` first.');
    return { ok: false, results: [], totalJs: null };
  }

  // `next dev` also populates .next/static, but with unminified HMR chunks that
  // are meaningless against a production budget. Refuse rather than report noise.
  const isDevOutput =
    !fs.existsSync(path.join(ROOT, '.next', 'BUILD_ID')) ||
    fs.existsSync(path.join(STATIC_DIR, 'development'));

  if (isDevOutput) {
    console.error(
      '✗ .next/ holds a development build (no BUILD_ID). Bundle budgets only\n' +
        '  apply to production output — run `npm run build` first.'
    );
    return { ok: false, results: [], totalJs: null };
  }

  const jsFiles = collectFiles(STATIC_DIR, (f) => f.endsWith('.js'));
  const cssFiles = collectFiles(STATIC_DIR, (f) => f.endsWith('.css'));
  const vendorFiles = jsFiles.filter((f) => /vendors?[-.]/.test(path.basename(f.path)));

  const totalJs = sum(jsFiles);
  const vendorJs = sum(vendorFiles);
  const appJs = totalJs - vendorJs;
  const totalCss = sum(cssFiles);

  const { bundleSize, assets } = config.budgets;
  const results = [
    evaluate('Total JavaScript', totalJs, bundleSize.total),
    evaluate('Vendor chunks', vendorJs, bundleSize.vendor),
    evaluate('App code', appJs, bundleSize.app),
    evaluate('CSS', totalCss, assets.css),
  ];

  const icons = { ok: '✓', warn: '!', over: '✗' };
  console.log('\nBundle size vs. budget (performance.config.js)\n');
  for (const r of results) {
    console.log(
      `  ${icons[r.status]} ${r.name.padEnd(18)} ${formatBytes(r.size).padStart(10)}` +
        ` / ${formatBytes(r.budget).padStart(10)}  (${r.pct.toFixed(0)}%)`
    );
  }

  const over = results.filter((r) => r.status === 'over');
  const warn = results.filter((r) => r.status === 'warn');

  console.log('');
  if (over.length) {
    console.error(`✗ ${over.length} budget(s) exceeded: ${over.map((r) => r.name).join(', ')}`);
  } else if (warn.length) {
    console.warn(`! Within budget, but ${warn.map((r) => r.name).join(', ')} above ${WARN_PCT}%.`);
  } else {
    console.log('✓ All bundle budgets met.');
  }
  console.log(`  ${jsFiles.length} JS file(s), ${cssFiles.length} CSS file(s) measured.\n`);

  return { ok: over.length === 0, results, totalJs };
}

module.exports = { checkBundleSize, formatBytes, collectFiles, sum };

if (require.main === module) {
  const { ok } = checkBundleSize();
  process.exit(ok ? 0 : 1);
}
