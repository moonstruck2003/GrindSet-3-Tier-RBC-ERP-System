const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../docs/testing_report/screenshots');
const ARTIFACT_DIR = 'C:\\Users\\PC\\.gemini\\antigravity\\brain\\865290bf-d5a0-4748-9d1a-c0a052cb2050';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fetchToken(email, password = 'password123') {
  const res = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return await res.json();
}

async function saveScreenshot(page, filename) {
  const targetPath1 = path.join(OUTPUT_DIR, filename);
  const targetPath2 = path.join(ARTIFACT_DIR, filename);
  await page.screenshot({ path: targetPath1, fullPage: false });
  try {
    fs.copyFileSync(targetPath1, targetPath2);
  } catch (e) {
    console.error('Error copying to artifact dir:', e.message);
  }
  console.log(`Saved screenshot: ${filename}`);
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  try {
    // 1. Swagger OpenAPI Documentation
    console.log('1. Capturing Swagger API...');
    await page.goto('http://localhost:5000/swagger/index.html', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot(page, 'figure1_swagger_api.png');

    // 2. Landing Page & Auth Modal
    console.log('2. Capturing Landing Page with Auth...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, 'figure2_landing_page.png');

    // Open Auth Modal on Landing Page
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, a'));
      const signin = btns.find(b => b.textContent && b.textContent.includes('Sign In'));
      if (signin) signin.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await saveScreenshot(page, 'figure_table1_auth_modal.png');

    // 3. Admin Governance Control Center (RBAC Table)
    console.log('3. Capturing Admin Dashboard...');
    const adminAuth = await fetchToken('admin@grindset.io', 'password123');
    await page.evaluate((auth) => {
      localStorage.setItem('grindset_token', auth.token);
      localStorage.setItem('grindset_user', JSON.stringify(auth.user));
    }, adminAuth);
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot(page, 'figure_table2_admin_rbac.png');

    // 4. RoleGuard Access Denied (Employee trying to view /audit)
    console.log('4. Capturing RoleGuard Route Interception...');
    const empAuth = await fetchToken('john.dev@grindset.io', 'password123');
    await page.evaluate((auth) => {
      localStorage.setItem('grindset_token', auth.token);
      localStorage.setItem('grindset_user', JSON.stringify(auth.user));
    }, empAuth);
    await page.goto('http://localhost:5173/audit', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, 'figure_table2_roleguard_blocked.png');

    // 5. Glassmorphism Blur Lockout Overlay (Pending Applicant)
    console.log('5. Capturing Blur Lockout Overlay...');
    const applicantAuth = await fetchToken('alex.applicant@acmeglobal.com', 'password123');
    await page.evaluate((auth) => {
      localStorage.setItem('grindset_token', auth.token);
      localStorage.setItem('grindset_user', JSON.stringify(auth.user));
    }, applicantAuth);
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot(page, 'figure_table3_blur_overlay.png');

    // 6. Company Workforce Directory (Company Owner)
    console.log('6. Capturing Workforce Directory...');
    const compAuth = await fetchToken('corp@acmeglobal.com', 'password123');
    await page.evaluate((auth) => {
      localStorage.setItem('grindset_token', auth.token);
      localStorage.setItem('grindset_user', JSON.stringify(auth.user));
    }, compAuth);
    await page.goto('http://localhost:5173/workforce', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot(page, 'figure_table4_workforce.png');

    // 7. Projects Portfolio & Kanban Board
    console.log('7. Capturing Projects Portfolio...');
    await page.goto('http://localhost:5173/projects', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot(page, 'figure_table5_projects_portfolio.png');

    // Switch to Kanban view on Projects Page
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const kanbanBtn = btns.find(b => b.textContent && b.textContent.includes('Sprint Kanban'));
      if (kanbanBtn) kanbanBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await saveScreenshot(page, 'figure_table5_kanban_board.png');

    // 8. Finance & General Ledger Hub
    console.log('8. Capturing Finance & General Ledger...');
    await page.goto('http://localhost:5173/finance', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await saveScreenshot(page, 'figure_table6_finance.png');

    // Open Reallocate Funds modal on Finance Page
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const reallocBtn = btns.find(b => b.textContent && b.textContent.includes('Reallocate Budget'));
      if (reallocBtn) reallocBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await saveScreenshot(page, 'figure_table6_reallocate_modal.png');

    console.log('All screenshots captured successfully!');
  } catch (err) {
    console.error('Error capturing screenshots:', err);
  } finally {
    await browser.close();
  }
}

run();
