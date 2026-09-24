# Testing

## Overview

Automated tests currently cover data entry in the Android app. Jest organizes the tests. Detox taps buttons, fills fields, and reads the app on a connected Android device.

The tests log in and download test permits, but they never press **Finalizar y enviar**. They check the forms and confirm that WatermelonDB keeps the saved data. They do not replace data in the backend.

The backend admin uses Playwright for browser tests. The first suite covers login behavior and the login layout on desktop and mobile-sized screens.

## Installation

Install the repository dependencies from the root:

```sh
npm install
```

Build the app and its Android test package once from `mobile`:

```sh
npm run e2e:build
```

Before a run:

- Connect an Android device with USB debugging enabled.
- Add the test settings to `mobile/.env`.
- Start the backend and Metro.
- Give the test user two empty permits named `TEST-01` and `TEST-02`.

See the [mobile E2E guide](mobile/e2e/README.md) for the environment variables and complete device setup.

For the admin browser tests, install Chromium once from `backend`:

```sh
npx playwright install chromium
```

Add the isolated database URL and E2E administrator credentials to `backend/.env`:

```text
VICUGNA_E2E_DATABASE_URL=postgresql://vicugna:vicugna@localhost:5432/vicugna_e2e
E2E_ADMIN_EMAIL=...
E2E_ADMIN_PASSWORD=...
```

The E2E database must use local PostgreSQL, its name must end in `_e2e`, and it must not be the development database. The test command recreates this database inside the existing PostgreSQL container, seeds known fixtures and the administrator from these credentials, runs Playwright, and removes the database afterward. It refuses to continue when the safety checks fail. No administrator needs to be created manually in the E2E database.

## Architecture

```text
Jest
        |
   E2E suites
        |
 Reusable flows
        |
  Detox helpers
        |
Android app + WatermelonDB
```

- `mobile/e2e/detox.config.js` connects Detox to the Android test build.
- `mobile/e2e/jest.config.js` sets up the test runner and results.
- `mobile/e2e/happy-path.test.js` and `validation.test.js` contain the tests.
- `mobile/e2e/flows.js` contains shared actions, such as filling a complete form.
- `mobile/e2e/support.js` contains basic Detox actions and checks.

Detox finds buttons and fields through their accessibility labels.

The admin tests live in `backend/e2e`. The test runner recreates the isolated E2E database, builds the backend, starts it on port `3100`, opens Chromium, and removes the test database when Playwright finishes. It keeps screenshots, video, and traces only when a test fails. Authenticated tests log in once and reuse an ignored local session file. Tracing is disabled while credentials are submitted and throughout authenticated tests so passwords and session cookies are not stored in trace files. Normal behavior runs once on desktop; tests marked `@responsive` also run with a mobile-sized browser.

## Test suites

From `mobile`, run either suite while Metro and the backend remain available:

```sh
npm run e2e:happy
npm run e2e:validation
```

The two test groups are independent and can run in either order. Each one clears the app's local data, logs in, downloads both test permits, and uses its own permit.

- **Happy path (`TEST-01`):** completes all three steps, reopens saved records, and checks that the permit becomes ready to send.
- **Validation (`TEST-02`):** checks required fields, allowed number ranges, rules between fields, exact limits, and automatic values.

From `backend`, run the admin browser tests with:

```sh
npm run test:e2e
```

The login suite checks the visible form, password visibility toggle, horizontal overflow, rejected credentials, and a successful administrator login. The authenticated home suite checks its desktop and mobile-sized layout and opens Users, Assignments, and Monitoring from their cards.

The happy path does not continue app actions after a failed stage because each later stage needs the previous data. The validation tests report each rule separately. If a required setup step fails, its dependent section reports the missing prerequisite. Failures save screenshots and device logs in `mobile/e2e/artifacts`. Git ignores that directory.

## Scope

The mobile tests check that a user can enter and keep valid data on an Android device. They do not test the final sync, saved backend data, the public site, iOS, production APKs, or OTA updates. The admin Playwright suite currently covers login, the authenticated home screen, and navigation to each main section.

The React admin will not have a separate component unit-test suite. Playwright covers its user-facing behavior. Backend testing will use API integration tests against a dedicated PostgreSQL test database, with unit tests reserved for important pure business rules.
