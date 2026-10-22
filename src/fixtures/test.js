import { test as base } from '@playwright/test';
import { Header } from '../components/Header.js';
import { IdentityPage } from '../pages/IdentityPage.js';
import { LoginPage } from '../pages/LoginPage.js';
import { RegistrationPage } from '../pages/RegistrationPage.js';
import { provisionDemoShop } from './demo-shop.js';

export const test = base.extend({
  shopUrl: [
    async ({ browser }, use) => {
      await use(process.env.SHOP_URL ?? (await provisionDemoShop(browser)));
    },
    { scope: 'worker', timeout: 300_000 },
  ],

  baseURL: async ({ shopUrl }, use) => {
    await use(shopUrl);
  },

  header: async ({ page }, use) => use(new Header(page)),
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  registrationPage: async ({ page }, use) => use(new RegistrationPage(page)),
  identityPage: async ({ page }, use) => use(new IdentityPage(page)),
});

export { expect } from '@playwright/test';
