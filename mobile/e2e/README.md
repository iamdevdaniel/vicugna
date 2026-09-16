# Android E2E tests

Detox drives the real Android app. Jest organizes the scenarios and reports each named test. The tests never press **Finalizar y enviar**, so their data stays in WatermelonDB.

## Requirements

- The Android device is connected, authorized, and listed by `adb devices`.
- Metro and the development backend are running.
- The E2E user owns two empty permits named exactly `TEST-01` and `TEST-02`.

Add these values to the existing `mobile/.env` file:

```dotenv
# Detox E2E
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
E2E_DEVICE_ID=
```

`E2E_DEVICE_ID` is the first column shown by `adb devices`. If Metro does not use port `8081`, also set `E2E_EXPO_URL`.

## First build

From `mobile`, regenerate the ignored Android project and build the app plus its test package:

```sh
npm run e2e:build
```

Run this again after native Android changes. JavaScript-only changes do not require another E2E build.

## Run

Keep Metro and the backend running, then run either suite:

```sh
npm run e2e:happy
npm run e2e:validation
```

No separate automation server is needed. Detox installs the test build, clears the app data, forwards Metro's port, opens the development client, logs in, and downloads the two test permits. The suites are independent and can run in either order.

- `TEST-01`: saves and reopens three participants, complete headers, five Registros de esquila, three Limpiados, and two Predescerdados. It finishes at the ready-to-send state without sending.
- `TEST-02`: checks required values, types, ranges, relationships, exact coordinate limits, derived fields, and signatures. It restores valid values after each failed case.

The happy-path suite does not continue app actions after a failed stage because every later stage depends on it. The validation suite keeps reporting independent rules inside each prepared form. If form setup fails, its dependent section reports the missing prerequisite instead of trying to save incomplete data.

Failure screenshots and device logs are kept under `e2e/artifacts`. Successful-test artifacts are discarded.
