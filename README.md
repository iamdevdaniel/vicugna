# Vicugna

## Releases

- Daily work is pushed to `dev`; Render watches `main` for backend releases.
- `npm run release:backend` publishes a patch release to `dev` and `main`.
- `npm run release:mobile` publishes a patch OTA release to `dev` only.
- Mobile minor and major releases build and publish a new APK. Their
  `runtimeVersion` follows `major.minor`, while Android `versionCode` increases
  for every APK.
- Pass `-- minor` or `-- major` to choose a larger version bump.
- Releases update the version files, create a release commit, and create a Git
  tag such as `backend-v1.0.1` or `mobile-v1.0.1`.

### Branch divergence checks

```bash
git merge-base origin/main origin/dev
```
Shows the last commit shared by `main` and `dev`.

```bash
git rev-list --left-right --count origin/main...origin/dev
```
Counts commits unique to `main` and unique to `dev`, in that order.

```bash
git show -s --format='%h %ad %s' --date=iso "$(git merge-base origin/main origin/dev)"
```
Shows the shared divergence commit's ID, date, and message.

## Mobile

### [P1]

- TODO: Make related DAL data and status writes atomic. Currently, a data write
  can succeed before its status recalculation fails, leaving stale persisted
  statuses.

### [P1]

- TODO: Audit important mobile mutation hooks for synchronous re-entry. React
  loading state is scheduled and cannot reliably stop two rapid presses before
  the component rerenders, so create, update, delete, sync, and other
  non-idempotent operations can overlap even when their buttons use a loading
  flag. Centralize a consistent pattern in those hooks: use a ref as the
  immediate in-flight lock for the complete operation, including validation
  and navigation, and keep state only for rendering disabled/loading feedback.
  Release the lock after validation or a failed operation; after successful
  navigation, leave it locked until the screen unmounts. Do not add this to
  read-only requests or harmless idempotent actions. Add repeated-press tests
  for creation, deletion, synchronization, and save/delete overlap.

### [P1]

- TODO: Replace the mobile bearer-token persistence model with a secure,
  offline-first session model. `mobile/utils/auth-store.ts` currently persists
  the 90-day bearer token, expiry, and cached user in plain `AsyncStorage`.
  Move the long-lived session/refresh credential to Expo SecureStore backed by
  Android Keystore, while keeping only the non-sensitive cached identity and
  offline authentication state in local app storage. The current backend has
  no refresh-token flow; it only signs a self-contained bearer token in
  `backend/src/modules/mobile-auth/mobile_auth.token.ts`, so add an explicit
  session/refresh endpoint and short-lived access-token renewal before changing
  the client storage.

  Preserve offline work after access-token expiry: local permit/form reads and
  writes must continue without a valid server token, while permit downloads,
  sync, and other server operations wait for connectivity and successful
  session renewal. Centralize authenticated requests so expiry triggers one
  refresh attempt, concurrent requests do not race, failed renewal returns a
  clear re-login state, and queued sync data is never deleted or partially
  applied because authentication failed. Define logout, revoked-user,
  password-change, device-loss, and credential-migration behavior. Migrate
  existing `AsyncStorage` sessions safely, never log tokens or refresh
  credentials, and test cold-start hydration, long offline periods, expiry
  during sync, reconnect/retry, duplicate refreshes, logout, and WatermelonDB
  data preservation on Android release builds.

### [P1]

- TODO: Send each permit and its field data to every assigned user, not only the
  active/lead assignee. Keep permission to upload the completed permit limited
  to the active/lead assignee.

### [P2]

- TODO: Add an OTA update status flow for Android. Use `expo-updates` from the
  root app lifecycle to check for compatible production updates, expose states
  for checking, available, downloading, ready, and failed, and later connect
  those states to a user notification. Downloading an update is safe while the
  user works, but applying it with `Updates.reloadAsync()` can discard unsaved
  in-memory form state, so reload only at a safe point chosen by the future UX.
  Keep runtime-version compatibility enforced: native dependency or native
  configuration changes require a new APK, while patch OTA releases must remain
  JavaScript/assets-only. Test the flow on a production APK, not Expo Go, and
  verify failure handling, rollback behavior, offline use, and WatermelonDB
  data safety.

### [P2]

- TODO: Add bounded local diagnostic logs for mobile-only operational failures:
  offline, request timeout, unreachable backend, invalid response, and unknown
  client errors. Store structured entries with timestamp, operation, category,
  safe technical details, and app version using `expo-file-system`; rotate or
  delete old files at a fixed size/count limit. Never log tokens, passwords,
  signatures, identity numbers, or request payloads. Decide later when and how
  these logs are sent to the backend.

### [P3]

- TODO: From an existing Registro de fibra record, allow the user to continue
  directly to the next detail form after saving, instead of always returning to
  the Registro de fibra overview or permit home screen. Preserve the current
  edit/create distinction and only offer this navigation when the next form is
  valid for the current record state.

### [P3]

- TODO: Design a direct next-form flow for shearing create and edit screens.
  Decide whether the next destination depends on creating versus editing, the
  current record/header state, and whether another record already exists. Keep
  back navigation, cancellation, validation errors, and partially completed
  records safe. After the partial-save flow is corrected, enforce locked-field
  behavior in create/edit forms with disabled inputs where appropriate; do not
  rely only on read-only permit summaries.

## Backend

### [P1]

- TODO: Enforce completed Registro de fibra headers at the backend sync boundary. The mobile app now allows users to save step 3.1 after entering the start date, while leaving the finishing date empty until the process ends. That partial state is valid locally, but it must not be accepted by `POST /permits/sync`. The backend currently verifies that the cleaning header exists and belongs to the permit, but does not verify `isCompleted` or require non-empty `startDate`, `endDate`, `site`, and `supervisors`. A crafted or outdated client request could therefore sync an incomplete header; PostgreSQL `NOT NULL` does not prevent this because an empty string is still non-null. Add explicit validation, return a Spanish client error, and test that the transaction does not replace existing field data when the header is incomplete.

### [P2]

- TODO: Delete users safely: hard delete only when they have no assigned data; otherwise deactivate.

### [P2] TODO: Assignment UX And Integrity

- Drive the whole assignment screen from the selected season and reset permit/user state when the season changes.
- Keep a single-screen flow with three panels: permit setup/selection, user assignment, and permit result card.
- Treat community as part of permit setup; once a permit has assignments, its community becomes read-only.
- Disable the assignment panel until a permit is created or selected.
- Show one selected permit card in detail and keep other permits in a compact season list.
- Make active assignee status visually obvious and allow switching it from the permit card.
- Show clear empty states for permits with no assigned users.
- Keep one permit inside one community only.
- Allow many users per permit, but only one active assignee per permit.
- Decide how to handle assigned users that later become inactive system users.
- Keep future mobile sync rules aligned with permit community locking and single active assignee.

### [P3]

- TODO: Add password reset flow.

## Hosting & DB

Links for future consideration (db and server):
- [Render Dashboard](https://dashboard.render.com/) (Server)
- [Supabase Pricing](https://supabase.com/pricing) (DB)
