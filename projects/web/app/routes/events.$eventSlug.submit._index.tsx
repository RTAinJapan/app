import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { redirect } from "@remix-run/react";
import { z } from "zod";

import { assertUser } from "../lib/session.server";
import { eventSlugSchema } from "../lib/validation";

const paramsSchema = z.object({ eventSlug: eventSlugSchema });

export const loader = async ({
	params,
	request,
	context,
}: LoaderFunctionArgs) => {
	const { eventSlug } = paramsSchema.parse(params);
	const [user, event] = await Promise.all([
		assertUser(request, context),
		context.db.events.findUnique({
			where: { slug: eventSlug },
			select: { id: true },
		}),
	]);
	if (!event) {
		throw new Response("event not found", { status: 404 });
	}
	const submission = await context.db.submission.findUnique({
		where: {
			userId_eventId: { userId: user.id, eventId: event.id },
		},
		select: {
			submissionAvailability: { select: { id: true } },
		},
	});
	if (!submission || submission.submissionAvailability.length === 0) {
		throw redirect(`/events/${eventSlug}/submit/availability`);
	}
	return null;
};

export default function EventsSubmitPage() {
	return null;
}
