import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import {
	createCookie,
	createWorkersKVSessionStorage,
} from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { type PlatformProxy } from "wrangler";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		db: PrismaClient;
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
	const db = new PrismaClient({ adapter: new PrismaD1(cloudflare.env.DB) });

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
			const user = await db.users.upsert({
				where: { discordId: profile.id },
				update: {},
				create: {
					discordId: profile.id,
					displayName: profile.displayName,
				},
				select: { id: true },
			});
			return { userId: user.id };
		},
	);

	auth.use(discordStrategy);

	return { db, auth };
};
