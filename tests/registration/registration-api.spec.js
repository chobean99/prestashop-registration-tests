import { postRegistrationForm } from '../../src/api/customer-api.js';
import { buildCustomer } from '../../src/data/customer.js';
import { expect, test } from '../../src/fixtures/test.js';

test.describe('Registration - backend enforcement', () => {
  test('server rejects a weak password even when the browser-side policy check is bypassed', async ({ request }) => {
    const response = await postRegistrationForm(request, buildCustomer({ password: 'password1' }));

    expect(response.status()).toBe(200);
    expect(new URL(response.url()).pathname, 'should not redirect as on success').toBe('/registration');
    expect(await response.text()).toContain('This is a very common password');
  });

  test('server rejects registration when required consents are missing', async ({ request }) => {
    const customer = buildCustomer();
    const response = await request.post('/registration', {
      form: {
        firstname: customer.firstName,
        lastname: customer.lastName,
        email: customer.email,
        password: customer.password,
        submitCreate: '1',
      },
    });

    expect(response.status()).toBe(200);
    expect(new URL(response.url()).pathname, 'should not redirect as on success').toBe('/registration');
    const requiredFieldErrors = (await response.text()).match(/Required field/g) ?? [];
    expect(requiredFieldErrors, 'one error per missing consent').toHaveLength(2);
  });
});
