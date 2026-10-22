import { registerCustomerViaApi } from '../../src/api/customer-api.js';
import { expectRegistrationRejected } from '../../src/assertions/registration.js';
import { buildCustomer } from '../../src/data/customer.js';
import { expect, test } from '../../src/fixtures/test.js';

test.describe('Registration - server-side validation', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  test('registration is rejected when the email is already used by another account', async ({
    page,
    request,
    registrationPage,
  }) => {
    const existingCustomer = buildCustomer();
    await registerCustomerViaApi(request, existingCustomer);

    await registrationPage.register(buildCustomer({ firstName: 'Other', email: existingCustomer.email }));

    await expect(registrationPage.form.errorFor(registrationPage.form.email)).toHaveText(
      'The email is already used, please choose another one or sign in',
    );
    await expectRegistrationRejected(page);
  });

  const invalidNames = [
    { field: 'firstName', value: 'John123', reason: 'digits' },
    { field: 'lastName', value: 'Doe@Home', reason: 'special characters' },
  ];

  for (const { field, value, reason } of invalidNames) {
    test(`registration is rejected when ${field} contains ${reason}`, async ({ page, registrationPage }) => {
      await registrationPage.register(buildCustomer({ [field]: value }));

      await expect(registrationPage.form.errorFor(registrationPage.form[field])).toHaveText('Invalid format.');
      await expectRegistrationRejected(page);
    });
  }

  test('registration is rejected when birthdate is not a valid date', async ({ page, registrationPage }) => {
    await registrationPage.register(buildCustomer({ birthdate: '13/45/2000' }));

    await expect(registrationPage.form.errorFor(registrationPage.form.birthdate)).toHaveText(
      'Format should be 05/31/1970.',
    );
    await expectRegistrationRejected(page);
  });
});
