# Vicugna - Offline-First Mobile App

React Native app built with Expo + TypeScript for Android.

## Tech Stack

- **Framework:** Expo (managed workflow) + TypeScript
- **Database:** WatermelonDB + expo-sqlite (offline-first)
- **Sync:** expo-task-manager + expo-background-fetch
- **Styling:** NativeWind (Tailwind CSS)
- **Navigation:** React Navigation + Expo Router
- **State:** Zustand
- **Storage:** expo-secure-store + expo-file-system

## Development

1. **Install:**
   ```bash
   npm install

2. **Run on Android**
``` npm run Android

## Upgrade Notes

- Expo doctor looks good.
- The only warning left is WatermelonDB not being tested on the New Architecture.
- I removed `@react-native-vector-icons/material-design-icons` because we were not using it.
- I ignored `@nozbe/simdjson` because it was just a package metadata warning.
- Next: run the app and test DB create, edit, delete, and reload.