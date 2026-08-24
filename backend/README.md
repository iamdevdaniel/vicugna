# Backend Notes

## Database Commands

- `npm run db -- start`: Starts the local Postgres container and waits until it is ready.
- `npm run db -- respawn`: Initializes the database in `VICUGNA_DEV_DATABASE_URL` with migrations and all development seeds.
- `npm run db -- wait`: Waits until the local Postgres container is ready.
- `npm run db -- stop`: Stops the local Postgres container without deleting its data.
- `npm run db -- nuke`: Stops the local Postgres container and permanently deletes its database volume.
- `npm run db -- status`: Shows whether the local Postgres container is running.
- `npm run db -- generate`: Generates migration SQL and metadata from the current Drizzle schema.
- `npm run db -- migrate`: Applies pending migrations to the database configured in `VICUGNA_DATABASE_URL`.
- `npm run db -- studio`: Opens Drizzle Studio for the database configured in `VICUGNA_DATABASE_URL`.
- `npm run db -- seed seasons`: Creates or updates the development seasons.
- `npm run db -- seed regionals`: Creates or updates the department, regional, and community catalog.
- `npm run db -- seed users`: Creates or updates the development mobile users.
- `npm run db -- seed asg`: Creates or updates the development permits and their assignments.
- `npm run db -- seed asg-reset`: Deletes synced field data for seeded permits and returns them to `assigned`.

## Type Sections

- **Domain**: app/business meaning. Example: `UserListItem`.
- **HTTP**: data coming from requests/forms. Example: `CreateUserFormData`.
- **View**: data needed to render EJS pages/partials. Example: `UsersPageData`.

These sections describe what the type represents, not where it is allowed to be used. Controllers are the fork in the road: they connect requests, services, and views.

## Assignment Rules

1. A season can contain many communities.
2. A community can contain many permits.
3. A permit can have many assigned users.
4. A permit can have only one active assigned user at a time.
5. The first assignment created for a permit becomes the active one by default.
6. Later assignments for the same permit start as inactive.
7. A user can be assigned to many communities, but not twice to the same permit/community combination.
8. During a season, a permit can belong to only one community.
9. A permit cannot be reused across different seasons.
10. The exact same assignment row must not be inserted twice.
