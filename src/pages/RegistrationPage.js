import { CustomerForm } from '../components/CustomerForm.js';

export class RegistrationPage {
  static path = '/registration';

  constructor(page) {
    this.page = page;
    this.form = new CustomerForm(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Create an account' });
    this.createAccountButton = this.form.root.getByRole('button', { name: 'Create account' });
    this.passwordLengthRequirement = page.locator('[data-ps-ref="password-requirements-length"]');
    this.passwordStrengthRequirement = page.locator('[data-ps-ref="password-requirements-score"]');
  }

  async goto() {
    await this.page.goto(RegistrationPage.path);
  }

  async acceptConsents({ acceptTerms = true, acceptDataPrivacy = true } = {}) {
    if (acceptTerms) await this.form.termsAndPrivacyPolicy.check();
    if (acceptDataPrivacy) await this.form.customerDataPrivacy.check();
  }

  async submit() {
    await this.createAccountButton.click();
  }

  async register(customer, consents) {
    await this.form.fill(customer);
    await this.acceptConsents(consents);
    await this.submit();
  }
}
