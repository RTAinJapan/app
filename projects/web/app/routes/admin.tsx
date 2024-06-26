import { unstable_defineLoader } from "@remix-run/cloudflare";
import { Outlet } from "@remix-run/react";

export const loader = unstable_defineLoader(async ({ request, context }) => {
	const session = await context.auth.isAuthenticated(request);
	if (!session) {
		throw new Response("must sign in", { status: 401 });
	}
	const role = await context.db.userRoles.findUnique({
		where: { userId: session.userId },
		select: { isAdmin: true },
	});
	if (!role?.isAdmin) {
		throw new Response("must be an admin", { status: 403 });
	}
	return new Response();
});

export default () => {
	return (
		<div>
			<h1>Admin</h1>
			<div>
				<Outlet />
			</div>
		</div>
	);
};
