import { json, unstable_defineLoader } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export const loader = unstable_defineLoader(async ({ request, context }) => {
	const session = await context.auth.isAuthenticated(request);
	if (!session) {
		return json({ user: null });
	}
	const user = await context.db.users.findUnique({
		where: { id: session.userId },
		select: { displayName: true },
	});
	return json({ user });
});

export default () => {
	const { user } = useLoaderData<typeof loader>();
	const { t } = useTranslation();

	return (
		<div>
			{user ? (
				<div>
					<div>
						{t("hello")}, {user.displayName}
					</div>
					<Form method="post" action="/sign-out">
						<button>Sign out</button>
					</Form>
				</div>
			) : (
				<Link to="/sign-in">Sign in</Link>
			)}
		</div>
	);
};
