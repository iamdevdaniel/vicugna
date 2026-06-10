import { Database } from "@nozbe/watermelondb"
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite"
import {
	BasicInfoModel,
	ParticipantModel,
	ShearingHeaderModel,
	ShearingRecordModel,
} from "./models"
import { appDbSchema } from "./schemas"

const adapter = new SQLiteAdapter({
	schema: appDbSchema,
})

export const database = new Database({
	adapter,
	modelClasses: [
		BasicInfoModel,
		ParticipantModel,
		ShearingHeaderModel,
		ShearingRecordModel,
	],
})
