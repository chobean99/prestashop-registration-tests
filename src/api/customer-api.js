import { expect } from '@playwright/test';

export function postRegistrationForm(request, customer) {
  return request.post('/registration', {
    form: {
      firstname: customer.firstName,
      lastname: customer.lastName,
      email: customer.email,
      password: customer.password,
      psgdpr: '1',
      customer_privacy: '1',
      submitCreate: '1',
    },
  });
}

export async function registerCustomerViaApi(request, customer) {
  const response = await postRegistrationForm(request, customer);

  expect(response.ok(), `registration request failed with HTTP ${response.status()}`).toBeTruthy();
  expect(new URL(response.url()).pathname, 'customer should be created and redirected').not.toContain('registration');
}
