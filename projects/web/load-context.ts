import {
	createCookie,
	createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";
import { eq } from "drizzle-orm";
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { type PlatformProxy } from "wrangler";

import * as schema from "../db-schema/schema";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		db: DrizzleD1Database<typeof schema>;
		auth: Authenticator<Session>;
	}
}

interface Session {
	userId: number;
}

export const getLoadContext = ({
	context: { cloudflare },
}: {
	context: { cloudflare: Cloudflare };
}) => {
	const db = drizzle(cloudflare.env.DB, { schema });

	const sessionStorage = createWorkersKVSessionStorage({
		kv: cloudflare.env.SESSION_KV,
		cookie: createCookie("session", {
			secure: cloudflare.env.LOCAL !== "true",
			httpOnly: true,
			path: "/",
			secrets: [cloudflare.env.SESSION_COOKIE_SECRET],
		}),
	});

	const auth = new Authenticator<Session>(sessionStorage);

	const discordStrategy = new DiscordStrategy(
		{
			clientID: cloudflare.env.DISCORD_CLIENT_ID,
			clientSecret: cloudflare.env.DISCORD_CLIENT_SECRET,
			callbackURL: "/sign-in/callback/discord",
			scope: ["identify"],
		},
		async ({ profile }) => {
			const user = await db.query.users.findFirst({
				where: eq(schema.users.discordId, profile.id),
				columns: { id: true },
			});
			if (user) {
				return { userId: user.id };
			}
			const [newUser] = await db
				.insert(schema.users)
				.values({
					discordId: profile.id,
					displayName: profile.displayName,
				})
				.returning({ id: schema.users.id });
			if (newUser) {
				return { userId: newUser.id };
			}
			throw new Error("failed to authenticate with Discord");
		},
	);

	auth.use(discordStrategy);

	return { db, auth };
};
