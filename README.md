# Vicugna

## Releases

- Daily work is pushed to `dev`; Render watches `main` for backend releases.
- `npm run release:backend` publishes a patch release to `dev` and `main`.
- `npm run release:mobile` publishes a patch release to `dev` only.
- Pass `-- minor` or `-- major` to choose a larger version bump.
- Releases update the version files, create a release commit, and create a Git
  tag such as `backend-v1.0.1` or `mobile-v1.0.1`.

## Mobile

- TODO: Make related DAL data and status writes atomic. Currently, a data write
  can succeed before its status recalculation fails, leaving stale persisted
  statuses.
- TODO: Add bounded local diagnostic logs for mobile-only operational failures:
  offline, request timeout, unreachable backend, invalid response, and unknown
  client errors. Store structured entries with timestamp, operation, category,
  safe technical details, and app version using `expo-file-system`; rotate or
  delete old files at a fixed size/count limit. Never log tokens, passwords,
  signatures, identity numbers, or request payloads. Decide later when and how
  these logs are sent to the backend.

## Backend

- Add password reset flow.
- Delete users safely: hard delete only when they have no assigned data; otherwise deactivate.

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
