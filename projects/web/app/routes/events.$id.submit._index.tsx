import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

import { assertUser } from "../lib/session.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
	await assertUser(request, context);
	return null;
};

export default function EventsSubmitPage() {
	return (
		<div>
			<Link to="./availability">Availability</Link>
		</div>
	);
}
