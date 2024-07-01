import { redirect, unstable_defineAction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { assertAdmin } from "../lib/session.server";

export default () => {
	return (
		<div>
			<h2>Create Event</h2>
			<Form method="post">
				<label>
					Full Name
					<input
						type="text"
						name="fullName"
						autoComplete="off"
						required
						defaultValue="RTA in Japan "
					/>
				</label>
				<label>
					Short Name
					<input
						type="text"
						name="shortName"
						autoComplete="off"
						required
						defaultValue="RiJ"
					/>
				</label>
				<label>
					Start Time
					<input type="datetime-local" name="startTime" required />
				</label>
				<input
					type="hidden"
					name="timezoneOffset"
					value={new Date().getTimezoneOffset()}
				/>
				<button type="submit">Create</button>
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

export const action = unstable_defineAction(async ({ request, context }) => {
	const [formData] = await Promise.all([
		request.formData(),
		assertAdmin(request, context),
	]);
	const serverTimezoneOffset = new Date().getTimezoneOffset();
	const data = actionSchema.parse(formData);
	await context.db.events.create({
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
});
