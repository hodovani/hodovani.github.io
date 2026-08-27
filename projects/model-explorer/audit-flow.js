/**
 * Automated Lighthouse User Flow Audit for Hugging Face Model Explorer
 * Tests:
 * 1. Navigation: Explore Dashboard initial load
 * 2. Timespan: Transition when opening details modal (measures CLS, INP, smoothness)
 * 3. Snapshot: Details Modal DOM state (contrast, focus, a11y)
 * 4. Timespan: Transition when closing modal and returning to results
 * 5. Snapshot: Restored results grid state and focus restoration
 */

import { startFlow } from 'lighthouse';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

function getChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const standardMac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  if (fs.existsSync(standardMac)) return standardMac;
  const linuxCandidates = ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  for (const candidate of linuxCandidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return 'google-chrome';
}

const CHROME_PATH = getChromePath();
const TARGET_URL = 'http://127.0.0.1:4000/projects/model-explorer/';
const REPORT_HTML_PATH = path.resolve('projects/model-explorer/user-flow-report.html');

async function runAuditFlow() {
  console.log('🚀 Launching Chrome for Lighthouse User Flow Audit...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log('📊 Starting Lighthouse User Flow...');
    const flow = await startFlow(page, {
      name: 'HF Model Explorer - Full Transition Journey',
      configContext: {
        settingsOverrides: {
          screenEmulation: { disabled: true },
          formFactor: 'desktop'
        }
      }
    });

    // -------------------------------------------------------------
    // Step 1: Navigation - Initial Explore Dashboard
    // -------------------------------------------------------------
    console.log('  1. Navigating to Explore Dashboard...');
    await flow.navigate(TARGET_URL, {
      stepName: '1. Explore Dashboard Initial Load'
    });

    await page.waitForSelector('[data-model-id]', { timeout: 15000 });
    console.log('     ✓ Dashboard loaded with model cards.');

    // -------------------------------------------------------------
    // Step 2: Timespan - Open Details Modal Transition
    // -------------------------------------------------------------
    console.log('  2. Auditing Modal Open Transition (Timespan)...');
    await flow.startTimespan({
      stepName: '2. Card Click & Modal Open Transition'
    });

    await page.click('[data-model-id]');
    await page.waitForSelector('#model-details-dialog[open]', { timeout: 5000 });
    await page.waitForSelector('.details-telemetry-grid', { timeout: 15000 });

    await flow.endTimespan();
    console.log('     ✓ Transition complete: Modal open & telemetry rendered.');

    // -------------------------------------------------------------
    // Step 3: Snapshot - Details Modal Open State
    // -------------------------------------------------------------
    console.log('  3. Auditing Details Modal A11y & Contrast (Snapshot)...');
    await flow.snapshot({
      stepName: '3. Details Modal Open State'
    });
    console.log('     ✓ Modal snapshot captured.');

    // -------------------------------------------------------------
    // Step 4: Timespan - Close Modal Transition
    // -------------------------------------------------------------
    console.log('  4. Auditing Modal Close Transition (Timespan)...');
    await flow.startTimespan({
      stepName: '4. Modal Close & Focus Return Transition'
    });

    await page.click('#btn-close-details');
    await page.waitForFunction(() => {
      const d = document.querySelector('#model-details-dialog');
      return !d || !d.open;
    }, { timeout: 5000 });

    await flow.endTimespan();
    console.log('     ✓ Transition complete: Modal closed.');

    // -------------------------------------------------------------
    // Step 5: Snapshot - Restored Dashboard State
    // -------------------------------------------------------------
    console.log('  5. Auditing Restored Results Grid (Snapshot)...');
    await flow.snapshot({
      stepName: '5. Restored Results Grid'
    });
    console.log('     ✓ Restored state captured.');

    // -------------------------------------------------------------
    // Report Generation
    // -------------------------------------------------------------
    console.log('📝 Generating User Flow Report...');
    const reportHtml = await flow.generateReport();
    fs.writeFileSync(REPORT_HTML_PATH, reportHtml);
    console.log(`✅ Flow Report written to: ${REPORT_HTML_PATH}`);

    const flowResult = await flow.createFlowResult();
    console.log('\n================ USER FLOW SUMMARY ================');
    flowResult.steps.forEach((step, idx) => {
      console.log(`\nStep ${idx + 1}: ${step.name} (${step.mode})`);
      if (step.categories) {
        for (const [catKey, cat] of Object.entries(step.categories)) {
          console.log(`   - ${cat.title}: ${(cat.score * 100).toFixed(0)}`);
        }
      }
    });
    console.log('\n===================================================');

  } finally {
    await browser.close();
  }
}

runAuditFlow().catch((err) => {
  console.error('Error running user flow audit:', err);
  process.exit(1);
});
