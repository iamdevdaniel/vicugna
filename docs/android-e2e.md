# Android E2E Tests

Detox drives the real Android app. Jest organizes the scenarios and reports each named test. The sync suite uses the real backend with an isolated E2E PostgreSQL database.

## Requirements

- The Android device is connected, authorized, and listed by `adb devices`.
- Metro and the development backend are running for the happy-path, validation, and isolation suites.
- The E2E user owns two empty permits named exactly `TEST-01` and `TEST-02`.
- The second E2E user owns a permit named exactly `ISOLATION-02`.
- Docker is running so the sync suite can start Toxiproxy.
- `backend/.env` contains the isolated E2E database and administrator settings described in `TESTING.md`.

`E2E_DEVICE_ID` is the first column shown by `adb devices`. If Metro does not use port `8081`, also set `E2E_EXPO_URL`.

## First build

From `mobile`, regenerate the ignored Android project and build the app plus its test package:

```sh
npm run e2e:build
```

Run this again after native Android changes. JavaScript-only changes do not require another E2E build.

## Run

Keep Metro and the backend running, then run any suite:

```sh
npm run e2e:happy
npm run e2e:isolation
npm run e2e:validation
```

No separate automation server is needed. Detox installs the test build, clears the app data, forwards Metro's port, opens the development client, logs in, and downloads the two test permits. The suites are independent and can run in either order.

- `TEST-01`: saves and reopens three participants, complete headers, five Registros de esquila, three Limpiados, and two Predescerdados. It finishes at the ready-to-send state without sending.
- `TEST-02`: checks required values, types, ranges, relationships, exact coordinate limits, derived fields, and signatures. It restores valid values after each failed case.
- The isolation suite switches between both E2E users and verifies that each account sees only its own permits while the first account keeps its local participant data.

The sync suite does not use the development backend or its database. Start Metro in one terminal:

```sh
npm run start:e2e-sync
```

Run the suite in another terminal:

```sh
npm run e2e:sync
```

The first run downloads the pinned Toxiproxy container image if Docker does not already have it.

The test command creates the protected `_e2e` database, starts the real backend on port `3100`, and puts Toxiproxy on port `3200` between Android and the backend. It resets two existing backend E2E permits before every test and removes the database afterward. It covers:

1. Downloading a permit sent by another device, reopening it, editing it, and sending it again.
2. Keeping local data after dismissing a conflict and finding the conflict again later.
3. Replacing local data with the complete server copy.
4. Resolving two conflicts one at a time.
5. Retrying after a response is lost and the app restarts.
6. Retrying after a response is lost and the same user logs out and back in.
7. Keeping the pending send when the backend rejects authentication during a retry.
8. Keeping local data when an administrator cancels reopening, then sending after reopening again.
9. Showing the retry action when the send response never reaches Android.
10. Retrying successfully when the send response never reaches Android.
11. Keeping the send pending and retrying after a malformed backend response.

For the lost-response cases, Toxiproxy prevents the backend response from reaching Android. Android's native network layer reports that failure before the app's 95-second timer expires. The tests verify that the permit stays pending and can be retried. For the malformed-response case, a test-only HTTP proxy forwards the request to the real backend, waits for its response, and returns invalid JSON over a normally completed connection. These tests do not change the production timeout or duplicate backend behavior. Every run also gives the E2E user a unique password, so a Metro bundle pointing at another backend fails before Android can edit or send data. The development database is never changed.

The happy-path suite does not continue app actions after a failed stage because every later stage depends on it. The validation suite keeps reporting independent rules inside each prepared form. If form setup fails, its dependent section reports the missing prerequisite instead of trying to save incomplete data.

Failure screenshots and device logs are kept under `e2e/artifacts`. Successful-test artifacts are discarded.
