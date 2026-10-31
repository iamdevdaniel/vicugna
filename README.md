# Vicugna

Vicugna is an offline-first field application for recording vicuña management
data, with an Expo Android application, Express/PostgreSQL backend, and
administrative web interface.

## Projects

- `mobile/` — Expo Android application using WatermelonDB for offline data.
- `backend/` — Express API, PostgreSQL persistence, and admin frontend.
- `shared/` — Shared TypeScript contracts.

## Development

Install dependencies from the repository root:

```bash
npm install
```

Project guides are listed in [docs/README.md](docs/README.md).
API error handling is documented in [docs/API_ERRORS.md](docs/API_ERRORS.md).

Section-title comments always use this format:

```ts
// ==========================================
// TITLE
// ==========================================
```

## Testing

See [TESTING.md](TESTING.md) for the current automated test coverage, setup,
and architecture.

## Releases

Backend releases deploy from `main`. Mobile patch releases use OTA updates;
mobile minor and major releases build a new Android APK.

Internal planning and TODOs are kept locally in `.local/TODO.md` and are not
part of the public repository.
