import { unstable_defineAction } from "@remix-run/cloudflare";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { assertUser } from "../lib/session.server";

const paramsSchema = z.object({ id: z.coerce.number().int() });

const actionSchema = zfd.formData({
	from: zfd.text(z.coerce.date()),
	to: zfd.text(z.coerce.date()),
});

export const action = unstable_defineAction(
	async ({ params, request, context }) => {
		const { id: eventId } = paramsSchema.parse(params);
		const [user, formData] = await Promise.all([
			assertUser(request, context),
			request.formData(),
		]);
		const { from, to } = actionSchema.parse(formData);
		await context.db.submissionAvailability.create({
			data: {
				from,
				to,
				submission: {
					connectOrCreate: {
						create: {
							eventId,
							userId: user.id,
						},
						where: {
							userId_eventId: {
								eventId,
								userId: user.id,
							},
						},
					},
				},
			},
		});
		return null;
	},
);
