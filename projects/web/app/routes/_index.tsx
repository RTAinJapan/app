import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";

import { EventStatus } from "../lib/constants";

export const loader = async ({ context }: LoaderFunctionArgs) => {
	const events = await context.db.events.findMany({
		where: { status: EventStatus.Open },
		select: { id: true, name: true, slug: true },
	});
	return json({ events });
};

export default function IndexPage() {
	const { events } = useLoaderData<typeof loader>();

	return (
		<div>
			{events.length === 0 ? (
				<p>No events are currently accepting submissions.</p>
			) : (
				<>
					<h1 className="text-xl">Submission open</h1>
					<ul>
						{events.map((event) => (
							<li key={event.id}>
								<Link
									to={`/events/${event.slug}/submit`}
									className="font-medium text-blue-600 hover:underline dark:text-blue-500"
								>
									{event.name}
								</Link>
							</li>
						))}
					</ul>
				</>
			)}
		</div>
	);
}
