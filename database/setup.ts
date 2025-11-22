import { Database } from "@nozbe/watermelondb"
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite"
import {
	Form11DehearingModel,
	Form11RecordModel,
	Form11ShearingModel,
	Form11StorageModel,
	SyncMetaModel,
} from "./models"
import { appDbSchema } from "./schemas"

const adapter = new SQLiteAdapter({
	schema: appDbSchema,
})

export const database = new Database({
	adapter,
	modelClasses: [
		Form11ShearingModel,
		Form11DehearingModel,
		Form11RecordModel,
		SyncMetaModel,
		Form11StorageModel,
	],
})
