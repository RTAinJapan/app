import { type ActionFunctionArgs, redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { DateTimePicker } from "../components/date-time-picker";
import { Button } from "../components/shadcn/button";
import { Input } from "../components/shadcn/input";
import { Label } from "../components/shadcn/label";
import { EventStatus } from "../lib/constants";
import { assertAdmin } from "../lib/session.server";
import { dateTimeInputSchema, eventSlugSchema } from "../lib/validation";

export default function AdminEventsNewPage() {
	return (
		<div>
			<h2 className="text-xl">Create Event</h2>

			<Form method="post" className="flex flex-col items-start">
				<Label htmlFor="name">Name</Label>
				<Input type="text" name="name" id="name" required />

				<Label htmlFor="slug">Slug</Label>
				<Input type="text" name="slug" id="slug" required />

				<Label htmlFor="startTime">Start time</Label>
				<DateTimePicker name="startTime" id="startTime" required />

				<Label htmlFor="endTime">End time</Label>
				<DateTimePicker name="endTime" id="endTime" required />

				<Button type="submit">Create</Button>
			</Form>
		</div>
	);
}

const actionSchema = zfd.formData({
	name: zfd.text(z.string().min(1)),
	slug: zfd.text(eventSlugSchema),
	startTime: zfd.text(dateTimeInputSchema),
	endTime: zfd.text(dateTimeInputSchema),
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const [formData] = await Promise.all([
		request.formData(),
		assertAdmin(request, context),
	]);
	const data = actionSchema.parse(formData);
	await context.db.event.create({
		data: {
			name: data.name,
			slug: data.slug,
			startTime: fromZonedTime(data.startTime, "Asia/Tokyo"),
			endTime: fromZonedTime(data.endTime, "Asia/Tokyo"),
			status: EventStatus.Hidden,
		},
	});
	throw redirect("/admin/events");
};
