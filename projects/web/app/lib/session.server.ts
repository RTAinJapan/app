import type { AppLoadContext } from "@remix-run/cloudflare";

export const getUser = async (request: Request, context: AppLoadContext) => {
	const session = await context.auth.isAuthenticated(request);
	if (!session) {
		return null;
	}
	return context.db.users.findUnique({
		where: { id: session.userId },
		select: {
			id: true,
			roles: { select: { isAdmin: true } },
		},
	});
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
