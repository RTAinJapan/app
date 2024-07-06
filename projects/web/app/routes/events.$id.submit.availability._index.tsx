import { unstable_defineLoader } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { z } from "zod";

import { assertUser } from "../lib/session.server";
import type { action as createAvailabilityAction } from "./events.$id.submit.availability.create";

const paramsSchema = z.object({ id: z.coerce.number().int() });

export const loader = unstable_defineLoader(
	async ({ params, request, context }) => {
		const { id: eventId } = paramsSchema.parse(params);
		const user = await assertUser(request, context);
		const availability = await context.db.submissionAvailability.findMany({
			where: {
				submission: {
					eventId,
					userId: user.id,
				},
			},
			orderBy: { from: "asc" },
		});
		return { availability };
	},
);

export default function EventsSubmitAvailabilityPage() {
	const fetcher = useFetcher<typeof createAvailabilityAction>();

	return (
		<div>
			<h1>Your availability</h1>
			<fetcher.Form method="post" action={"./create"}></fetcher.Form>
		</div>
	);
}
