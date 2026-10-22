import { expect } from '@playwright/test';
import { Header } from '../components/Header.js';
import { RegistrationPage } from '../pages/RegistrationPage.js';

export async function expectRegistrationRejected(page) {
  await expect(page, 'customer should stay on the registration page').toHaveURL(
    (url) => url.pathname === RegistrationPage.path,
  );
  await expect(new RegistrationPage(page).heading).toBeVisible();
  await expect(new Header(page).signInLink, 'customer should not be signed in').toBeVisible();
}
