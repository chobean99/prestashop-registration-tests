# PrestaShop Registration – Test Automation

This repo has my Playwright (JavaScript) tests for the customer registration form on the [PrestaShop demo shop](https://demo.prestashop.com/).

The tests are in [`tests/`](tests/) and the supporting code is in [`src/`](src/).

## How to run it

You'll need Node.js 20 or newer and an internet connection, because the tests run against the public demo.

```bash
npm install
npx playwright install chromium     # or "npx playwright install" if you want all browsers
npm test
```

Other scripts:

- `npm run test:smoke` runs only the main happy-path test (tagged `@smoke`).
- `npm run test:headed` runs with a visible browser, one test at a time, so you can watch what happens.
- `npm run test:ui` opens Playwright's UI mode, which is the easiest way to pick and debug single tests.
- `npm run test:all-browsers` runs on Chromium, Firefox and WebKit.
- `npm run report` opens the HTML report from the last run.

To run one file, use `npx playwright test tests/registration/server-side-validation.spec.js`. To run tests by
name, use `npx playwright test -g "already used"`.

When a test fails, the HTML report has its screenshot, video and trace. The trace is usually the quickest way to
find out what went wrong.

At the start, every worker spins up a fresh demo shop. If you already have a demo shop open (handy when debugging),
you can reuse it:
`SHOP_URL=https://<name>.demo.prestashop.com npm test` (PowerShell: `$env:SHOP_URL="..."; npm test`).

## How the project is organised

```
├── tests/registration/
│   ├── successful-registration.spec.js   # happy paths: account is created, data is saved, login works
│   ├── server-side-validation.spec.js    # rules checked by the backend: duplicate email, names, birthdate
│   ├── client-side-validation.spec.js    # rules checked in the browser: required fields, consents, password, email
│   └── registration-api.spec.js          # the backend still enforces the rules when the browser is skipped
├── src/
│   ├── fixtures/
│   │   ├── test.js            # custom `test` that provides page objects and the shop URL
│   │   └── demo-shop.js       # sets up a demo shop and checks that it responds
│   ├── pages/                 # page objects: RegistrationPage, LoginPage, IdentityPage
│   ├── components/            # parts shared between pages: CustomerForm, Header
│   ├── api/customer-api.js    # creates a customer over HTTP, without the UI
│   ├── data/customer.js       # test data builder (new unique email every time)
│   ├── assertions/            # reusable checks, e.g. "registration was rejected"
│   └── utils/                 # helper for reading browser validation messages
├── playwright.config.js
└── .github/workflows/playwright.yml      # CI: runs on push, on pull requests and once a day
```

## What I tested and why

I didn't try to cover everything. I started from what would hurt the shop most if it broke:

1. A new customer can't sign up at all.
2. The customer signs up, but their data isn't saved correctly.
3. Bad input gets through.
4. The required GDPR consents aren't enforced.

From that I ended up with these scenarios:

| #  | Scenario | Why I picked it |
| -- | -------- | --------------- |
| 1  | Sign up from *Sign in → Create your account* with only the required fields (`@smoke`) | This is the main journey. If it breaks, the shop gets no new customers. |
| 2  | Fill in every optional field (title, birthdate, newsletter, partner offers) and check that they're saved | Data can get lost between the form and the database without anyone noticing. |
| 3  | Sign out, then sign in with the new account | This proves the account really exists, and that the test isn't passing only because of the session left over from sign-up. |
| 4  | Register with an email that's already taken | Each email should belong to one account only. |
| 5  | Names with digits or special characters | These names end up on invoices and shipping labels. |
| 6  | Invalid birthdate | The field is free text and optional, which makes it easy to forget about. |
| 7  | Submit an empty form | Every required field should be flagged, and birthdate should stay optional. |
| 8  | Try to sign up without each GDPR consent | This is a legal requirement. |
| 9  | Passwords that are too short or too weak | Account security. |
| 10 | Malformed email | Without a valid email, the customer can't reset their password or get order emails. |
| 11 | Send the form straight to the backend with a weak password or missing consents | Anyone can get around browser checks, so the server has to enforce the rules too. |

Things I left out on purpose:

- Checking that the newsletter or welcome email actually arrives, because I don't have access to a mailbox.
- Translations.
- Visual layout and full accessibility audits. Dedicated tools do these better.
- XSS and markup payloads in names. On the demo, Cloudflare blocks them before they reach the shop, so a test
  would be testing Cloudflare, not PrestaShop.

## Some decisions worth explaining

**The demo is a bit unusual.** Each visit to `demo.prestashop.com` creates a brand new shop on a random subdomain
and shows it inside an iframe. Rather than dealing with the iframe in every test, the fixture in
[`demo-shop.js`](src/fixtures/demo-shop.js) opens the launcher once per worker, reads the real shop URL, checks that the shop is up and sets that URL as `baseURL`. After that, tests simply call `page.goto('/registration')`.
 A nice side effect is that every worker gets its own clean shop.

**Page objects come in through fixtures.** Tests say what the user does, and the page objects handle how it's done.
The registration page and the "Your personal information" page use the same customer form, so I wrote it once as
`CustomerForm`. Page objects are passed to tests as Playwright fixtures, which is why you won't see
`new SomethingPage(page)` in the tests.

**Locators are based on what users see.** Elements are found by label and role, for example
`getByLabel('First name')` or `getByRole('button', { name: 'Create account' })`. To check that the user is signed
in, the tests look at the header button's accessible name (`View my account (John Doe)`). I used that instead of
the visible text because on narrow screens the text gets cut down to initials, while the accessible name doesn't
change.

**Tests don't depend on each other.** Each test creates its own customer with a unique email, so the tests can run
in parallel, in any order, and as many times as you like.

**Setup goes through the API when it can.** In the duplicate-email test, the first account is created with a direct
HTTP request instead of going through the form a second time. This is faster, and it means one less thing that can
break.

**Server errors and browser errors are checked differently.** Errors from the server are shown under the field, so
I check their exact text. Browser validation is checked through the input's `validationMessage`. The browser's own
messages differ between browsers and languages, so for those I only check that a message is there. The password
messages come from the shop itself, so I check their text.

**There are no hard-coded waits.** Everything relies on Playwright's auto-waiting and `expect.poll`. For example,
the password strength check runs in the background, so the test waits for its result before submitting.

**Flakiness.** The public demo sometimes returns an HTTP 502 when a form is submitted. I allowed one retry, so these
failures show up as "flaky" in the report instead of quietly disappearing. I also kept it to two workers so the
suite doesn't hammer the shared demo.

## Known limitations

- The tests run against a public environment I have no control over. Its speed, uptime and PrestaShop version can
  change at any time.
- Each worker creates a real demo shop, so the first test in each worker takes a few seconds longer.
- Test accounts are never deleted. That's fine here because demo shops are thrown away anyway, but it wouldn't be
  fine on a long-lived environment.

