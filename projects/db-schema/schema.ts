import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const createdUpdatedColumns = {
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.notNull()
		.$default(() => new Date()),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.notNull()
		.$onUpdate(() => new Date()),
};

export const users = sqliteTable("users", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	discordId: text("discord_id").unique().notNull(),
	displayName: text("display_name").notNull(),
	...createdUpdatedColumns,
});
