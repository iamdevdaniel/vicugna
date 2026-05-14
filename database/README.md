# database

## Readers and Writers

Readers are reactive hooks. Subscribe to WatermelonDB queries and automatically update when the DB changes. No manual re-fetching needed.

All return `{ data, loading, error }`.

**`useReadAllForm11()`** — loads every form11. For each one it observes shearing, dehearing, and a record count. Does NOT load the actual record rows.

**`useReadOneForm11(id)`** — same as above but for a single form. Observes shearing, dehearing, and record count reactively. Also does NOT load record rows.

**`useReadForm11Records(storageId)`** — loads the full record rows for one form. Use this only on the records list screen.

Writers are async functions for creating and updating data. Call these from components, wrap in try/catch there.

- `createForm11()` - creates a new empty form11 (storage + shearing + dehearing)
- `updateShearingForm(storageId, data)` - updates the shearing section
- `updateDehearingForm(storageId, data)` - updates the dehearing section

## Mappers and Appliers

Defined in `mappers.ts`. Keep DB model types and app types separate.

Mappers read from a model and return an app type:
- `mapToForm11Storage(storage, shearing, dehearing)` - returns `Form11Storage`
- `mapToForm11Record(record)` - returns `Form11Record`

Appliers write app type fields onto a model in place (used inside WatermelonDB `.update()` callbacks):
- `applyShearingToModel(model, data)`
- `applyDehearingToModel(model, data)`
