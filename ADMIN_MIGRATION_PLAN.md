# Admin migration plan

## Goal

Replace the EJS, HTMX, and Alpine admin with React Router Framework Mode without changing the mobile API, business rules, services, repositories, or database.

The two admin interfaces will run side by side during the migration:

- Current admin: `/admin`
- New admin: `/admin-v2`

Express remains the application server. The new route loaders and actions call the existing services directly. There will be no separate admin API and no React Server Components.

```text
Express
└── /admin-v2
    └── React Router Framework Mode
        ├── loaders and actions
        ├── existing services
        ├── existing repositories
        └── PostgreSQL
```

## Step 1: Foundation

- Install React Router Framework Mode.
- Integrate its handler into the existing Express server.
- Mount it at `/admin-v2`.
- Add the root layout, styles, error boundary, and a basic test page.
- Reuse Tailwind and DaisyUI initially.
- Verify development and production builds.

Review goal: approve the architecture before migrating features.

Estimate: 3–5 hours.

## Step 2: Authentication

- Connect React Router to the existing Express session.
- Create the new login and logout actions.
- Add a protected admin layout.
- Redirect unauthenticated requests correctly.
- Preserve rate limiting and secure cookies.

Review goal: confirm that login, logout, redirects, and session expiration behave like the current admin.

Estimate: 3–5 hours.

## Step 3: Mission control

- Migrate the mission-control screen.
- Add navigation to the new admin sections.
- Preserve version and environment information.
- Establish shared page, button, form, loading, and error patterns.

Review goal: approve the shared UI conventions before larger screens use them.

Estimate: 2–3 hours.

## Step 4: Users

- Migrate the users list.
- Migrate user creation and validation.
- Migrate password generation.
- Preserve success, error, and loading states.
- Call the existing user services directly from loaders and actions.

Review goal: compare every user operation with the current interface.

Estimate: 4–6 hours.

## Step 5: Assignments — reading and navigation

- Migrate season selection.
- Migrate permit and user panels.
- Migrate filtering, selection, and responsive layout.
- Do not add mutations in this step.

Review goal: verify that all displayed data and selections match the current admin.

Estimate: 4–6 hours.

## Step 6: Assignments — mutations

- Migrate permit creation.
- Migrate assignment changes and ordering.
- Preserve validation and active-user rules.
- Add pending states, error recovery, and unsaved-change protection.
- Continue using the existing assignment service.

Review goal: test every assignment operation independently. This is the highest-risk step.

Estimate: 5–8 hours.

## Step 7: Monitoring and exports

- Migrate the monitoring overview and filters.
- Migrate permit details.
- Migrate reopening permits.
- Connect existing export downloads without rewriting export generation.

Review goal: compare statuses, details, reopening, and downloaded files with the current admin.

Estimate: 6–9 hours.

## Step 8: Verification

- Create one parity checklist covering both interfaces.
- Test desktop and narrow layouts.
- Test authentication failures, validation failures, an unavailable database, and repeated submissions.
- Add a small browser E2E suite for the critical admin flow.
- Remove temporary migration adapters.

Review goal: establish that `/admin` and `/admin-v2` provide the same behavior.

Estimate: 5–8 hours.

## Step 9: Cutover and cleanup

- Mount the React Router application at `/admin`.
- Remove `/admin-v2`.
- Delete the old EJS templates and partials.
- Remove HTMX, Alpine, obsolete controller paths, assets, and dependencies.
- Run final build and deployment checks.

This must be a separate change and happen only after the new admin has reached feature parity and been approved.

Estimate: 2–4 hours.

## Expected total

Approximately 34–54 hours across nine reviewable changes.

