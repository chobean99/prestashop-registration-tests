export class Header {
  constructor(page) {
    this.page = page;
    this.signInLink = page.locator('#_desktop_ps_customersignin').getByRole('link', { name: 'Sign in' });
  }

  accountMenuFor(firstName, lastName) {
    return this.page.getByRole('button', { name: `View my account (${firstName} ${lastName})` });
  }
}
