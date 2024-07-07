import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useMatches } from "@remix-run/react";
import { Breadcrumb } from "flowbite-react";
import { Fragment, type ReactNode } from "react";

import { assertAdmin } from "../lib/session.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	await assertAdmin(request, context);
	return null;
};

export default function AdminLayout() {
	const matches = useMatches();
	const breadcrumbs: { id: string; component: ReactNode }[] = [];
	for (const match of matches) {
		if (
			match.handle &&
			typeof match.handle === "object" &&
			"breadcrumb" in match.handle
		) {
			breadcrumbs.push({
				id: match.id,
				component: match.handle.breadcrumb as ReactNode,
			});
		}
	}
	return (
		<>
			<Breadcrumb className="m-2">
				{breadcrumbs.map(({ id, component }) => (
					<Fragment key={id}>{component}</Fragment>
				))}
			</Breadcrumb>
			<Outlet />
		</>
	);
}

export const handle = {
	breadcrumb: (
		<Breadcrumb.Item>
			<Link to="/admin">Admin</Link>
		</Breadcrumb.Item>
	),
};
