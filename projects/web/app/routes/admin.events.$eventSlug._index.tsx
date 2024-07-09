import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
	redirect,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { fromZonedTime } from "date-fns-tz";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { DateTimePicker } from "../components/date-time-picker";
import { Button } from "../components/shadcn/button";
import {
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "../components/shadcn/form";
import { Input } from "../components/shadcn/input";
import { Label } from "../components/shadcn/label";
import { Select, SelectContent, SelectItem } from "../components/shadcn/select";
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
				<Label htmlFor="name">Name</Label>
				<Input name="name" id="name" required defaultValue={event.name} />

				<Label htmlFor="slug">Slug</Label>
				<Input name="slug" id="slug" required defaultValue={event.slug} />

				<Label htmlFor="startTime">Start time</Label>
				<DateTimePicker
					name="startTime"
					id="startTime"
					required
					defaultValue={new Date(event.startTime)}
				/>

				<Label htmlFor="endTime">End time</Label>
				<DateTimePicker
					name="endTime"
					id="endTime"
					required
					defaultValue={new Date(event.endTime)}
				/>

				<Label htmlFor="status">Status</Label>
				<FormField
					name="status"
					render={() => (
						<FormItem>
							<FormLabel>Status</FormLabel>
							<Select defaultValue={event.status}>
								<SelectContent>
									<SelectItem value={EventStatus.Hidden}>Hidden</SelectItem>
									<SelectItem value={EventStatus.Visible}>Visible</SelectItem>
									<SelectItem value={EventStatus.Open}>Open</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				></FormField>

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
