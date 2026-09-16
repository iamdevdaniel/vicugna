# Testing

## Overview

Automated tests currently cover data entry in the Android app. Jest organizes the tests. Detox taps buttons, fills fields, and reads the app on a connected Android device.

The tests log in and download test permits, but they never press **Finalizar y enviar**. They check the forms and confirm that WatermelonDB keeps the saved data. They do not replace data in the backend.

The backend does not have an automated test suite yet.

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

## Test suites

From `mobile`, run either suite while Metro and the backend remain available:

```sh
npm run e2e:happy
npm run e2e:validation
```

The two test groups are independent and can run in either order. Each one clears the app's local data, logs in, downloads both test permits, and uses its own permit.

- **Happy path (`TEST-01`):** completes all three steps, reopens saved records, and checks that the permit becomes ready to send.
- **Validation (`TEST-02`):** checks required fields, allowed number ranges, rules between fields, exact limits, and automatic values.

The happy path does not continue app actions after a failed stage because each later stage needs the previous data. The validation tests report each rule separately. If a required setup step fails, its dependent section reports the missing prerequisite. Failures save screenshots and device logs in `mobile/e2e/artifacts`. Git ignores that directory.

## Scope

These tests check that a user can enter and keep valid data on an Android device. They do not test the final sync, saved backend data, the admin site, the public site, iOS, production APKs, or OTA updates.
