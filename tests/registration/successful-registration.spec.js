import { buildCustomer, buildFullCustomer } from '../../src/data/customer.js';
import { expect, test } from '../../src/fixtures/test.js';

test.describe('Registration - successful account creation', () => {
  test(
    'new customer can create an account from the Sign in page using only required fields',
    { tag: '@smoke' },
    async ({ page, header, loginPage, registrationPage, identityPage }) => {
      const customer = buildCustomer();

      await test.step('open the registration form via header "Sign in" > "Create your account"', async () => {
        await page.goto('/');
        await header.signInLink.click();
        await expect(loginPage.heading).toBeVisible();
        await loginPage.createAccountLink.click();
        await expect(registrationPage.heading).toBeVisible();
      });

      await test.step('submit the form with required fields only', async () => {
        await registrationPage.register(customer);
      });

      await test.step('customer is signed in and returned to the page they came from', async () => {
        await expect(header.accountMenuFor(customer.firstName, customer.lastName)).toBeVisible();
        await expect(page).toHaveURL((url) => url.pathname === '/');
      });

      await test.step('entered data is saved to the customer profile', async () => {
        await identityPage.goto();
        await expect(identityPage.form.firstName).toHaveValue(customer.firstName);
        await expect(identityPage.form.lastName).toHaveValue(customer.lastName);
        await expect(identityPage.form.email).toHaveValue(customer.email);
      });
    },
  );

  test('optional fields entered during registration are saved to the customer profile', async ({
    header,
    registrationPage,
    identityPage,
  }) => {
    const customer = buildFullCustomer();

    await registrationPage.goto();
    await registrationPage.register(customer);
    await expect(header.accountMenuFor(customer.firstName, customer.lastName)).toBeVisible();

    await identityPage.goto();
    const { form } = identityPage;
    await expect(form.socialTitle(customer.socialTitle)).toBeChecked();
    await expect(form.birthdate).toHaveValue(customer.birthdate);
    await expect(form.partnerOffers).toBeChecked();
    await expect(form.newsletter).toBeChecked();
  });

  test('newly registered customer can sign in with the chosen credentials', async ({
    context,
    header,
    registrationPage,
    loginPage,
  }) => {
    const customer = buildCustomer();
    await registrationPage.goto();
    await registrationPage.register(customer);
    await expect(header.accountMenuFor(customer.firstName, customer.lastName)).toBeVisible();

    await context.clearCookies();
    await loginPage.goto();
    await expect(header.signInLink).toBeVisible();

    await loginPage.signIn(customer.email, customer.password);
    await expect(header.accountMenuFor(customer.firstName, customer.lastName)).toBeVisible();
  });
});
