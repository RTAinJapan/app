import { PrismaD1 } from "@prisma/adapter-d1";
import { PrismaClient } from "@prisma/client";
import {
	type Cookie,
	createCookie,
	createWorkersKVSessionStorage,
	type SessionStorage,
} from "@remix-run/cloudflare";
import { Authenticator } from "remix-auth";
import { DiscordStrategy } from "remix-auth-discord";
import { type PlatformProxy } from "wrangler";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
	interface AppLoadContext {
		db: PrismaClient;
		auth: Authenticator<Session>;
		sessionStorage: SessionStorage;
		renewSessionCookie: Cookie;
	}
}

type Session = Readonly<{ userId: number }>;

export const getLoadContext = ({
	context: { cloudflare },
}: {
	context: { cloudflare: Cloudflare };
}) => {
	const db = new PrismaClient({ adapter: new PrismaD1(cloudflare.env.DB) });

	const superAdmin = new Set(cloudflare.env.SUPER_ADMIN_DISCORD_ID.split(","));

	const sessionStorage = createWorkersKVSessionStorage({
		kv: cloudflare.env.SESSION_KV,
		cookie: createCookie("session", {
			secure: cloudflare.env.LOCAL !== "true",
			httpOnly: true,
			path: "/",
			secrets: [cloudflare.env.SESSION_COOKIE_SECRET],
			maxAge: 60 * 60 * 24 * 14,
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
			const isSuperAdmin = superAdmin.has(profile.id);
			const user = await db.users.upsert({
				where: { discordId: profile.id },
				update: {
					roles: isSuperAdmin
						? {
								upsert: {
									create: { isAdmin: true },
									update: { isAdmin: true },
								},
							}
						: undefined,
				},
				create: {
					discordId: profile.id,
					displayName: profile.displayName,
					roles: isSuperAdmin ? { create: { isAdmin: true } } : undefined,
				},
				select: { id: true },
			});
			return { userId: user.id };
		},
	);

	auth.use(discordStrategy);

	const renewSessionCookie = createCookie("renew-session", {
		httpOnly: true,
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60, // 1 hour
		secure: cloudflare.env.LOCAL !== "true",
	});

	return { db, auth, renewSessionCookie, sessionStorage };
};
