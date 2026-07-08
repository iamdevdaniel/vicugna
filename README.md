# Vicugna

## Mobile

- TODO

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
