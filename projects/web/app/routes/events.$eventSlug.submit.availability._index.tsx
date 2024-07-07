import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { fromZonedTime } from "date-fns-tz";
import { Breadcrumb, Button } from "flowbite-react";
import { Fragment, useState } from "react";
import { MdDelete } from "react-icons/md";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { DateTimePicker } from "../components/date-time-picker";
import { assertUser } from "../lib/session.server";
import { dateTimeInputSchema, eventSlugSchema } from "../lib/validation";

const paramsSchema = z.object({ eventSlug: eventSlugSchema });

export const loader = async ({
	params,
	request,
	context,
}: LoaderFunctionArgs) => {
	const { eventSlug } = paramsSchema.parse(params);
	const [user, event] = await Promise.all([
		assertUser(request, context),
		context.db.events.findUnique({
			where: { slug: eventSlug },
			select: { id: true, startTime: true, endTime: true },
		}),
	]);
	if (!event) {
		throw new Response("event not found", { status: 404 });
	}
	const availability = await context.db.submissionAvailability.findMany({
		where: {
			submission: {
				eventId: event.id,
				userId: user.id,
			},
		},
		orderBy: { from: "asc" },
		select: { from: true, to: true },
	});
	return json({ event, availability });
};

export default function EventsSubmitAvailabilityPage() {
	const { availability, event } = useLoaderData<typeof loader>();
	const [inputs, setInputs] = useState(() =>
		availability.map((time) => ({
			id: crypto.randomUUID(),
			from: new Date(time.from),
			to: new Date(time.to),
		})),
	);
	const fetcher = useFetcher<typeof action>();

	return (
		<div>
			<Breadcrumb>
				<Breadcrumb.Item>Availability</Breadcrumb.Item>
			</Breadcrumb>

			<Button
				onClick={() => {
					setInputs((old) => [
						...old,
						{
							id: crypto.randomUUID(),
							from: new Date(event.startTime),
							to: new Date(event.endTime),
						},
					]);
				}}
			>
				Add availability
			</Button>

			<fetcher.Form method="post">
				<div className="grid grid-cols-[auto_auto_auto_auto] items-center justify-start gap-x-1 gap-y-2">
					{inputs.map((input, index) => {
						return (
							<Fragment key={input.id}>
								<DateTimePicker
									name="from"
									defaultValue={input.from}
									min={new Date(event.startTime)}
									max={new Date(event.endTime)}
									aria-label="From"
								/>
								<div>~</div>
								<DateTimePicker
									name="to"
									defaultValue={input.to}
									min={new Date(event.startTime)}
									max={new Date(event.endTime)}
									aria-label="To"
								/>
								<Button
									onClick={() => {
										setInputs((old) => old.filter((_, i) => i !== index));
									}}
									color="failure"
								>
									<MdDelete />
								</Button>
							</Fragment>
						);
					})}
				</div>
				<Button type="submit">Next</Button>
			</fetcher.Form>
		</div>
	);
}

const actionSchema = zfd.formData({
	from: zfd.repeatableOfType(dateTimeInputSchema),
	to: zfd.repeatableOfType(dateTimeInputSchema),
});

export const action = async ({
	params,
	request,
	context,
}: ActionFunctionArgs) => {
	const { eventSlug } = paramsSchema.parse(params);
	const [user, formData, event] = await Promise.all([
		assertUser(request, context),
		request.formData(),
		context.db.events.findUnique({ where: { slug: eventSlug } }),
	]);

	if (!event) {
		throw new Response("event not found", { status: 404 });
	}

	const data = actionSchema.parse(formData);

	if (data.from.length === 0) {
		return json({ ok: false, error: "empty" } as const);
	}

	const availability: { from: Date; to: Date }[] = [];

	for (const [index, from] of data.from.entries()) {
		const to = data.to.at(index);
		if (!to) {
			return json({ ok: false, error: "mismatch" } as const);
		}
		availability.push({
			from: fromZonedTime(from, "Asia/Tokyo"),
			to: fromZonedTime(to, "Asia/Tokyo"),
		});
	}

	await context.db.submission.upsert({
		create: {
			userId: user.id,
			eventId: event.id,
			submissionAvailability: {
				createMany: {
					data: availability,
				},
			},
		},
		where: { userId_eventId: { userId: user.id, eventId: event.id } },
		update: {
			submissionAvailability: {
				deleteMany: {},
				createMany: {
					data: availability,
				},
			},
		},
	});

	return null;
};
