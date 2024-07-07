import { type ActionFunctionArgs,redirect } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { fromZonedTime } from "date-fns-tz/fromZonedTime";
import { Button, Label, TextInput } from "flowbite-react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { DateTimePicker } from "../components/date-time-picker";
import { assertAdmin } from "../lib/session.server";

export default function AdminEventsNewPage() {
	return (
		<div>
			<h2 className="text-xl">Create Event</h2>
			<Form method="post" className="flex flex-col items-start">
				<Label htmlFor="fullName" value="Full name" />
				<TextInput
					type="text"
					name="fullName"
					id="fullName"
					autoComplete="off"
					required
					defaultValue="RTA in Japan "
				/>
				<Label htmlFor="shortName" value="Short name" />
				<TextInput
					type="text"
					name="shortName"
					id="shortName"
					autoComplete="off"
					required
					defaultValue="RiJ"
				/>
				<Label value="Start time" />
				<DateTimePicker name="startTime" />
				<Label value="End time" />
				<DateTimePicker name="endTime" />
				<Button type="submit">Create</Button>
			</Form>
		</div>
	);
}

const actionSchema = zfd.formData({
	fullName: zfd.text(),
	shortName: zfd.text(),
	startTime: zfd.text(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)),
	endTime: zfd.text(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)),
});

export const action = async ({ request, context }: ActionFunctionArgs) => {
	const [formData] = await Promise.all([
		request.formData(),
		assertAdmin(request, context),
	]);
	const data = actionSchema.parse(formData);
	await context.db.events.create({
		data: {
			fullName: data.fullName,
			shortName: data.shortName,
			startTime: fromZonedTime(data.startTime, "Asia/Tokyo"),
			endTime: fromZonedTime(data.endTime, "Asia/Tokyo"),
		},
	});
	throw redirect("/admin/events");
};
