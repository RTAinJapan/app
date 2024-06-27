import { redirect, unstable_defineAction } from "@remix-run/cloudflare";
import { z } from "zod";

import { assertAdmin } from "../lib/session.server";

const paramsSchema = z.object({
	id: z.coerce.number().int(),
});

export const action = unstable_defineAction(
	async ({ params, request, context }) => {
		await assertAdmin(request, context);
		const { id } = paramsSchema.parse(params);
		await context.db.events.delete({ where: { id } });
		throw redirect("/admin/events");
	},
);
