import { unstable_defineLoader } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";

import { assertUser } from "../lib/session.server";

export const loader = unstable_defineLoader(async ({ request, context }) => {
	await assertUser(request, context);
	return null;
});

export default function EventsSubmitPage() {
	return (
		<div>
			<Link to="./availability">Availability</Link>
		</div>
	);
}
