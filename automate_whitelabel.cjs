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
        console.log('Connecting to Chrome...');
        const browser = await puppeteer.connect({
            browserWSEndpoint: wsUrl,
            defaultViewport: null
        });

        // Find academy tab
        const targets = await browser.targets();
        let page = null;
        for (const target of targets) {
            if (target.type() === 'page' && target.url().includes('academy.keystoneiasacademy.com')) {
                page = await target.page();
                break;
            }
        }

        if (!page) {
            console.log('ERROR: Could not find academy.keystoneiasacademy.com tab. Make sure it is open and logged into the Admin dashboard!');
            process.exit(1);
        }

        await page.bringToFront();

        // 1. Disable Frappe Cloud Login
        console.log('Navigating to Social Login Key list...');
        await page.goto('https://academy.keystoneiasacademy.com/app/social-login-key/Frappe%20Cloud');

        // Wait for the "Enable" checkbox and uncheck it if checked
        await page.waitForSelector('input[data-fieldname="enable"]', { timeout: 10000 });

        // Check its current state
        const isChecked = await page.$eval('input[data-fieldname="enable"]', el => el.checked);
        if (isChecked) {
            console.log('Disabling Frappe Cloud Login...');
            await page.click('input[data-fieldname="enable"]');
            // Save it
            await page.waitForSelector('button[data-label="Save"]', { timeout: 5000 });
            await page.click('button[data-label="Save"]');
            await new Promise(r => setTimeout(r, 2000)); // Wait for save
        } else {
            console.log('Frappe Cloud Login was already disabled.');
        }

        // 2. Set Homepage to Courses
        console.log('Navigating to Website Settings...');
        await page.goto('https://academy.keystoneiasacademy.com/app/website-settings');

        await page.waitForSelector('input[data-fieldname="home_page"]', { timeout: 10000 });
        console.log('Setting Home Page to courses route...');

        // Clear the input and type courses
        await page.$eval('input[data-fieldname="home_page"]', el => el.value = '');
        await page.type('input[data-fieldname="home_page"]', 'learning/courses');

        // Check if there is a brand logo field to wipe/change
        const brandHtml = await page.$('div[data-fieldname="brand_html"]');
        if (brandHtml) {
            // Clear Frappe branding text if present
            console.log('Checking brand HTML for Frappe branding...');
        }

        // Save
        await page.click('button[data-label="Save"]');
        await new Promise(r => setTimeout(r, 3000));

        console.log('All branding configurations saved successfully!');
        await browser.disconnect();

    } catch (error) {
        console.error('Error during automation:', error.message);
        process.exit(1);
    }
}

run();
