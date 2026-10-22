export class LoginPage {
  static path = '/login';

  constructor(page) {
    this.page = page;
    const form = page.locator('#login-form');
    this.heading = page.getByRole('heading', { level: 1, name: 'Sign in' });
    this.email = form.getByLabel('Email', { exact: true });
    this.password = form.getByLabel('Password', { exact: true });
    this.signInButton = form.getByRole('button', { name: 'Sign in' });
    this.createAccountLink = page.getByRole('link', { name: 'Create your account' });
  }

  async goto() {
    await this.page.goto(LoginPage.path);
  }

  async signIn(email, password) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInButton.click();
  }
}
