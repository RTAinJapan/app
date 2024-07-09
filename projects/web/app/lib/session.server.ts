import type { AppLoadContext } from "@remix-run/cloudflare";

export const getUser = async (request: Request, context: AppLoadContext) => {
	const session = await context.auth.isAuthenticated(request);
	if (!session) {
		return null;
	}

	const user = await context.db.user.findUnique({
		where: { id: session.userId },
		select: {
			id: true,
			displayName: true,
			roles: { select: { isAdmin: true } },
		},
	});

	// Session exists but the user doesn't.
	// This can happen if the user was deleted from the database, but the session is still valid.
	if (!user) {
		await context.auth.logout(request, { redirectTo: "/" });
	}

	return user;
};

export const assertUser = async (request: Request, context: AppLoadContext) => {
	const user = await getUser(request, context);
	if (!user) {
		throw new Response("must sign in", { status: 401 });
	}
	return user;
};

export const assertAdmin = async (
	request: Request,
	context: AppLoadContext,
) => {
	const user = await assertUser(request, context);
	if (!user.roles?.isAdmin) {
		throw new Response("must be an admin", { status: 403 });
	}
	return user;
};
