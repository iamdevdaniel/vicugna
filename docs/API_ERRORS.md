# API Errors

This document covers the JSON API used by Android and the PWA. Admin pages use
React Router responses and are not covered here.

## Response format

Success:

```json
{
  "ok": true,
  "data": {}
}
```

Expected error:

```json
{
  "ok": false,
  "error": "Mensaje claro en español",
  "code": "OPTIONAL_STABLE_CODE"
}
```

- `error`: Spanish message that is safe to show to the user.
- `code`: Optional stable value used when the app needs a specific action.
- Client code must use `code`, never message text, to choose an action.

## Error codes

- `PYLD`: The request body does not match the required permit structure.
- `VPRM_2`: The submitted permit version is invalid.
- `VPRT_1`: The permit has no participants.
- `VPRT_2`: A participant belongs to another permit.
- `VPRT_3`: The request contains a duplicated participant.
- `VSHE_1`: The shearing record is incomplete.
- `VSHE_2`: The shearing header belongs to another permit.
- `VSHE_3`: The permit has no shearing records.
- `VSHE_4`: A shearing record belongs to another permit.
- `VSHE_5`: Gestation is invalid for the animal's sex or age.
- `VSHE_6`: The shearing state is invalid for the animal's age or gestation.
- `VSHE_7`: The request contains a duplicated shearing record.
- `VCLG_1`: The general fiber-record information is incomplete.
- `VCLG_2`: The fiber-record header belongs to another permit.
- `VCLG_3`: The permit has no fiber records.
- `VCLG_4`: A fiber record does not have exactly one detail.
- `VCLG_5`: A fiber record belongs to another permit.
- `VCLG_6`: A fiber record is incomplete.
- `VCLG_7`: A cleaning detail belongs to another fiber record.
- `VCLG_8`: A dehairing detail belongs to another fiber record.
- `VCLG_9`: A fiber record has both cleaning and dehairing details.
- `VCLG_11`: Clean weight is greater than gross weight.
- `VCLG_12`: Dirty weight is greater than gross weight.
- `VCLG_13`: The cleaning weights together are greater than gross weight.
- `VCLG_14`: Stored total weight does not equal the cleaning weights.
- `VCLG_15`: The request contains a duplicated fiber record.
- `VCLG_16`: More than one cleaning detail points to the same fiber record.
- `VCLG_17`: The request contains a duplicated cleaning detail.
- `VCLG_18`: More than one dehairing detail points to the same fiber record.
- `VCLG_19`: The request contains a duplicated dehairing detail.
- `PERMIT_NOT_FOUND`: The requested permit does not exist.
- `PERMIT_SYNC_FORBIDDEN`: The user is not allowed to upload the permit.
- `PERMIT_SYNC_UNAVAILABLE`: The permit is not currently available for upload.
- `SYNC_VERSION_CONFLICT`: The server has a newer version of the permit.
- `SYNC_ATTEMPT_MISMATCH`: The same attempt ID was reused with different details.
- `SYNC_ATTEMPT_READ_FAILED`: The backend could not read a reserved sync attempt.

## HTTP status

- `400`: The request body or collected data is invalid.
- `401`: Login is required or the token is invalid.
- `403`: The user is logged in but does not own the permit.
- `404`: The route or requested record does not exist.
- `409`: The request conflicts with the current permit state or version.
- `429`: Too many requests were sent.
- `500`: An unexpected backend error occurred.
- `503`: The database is temporarily unavailable.

The backend logs technical details. Responses must not expose stack traces,
database messages, credentials, or internal paths. Unexpected errors return a
general message.

## Mobile handling

`mobile/api/backend-request.ts` converts request failures into these groups:

- `offline`: The device knows it has no internet connection.
- `timeout`: The server did not answer before the request limit.
- `unreachable`: The device could not reach the server.
- `invalid_response`: The server response was not valid JSON or lacked data.
- `rejected`: The backend clearly rejected the request.
- `unexpected`: Another communication error occurred.

- Expected `4xx` errors show the backend message.
- Unexpected `5xx` errors show a safe message from the app.
- A stable `code` may activate a specific recovery action.
- A timeout, lost connection, invalid response, or `5xx` may leave a write's result unknown.

## Known mismatch

- Global `404`, `429`, and `503` handlers return `{ "message": "..." }` instead of the standard error format.
- The mobile app safely replaces those responses, but the handlers should eventually use the standard format.
