# Vicugna

Vicugna is an offline-first Android field application for recording vicuña
management data, with an Express/PostgreSQL backend and administrative web
interface.

## Projects

- `mobile/` — Expo/React Native Android application with local WatermelonDB
  storage and synchronization.
- `backend/` — Express API, PostgreSQL persistence, and admin frontend.
- `shared/` — Shared TypeScript contracts.

## Development

Install dependencies from the repository root:

```bash
npm install
```

Use the project-specific README files and scripts for local backend and mobile
development.

## Releases

Backend releases deploy from `main`. Mobile patch releases use OTA updates;
mobile minor and major releases build a new Android APK.

Internal planning and TODOs are kept locally in `.local/TODO.md` and are not
part of the public repository.
