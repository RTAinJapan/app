import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { z } from "zod";

import { assertAdmin } from "../lib/session.server";

const paramsSchema = z.object({
	id: z.coerce.number().int(),
});

export const action = async ({
	params,
	request,
	context,
}: ActionFunctionArgs) => {
	await assertAdmin(request, context);
	const { id } = paramsSchema.parse(params);
	await context.db.events.delete({ where: { id } });
	throw redirect("/admin/events");
};
