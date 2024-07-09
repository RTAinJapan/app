import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, Link, useLoaderData } from "@remix-run/react";

import { Button } from "../components/shadcn/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../components/shadcn/table";

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const events = await context.db.event.findMany({
		select: {
			id: true,
			name: true,
			slug: true,
			status: true,
			startTime: true,
			endTime: true,
		},
		orderBy: { startTime: "desc" },
	});
	return json({ events });
};

const dateTimeFormat = new Intl.DateTimeFormat("ja-JP", {
	timeZone: "Asia/Tokyo",
	dateStyle: "long",
	timeStyle: "long",
});

export default function AdminEventsPage() {
	const { events } = useLoaderData<typeof loader>();

	return (
		<div className="flex flex-col items-start">
			<Button asChild>
				<Link to="./new" />
			</Button>

			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Name</TableHead>
						<TableHead>Slug</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Start Time</TableHead>
						<TableHead>End Time</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{events.map((event) => (
						<TableRow key={event.id}>
							<TableCell>
								<Link
									to={event.slug}
									className="text-blue-600 hover:underline dark:text-blue-500"
								>
									{event.name}
								</Link>
							</TableCell>
							<TableCell>{event.slug}</TableCell>
							<TableCell>{event.status}</TableCell>
							<TableCell>
								{dateTimeFormat.format(new Date(event.startTime))}
							</TableCell>
							<TableCell>
								{dateTimeFormat.format(new Date(event.endTime))}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
