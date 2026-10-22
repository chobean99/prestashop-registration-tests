import { CustomerForm } from '../components/CustomerForm.js';

export class IdentityPage {
  static path = '/identity';

  constructor(page) {
    this.page = page;
    this.form = new CustomerForm(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Your personal information' });
  }

  async goto() {
    await this.page.goto(IdentityPage.path);
  }
}
