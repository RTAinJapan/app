import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdUpdatedRows = {
	createdAt: integer("created_at", { mode: "timestamp_ms" }).$default(
		() => new Date(),
	),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" }).$onUpdate(
		() => new Date(),
	),
};

export const users = sqliteTable("users", {
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	discordId: text("discord_id").unique(),
	displayName: text("display_name"),
	...createdUpdatedRows,
});
