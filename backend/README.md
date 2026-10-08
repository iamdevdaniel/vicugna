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
- **Page state**: data returned by services and rendered by React Router screens.

These sections describe what the type represents, not where it is allowed to be used. React Router routes connect requests, services, and screens.

## Assignment Rules

1. A season can contain many communities.
2. A community can contain many permits.
3. A permit can have zero or one responsible user.
4. The responsible user must be an active regular user.
5. Before the first download, an administrator may assign, replace, or remove
   the responsible user.
6. The first download changes the permit to `in_progress`; its responsible user
   cannot then be changed through the regular assignment flow.
7. A user can be responsible for many permits.
8. During a season, a permit belongs to one community.
9. A permit number is unique within its season.
