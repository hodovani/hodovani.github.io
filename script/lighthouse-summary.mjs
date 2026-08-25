import fs from 'node:fs';
import path from 'node:path';

function formatScore(score) {
  const val = Math.round(score * 100);
  if (val >= 90) return `🟢 ${val}`;
  if (val >= 50) return `🟡 ${val}`;
  return `🔴 ${val}`;
}

export function generateLighthouseSummary(lhDir = '.lighthouseci') {
  const linksPath = path.join(lhDir, 'links.json');
  if (!fs.existsSync(linksPath)) {
    return 'No Lighthouse CI results found.';
  }

  const links = JSON.parse(fs.readFileSync(linksPath, 'utf-8'));
  const files = fs.readdirSync(lhDir).filter((f) => f.startsWith('lhr-') && f.endsWith('.json'));

  const reportsByUrl = new Map();

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(lhDir, file), 'utf-8'));
    const url = raw.requestedUrl || raw.finalDisplayedUrl || raw.finalUrl;
    reportsByUrl.set(url, raw);
  }

  let table = `### ⚡ Lighthouse CI Audit Results\n\n`;
  table += `| Page | Performance | Accessibility | Best Practices | SEO | Detailed Report |\n`;
  table += `| :--- | :---: | :---: | :---: | :---: | :--- |\n`;

  for (const [url, reportLink] of Object.entries(links)) {
    const report = reportsByUrl.get(url);
    const pathname = new URL(url).pathname || '/';
    
    if (report && report.categories) {
      const perf = formatScore(report.categories.performance?.score ?? 0);
      const a11y = formatScore(report.categories.accessibility?.score ?? 0);
      const bp = formatScore(report.categories['best-practices']?.score ?? 0);
      const seo = formatScore(report.categories.seo?.score ?? 0);

      table += `| \`${pathname}\` | ${perf} | ${a11y} | ${bp} | ${seo} | [View Report](${reportLink}) |\n`;
    } else {
      table += `| \`${pathname}\` | — | — | — | — | [View Report](${reportLink}) |\n`;
    }
  }

  return table;
}

if (process.argv[1]?.endsWith('lighthouse-summary.mjs')) {
  const summary = generateLighthouseSummary();
  console.log(summary);

  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${summary}\n`);
  }
}
