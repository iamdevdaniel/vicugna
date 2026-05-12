# database

## Readers and Writers

Readers are reactive hooks. Subscribe to WatermelonDB queries and automatically update when the DB changes. No manual re-fetching needed.

- `useAllForm11()` - all form11 storage objects (no records)
- `useForm11Records(storageId)` - records for a specific form11 storage

Both return `{ data, loading, error }`.

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
