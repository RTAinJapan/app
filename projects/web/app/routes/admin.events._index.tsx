import { unstable_defineLoader } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

export const loader = unstable_defineLoader(async ({ context }) => {
	const events = await context.db.events.findMany({
		select: { id: true, fullName: true, shortName: true, startTime: true },
		orderBy: { startTime: "desc" },
	});
	return { events };
});

export default () => {
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
					</tr>
				</thead>
				<tbody>
					{events.map((event) => (
						<tr key={event.id}>
							<td>{event.fullName}</td>
							<td>{event.shortName}</td>
							<td>{event.startTime.toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};
