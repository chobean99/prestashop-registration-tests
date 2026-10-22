import { expectRegistrationRejected } from '../../src/assertions/registration.js';
import { buildCustomer } from '../../src/data/customer.js';
import { expect, test } from '../../src/fixtures/test.js';
import { validationMessageOf } from '../../src/utils/browser-validation.js';

test.describe('Registration - client-side validation', () => {
  test.beforeEach(async ({ registrationPage }) => {
    await registrationPage.goto();
  });

  test('empty form cannot be submitted and every required field is flagged', async ({ page, registrationPage }) => {
    const { form } = registrationPage;
    await registrationPage.submit();

    const requiredFields = [
      form.firstName,
      form.lastName,
      form.email,
      form.password,
      form.termsAndPrivacyPolicy,
      form.customerDataPrivacy,
    ];
    for (const field of requiredFields) {
      await expect(field, `${await field.getAttribute('name')} should be required`).not.toHaveJSProperty(
        'validationMessage',
        '',
      );
    }
    await expect(form.birthdate, 'birthdate should be optional').toHaveJSProperty('validationMessage', '');
    await expectRegistrationRejected(page);
  });

  const missingConsents = [
    { consent: 'terms and conditions', options: { acceptTerms: false }, field: 'termsAndPrivacyPolicy' },
    { consent: 'customer data privacy', options: { acceptDataPrivacy: false }, field: 'customerDataPrivacy' },
  ];

  for (const { consent, options, field } of missingConsents) {
    test(`account cannot be created without accepting ${consent}`, async ({ page, registrationPage }) => {
      await registrationPage.register(buildCustomer(), options);

      await expect(registrationPage.form[field]).not.toBeChecked();
      await expect(registrationPage.form[field]).not.toHaveJSProperty('validationMessage', '');
      await expectRegistrationRejected(page);
    });
  }

  const passwordsViolatingPolicy = [
    { password: 'Ab1!x', problem: 'is shorter than 8 characters', message: 'Your password length is invalid' },
    { password: 'password1', problem: 'is too weak', message: 'Your password is too weak' },
  ];

  for (const { password, problem, message } of passwordsViolatingPolicy) {
    test(`password that ${problem} is rejected by the password policy`, async ({ page, registrationPage }) => {
      await registrationPage.form.fill(buildCustomer({ password }));
      await registrationPage.acceptConsents();

      await expect.poll(() => validationMessageOf(registrationPage.form.password)).toContain(message);
      await expect(registrationPage.passwordLengthRequirement).toContainText('between 8 and 72 characters');
      await expect(registrationPage.passwordStrengthRequirement).toContainText('The minimum score must be: Strong');

      await registrationPage.submit();
      await expectRegistrationRejected(page);
    });
  }

  test('email without "@" is rejected by the browser', async ({ page, registrationPage }) => {
    await registrationPage.register(buildCustomer({ email: 'john.doe.example.com' }));

    await expect(registrationPage.form.email).not.toHaveJSProperty('validationMessage', '');
    await expectRegistrationRejected(page);
  });
});
