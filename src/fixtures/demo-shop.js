import { expect } from '@playwright/test';

const DEMO_LAUNCHER_URL = 'https://demo.prestashop.com/';
const MAX_PROVISIONING_ATTEMPTS = 3;

export async function provisionDemoShop(browser) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_PROVISIONING_ATTEMPTS; attempt++) {
    try {
      return await provisionOnce(browser);
    } catch (error) {
      lastError = error;
      console.warn(`Demo shop provisioning attempt ${attempt}/${MAX_PROVISIONING_ATTEMPTS} failed.`);
    }
  }
  throw lastError;
}

async function provisionOnce(browser) {
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(DEMO_LAUNCHER_URL, { waitUntil: 'domcontentloaded' });

    const shopFrame = page.locator('#framelive');
    await expect(shopFrame, 'demo launcher should provision a shop instance').toHaveAttribute(
      'src',
      /^https:\/\/[\w-]+\.demo\.prestashop\.com/,
      { timeout: 90_000 },
    );
    const shopUrl = new URL(await shopFrame.getAttribute('src')).origin;

    await expect(async () => {
      const response = await context.request.get(`${shopUrl}/registration`);
      expect(response.status(), `${shopUrl} should be up`).toBe(200);
    }).toPass({ timeout: 30_000 });

    return shopUrl;
  } finally {
    await context.close();
  }
}
