import { Model } from "@nozbe/watermelondb"
import { date, field } from "@nozbe/watermelondb/decorators"

export class Note extends Model {
	static table = "notes"

	@field("text") text!: string
	@date("created_at") createdAt!: Date
	@date("updated_at") updatedAt!: Date
}
