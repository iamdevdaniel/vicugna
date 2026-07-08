# Backend Notes

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
