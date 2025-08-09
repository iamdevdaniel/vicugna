import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { Note } from './models/note'
import { mySchema } from './schema'

const adapter = new SQLiteAdapter({
    schema: mySchema,
    dbName: 'vicugna.db',
})

export const database = new Database({
    adapter,
    modelClasses: [Note],
})