import { unstable_defineLoader } from "@remix-run/cloudflare";
import { Link, Outlet } from "@remix-run/react";

import { assertAdmin } from "../lib/session.server";

export const loader = unstable_defineLoader(async ({ request, context }) => {
	await assertAdmin(request, context);
	return null;
});

export default () => {
	return (
		<div>
			<h1>
				<Link to="/admin">Admin</Link>
			</h1>
			<div>
				<Outlet />
			</div>
		</div>
	);
};
