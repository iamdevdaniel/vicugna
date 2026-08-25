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

- TODO: Send each permit and its field data to every assigned user, not only the
  active/lead assignee. Keep permission to upload the completed permit limited
  to the active/lead assignee.
- TODO: Make related DAL data and status writes atomic. Currently, a data write
  can succeed before its status recalculation fails, leaving stale persisted
  statuses.
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
- TODO: Add bounded local diagnostic logs for mobile-only operational failures:
  offline, request timeout, unreachable backend, invalid response, and unknown
  client errors. Store structured entries with timestamp, operation, category,
  safe technical details, and app version using `expo-file-system`; rotate or
  delete old files at a fixed size/count limit. Never log tokens, passwords,
  signatures, identity numbers, or request payloads. Decide later when and how
  these logs are sent to the backend.
- TODO: From an existing Registro de fibra record, allow the user to continue
  directly to the next detail form after saving, instead of always returning to
  the Registro de fibra overview or permit home screen. Preserve the current
  edit/create distinction and only offer this navigation when the next form is
  valid for the current record state.
- TODO: Design a direct next-form flow for shearing create and edit screens.
  Decide whether the next destination depends on creating versus editing, the
  current record/header state, and whether another record already exists. Keep
  back navigation, cancellation, validation errors, and partially completed
  records safe. After the partial-save flow is corrected, enforce locked-field
  behavior in create/edit forms with disabled inputs where appropriate; do not
  rely only on read-only permit summaries.

## Backend

- TODO: Add password reset flow.
- TODO: Delete users safely: hard delete only when they have no assigned data; otherwise deactivate.
- TODO: Enforce completed Registro de fibra headers at the backend sync boundary. The mobile app now allows users to save step 3.1 after entering the start date, while leaving the finishing date empty until the process ends. That partial state is valid locally, but it must not be accepted by `POST /permits/sync`. The backend currently verifies that the cleaning header exists and belongs to the permit, but does not verify `isCompleted` or require non-empty `startDate`, `endDate`, `site`, and `supervisors`. A crafted or outdated client request could therefore sync an incomplete header; PostgreSQL `NOT NULL` does not prevent this because an empty string is still non-null. Add explicit validation, return a Spanish client error, and test that the transaction does not replace existing field data when the header is incomplete.

### TODO: Assignment UX And Integrity

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

## Hosting & DB

Links for future consideration (db and server):
- [Render Dashboard](https://dashboard.render.com/) (Server)
- [Supabase Pricing](https://supabase.com/pricing) (DB)
