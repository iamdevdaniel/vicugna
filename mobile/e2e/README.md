# Android E2E tests

The WebdriverIO runner uses Appium to drive the installed Android app on a real device. The tests never press **Finalizar y enviar**, so test data stays in WatermelonDB and is not uploaded.

## Prerequisites

- Appium is running and the UiAutomator2 driver is installed.
- The phone is connected, authorized for USB debugging, and listed by `adb devices`.
- The current development build is installed and can load the current JavaScript bundle.
- The E2E user owns two empty permits named exactly `TEST-01` and `TEST-02`.
- The backend is reachable so the initial login and permit download can finish.

Add the local credentials and device ID to the existing `mobile/.env` file:

```dotenv
# Appium E2E
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
E2E_DEVICE_ID=
```

`E2E_DEVICE_ID` is the first column shown by `adb devices`. The `.env` file remains untracked.

Forward Metro's default port to the phone before running the suites:

```sh
adb reverse tcp:8081 tcp:8081
```

After clearing the app data, the test opens the development client directly at `http://127.0.0.1:8081`. If Metro uses another address, set `E2E_EXPO_URL` in `mobile/.env`.

## Run

From `mobile`, start Appium in one terminal:

```sh
npm run e2e:server
```

Run one suite from another terminal:

```sh
npm run e2e:happy
npm run e2e:validation
```

Each suite clears all data for `com.maydanachi.vicugna`, opens the logged-out app, logs in, downloads both test permits, and then works only on its assigned permit. This makes each run independent of stale authentication or WatermelonDB data.

- `TEST-01`: three participants, complete headers, five Registros de esquila, three Limpiados, two Predescerdados, reopened saved values, and the final ready-to-send state.
- `TEST-02`: representative required, type, range, relationship, exact-boundary, derived-field, and signature validation failures followed by valid local saves.

The happy-path suite stops at its first failure because every stage depends on the previous one. The validation suite reports each rule separately and restores valid field values between checks so independent tests can continue. If required setup fails, dependent groups are skipped instead of producing secondary failures.

Appium reads the Android accessibility tree. Screenshots are saved under `e2e/artifacts` only when a test fails; they help diagnose failures but are not pass/fail evidence.
