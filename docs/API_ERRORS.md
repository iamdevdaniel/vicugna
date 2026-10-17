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

These failures prove that no upload reached the backend. The app does not mark
the permit as pending, and the permit remains editable.

| Failure | User action |
| --- | --- |
| No active login (local check without an error code) | Log in and send again. |
| The device confirms it has no connection (`MOBILE_OFFLINE`) | Connect to the internet and send again. |
| Android cannot prepare the local payload (`MOBILE_SYNC_START_FAILED`) | Try again. If it continues, report the problem without losing the collected data. |

## 2. Confirmed backend responses

The backend clearly accepted or rejected the current upload.

| Response | Codes | App behavior |
| --- | --- | --- |
| Upload accepted | Successful `200` response | Save the returned status, `serverHash`, and `hashVersion`, then show success. |
| Login or ownership rejected | `401`, `PERMIT_SYNC_FORBIDDEN` | Show the backend message. |
| Permit missing or unavailable | `PERMIT_NOT_FOUND`, `PERMIT_SYNC_UNAVAILABLE` | Stop the upload and show the backend message. |
| Collected data rejected | `PYLD`, `VPRT_*`, `VSHE_*`, `VCLG_*` | Keep the collected data editable and show the backend rejection message. |
| Server and device data both changed | `SYNC_DATA_CONFLICT` | Keep the local data and offer the choice to preserve it or replace it with the server data. |
| Hash rules are not supported | `SYNC_HASH_VERSION_UNSUPPORTED` | Keep all data unchanged and require an app update. |

## 3. Unconfirmed upload results

These failures do not prove whether the backend saved the upload. The app keeps
the collected data, marks that permit as pending, and shows `Reintentar envío`.
Retrying sends the same collected data and `baseHash`.

| Failure | Codes or examples |
| --- | --- |
| Android stopped waiting before receiving a response | `MOBILE_REQUEST_TIMEOUT` |
| Android could not reach or stay connected to the server | `MOBILE_SERVER_UNREACHABLE` |
| Another unexpected communication failure occurred | `MOBILE_REQUEST_FAILED` |
| The response was not valid API JSON | `MOBILE_INVALID_RESPONSE` |
| The backend returned a server error | `MOBILE_SERVER_ERROR` |
| Android received success but could not save it locally | `MOBILE_SYNC_COMPLETE_FAILED` |
| Android cannot read the pending local data for retry | `MOBILE_SYNC_DATA_READ_FAILED` |
| A retry is blocked before the backend compares the data | Offline status, expired login, rate limiting, or `PYLD` during retry |

The app does not clear an unconfirmed pending state. The user may need to log
in or restore connectivity before retrying.

## 4. Known API inconsistencies

- Global `404`, `429`, and `500` handlers return `{ "message": "..." }` instead
  of the standard error format. A global `503` can return either plain text or
  `{ "message": "..." }`. Android treats these as invalid responses rather
  than using their intended message or code.
- An unexpected mobile-login failure can return its raw error message instead
  of the safe unexpected-error response.
