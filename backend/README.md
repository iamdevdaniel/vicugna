# Backend Notes

## Type Sections

- **Domain**: app/business meaning. Example: `UserListItem`.
- **HTTP**: data coming from requests/forms. Example: `CreateUserFormData`.
- **View**: data needed to render EJS pages/partials. Example: `UsersPageData`.

These sections describe what the type represents, not where it is allowed to be used. Controllers are the fork in the road: they connect requests, services, and views.
