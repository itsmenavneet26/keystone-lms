const puppeteer = require('puppeteer-core');
const http = require('http');

async function getWebSocketDebuggerUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json/version', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const info = JSON.parse(data);
          resolve(info.webSocketDebuggerUrl);
        } catch (e) {
          reject(new Error('Invalid JSON'));
        }
      });
    }).on('error', (e) => reject(new Error('Debugger not running: ' + e.message)));
  });
}

async function run() {
  try {
    const wsUrl = await getWebSocketDebuggerUrl();
    const browser = await puppeteer.connect({
      browserWSEndpoint: wsUrl,
      defaultViewport: null
    });

    // Find Frappe Cloud tab or open a new one
    const targets = await browser.targets();
    let page = null;
    for (const target of targets) {
      if (target.type() === 'page' && target.url().includes('frappe.cloud')) {
        page = await target.page();
        break;
      }
    }

    if (!page) {
      // If they closed it, open a new one
      page = await browser.newPage();
      await page.goto('https://cloud.frappe.io/dashboard/sites');
    }

    await page.bringToFront();

    // Automation Logic: Navigate to Settings -> Github
    console.log('Navigating to GitHub settings...');
    await page.goto('https://cloud.frappe.io/dashboard/settings/developer');
    await page.waitForSelector('button, a', { timeout: 10000 });

    // Take a screenshot to show the user where it is
    await page.screenshot({ path: 'frappe_github_settings.png' });

    // Leave the browser up for the user to see
    console.log('Browser is ready for GitHub connection!');

    await browser.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

run();
