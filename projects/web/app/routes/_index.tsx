import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";

import { users } from "../../../db-schema/schema";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	const session = await context.auth.isAuthenticated(request);
	if (!session) {
		return json(null);
	}
	const user = await context.db.query.users.findFirst({
		where: eq(users.id, session.userId),
		columns: { id: true },
	});
	if (!user) {
		return json(null);
	}
	return json(user);
};

export default () => {
	const data = useLoaderData<typeof loader>();

	return (
		<div>
			{data ? (
				<div>
					<div>{data.id}</div>
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
