# API Errors

This document covers the JSON API used by Android and the PWA. Admin pages use
React Router responses and are not covered here.

## Response format

A successful request returns:

```json
{
  "ok": true,
  "data": {}
}
```

An expected error returns:

```json
{
  "ok": false,
  "error": "Mensaje claro en español",
  "code": "OPTIONAL_STABLE_CODE"
}
```

`error` is safe to show to the user. `code` is optional and is used only when
the app must choose a specific action. Client code must never make decisions by
comparing the message text.

Current validation-code families are `PYLD`, `VPRM`, `VPRT`, `VSHE`, and
`VCLG`. An outdated permit upload uses `SYNC_VERSION_CONFLICT` so the app can
offer to keep the local data or replace it with the current server data.

## HTTP status

| Status | Meaning |
| --- | --- |
| `400` | The request body or collected data is invalid. |
| `401` | Login is required or the token is invalid. |
| `403` | The user is logged in but does not own the requested permit. |
| `404` | The route or requested record does not exist. |
| `409` | The request conflicts with the current permit status or version. |
| `429` | Too many requests were sent. |
| `500` | An unexpected backend error occurred. |
| `503` | The database is temporarily unavailable. |

The backend logs technical details. Responses must not expose stack traces,
database messages, credentials, or internal paths. Unexpected errors return a
general message.

## Mobile handling

`mobile/api/backend-request.ts` converts request failures into these groups:

- `offline`: the device knows it has no internet connection.
- `timeout`: the server did not answer before the request limit.
- `unreachable`: the device could not reach the server.
- `invalid_response`: the server response was not valid JSON or lacked data.
- `rejected`: the backend clearly rejected the request.
- `unexpected`: another communication error occurred.

For ordinary requests, the app shows the backend message for expected `4xx`
errors and a safe fallback message for `5xx` errors. A feature may use `code`
to show a specific recovery action.

For writes, a clear `4xx` rejection means the backend did not accept the
change. A timeout, lost connection, invalid response, or `5xx` response may
leave the result unknown. Each write flow must decide how to recover without
silently repeating a change.

## Known mismatch

The global Express handlers for `404`, `429`, and `503` currently return
`{ "message": "..." }` instead of the standard error format. The mobile client
falls back to its own safe message, but these handlers should eventually use
the standard format above.
