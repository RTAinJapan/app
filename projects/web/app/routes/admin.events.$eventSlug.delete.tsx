import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { z } from "zod";

import { assertAdmin } from "../lib/session.server";
import { eventSlugSchema } from "../lib/validation";

const paramsSchema = z.object({
	eventSlug: eventSlugSchema,
});

export const action = async ({
	params,
	request,
	context,
}: ActionFunctionArgs) => {
	await assertAdmin(request, context);
	const { eventSlug } = paramsSchema.parse(params);
	await context.db.events.delete({ where: { slug: eventSlug } });
	throw redirect("/admin/events");
};
