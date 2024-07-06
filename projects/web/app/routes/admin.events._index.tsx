import { unstable_defineLoader } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = unstable_defineLoader(async ({ context }) => {
	const events = await context.db.events.findMany({
		select: {
			id: true,
			fullName: true,
			shortName: true,
			startTime: true,
			published: true,
			canSubmit: true,
		},
		orderBy: { startTime: "desc" },
	});
	return { events };
});

export default function AdminEventsPage()  {
	const { events } = useLoaderData<typeof loader>();

	return (
		<div>
			<h2>Events</h2>
			<Link to="./new">Create</Link>
			<table>
				<thead>
					<tr>
						<th>Full Name</th>
						<th>Short Name</th>
						<th>Start Time</th>
						<th>Published</th>
						<th>Can submit</th>
					</tr>
				</thead>
				<tbody>
					{events.map((event) => (
						<tr key={event.id}>
							<td>
								<Link to={event.id.toFixed()}>{event.fullName}</Link>
							</td>
							<td>{event.shortName}</td>
							<td>{event.startTime.toLocaleString()}</td>
							<td>{event.published ? "Yes" : "No"}</td>
							<td>{event.canSubmit ? "Yes" : "No"}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
