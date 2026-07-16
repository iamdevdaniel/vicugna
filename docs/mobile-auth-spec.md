# Mobile Auth Spec

## Scope

- First mobile login
- Permit download after login
- Offline use after permits are on the device
- What login is used for

## Goals

- Let the user log in with credentials given by the admin
- Download the user permits right after login
- Allow data collection without needing to stay online
- Use login only for permit download and sync

## Core Rules

### 1. First Login

- The user logs in for the first time with the username and password given by the admin.
- The admin-created mobile user uses `email + password`.
- A successful login returns only the permits currently assigned to that user.
- A successful login may still return zero permits.

### 2. Offline Usage

- Right after a successful login, the backend sends the user permit data.
- Once the permits are on the device, the user can start collecting data.
- The user does not need to be online to keep collecting data later.
- Local collected data stays only on the device that created it.
- Local collected data is not copied to the user's other devices.

### 3. What Requires Backend Access

- Login
- Permit refresh from the backend
- Sync
- Permit refresh may happen automatically in the background when the user has internet and is already logged in.

### 4. Auth Must Never Block Local Collection

- If the permits are already on the device, login must never block local data collection.
- Login is only needed to get permit data and to sync later.
- If a permit was removed on the backend, the user may still see local data for it, but sync must be blocked.

## Backend Data Needed

- Mobile user with `email + password`
- Assigned permits per user
- Token/session support
- Device login history

## First Login Contract

- Request: `email + password`
- Response: assigned permits only
- Minimum permit payload:
  - `id`
  - `seasonId`
  - `communityId`
  - `permitNumber`
  - `createdAt`
  - `updatedAt`

## Session Rules

- The mobile app stores the auth token locally on the device.
- The token is used for permit refresh and sync.
- If the token is invalid or expired, the user logs in again.
- Local data collection must still work even if the token is missing or expired.
- Initial token lifetime target: `90 days`

## Out of Scope For This Document
