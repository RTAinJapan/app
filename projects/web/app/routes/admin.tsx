import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, Outlet, useMatches } from "@remix-run/react";
import { Breadcrumb } from "flowbite-react";
import { z } from "zod";

import { assertAdmin } from "../lib/session.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	await assertAdmin(request, context);
	return null;
};

const handleSchema = z.object({ breadcrumb: z.string().min(1) });

export default function AdminLayout() {
	const matches = useMatches();

	const breadcrumbs: { id: string; name: string; path: string }[] = [];
	for (const match of matches) {
		const parseResult = handleSchema.safeParse(match.handle);
		if (parseResult.success) {
			breadcrumbs.push({
				id: match.id,
				name: parseResult.data.breadcrumb,
				path: match.pathname,
			});
		}
	}

	return (
		<>
			<Breadcrumb>
				{breadcrumbs.map(({ id, name, path }) => (
					<Breadcrumb.Item key={id}>
						<Link to={path}>{name}</Link>
					</Breadcrumb.Item>
				))}
			</Breadcrumb>
			<Outlet />
		</>
	);
}

export const handle = {
	breadcrumb: "Admin",
};
