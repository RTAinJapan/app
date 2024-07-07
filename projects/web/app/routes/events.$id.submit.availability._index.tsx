import {
	type ActionFunctionArgs,
	json,
	type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import { Button } from "flowbite-react";
import { Fragment, useState } from "react";
import { MdDelete } from "react-icons/md";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { DateTimePicker } from "../components/date-time-picker";
import { assertUser } from "../lib/session.server";

const paramsSchema = z.object({ id: z.coerce.number().int() });

export const loader = async ({
	params,
	request,
	context,
}: LoaderFunctionArgs) => {
	const { id: eventId } = paramsSchema.parse(params);
	const [user] = await Promise.all([assertUser(request, context)]);
	const availability = await context.db.submissionAvailability.findMany({
		where: {
			submission: {
				eventId,
				userId: user.id,
			},
		},
		orderBy: { from: "asc" },
		select: {
			from: true,
			to: true,
			submission: { select: { event: { select: { startTime: true } } } },
		},
	});
	return json({ availability });
};

const eventStart = new Date("2024-08-09T16:00:00+0900");
const eventEnd = new Date("2024-08-15T20:00:00+0900");

export default function EventsSubmitAvailabilityPage() {
	const [inputs, setInputs] = useState<string[]>(() => [crypto.randomUUID()]);
	const fetcher = useFetcher<typeof action>();

	return (
		<div>
			<h1 className="text-2xl">Your availability</h1>

			<Button
				onClick={() => {
					setInputs((old) => [...old, crypto.randomUUID()]);
				}}
			>
				Add availability
			</Button>

			<fetcher.Form method="post">
				<div className="grid grid-cols-[auto_auto_auto_auto] items-center justify-start gap-x-1 gap-y-2">
					{inputs.map((input, index) => {
						return (
							<Fragment key={input}>
								<DateTimePicker
									name="from"
									defaultValue={eventStart}
									min={eventStart}
									max={eventEnd}
								/>
								<div>~</div>
								<DateTimePicker
									name="to"
									defaultValue={eventEnd}
									min={eventStart}
									max={eventEnd}
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
				<Button type="submit">Submit</Button>
			</fetcher.Form>
		</div>
	);
}

const actionSchema = zfd.formData({
	"from-date": zfd.repeatableOfType(z.string().date()),
	"from-time": zfd.repeatableOfType(z.string().regex(/^\d{2}:\d{2}$/)),
	"to-date": zfd.repeatableOfType(z.string().date()),
	"to-time": zfd.repeatableOfType(z.string().regex(/^\d{2}:\d{2}$/)),
});

export const action = async ({
	params,
	request,
	context,
}: ActionFunctionArgs) => {
	const [user, formData] = await Promise.all([
		assertUser(request, context),
		request.formData(),
	]);

	const {
		["from-date"]: fromDate,
		["from-time"]: fromTime,
		["to-date"]: toDate,
		["to-time"]: toTime,
	} = actionSchema.parse(formData);

	if (fromDate.length === 0) {
		return json({ ok: false, error: "availabilityEmpty" } as const);
	}

	return null;
};
