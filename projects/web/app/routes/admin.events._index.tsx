import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json, Link, useLoaderData } from "@remix-run/react";
import { Button, Table } from "flowbite-react";

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const events = await context.db.events.findMany({
		select: {
			id: true,
			fullName: true,
			shortName: true,
			startTime: true,
			endTime: true,
			published: true,
			canSubmit: true,
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
					<Table.HeadCell>Full Name</Table.HeadCell>
					<Table.HeadCell>Short Name</Table.HeadCell>
					<Table.HeadCell>Start Time</Table.HeadCell>
					<Table.HeadCell>End Time</Table.HeadCell>
					<Table.HeadCell>Published</Table.HeadCell>
					<Table.HeadCell>Can submit</Table.HeadCell>
				</Table.Head>
				<Table.Body>
					{events.map((event) => (
						<Table.Row key={event.id}>
							<Table.Cell>
								<Link to={event.id.toFixed()}>{event.fullName}</Link>
							</Table.Cell>
							<Table.Cell>{event.shortName}</Table.Cell>
							<Table.Cell>
								{dateTimeFormat.format(new Date(event.startTime))}
							</Table.Cell>
							<Table.Cell>
								{dateTimeFormat.format(new Date(event.endTime))}
							</Table.Cell>
							<Table.Cell>{event.published ? "Yes" : "No"}</Table.Cell>
							<Table.Cell>{event.canSubmit ? "Yes" : "No"}</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table>
		</div>
	);
}
