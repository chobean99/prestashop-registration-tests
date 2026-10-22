export class CustomerForm {
  constructor(page) {
    this.root = page.locator('#customer-form');
    this.firstName = this.root.getByLabel('First name', { exact: true });
    this.lastName = this.root.getByLabel('Last name', { exact: true });
    this.email = this.root.getByLabel('Email', { exact: true });
    this.password = this.root.getByLabel('Password', { exact: true });
    this.birthdate = this.root.getByLabel('Birthdate', { exact: true });
    this.partnerOffers = this.root.getByLabel('Receive offers from our partners');
    this.newsletter = this.root.getByLabel(/Sign up for our newsletter/);
    this.termsAndPrivacyPolicy = this.root.getByLabel(/I agree to the terms and conditions/);
    this.customerDataPrivacy = this.root.getByLabel(/Customer data privacy/);
  }

  socialTitle(title) {
    return this.root.getByRole('radio', { name: title, exact: true });
  }

  errorFor(field) {
    return field.locator('xpath=ancestor::div[contains(@class, "mb-3")][1]').getByRole('alert');
  }

  async fill(customer) {
    if (customer.socialTitle) await this.socialTitle(customer.socialTitle).check();
    await this.firstName.fill(customer.firstName);
    await this.lastName.fill(customer.lastName);
    await this.email.fill(customer.email);
    await this.password.fill(customer.password);
    if (customer.birthdate) await this.birthdate.fill(customer.birthdate);
    if (customer.partnerOffers) await this.partnerOffers.check();
    if (customer.newsletter) await this.newsletter.check();
  }
}
