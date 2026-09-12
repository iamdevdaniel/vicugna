# Testing

## Overview

Automated tests currently cover data entry in the Android app. WebdriverIO and Mocha run the tests. Appium taps buttons, fills fields, and reads the app on a connected Android device.

The tests log in and download test permits, but they never press **Finalizar y enviar**. They check the forms and confirm that WatermelonDB keeps the saved data. They do not replace data in the backend.

The backend does not have an automated test suite yet.

## Installation

Install the repository dependencies from the root:

```sh
npm install
```

Install Appium's Android driver once from `mobile`:

```sh
npm run e2e:driver
```

Before a run:

- Connect an Android device with USB debugging enabled.
- Add the test settings to `mobile/.env`.
- Forward Metro's port to the device.
- Start the backend and Metro.
- Give the test user two empty permits named `TEST-01` and `TEST-02`.

See the [mobile E2E guide](mobile/e2e/README.md) for the environment variables and complete device setup.

## Architecture

```text
WebdriverIO + Mocha
        |
   E2E suites
        |
 Reusable flows
        |
 Appium helpers
        |
 Android app + WatermelonDB
```

- `mobile/e2e/wdio.conf.mjs` sets up the device, test groups, results, and error screenshots.
- `mobile/e2e/happy-path.mjs` and `validation.mjs` contain the tests.
- `mobile/e2e/flows.mjs` contains shared actions, such as filling a complete form.
- `mobile/e2e/support.mjs` contains basic Appium actions and checks.

Appium finds buttons and fields through their accessibility labels.

## Test suites

From `mobile`, keep Appium running in one terminal:

```sh
npm run e2e:server
```

Run either suite from another terminal:

```sh
npm run e2e:happy
npm run e2e:validation
```

The two test groups are independent and can run in either order. Each one clears the app's local data, logs in, downloads both test permits, and uses its own permit.

- **Happy path (`TEST-01`):** completes all three steps, reopens saved records, and checks that the permit becomes ready to send.
- **Validation (`TEST-02`):** checks required fields, allowed number ranges, rules between fields, exact limits, and automatic values.

The happy path stops on its first error because each step needs the data from the previous step. The validation tests report each rule separately. If a required setup step fails, only the tests that depend on it are skipped. Failures save screenshots in `mobile/e2e/artifacts`. Git ignores that directory.

## Scope

These tests check that a user can enter and keep valid data on an Android device. They do not test the final sync, saved backend data, the admin site, the public site, iOS, production APKs, or OTA updates.
