import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCREENSHOTS_DIR = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = process.env.BASE_URL || "https://career-wave-hm4q.vercel.app";
const COMPANY_SESSION_TOKEN = "streamify-demo-token-123";

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function captureAll() {
  console.log(`\n======================================================`);
  console.log(`🚀 Career Wave Automated Platform Discovery & Capture`);
  console.log(`Target URL: ${BASE_URL}`);
  console.log(`Chrome Executable: ${CHROME_PATH}`);
  console.log(`Output Directory: ${SCREENSHOTS_DIR}`);
  console.log(`======================================================\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1920,1080',
    ],
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 2,
    },
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  async function snap(filename, options = {}) {
    const filePath = path.join(SCREENSHOTS_DIR, filename);
    await wait(options.delay || 1200);
    await page.screenshot({
      path: filePath,
      fullPage: options.fullPage ?? false,
    });
    const stats = fs.statSync(filePath);
    console.log(`📸 [SAVED] ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  try {
    // 1. Landing Hero Viewport
    console.log('[1/12] Capturing Homepage Hero Viewport...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 35000 });
    await snap('01-landing-hero.png', { fullPage: false, delay: 1200 });

    // 2. Landing Full Overview
    console.log('[2/12] Capturing Homepage Full Page Overview...');
    await snap('02-landing-full-overview.png', { fullPage: true, delay: 1000 });

    // 3. Jobs Directory & Search Filters
    console.log('[3/12] Capturing Jobs Directory & Filters (/jobs)...');
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle0', timeout: 35000 });
    await snap('03-jobs-search-directory.png', { fullPage: false, delay: 1500 });

    // 4. Job Details Overview
    const sampleJobUrl = `${BASE_URL}/job/2e829fae-0f86-4f53-b895-c5b002026717`;
    console.log(`[4/12] Capturing Job Details Overview (${sampleJobUrl})...`);
    await page.goto(sampleJobUrl, { waitUntil: 'networkidle0', timeout: 35000 });
    await snap('04-job-details-overview.png', { fullPage: false, delay: 1500 });

    // 5. AI Resume & ATS Matcher in focus
    console.log('[5/12] Capturing AI Resume & ATS Matcher...');
    await page.evaluate(() => {
      window.scrollTo({ top: 140, behavior: 'instant' });
    });
    await snap('05-ai-resume-ats-matcher.png', { fullPage: false, delay: 1000 });

    // 6. Gemini AI Career Assistant Chatbot
    console.log('[6/12] Capturing Gemini AI Career Assistant Chatbot...');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 35000 });
    const chatBtn = await page.$('button svg.lucide-message-square');
    if (chatBtn) {
      const parentBtn = await page.evaluateHandle(el => el.closest('button'), chatBtn);
      if (parentBtn && parentBtn.asElement()) {
        await parentBtn.asElement().click();
        await wait(1800);
        await snap('06-ai-career-assistant.png', { fullPage: false });
      }
    }

    // 7. Authentication Gateway
    console.log('[7/12] Capturing Authentication Gateway (/login)...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle0', timeout: 35000 });
    await snap('07-login-authentication.png', { fullPage: false, delay: 1000 });

    // --- Inject Session Token for Recruiter Workflow ---
    console.log('\n--- Authenticating as Company Recruiter ---');
    const domain = new URL(BASE_URL).hostname;
    await page.setCookie(
      {
        name: '__Secure-authjs.session-token',
        value: COMPANY_SESSION_TOKEN,
        domain: domain,
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'Lax',
      },
      {
        name: 'authjs.session-token',
        value: COMPANY_SESSION_TOKEN,
        domain: domain,
        path: '/',
        secure: false,
        httpOnly: true,
        sameSite: 'Lax',
      }
    );

    // 8. Post a Job Page & Duration Pricing
    console.log('[8/12] Capturing Job Creation & Pricing Tiers (/post-job)...');
    await page.goto(`${BASE_URL}/post-job`, { waitUntil: 'networkidle0', timeout: 35000 });
    await snap('08-post-job-and-pricing.png', { fullPage: false, delay: 1500 });

    // 9. Recruiter Dashboard & Analytics KPIs
    console.log('[9/12] Capturing Recruiter Dashboard & Analytics (/my-jobs)...');
    await page.goto(`${BASE_URL}/my-jobs`, { waitUntil: 'networkidle0', timeout: 35000 });
    await snap('09-recruiter-dashboard.png', { fullPage: false, delay: 1500 });

    // 10. Recruiter ATS Applicant Pipeline
    console.log('[10/12] Capturing Recruiter ATS Candidate Pipeline (/applications)...');
    await page.goto(`${BASE_URL}/applications`, { waitUntil: 'networkidle0', timeout: 35000 });
    await snap('10-recruiter-ats-pipeline.png', { fullPage: false, delay: 1500 });

    // 11. Public Company Profile
    console.log('[11/12] Capturing Public Company Showcase (/company/[companyId])...');
    const companyId = "1156b5d5-e693-4d35-8fdd-7601971c1817";
    await page.goto(`${BASE_URL}/company/${companyId}`, { waitUntil: 'networkidle0', timeout: 35000 });
    await snap('11-company-profile.png', { fullPage: false, delay: 1500 });

    // 12. Candidate Evaluation Modal with In-Browser PDF Preview
    console.log('[12/12] Capturing In-Browser PDF Resume Preview Dialog...');
    await page.goto(`${BASE_URL}/applications`, { waitUntil: 'networkidle0', timeout: 35000 });
    await wait(2000);
    const viewDetailsBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent && b.textContent.includes('View Details'));
    });
    if (viewDetailsBtn && viewDetailsBtn.asElement()) {
      await viewDetailsBtn.asElement().click();
      await wait(2000);
      await snap('12-candidate-detail-modal.png', { fullPage: false });
    }

    console.log('\n======================================================');
    console.log('🎉 Automated Crawl & Screenshot Capture Complete!');
    console.log('======================================================\n');

  } catch (error) {
    console.error('Crawler error:', error);
  } finally {
    await browser.close();
  }
}

captureAll().catch(console.error);
