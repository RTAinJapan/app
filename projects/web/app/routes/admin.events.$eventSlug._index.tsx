import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
	redirect,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { fromZonedTime } from "date-fns-tz";
import { Button, Label, Select, TextInput } from "flowbite-react";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { DateTimePicker } from "../components/date-time-picker";
import { EventStatus } from "../lib/constants";
import { assertAdmin } from "../lib/session.server";
import {
	dateTimeInputSchema,
	eventSlugSchema,
	eventStatusSchema,
} from "../lib/validation";

const paramsSchema = z.object({
	eventSlug: eventSlugSchema,
});

export const loader = async ({ params, context }: LoaderFunctionArgs) => {
	const { eventSlug } = paramsSchema.parse(params);
	const event = await context.db.event.findUnique({
		where: { slug: eventSlug },
		select: {
			id: true,
			name: true,
			slug: true,
			status: true,
			startTime: true,
			endTime: true,
		},
	});
	if (!event) {
		throw new Response(null, { status: 404 });
	}
	return json({ event });
};

export default function AdminEventsEditPage() {
	const { event } = useLoaderData<typeof loader>();

	return (
		<div>
			<h2 className="text-xl">Edit event: {event.name}</h2>

			<Form method="post" action="./delete">
				<Button type="submit" color="failure">
					Delete
				</Button>
			</Form>

			<Form method="post" className="flex flex-col items-start">
				<Label htmlFor="name" value="Name" />
				<TextInput name="name" id="name" required defaultValue={event.name} />

				<Label htmlFor="slug" value="Slug" />
				<TextInput name="slug" id="slug" required defaultValue={event.slug} />

				<Label htmlFor="startTime" value="Start time" />
				<DateTimePicker
					name="startTime"
					id="startTime"
					required
					defaultValue={new Date(event.startTime)}
				/>

				<Label htmlFor="endTime" value="End time" />
				<DateTimePicker
					name="endTime"
					id="endTime"
					required
					defaultValue={new Date(event.endTime)}
				/>

				<Label htmlFor="status" value="Status" />
				<Select id="status" name="status" defaultValue={event.status}>
					<option value={EventStatus.Hidden}>Hidden</option>
					<option value={EventStatus.Visible}>Visible</option>
					<option value={EventStatus.Open}>Open</option>
				</Select>

				<Button type="submit">Save</Button>
			</Form>
		</div>
	);
}

const actionSchema = zfd.formData({
	name: zfd.text(z.string().min(1)),
	slug: zfd.text(eventSlugSchema),
	startTime: zfd.text(dateTimeInputSchema),
	endTime: zfd.text(dateTimeInputSchema),
	status: zfd.text(eventStatusSchema),
});

export const action = async ({
	params,
	request,
	context,
}: ActionFunctionArgs) => {
	const [formData] = await Promise.all([
		request.formData(),
		assertAdmin(request, context),
	]);
	const { eventSlug } = paramsSchema.parse(params);
	const data = actionSchema.parse(formData);
	await context.db.event.update({
		where: { slug: eventSlug },
		data: {
			name: data.name,
			slug: data.slug,
			status: data.status,
			startTime: fromZonedTime(data.startTime, "Asia/Tokyo"),
			endTime: fromZonedTime(data.endTime, "Asia/Tokyo"),
		},
	});
	throw redirect("/admin/events");
};
