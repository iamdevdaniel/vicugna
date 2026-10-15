# API Errors

This document covers the JSON API used by Android and the PWA. Admin pages use
React Router responses and are not covered here.

Success uses `{ "ok": true, "data": ... }`. An expected error uses
`{ "ok": false, "error": "Mensaje en español", "code": "OPTIONAL_CODE" }`.
An unexpected error uses `{ "ok": false, "error": "Error interno del servidor" }`.
The error `code` is optional. The app uses it when a specific action is needed,
and may use the HTTP status for general cases such as `401`. It never uses the
message text to choose an action. Technical details stay in backend logs.

## 1. Failures before submission

These failures prove that no upload reached the backend. The app does not save
a sync-attempt ID, and the permit remains editable.

| Failure | User action |
| --- | --- |
| No active login (local check without an error code) | Log in and send again. |
| The device confirms it has no connection (`MOBILE_OFFLINE`) | Connect to the internet and send again. |
| Android cannot prepare the local payload (`MOBILE_SYNC_START_FAILED`) | Try again. If it continues, report the problem without losing the collected data. |

## 2. Confirmed backend responses

The backend clearly accepted or rejected the current upload.

| Response | Codes | App behavior |
| --- | --- | --- |
| Upload accepted | Successful `200` response | Save the returned status and version, clear the attempt ID, and show success. |
| Login or ownership rejected | `401`, `PERMIT_SYNC_FORBIDDEN` | Show the backend message. A new rejected attempt may be cleared. |
| Permit missing or unavailable | `PERMIT_NOT_FOUND`, `PERMIT_SYNC_UNAVAILABLE` | Stop the upload and show the backend message. |
| Collected data rejected | `PYLD`, `VPRM_2`, `VPRT_*`, `VSHE_*`, `VCLG_*` | Keep the collected data editable and show the backend rejection message. |
| Newer server data exists | `SYNC_VERSION_CONFLICT` | Keep the local data and offer the existing choice to preserve it or replace it with the server data. |

A rejection clears the attempt ID only when it proves that the current upload
was not saved. A response received while retrying may not resolve the earlier
upload and can belong to section 3 instead.

If Android cannot remove the saved attempt after a clear rejection,
`MOBILE_SYNC_CLEAR_FAILED` keeps the permit locked and shows
`Reintentar envío`.

## 3. Unconfirmed upload results

These failures do not prove whether the backend saved the upload. The app keeps
the same sync-attempt ID and collected data, locks that permit, and shows
`Reintentar envío`. Retrying sends the same ID and data.

| Failure | Codes or examples |
| --- | --- |
| Android stopped waiting before receiving a response | `MOBILE_REQUEST_TIMEOUT` |
| Android could not reach or stay connected to the server | `MOBILE_SERVER_UNREACHABLE` |
| Another unexpected communication failure occurred | `MOBILE_REQUEST_FAILED` |
| The response was not valid API JSON | `MOBILE_INVALID_RESPONSE` |
| The backend returned a server error | `MOBILE_SERVER_ERROR`. Android currently replaces the backend's `SYNC_ATTEMPT_READ_FAILED` code with this code. |
| Android received success but could not save it locally | `MOBILE_SYNC_COMPLETE_FAILED` |
| Android cannot read a saved attempt for retry | `MOBILE_SYNC_DATA_READ_FAILED` |
| The saved ID does not match the backend attempt | `SYNC_ATTEMPT_MISMATCH` |
| A retry is blocked before the backend checks its saved attempt | Offline status, expired login, rate limiting, or `PYLD` during retry |

The app does not cancel an unconfirmed attempt or create a new ID. The user may
need to log in or restore connectivity before retrying.

## 4. Known API inconsistencies

- Global `404`, `429`, and `500` handlers return `{ "message": "..." }` instead
  of the standard error format. A global `503` can return either plain text or
  `{ "message": "..." }`. Android treats these as invalid responses rather
  than using their intended message or code.
- An unexpected mobile-login failure can return its raw error message instead
  of the safe unexpected-error response.
