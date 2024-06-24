import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { type PlatformProxy } from "wrangler";

import * as schema from "../db-schema/schema";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		db: DrizzleD1Database<typeof schema>;
	}
}

export const getLoadContext = ({
	context: { cloudflare },
}: {
	context: { cloudflare: Cloudflare };
}) => {
	const db = drizzle(cloudflare.env.DB, { schema });
	return { db };
};
