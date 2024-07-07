import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, Link, useLoaderData } from "@remix-run/react";
import { Button, Table } from "flowbite-react";

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
			<Button as={Link} to="./new">
				Create
			</Button>

			<Table>
				<Table.Head>
					<Table.HeadCell>Name</Table.HeadCell>
					<Table.HeadCell>Slug</Table.HeadCell>
					<Table.HeadCell>Status</Table.HeadCell>
					<Table.HeadCell>Start Time</Table.HeadCell>
					<Table.HeadCell>End Time</Table.HeadCell>
				</Table.Head>
				<Table.Body>
					{events.map((event) => (
						<Table.Row key={event.id}>
							<Table.Cell>
								<Link
									to={event.slug}
									className="text-blue-600 hover:underline dark:text-blue-500"
								>
									{event.name}
								</Link>
							</Table.Cell>
							<Table.Cell>{event.slug}</Table.Cell>
							<Table.Cell>{event.status}</Table.Cell>
							<Table.Cell>
								{dateTimeFormat.format(new Date(event.startTime))}
							</Table.Cell>
							<Table.Cell>
								{dateTimeFormat.format(new Date(event.endTime))}
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</div>
	);
}
