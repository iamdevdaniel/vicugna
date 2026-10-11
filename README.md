# Vicugna

Vicugna is an offline-first field application for recording vicuña management
data, with an Express/PostgreSQL backend and administrative web interface. The
existing Expo project targets Android and is being extended with a laptop-first
Chrome PWA.

## Projects

- `mobile/` — Expo project containing the Android application and its laptop
  PWA port. Android uses WatermelonDB; the PWA will use Dexie/IndexedDB behind
  web-specific files.
- `backend/` — Express API, PostgreSQL persistence, and admin frontend.
- `shared/` — Shared TypeScript contracts.

## Development

Install dependencies from the repository root:

```bash
npm install
```

Project guides are listed in [docs/README.md](docs/README.md).

## Testing

See [docs/testing.md](docs/testing.md) for the current automated test coverage,
setup, and architecture.

## Releases

Backend releases deploy from `main`. Mobile patch releases use OTA updates;
mobile minor and major releases build a new Android APK.

Internal planning and TODOs are kept locally in `.local/TODO.md` and are not
part of the public repository.
