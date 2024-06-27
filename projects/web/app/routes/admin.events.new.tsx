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
				<div>
					<label>
						Full Name
						<input type="text" name="fullName" autoComplete="off" required />
					</label>
				</div>
				<div>
					<label>
						Short Name
						<input type="text" name="shortName" autoComplete="off" required />
					</label>
				</div>
				<div>
					<label>
						Start Time
						<input type="datetime-local" name="startTime" required />
					</label>
				</div>
				<button type="submit">Create</button>
			</Form>
		</div>
	);
};

const actionSchema = zfd.formData({
	fullName: zfd.text(),
	shortName: zfd.text(),
	startTime: zfd.text(z.coerce.date()),
});

export const action = unstable_defineAction(async ({ request, context }) => {
	const [formData] = await Promise.all([
		request.formData(),
		assertAdmin(request, context),
	]);
	const data = actionSchema.parse(formData);
	await context.db.events.create({
		data: {
			fullName: data.fullName,
			shortName: data.shortName,
			startTime: data.startTime,
		},
	});
	throw redirect("/admin/events");
});
