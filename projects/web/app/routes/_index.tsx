import { unstable_defineLoader as defineLoader } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export const loader = defineLoader(async ({ request, context }) => {
	const session = await context.auth.isAuthenticated(request);
	if (!session) {
		return;
	}
	const user = await context.db.users.findUnique({
		where: { id: session.userId },
		select: { displayName: true },
	});
	if (!user) {
		return;
	}
	return { user };
});

export default () => {
	const data = useLoaderData<typeof loader>();
	const { t } = useTranslation();

	return (
		<div>
			{data ? (
				<div>
					<div>
						{t("hello")}, {data.user.displayName}
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
