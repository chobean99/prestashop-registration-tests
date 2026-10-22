import { randomUUID } from 'node:crypto';

export const VALID_PASSWORD = 'Str0ng!Pass#2026';

export function uniqueEmail() {
  return `qa.${Date.now()}.${randomUUID().slice(0, 8)}@example.com`;
}

export function buildCustomer(overrides = {}) {
  return {
    firstName: 'John',
    lastName: 'Doe',
    email: uniqueEmail(),
    password: VALID_PASSWORD,
    ...overrides,
  };
}

export function buildFullCustomer(overrides = {}) {
  return buildCustomer({
    socialTitle: 'Mrs.',
    firstName: 'Jane',
    lastName: 'Smith',
    birthdate: '05/31/1990',
    partnerOffers: true,
    newsletter: true,
    ...overrides,
  });
}
