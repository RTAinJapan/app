import {
	redirect,
	unstable_defineAction,
	unstable_defineLoader,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { getDateTimeInputValue } from "../lib/datetime";
import { assertAdmin } from "../lib/session.server";

const paramsSchema = z.object({
	id: z.coerce.number().int(),
});

export const loader = unstable_defineLoader(async ({ params, context }) => {
	const { id } = paramsSchema.parse(params);
	const event = await context.db.events.findUnique({
		where: { id },
		select: { id: true, fullName: true, shortName: true, startTime: true },
	});
	if (!event) {
		throw new Response(null, { status: 404 });
	}
	return { event };
});

export default () => {
	const { event } = useLoaderData<typeof loader>();

	return (
		<div>
			<h2>Edit Event</h2>
			<Form method="post" action="./delete">
				<button type="submit">Delete</button>
			</Form>
			<Form method="post">
				<div>
					<label>
						Full Name
						<input
							type="text"
							name="fullName"
							autoComplete="off"
							required
							defaultValue={event.fullName}
						/>
					</label>
				</div>
				<div>
					<label>
						Short Name
						<input
							type="text"
							name="shortName"
							autoComplete="off"
							required
							defaultValue={event.shortName}
						/>
					</label>
				</div>
				<div>
					<label>
						Start Time
						<input
							type="datetime-local"
							name="startTime"
							required
							defaultValue={getDateTimeInputValue(event.startTime)}
						/>
					</label>
				</div>
				<input
					type="hidden"
					name="timezoneOffset"
					value={new Date().getTimezoneOffset()}
				/>
				<button type="submit">Save</button>
			</Form>
		</div>
	);
};

const actionSchema = zfd.formData({
	fullName: zfd.text(),
	shortName: zfd.text(),
	startTime: zfd.text(z.coerce.date()),
	timezoneOffset: zfd.numeric(),
});

export const action = unstable_defineAction(
	async ({ params, request, context }) => {
		const [formData] = await Promise.all([
			request.formData(),
			assertAdmin(request, context),
		]);
		const { id } = paramsSchema.parse(params);
		const serverTimezoneOffset = new Date().getTimezoneOffset();
		const data = actionSchema.parse(formData);
		await context.db.events.update({
			where: { id },
			data: {
				fullName: data.fullName,
				shortName: data.shortName,
				startTime: new Date(
					data.startTime.getTime() +
						(data.timezoneOffset - serverTimezoneOffset) * 60000,
				),
			},
		});
		throw redirect("/admin/events");
	},
);
